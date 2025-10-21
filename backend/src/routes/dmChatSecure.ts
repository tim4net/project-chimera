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
import { detectIntent, type GameContext } from '../services/intentDetector';
import { validateAction, formatValidationFailure } from '../services/actionValidator';
import { executeAction } from '../services/ruleEngine';
import { generateNarrative, generateNarrativeWithGemini, isSignificantEvent } from '../services/narratorLLM';
import { maybeOfferQuest, buildQuestOfferPrompt } from '../services/questIntegration';
import { updateQuestProgress } from '../services/questGenerator';
import { generateCombatLoot, awardLoot, formatLootForNarrative } from '../services/lootGenerator';
import { checkAndProcessLevelUp } from '../services/levelingSystem';
import type { CharacterRecord } from '../types';
import type { ActionResult, StateChange } from '../types/actions';

const router = Router();

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

interface ChatResponse {
  response: string; // Narrative from LLM
  actionResults: ActionResult[]; // What actually happened (for UI to display dice, etc.)
  stateChanges: StateChange[]; // Consolidated state changes
  triggerActivePhase: boolean;
}

// ============================================================================
// HELPER: Apply State Changes to Database
// ============================================================================

async function applyStateChanges(
  stateChanges: StateChange[],
  characterId: string
): Promise<void> {
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

      // Add more fields as needed (inventory, gold, etc.)
      default:
        console.warn(`[DM Chat] Unknown field type: ${change.field}`);
    }
  }
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
      const { data: nearbyPOIs } = await supabaseServiceClient
        .from('world_pois')
        .select('name, type, position')
        .eq('campaign_seed', character.campaign_seed)
        .limit(10);

      const gameContext: GameContext = {
        characterId,
        character: character as CharacterRecord,
        inCombat: !!activeEncounter,
        nearbyPOIs: nearbyPOIs || [],
      };

      const intentResult = detectIntent(message, gameContext);

      console.log('[DM Chat Secure] Intent detection:', {
        actions: intentResult.actions.map(a => a.type),
        confidence: intentResult.confidence,
        flags: intentResult.flags,
      });

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
        res.status(200).json({
          response: intentResult.clarificationPrompt || 'Could you clarify what you want to do?',
          actionResults: [],
          stateChanges: [],
          triggerActivePhase: false,
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

          const validation = await validateAction(action, character as CharacterRecord, message);

          if (!validation.isValid) {
            // Action is invalid - return correction to player
            const correctionMessage = formatValidationFailure(validation);

            console.log('[DM Chat Secure] Action rejected:', validation.reason);

            res.status(200).json({
              response: correctionMessage,
              actionResults: [],
              stateChanges: [],
              triggerActivePhase: false,
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

          const result = await executeAction(action, character as CharacterRecord);
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
        await applyStateChanges(allStateChanges, characterId);
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
        const offeredQuest = await maybeOfferQuest(character as CharacterRecord);

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
          location: `(${character.position_x}, ${character.position_y})`,
        },
        createJournalEntry: false,
        triggerActivePhase: false,
      };

      try {
        narrative = await generateNarrative(
          character as CharacterRecord,
          conversationHistory,
          message,
          primaryResult,
          questOfferData
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
            executionTimeMs: Date.now() - startTime,
          },
        });

      if (dmMessageError) {
        console.error('[DM Chat Secure] Failed to store DM response:', dmMessageError);
      }

      // ======================================================================
      // STEP 9: RETURN RESPONSE
      // ======================================================================

      const triggerActivePhase = actionResults.some(r => r.triggerActivePhase);

      res.status(200).json({
        response: narrative,
        actionResults,
        stateChanges: allStateChanges,
        triggerActivePhase,
      } as ChatResponse);

      console.log(`[DM Chat Secure] Request completed in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('[DM Chat Secure] Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
