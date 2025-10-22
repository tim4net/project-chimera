/**
 * @file DM Chat API (Secure Architecture)
 *
 * This is the NEW secure implementation that follows the consensus recommendations:
 * 1. Intent Detection → Parse player message
 * 2. Rule Engine → Calculate COMPLETE state changes (authoritative)
 * 3. LLM Narrator → Generate narrative ONLY (no state proposals)
 * 4. Apply State → Commit Rule Engine's changes (never LLM's)
 *
 * Security guarantees:
 * - LLM never proposes state changes
 * - All state changes validated against action type
 * - Transactional commits with provenance
 * - Idempotency via action IDs
 * - Multi-intent detection and handling
 */

import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { supabaseServiceClient } from '../services/supabaseClient';
import { detectIntent, detectQueryIntent, type GameContext, type HighLevelIntent } from '../services/intentDetector';
import { validateAction, formatValidationFailure } from '../services/actionValidator';
import { executeAction } from '../services/ruleEngine';
import {
  generateNarrative,
  isSignificantEvent,
  enhanceContextWithTileFeatures,
  describeTrafficLevel,
  describeDangerLevel,
  getCompassDirection,
  type TileFeatureContext
} from '../services/narratorLLM';
import { maybeOfferQuest } from '../services/questIntegration';
import { updateQuestProgress } from '../services/questGenerator';
import { generateCombatLoot, awardLoot, formatLootForNarrative } from '../services/lootGenerator';
import { checkAndProcessLevelUp } from '../services/levelingSystem';
import type { CharacterRecord, GameEvent, DmResponse } from '../types';
import type { ActionResult, StateChange } from '../types/actions';
import { LocationService } from '../services/locationService';
import type { LocationContext } from '../types/road-types';
import { revealTilesInRadius } from '../services/fogOfWarService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const locationService = new LocationService();

// ============================================================================
// COST TRACKING
// ============================================================================

// Gemini Flash pricing (as of 2025-01)
const GEMINI_FLASH_INPUT_COST_PER_1M = 0.075; // $0.075 per 1M input tokens
const GEMINI_FLASH_OUTPUT_COST_PER_1M = 0.30;  // $0.30 per 1M output tokens

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 * @param textOrLength - Either the text string itself, or the character count as a number
 */
function estimateTokens(textOrLength: string | number): number {
  const charCount = typeof textOrLength === 'string' ? textOrLength.length : textOrLength;
  return Math.ceil(charCount / 4);
}

/**
 * Calculate cost for this request
 */
function calculateCost(inputTokens: number, outputTokens: number): TokenUsage {
  const inputCost = (inputTokens / 1_000_000) * GEMINI_FLASH_INPUT_COST_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * GEMINI_FLASH_OUTPUT_COST_PER_1M;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

// Track cumulative costs per session (with TTL to prevent memory leak)
const sessionCosts: Map<string, { cost: number; lastUpdated: number }> = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Log cost tracking information
 */
function logCostTracking(characterId: string, usage: TokenUsage): void {
  const now = Date.now();
  const currentSession = sessionCosts.get(characterId);
  const cumulative = (currentSession?.cost || 0) + usage.totalCost;

  sessionCosts.set(characterId, { cost: cumulative, lastUpdated: now });

  console.log('[Cost Tracking]', {
    characterId,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    inputCost: `$${usage.inputCost.toFixed(6)}`,
    outputCost: `$${usage.outputCost.toFixed(6)}`,
    requestCost: `$${usage.totalCost.toFixed(6)}`,
    cumulativeCost: `$${cumulative.toFixed(6)}`,
  });
}

/**
 * Clean up old session cost data
 */
function cleanupOldSessionCosts(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [characterId, session] of sessionCosts.entries()) {
    if (now - session.lastUpdated > SESSION_TTL) {
      sessionCosts.delete(characterId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cost Tracking] Cleaned up ${cleaned} old session(s)`);
  }
}

// Run cleanup periodically (every hour)
let costCleanupInterval: NodeJS.Timeout | null = null;

export function startCostTracking(): void {
  if (costCleanupInterval) return;
  costCleanupInterval = setInterval(cleanupOldSessionCosts, 60 * 60 * 1000);
  console.log('[Cost Tracking] Started session cost cleanup (hourly)');
}

export function stopCostTracking(): void {
  if (costCleanupInterval) {
    clearInterval(costCleanupInterval);
    costCleanupInterval = null;
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
  role: 'player' | 'dm' | 'system';
  content: string;
}

interface ChatRequest {
  characterId: string;
  message: string;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse extends DmResponse {
  response: string; // Narrative from LLM
  actionResults: ActionResult[]; // What actually happened (for UI to display dice, etc.)
  stateChanges: StateChange[]; // Consolidated state changes
  triggerActivePhase: boolean;
}

interface PositionChange {
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
}

function getPositionChange(
  stateChanges: StateChange[],
  fallbackPosition: { x: number; y: number }
): PositionChange | null {
  const xChange = stateChanges.find(change => change.field === 'position_x');
  const yChange = stateChanges.find(change => change.field === 'position_y');

  if (!xChange && !yChange) {
    return null;
  }

  const oldPosition = {
    x: typeof xChange?.oldValue === 'number' ? xChange.oldValue : fallbackPosition.x,
    y: typeof yChange?.oldValue === 'number' ? yChange.oldValue : fallbackPosition.y,
  };

  const newPosition = {
    x: typeof xChange?.newValue === 'number' ? xChange.newValue : fallbackPosition.x,
    y: typeof yChange?.newValue === 'number' ? yChange.newValue : fallbackPosition.y,
  };

  if (oldPosition.x === newPosition.x && oldPosition.y === newPosition.y) {
    return null;
  }

  return { oldPosition, newPosition };
}

function summarizeActionResults(actionResults: ActionResult[], triggerActivePhase: boolean): Record<string, unknown> | undefined {
  if (actionResults.length === 0) {
    return undefined;
  }

  return {
    actions: actionResults.map(result => ({
      actionId: result.actionId,
      type: result.source.action.type,
      success: result.success,
      outcome: result.outcome,
      stateChanges: result.stateChanges.map(change => ({
        entityId: change.entityId,
        field: change.field,
        newValue: change.newValue,
        delta: change.delta ?? null,
      })),
    })),
    triggerActivePhase,
  };
}

function buildGameEvents(
  actionResults: ActionResult[],
  allStateChanges: StateChange[],
  startingPosition: { x: number; y: number }
): GameEvent[] {
  const events: GameEvent[] = [];
  const aggregatePositionChange = getPositionChange(allStateChanges, startingPosition);

  if (aggregatePositionChange) {
    events.push({
      type: 'LOCATION_CHANGED',
      new_position: aggregatePositionChange.newPosition,
    });
  }

  for (const result of actionResults) {
    const actionType = result.source.action.type;
    const actionPositionChange = getPositionChange(
      result.stateChanges,
      aggregatePositionChange?.oldPosition ?? startingPosition
    );
    const resolvedPosition = actionPositionChange?.newPosition ?? aggregatePositionChange?.newPosition;

    if (actionType === 'TRAVEL') {
      const travelEvent: GameEvent = { type: 'TRAVEL_STARTED' };
      if (resolvedPosition) {
        travelEvent.new_position = resolvedPosition;
      }
      events.push(travelEvent);
    }

    if (actionType === 'CONVERSATION') {
      const npcId = (result.source.action as any)?.npcId;
      if (npcId) {
        const npcEvent: GameEvent = {
          type: 'NPC_ENCOUNTER',
          npc_id: npcId,
        };
        events.push(npcEvent);
      }
    }

    if (result.narrativeContext) {
      const context = result.narrativeContext as Record<string, any>;
      const travelEncounter = context.travelEncounter;

      if (travelEncounter) {
        const encounterIsNpc = travelEncounter.type === 'npc_encounter';
        const encounterEvent: GameEvent = {
          type: encounterIsNpc ? 'NPC_ENCOUNTER' : 'ENCOUNTER',
          encounter_type: travelEncounter.type,
          encounter_name: travelEncounter.name,
        };

        if (encounterIsNpc) {
          encounterEvent.npc_name = travelEncounter.name;
        }

        events.push(encounterEvent);
      }

      if (context.threatType) {
        events.push({
          type: 'ENCOUNTER',
          encounter_type: String(context.threatType),
          encounter_name: context.threatVariant ? String(context.threatVariant) : String(context.threatType),
        });
      }

      const landmarkDiscoveries = context.landmarkDiscoveries?.newlyDiscovered;
      if (Array.isArray(landmarkDiscoveries)) {
        for (const discovery of landmarkDiscoveries) {
          const landmarkEvent: GameEvent = {
            type: 'LANDMARK_DISCOVERY',
            landmark_id: discovery.id,
            landmark_name: discovery.name,
          };

          if (resolvedPosition) {
            landmarkEvent.new_position = resolvedPosition;
          } else if (aggregatePositionChange) {
            landmarkEvent.new_position = aggregatePositionChange.newPosition;
          }

          events.push(landmarkEvent);
        }
      }
    }

    for (const change of result.stateChanges) {
      if (change.field === 'reputation_scores' && typeof change.delta === 'number') {
        events.push({
          type: 'REPUTATION_CHANGE',
          reputation_delta: change.delta,
        });
      }
    }
  }

  return events;
}

// ============================================================================
// HELPER: Apply State Changes to Database
// ============================================================================

async function applyStateChanges(
  stateChanges: StateChange[],
  characterId: string,
  actionType?: string,
  character?: CharacterRecord
): Promise<void> {
  // For TRAVEL actions, create a travel session instead of updating position directly
  if (actionType === 'TRAVEL' && character) {
    // Find the destination position from state changes
    let destinationX = character.position_x ?? 0;
    let destinationY = character.position_y ?? 0;

    for (const change of stateChanges) {
      if (change.field === 'position_x') {
        destinationX = change.newValue;
      }
      if (change.field === 'position_y') {
        destinationY = change.newValue;
      }
    }

    const currentX = character.position_x ?? 0;
    const currentY = character.position_y ?? 0;

    // Calculate distance in miles (assuming 1 tile = 1 mile)
    const dx = destinationX - currentX;
    const dy = destinationY - currentY;
    const miles = Math.sqrt(dx * dx + dy * dy);

    // Create travel session
    const sessionId = uuidv4();
    const { error: insertError } = await supabaseServiceClient
      .from('travel_sessions')
      .insert({
        id: sessionId,
        character_id: characterId,
        status: 'active',
        miles_traveled: 0,
        miles_total: miles,
        destination_x: destinationX,
        destination_y: destinationY,
        travel_mode: 'normal', // Default travel mode
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error(`[DM Chat] Failed to create travel session:`, insertError);
    } else {
      console.log(`[DM Chat] Created travel session ${sessionId} for ${miles.toFixed(2)} miles`);
    }

    // Discover tiles at current position
    try {
      const { data: charData } = await supabaseServiceClient
        .from('characters')
        .select('campaign_seed')
        .eq('id', characterId)
        .single();

      if (charData) {
        await revealTilesInRadius(charData.campaign_seed, currentX, currentY, 5, characterId);
        console.log(`[DM Chat] Revealed starting tiles for travel session`);
      }
    } catch (error) {
      console.error(`[DM Chat] Failed to discover starting tiles:`, error);
    }

    // For TRAVEL, don't apply position changes here - let the worker handle it
    return;
  }

  for (const change of stateChanges) {
    // Only apply changes to the authenticated character
    if (change.entityId !== characterId || change.entityType !== 'character') {
      console.warn(`[DM Chat] Skipping state change for non-owned entity: ${change.entityId}`);
      continue;
    }

    // Apply change based on field
    switch (change.field) {
      case 'hp_current': {
        const { error } = await supabaseServiceClient
          .from('characters')
          .update({ hp_current: change.newValue })
          .eq('id', characterId);

        if (error) {
          console.error(`[DM Chat] Failed to update ${change.field}:`, error);
        }
        break;
      }

      case 'position_x': {
        const { error } = await supabaseServiceClient
          .from('characters')
          .update({ position_x: change.newValue })
          .eq('id', characterId);

        if (error) {
          console.error(`[DM Chat] Failed to update ${change.field}:`, error);
        }
        break;
      }

      case 'position_y': {
        const { error } = await supabaseServiceClient
          .from('characters')
          .update({ position_y: change.newValue })
          .eq('id', characterId);

        if (error) {
          console.error(`[DM Chat] Failed to update ${change.field}:`, error);
        }
        break;
      }

      case 'xp': {
        const { error } = await supabaseServiceClient
          .from('characters')
          .update({ xp: change.newValue })
          .eq('id', characterId);

        if (error) {
          console.error(`[DM Chat] Failed to update ${change.field}:`, error);
        }
        break;
      }

      case 'game_time_minutes': {
        const { error } = await supabaseServiceClient
          .from('characters')
          .update({ game_time_minutes: change.newValue })
          .eq('id', characterId);

        if (error) {
          console.error(`[DM Chat] Failed to update ${change.field}:`, error);
        }
        break;
      }

      // Add more fields as needed (inventory, gold, etc.)
      default:
        console.warn(`[DM Chat] Unknown field type: ${change.field}`);
    }
  }
}

function normalizeCharacterRecord(raw: CharacterRecord): CharacterRecord {
  // Ensure position coordinates are set to defaults if missing
  return {
    ...raw,
    position_x: raw.position_x ?? 0,
    position_y: raw.position_y ?? 0,
  };
}

function formatRoadReference(name: string | null): string {
  if (!name) return 'the road';
  const trimmed = name.trim();
  return /^the\b/i.test(trimmed) ? trimmed : `the ${trimmed}`;
}

function buildKnownWorldFacts(
  character: CharacterRecord,
  tileContext: TileFeatureContext,
  locationContext: LocationContext | null
): string | null {
  if (!locationContext) {
    return 'World data is temporarily unavailable for this region.';
  }

  const positionX = character.position_x ?? 0; const positionY = character.position_y ?? 0;
  const facts: string[] = [];

  if (tileContext.is_on_road) {
    const roadLabel = formatRoadReference(tileContext.road_name);
    const trafficLabel = describeTrafficLevel(tileContext.road_traffic);
    const dangerLabel = describeDangerLevel(tileContext.road_danger);
    facts.push(`${roadLabel} beneath you carries ${trafficLabel} traffic and ${dangerLabel} danger.`);
  } else if (locationContext.nearestRoad) {
    const distance = locationContext.nearestRoad.distance.toFixed(1);
    const dx = locationContext.nearestRoad.positionOnRoad.x - positionX;
    const dy = locationContext.nearestRoad.positionOnRoad.y - positionY;
    const direction = getCompassDirection(dx, dy);
    const fallbackName = tileContext.road_name
      ?? (() => {
        const from = locationContext.nearestRoad?.fromSettlementName?.trim();
        const to = locationContext.nearestRoad?.toSettlementName?.trim();
        if (from && to) return `${from}–${to} Road`;
        if (from) return `${from} Road`;
        if (to) return `${to} Road`;
        return 'unnamed road';
      })();
    const roadLabel = formatRoadReference(fallbackName);
    facts.push(`${roadLabel} runs ${distance} miles to your ${direction}.`);
  } else {
    facts.push('No maintained roads cross this tile; you are currently off-road.');
  }

  if (tileContext.nearest_town_name && tileContext.nearest_town_distance != null && locationContext.nearestSettlement) {
    const dx = locationContext.nearestSettlement.x - positionX;
    const dy = locationContext.nearestSettlement.y - positionY;
    const direction = getCompassDirection(dx, dy);
    const distance = tileContext.nearest_town_distance.toFixed(1);
    const settlementType = tileContext.settlement_type ?? 'settlement';
    facts.push(`Nearest settlement: ${tileContext.nearest_town_name} (${settlementType}) ${distance} miles to the ${direction}.`);
  } else {
    facts.push('No mapped settlements fall within immediate scouting range.');
  }

  facts.push('Cardinal orientation: North corresponds to decreasing Y coordinates; east corresponds to increasing X coordinates.');

  return facts.join(' ');
}

// ============================================================================
// MAIN ROUTE
// ============================================================================

router.post(
  '/',
  requireAuth,
  async (req, res): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const startTime = Date.now();

    try {
      const { characterId, message, conversationHistory = [] } = authenticatedReq.body as ChatRequest;

      // ======================================================================
      // STEP 1: VALIDATION
      // ======================================================================

      if (!characterId || typeof characterId !== 'string') {
        res.status(400).json({ error: 'Character ID is required' });
        return;
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ error: 'Message cannot be empty' });
        return;
      }

      // Verify character belongs to authenticated user
      const { data: character, error: characterError } = await supabaseServiceClient
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (characterError || !character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      const typedCharacter = normalizeCharacterRecord(character as CharacterRecord);
      const initialPosition = { x: typedCharacter.position_x ?? 0, y: typedCharacter.position_y ?? 0 };

      // Session 0 system has been removed - spell selection now happens during character creation

      // ======================================================================
      // STEP 2: STORE PLAYER MESSAGE
      // ======================================================================

      const { error: messageInsertError } = await supabaseServiceClient
        .from('dm_conversations')
        .insert({
          character_id: characterId,
          role: 'player',
          content: message,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });

      if (messageInsertError) {
        console.error('[DM Chat Secure] Failed to store player message:', messageInsertError);
      }

      // ======================================================================
      // STEP 3: INTENT DETECTION
      // ======================================================================

      // Check for active combat
      const { data: activeEncounter } = await supabaseServiceClient
        .from('active_encounters')
        .select('id')
        .eq('character_id', characterId)
        .eq('status', 'active')
        .single();

      // Get nearby POIs for context (POIs are world entities, not owned by characters)
      // For now, just get POIs from the same campaign
      let nearbyPOIs: any[] | null = null;
      try {
        const { data, error } = await supabaseServiceClient
          .from('world_pois')
          .select('name, type, position')
          .eq('campaign_seed', character.campaign_seed)
          .limit(10);
        if (error && (error as any).code === '42703') {
          console.warn('[DM Chat Secure] world_pois.campaign_seed missing; falling back to unscoped POI query');
          const fallback = await supabaseServiceClient
            .from('world_pois')
            .select('name, type, position')
            .limit(10);
          nearbyPOIs = fallback.data || [];
        } else {
          nearbyPOIs = data || [];
        }
      } catch (e) {
        console.error('[DM Chat Secure] Failed to fetch POIs:', e);
        nearbyPOIs = [];
      }

      const gameContext: GameContext = {
        characterId,
        character: typedCharacter,
        inCombat: !!activeEncounter,
        nearbyPOIs: nearbyPOIs || [],
      };

      const intentResult = detectIntent(message, gameContext);
      const highLevelIntent: HighLevelIntent = detectQueryIntent(message);

      console.log('[DM Chat Secure] Intent detection:', {
        actions: intentResult.actions.map(a => a.type),
        confidence: intentResult.confidence,
        flags: intentResult.flags,
      });
      console.log('[DM Chat Secure] High-level intent:', highLevelIntent);

      // Handle suspicious patterns
      if (intentResult.flags.suspicious) {
        res.status(400).json({
          error: 'Invalid request',
          message: intentResult.clarificationPrompt || 'Your message contains suspicious patterns.',
        });
        return;
      }

      // Handle clarification needed
      if (intentResult.flags.requiresClarification) {
        const clarification = intentResult.clarificationPrompt || 'Could you clarify what you want to do?';
        res.status(200).json({
          response: clarification,
          narrative: clarification,
          actionResults: [],
          stateChanges: [],
          triggerActivePhase: false,
          events: [],
          action_result: undefined,
        } as ChatResponse);
        return;
      }

      // ======================================================================
      // STEP 3.5: VALIDATE ACTIONS (NEW - Action Validator)
      // ======================================================================

      // Validate CONVERSATION-type actions (unrecognized patterns)
      // Recognized actions (ATTACK, TRAVEL, etc.) are validated by Rule Engine
      // Skip validation for meta-commands like REVIEW_DM_RESPONSE
      for (const action of intentResult.actions) {
        if (action.type === 'CONVERSATION') {
          console.log('[DM Chat Secure] Validating unrecognized action...');

          const validation = await validateAction(action, typedCharacter, message);

          if (!validation.isValid) {
            // Action is invalid - return correction to player
            const correctionMessage = formatValidationFailure(validation);

            console.log('[DM Chat Secure] Action rejected:', validation.reason);

            res.status(200).json({
              response: correctionMessage,
              narrative: correctionMessage,
              actionResults: [],
              stateChanges: [],
              triggerActivePhase: false,
              events: [],
              action_result: undefined,
            } as ChatResponse);
            return;
          }

          console.log('[DM Chat Secure] Action validated successfully');
        }
        // Skip validation for meta-commands
        if (action.type === 'REVIEW_DM_RESPONSE') {
          console.log('[DM Chat Secure] Meta-command detected, skipping validation');
        }
      }

      // ======================================================================
      // STEP 4: EXECUTE ACTIONS (Rule Engine)
      // ======================================================================

      const actionResults: ActionResult[] = [];
      const allStateChanges: StateChange[] = [];

      for (const action of intentResult.actions) {
        try {
          console.log(`[DM Chat Secure] Executing action: ${action.type}`, action);

          const result = await executeAction(action, typedCharacter);
          actionResults.push(result);
          allStateChanges.push(...result.stateChanges);

          console.log(`[DM Chat Secure] Action result:`, {
            actionId: result.actionId,
            success: result.success,
            outcome: result.outcome,
            stateChanges: result.stateChanges.length,
          });
        } catch (error) {
          console.error(`[DM Chat Secure] Failed to execute action ${action.type}:`, error);
          // Continue with other actions
        }
      }

      // ======================================================================
      // STEP 5: APPLY STATE CHANGES (Transactional)
      // ======================================================================

      if (allStateChanges.length > 0) {
        console.log(`[DM Chat Secure] Applying ${allStateChanges.length} state changes`);
        // Find if any action is TRAVEL
        const travelAction = intentResult.actions.find(a => a.type === 'TRAVEL');
        await applyStateChanges(allStateChanges, characterId, travelAction ? 'TRAVEL' : undefined, typedCharacter);
      }

      const currentPosition = { x: typedCharacter.position_x ?? 0, y: typedCharacter.position_y ?? 0 };
      const updatedPositionAfterActions = getPositionChange(allStateChanges, currentPosition);
      if (updatedPositionAfterActions) {
        typedCharacter.position_x = updatedPositionAfterActions.newPosition.x;
        typedCharacter.position_y = updatedPositionAfterActions.newPosition.y;
      }

      // ======================================================================
      // STEP 5.5: GENERATE LOOT FROM COMBAT
      // ======================================================================

      let lootAwarded = null;

      for (const result of actionResults) {
        // Generate loot if enemy was defeated
        if (result.narrativeContext.enemyDefeated && result.narrativeContext.enemyCR) {
          const loot = await generateCombatLoot(result.narrativeContext.enemyCR);
          await awardLoot(characterId, loot);
          lootAwarded = loot;
          console.log(`[DM Chat Secure] Loot awarded: ${formatLootForNarrative(loot)}`);
        }
      }

      // ======================================================================
      // STEP 5.6: CHECK QUEST PROGRESS
      // ======================================================================

      // Track quest progress from completed actions
      for (const result of actionResults) {
        // Check if action contributes to quest objectives
        if (result.success && result.source.action.type === 'MELEE_ATTACK') {
          // Track enemy kills for "kill_enemies" quests
          // For now use generic 'enemy' - TODO: add enemyType to narrativeContext type
          await updateQuestProgress(characterId, 'kill_enemy', 'enemy');
        }

        if (result.source.action.type === 'TRAVEL') {
          // Check if reached quest location
          const newPos = `${allStateChanges.find(sc => sc.field === 'position_x')?.newValue},${allStateChanges.find(sc => sc.field === 'position_y')?.newValue}`;
          await updateQuestProgress(characterId, 'reach_location', newPos);
        }
      }

      // ======================================================================
      // STEP 6: MAYBE OFFER QUEST (Only when player asks)
      // ======================================================================

      let questOfferData = null;

      // Check if player is asking for quests/work
      const normalized = message.toLowerCase();
      const isAskingForQuest = /\b(any|got|have)\s+(work|jobs?|quests?|tasks?)\b/.test(normalized) ||
                               /\b(looking for|need|want)\s+(work|a job|a quest|something to do)\b/.test(normalized) ||
                               /\b(what can i do|how can i help)\b/.test(normalized);

      if (isAskingForQuest) {
        console.log('[DM Chat Secure] Player is asking for a quest');

        // Offer a quest ONLY when player explicitly asks
        const offeredQuest = await maybeOfferQuest(typedCharacter);

        if (offeredQuest) {
          questOfferData = {
            title: offeredQuest.title,
            description: offeredQuest.description,
            rewards: `${offeredQuest.xp_reward} XP, ${offeredQuest.gold_reward} gold`,
          };
          console.log(`[DM Chat Secure] Will offer quest: "${offeredQuest.title}"`);
        } else {
          // No quests available - let narrator handle it
          console.log('[DM Chat Secure] No quests available to offer');
        }
      }

      let locationContextForPrompt: LocationContext | null = null;
      let tileContextForPrompt: TileFeatureContext | null = null;
      let worldFacts: string | null = null;

      const canProvideWorldFacts = !typedCharacter.tutorial_state || typedCharacter.tutorial_state === 'complete';

      if (highLevelIntent === 'query' && canProvideWorldFacts) {
        try {
          const characterPosition = { x: typedCharacter.position_x ?? 0, y: typedCharacter.position_y ?? 0 };
          locationContextForPrompt = await locationService.buildLocationContext(
            typedCharacter.campaign_seed,
            characterPosition,
            {
              characterId,
              radius: 40,
              nearbySettlementLimit: 3,
            }
          );

          tileContextForPrompt = enhanceContextWithTileFeatures(typedCharacter, locationContextForPrompt);

          if (tileContextForPrompt) {
            worldFacts = buildKnownWorldFacts(typedCharacter, tileContextForPrompt, locationContextForPrompt);
          }

          if (worldFacts) {
            console.log('[DM Chat Secure] Injecting world facts for query:', worldFacts);
          }
        } catch (error) {
          console.error('[DM Chat Secure] Failed to assemble world facts:', error);
        }
      }

      // ======================================================================
      // STEP 7: GENERATE NARRATIVE (LLM - Narrative Only)
      // ======================================================================

      let narrative: string;

      // If no actions were executed, create a default exploration result
      const primaryResult = actionResults[0] || {
        actionId: 'exploration-' + Date.now(),
        success: true,
        outcome: 'The character is exploring and talking to The Chronicler.',
        source: {
          action: { type: 'EXPLORE', description: message },
          context: gameContext,
        },
        rolls: {},
        stateChanges: [],
        narrativeContext: {
          summary: 'A moment of exploration and conversation.',
          location: `(${typedCharacter.position_x}, ${typedCharacter.position_y})`,
        },
        createJournalEntry: false,
        triggerActivePhase: false,
      };

      try {
        narrative = await generateNarrative(
          typedCharacter,
          conversationHistory,
          message,
          primaryResult,
          {
            questToOffer: questOfferData,
            worldFacts,
            locationContext: locationContextForPrompt,
          }
        );

        // ======================================================================
        // COST TRACKING
        // ======================================================================

        // Estimate input tokens (system prompt + character sheet + history + message)
        const systemPromptLength = 1500; // Approximate character count
        const characterSheetLength = 500; // Approximate character count
        const historyLength = conversationHistory.slice(-10).reduce((sum, msg) => sum + msg.content.length, 0);
        const messageLength = message.length;

        // Sum total character count and estimate tokens
        const totalInputCharCount = systemPromptLength + characterSheetLength + historyLength + messageLength;
        const estimatedInputTokens = estimateTokens(totalInputCharCount);
        const estimatedOutputTokens = estimateTokens(narrative);

        const usage = calculateCost(estimatedInputTokens, estimatedOutputTokens);
        logCostTracking(characterId, usage);

        console.log('[DM Chat Secure] Narrative generated with Gemini Flash');
      } catch (error) {
        console.error('[DM Chat Secure] Error generating narrative:', error);
        // Fallback to action summary
        narrative = primaryResult.narrativeContext.summary + " (The Chronicler's connection wavers...)";
      }

      // ======================================================================
      // STEP 6.5: CHECK FOR LEVEL-UP
      // ======================================================================

      // Check if character leveled up (after XP rewards from quests/combat/loot)
      const levelUpResult = await checkAndProcessLevelUp(characterId);

      if (levelUpResult.leveledUp) {
        console.log(`[DM Chat Secure] LEVEL UP! ${levelUpResult.message}`);
        // Prepend level-up celebration to narrative
        narrative = `🎉 ${levelUpResult.message}\n\n` + narrative;
      }

      // ======================================================================
      // STEP 7: CREATE JOURNAL ENTRIES (with AI significance detection)
      // ======================================================================

      // Check if rule engine flagged this for journal entry
      const ruleEngineFlagged = actionResults.some(r => r.createJournalEntry);

      // For CONVERSATION actions, use AI to detect significance
      const primaryActionType = actionResults[0]?.source?.action?.type || 'CONVERSATION';
      let aiDetectedSignificance = false;

      if (!ruleEngineFlagged && primaryActionType === 'CONVERSATION') {
        const significance = await isSignificantEvent(message, narrative, primaryActionType);
        aiDetectedSignificance = significance.isSignificant;

        if (significance.isSignificant) {
          console.log(`[DM Chat Secure] 📔 AI detected significant event: ${significance.reason}`);
        }
      }

      const shouldCreateJournal = ruleEngineFlagged || aiDetectedSignificance;

      if (shouldCreateJournal) {
        const journalContent = ruleEngineFlagged
          ? actionResults
              .filter(r => r.createJournalEntry)
              .map(r => r.narrativeContext.summary)
              .join(' ')
          : narrative; // Use full narrative for AI-detected events

        const { error: journalError } = await supabaseServiceClient
          .from('journal_entries')
          .insert({
            character_id: characterId,
            entry_type: 'narrative',
            content: journalContent,
            metadata: {
              actionIds: actionResults.map(r => r.actionId),
              playerMessage: message,
              dmResponse: narrative,
              detectedBy: aiDetectedSignificance ? 'ai_significance' : 'rule_engine',
            },
          });

        if (journalError) {
          console.error('[DM Chat Secure] Failed to create journal entry:', journalError);
        }
      }

      // ======================================================================
      // STEP 8: STORE DM RESPONSE
      // ======================================================================

      const triggerActivePhase = actionResults.some(r => r.triggerActivePhase);
      const events = buildGameEvents(actionResults, allStateChanges, initialPosition);
      const actionResultSummary = summarizeActionResults(actionResults, triggerActivePhase);

      const { error: dmMessageError } = await supabaseServiceClient
        .from('dm_conversations')
        .insert({
          character_id: characterId,
          role: 'dm',
          content: narrative,
          metadata: {
            timestamp: new Date().toISOString(),
            actionIds: actionResults.map(r => r.actionId),
            actionResults, // Store for @claudecode review
            events,
            actionResultSummary,
            executionTimeMs: Date.now() - startTime,
          },
        });

      if (dmMessageError) {
        console.error('[DM Chat Secure] Failed to store DM response:', dmMessageError);
      }

      // ======================================================================
      // STEP 9: RETURN RESPONSE
      // ======================================================================

      res.status(200).json({
        response: narrative,
        narrative,
        action_result: actionResultSummary,
        actionResults,
        stateChanges: allStateChanges,
        triggerActivePhase,
        events,
      } as ChatResponse);

      console.log(`[DM Chat Secure] Request completed in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('[DM Chat Secure] Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
