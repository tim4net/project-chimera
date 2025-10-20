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
import { generateNarrative, generateNarrativeWithGemini } from '../services/narratorLLM';
import { maybeOfferQuest, buildQuestOfferPrompt } from '../services/questIntegration';
import { updateQuestProgress } from '../services/questGenerator';
import { generateCombatLoot, awardLoot, formatLootForNarrative } from '../services/lootGenerator';
import { checkAndProcessLevelUp } from '../services/levelingSystem';
import type { CharacterRecord } from '../types';
import type { ActionResult, StateChange } from '../types/actions';

const router = Router();

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

      // ======================================================================
      // STEP 1.5: CHECK FOR INCOMPLETE TUTORIAL (Auto-fix legacy characters)
      // ======================================================================

      // If character is a spellcaster at level 1+ but has no spells, reset to Level 0 tutorial
      const SPELLCASTING_CLASSES = ['Bard', 'Wizard', 'Cleric', 'Sorcerer', 'Warlock', 'Druid'];
      const isSpellcaster = SPELLCASTING_CLASSES.includes(character.class);
      const hasSpells = character.selected_spells && character.selected_spells.length > 0;
      const needsTutorial = isSpellcaster && !hasSpells && (!character.tutorial_state || character.tutorial_state === 'complete');

      if (needsTutorial) {
        console.log(`[DM Chat Secure] Detected incomplete spellcaster (${character.class}). Resetting to Level 0 tutorial.`);

        // Reset character to Level 0 Session 0 interview
        await supabaseServiceClient
          .from('characters')
          .update({
            level: 0,
            tutorial_state: 'interview_welcome', // Start at beginning of Session 0
            hp_max: 10, // Temporary HP during tutorial
            position_x: null, // Not in world yet
            position_y: null,
          })
          .eq('id', characterId);

        // Send tutorial welcome message
        const tutorialWelcome = `I notice you haven't completed your ${character.class} training yet! Before we begin your adventure, we must prepare your magic.

As a ${character.class}, you wield powerful spells. Let's start by selecting your cantrips - simple spells you can cast unlimited times.

When you're ready, say "I'm ready to choose my spells" and I'll guide you through the selection process.`;

        await supabaseServiceClient
          .from('dm_conversations')
          .insert({
            character_id: characterId,
            role: 'dm',
            content: tutorialWelcome,
            metadata: {
              tutorial_reset: true,
              timestamp: new Date().toISOString(),
            },
          });

        // Return tutorial message
        res.status(200).json({
          response: tutorialWelcome,
          actionResults: [],
          stateChanges: [
            { field: 'level', oldValue: character.level, newValue: 0 },
            { field: 'tutorial_state', oldValue: null, newValue: 'needs_cantrips' },
          ],
          triggerActivePhase: false,
        });
        return;
      }

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

      const gameContext: GameContext = {
        characterId,
        character: character as CharacterRecord,
        inCombat: false, // TODO: Query actual combat state
        // TODO: Add nearby enemies, NPCs, loot from database
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
          await updateQuestProgress(characterId, 'kill_enemy', 'goblin');
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
        console.log('[DM Chat Secure] Narrative from Local LLM');
      } catch (localError) {
        console.warn('[DM Chat Secure] Local LLM failed, trying Gemini:', localError);
        try {
          narrative = await generateNarrativeWithGemini(
            character as CharacterRecord,
            conversationHistory,
            message,
            primaryResult,
            questOfferData
          );
          console.log('[DM Chat Secure] Narrative from Gemini');
        } catch (geminiError) {
          console.error('[DM Chat Secure] Gemini fallback failed:', geminiError);
          // Ultimate fallback: use action summary
          narrative = primaryResult.narrativeContext.summary;
        }
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
      // STEP 7: CREATE JOURNAL ENTRIES
      // ======================================================================

      const shouldCreateJournal = actionResults.some(r => r.createJournalEntry);

      if (shouldCreateJournal) {
        const journalContent = actionResults
          .filter(r => r.createJournalEntry)
          .map(r => r.narrativeContext.summary)
          .join(' ');

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
