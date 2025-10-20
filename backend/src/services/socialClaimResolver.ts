/**
 * @file Social Claim Resolver - Executes social claim actions with consequences
 *
 * Handles bold narrative claims like "I'm the king's son" by:
 * 1. Rolling opposed Persuasion vs Insight check
 * 2. Setting threat levels if believed
 * 3. Applying reputation changes
 * 4. Creating mechanical consequences for narrative claims
 */

import type { SocialClaimAction, ActionResult, StateChange, DiceRoll } from '../types/actions';
import type { CharacterRecord } from '../types';
import { rollD20, calculateAbilityModifier, type D20RollResult } from '../game/dice';
import { getThreatConfig, getThreatTypeForClaim } from '../config/threats';

const RULE_ENGINE_VERSION = '1.0.0';

// ============================================================================
// HELPER: Convert D20 roll to DiceRoll
// ============================================================================

function d20RollResultToDiceRoll(result: D20RollResult, modifier: number = 0): DiceRoll {
  const total = result.total + modifier;
  return {
    dice: '1d20',
    rolls: result.rolls,
    modifier,
    total,
    criticalHit: result.isCritical,
    criticalMiss: result.isFumble,
  };
}

// ============================================================================
// NPC INSIGHT SIMULATION
// ============================================================================

/**
 * Generate NPC insight check
 * TODO: Replace with actual NPC data from database
 */
function generateNPCInsight(claimDifficulty: number): { roll: D20RollResult; modifier: number; total: number } {
  // Default NPC has insight based on claim difficulty
  // Easier claims = less perceptive NPCs
  // Harder claims = more perceptive NPCs (guards, nobles, etc.)
  const npcWisdom = Math.min(18, 10 + Math.floor(claimDifficulty / 3));
  const modifier = calculateAbilityModifier(npcWisdom);

  const roll = rollD20();
  const total = roll.total + modifier;

  return { roll, modifier, total };
}

// ============================================================================
// EXECUTE SOCIAL CLAIM
// ============================================================================

export async function executeSocialClaim(
  action: SocialClaimAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  console.log(`[SocialClaimResolver] Executing claim: ${action.claimType} - "${action.claimText}"`);

  // Step 1: Roll Persuasion/Deception check (player)
  const chaModifier = calculateAbilityModifier(character.ability_scores.CHA);
  const playerRoll = rollD20();
  const playerTotal = playerRoll.total + chaModifier;

  // Step 2: NPC Insight check (opposed)
  const npcCheck = generateNPCInsight(action.difficulty);

  // Step 3: Determine if claim is believed
  const believed = playerTotal >= npcCheck.total;

  console.log(`[SocialClaimResolver] Persuasion: ${playerTotal} vs Insight: ${npcCheck.total} → ${believed ? 'BELIEVED' : 'NOT BELIEVED'}`);

  // Step 4: Build state changes based on outcome
  const stateChanges: StateChange[] = [];

  if (believed) {
    // CLAIM BELIEVED - Set threat level!
    const threatType = getThreatTypeForClaim(action.claimType);

    if (threatType) {
      const threatConfig = getThreatConfig(threatType);

      // Add threat to character
      const newThreats = {
        ...(character.active_threats || {}),
        [threatType]: threatConfig,
      };

      stateChanges.push({
        entityId: action.actorId,
        entityType: 'character',
        field: 'active_threats',
        oldValue: character.active_threats || {},
        newValue: newThreats,
      });

      console.log(`[SocialClaimResolver] Threat activated: ${threatType} at ${threatConfig.chance}% chance`);
    }

    // Add reputation tag
    const newTags = [...(character.reputation_tags || []), `accepted_${action.claimType}`];

    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'reputation_tags',
      oldValue: character.reputation_tags || [],
      newValue: newTags,
    });

    // Improve reputation with relevant faction
    const factionKey = action.claimType === 'royal_heritage' ? 'nobles' : 'general';
    const newReputation = {
      ...(character.reputation_scores || {}),
      [factionKey]: ((character.reputation_scores?.[factionKey] || 0) + 20),
    };

    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'reputation_scores',
      oldValue: character.reputation_scores || {},
      newValue: newReputation,
    });

  } else {
    // CLAIM NOT BELIEVED - Caught lying!
    const newTags = [...(character.reputation_tags || []), `caught_lying_${action.claimType}`];

    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'reputation_tags',
      oldValue: character.reputation_tags || [],
      newValue: newTags,
    });

    // Damage reputation
    const factionKey = 'general';
    const newReputation = {
      ...(character.reputation_scores || {}),
      [factionKey]: ((character.reputation_scores?.[factionKey] || 0) - 20),
    };

    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'reputation_scores',
      oldValue: character.reputation_scores || {},
      newValue: newReputation,
    });

    console.log(`[SocialClaimResolver] Caught lying! Reputation penalty applied.`);
  }

  // Step 5: Build result
  return {
    actionId: action.actionId,
    success: believed,
    outcome: believed ? 'success' : 'failure',
    rolls: {
      persuasion: d20RollResultToDiceRoll(playerRoll, chaModifier),
      insight: d20RollResultToDiceRoll(npcCheck.roll, npcCheck.modifier),
    },
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: believed
        ? `The NPC believes your claim! But beware - this comes with consequences...`
        : `The NPC sees through your lie! Your reputation suffers.`,
      details: believed
        ? `Threat activated: ${getThreatTypeForClaim(action.claimType)} (${getThreatConfig(getThreatTypeForClaim(action.claimType)!).chance}% chance of encounters)`
        : 'You are now marked as a liar. NPCs will be skeptical of you.',
      mood: believed ? 'triumph' : 'defeat',
    },
    createJournalEntry: true,
    executionTimeMs: Date.now() - startTime,
  };
}

export default executeSocialClaim;
