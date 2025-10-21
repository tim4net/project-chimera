/**
 * @file Rule Engine - Authoritative game mechanics processor
 *
 * This is the ONLY component that can create state changes.
 * The LLM never touches this - it only narrates the results.
 *
 * Security principles:
 * 1. All state changes must come from here (never from LLM)
 * 2. Validate prerequisites before executing actions
 * 3. Calculate exact values (not ranges or suggestions)
 * 4. Return complete, atomic state changes
 * 5. Include provenance for audit trail
 */

import type {
  ActionSpec,
  ActionResult,
  StateChange,
  DiceRoll,
  MeleeAttackAction,
  SkillCheckAction,
  TravelAction,
  RestAction,
  TakeItemAction,
  SelectCantripsAction,
  SelectSpellsAction,
  CompleteTutorialAction,
} from '../types/actions';
import type { CharacterRecord } from '../types';
import { rollD20, rollDice, calculateAbilityModifier, type DiceRollResult, type D20RollResult } from '../game/dice';
import executeSocialClaim from './socialClaimResolver';
import { checkForThreats } from './threatChecker';
import { getEnemyByName } from './enemyService';
import { executeEquipItem, executeUseItem, executeDropItem } from './inventoryService';
import {
  validateCantripSelection,
  validateSpellSelection,
  hasCompletedSpellSelection,
  getSpellRequirements,
  isSpellcaster,
} from './spellValidator';
import { executeSkipInterview, executeContinueInterview, executeEnterWorld } from './interviewExecutors';
import { executeReviewDMResponse } from './reviewExecutor';

const RULE_ENGINE_VERSION = '1.0.0';

// ============================================================================
// HELPER: Calculate attack and damage modifiers
// ============================================================================

function calculateAttackModifier(character: CharacterRecord): number {
  // For melee attacks, use STR modifier + proficiency bonus
  const strModifier = calculateAbilityModifier(character.ability_scores.STR);
  return strModifier + character.proficiency_bonus;
}

function calculateDamageModifier(character: CharacterRecord): number {
  // For melee attacks, use STR modifier
  return calculateAbilityModifier(character.ability_scores.STR);
}

// ============================================================================
// HELPER: Convert roll results to DiceRoll
// ============================================================================

function diceRollResultToDiceRoll(result: DiceRollResult, modifier: number = 0): DiceRoll {
  const total = result.total + modifier;
  return {
    dice: result.notation,
    rolls: result.rolls,
    modifier,
    total,
  };
}

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
// COMBAT ACTIONS
// ============================================================================

async function executeMeleeAttack(
  action: MeleeAttackAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Step 1: Get enemy data (default to goblin if not found)
  const enemy = await getEnemyByName('Goblin'); // TODO: Get target from action.targetId
  const targetAC = enemy?.armor_class || 13;
  const targetHP = enemy?.hp_max || 15;
  const enemyCR = enemy?.cr || 1;

  // Step 2: Calculate attack modifier
  const attackMod = calculateAttackModifier(character);

  // Step 3: Roll attack (1d20 + modifier)
  const attackRoll = rollD20();
  const attackTotal = attackRoll.total + attackMod;

  const isHit = attackTotal >= targetAC || attackRoll.isCritical;
  const isCrit = attackRoll.isCritical;

  // Step 4: Roll damage if hit
  let damageRoll: DiceRollResult | null = null;
  let stateChanges: StateChange[] = [];

  if (isHit) {
    const damageMod = calculateDamageModifier(character);
    damageRoll = isCrit ? rollDice('2d8') : rollDice('1d8'); // Crit = double dice
    const damageTotal = damageRoll.total + damageMod;

    stateChanges.push({
      entityId: action.targetId,
      entityType: 'enemy',
      field: 'hp_current',
      oldValue: targetHP,
      newValue: targetHP - damageTotal,
      delta: -damageTotal,
    });
  }

  // Check if enemy was defeated
  const enemyDefeated = isHit && (targetHP - (damageRoll ? damageRoll.total + calculateDamageModifier(character) : 0)) <= 0;

  return {
    actionId: action.actionId,
    success: isHit,
    outcome: isCrit ? 'critical_success' : (isHit ? 'success' : 'failure'),
    rolls: {
      attack: d20RollResultToDiceRoll(attackRoll, attackMod),
      ...(damageRoll && { damage: diceRollResultToDiceRoll(damageRoll, calculateDamageModifier(character)) }),
    },
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: isHit
        ? `You hit the ${enemy?.name || 'target'} for ${damageRoll ? damageRoll.total + calculateDamageModifier(character) : 0} damage!${enemyDefeated ? ' It collapses, defeated!' : ''}`
        : 'Your attack misses!',
      mood: isCrit ? 'triumph' : (isHit ? 'neutral' : 'defeat'),
      enemyDefeated,
      enemyCR,
    },
    triggerActivePhase: !isHit, // Miss might trigger counterattack
    createJournalEntry: true,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// SKILL CHECKS
// ============================================================================

async function executeSkillCheck(
  action: SkillCheckAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Step 1: Determine ability modifier for skill
  const skillToAbility: Record<string, keyof CharacterRecord['ability_scores']> = {
    acrobatics: 'DEX', athletics: 'STR', stealth: 'DEX',
    persuasion: 'CHA', deception: 'CHA', intimidation: 'CHA',
    investigation: 'INT', arcana: 'INT', history: 'INT', nature: 'INT', religion: 'INT',
    insight: 'WIS', perception: 'WIS', survival: 'WIS', medicine: 'WIS', animal_handling: 'WIS',
    performance: 'CHA', sleight_of_hand: 'DEX',
  };

  const ability = skillToAbility[action.skill] || 'DEX';
  const abilityMod = Math.floor((character.ability_scores[ability] - 10) / 2);

  // Step 2: Add proficiency if skilled
  const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2;
  const isProficient = false; // TODO: Check character.skills array
  const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0);

  // Step 3: Roll check
  const checkRoll = rollD20();
  const checkTotal = checkRoll.total + totalMod;

  // Step 4: Determine DC (default to medium difficulty)
  const dc = action.dc || 15;
  const success = checkTotal >= dc;

  // Step 5: State changes based on skill
  const stateChanges: StateChange[] = [];

  // Some skills have state effects
  if (success && action.skill === 'stealth') {
    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'status_effects',
      oldValue: [],
      newValue: ['hidden'],
    });
  }

  return {
    actionId: action.actionId,
    success,
    outcome: checkRoll.isCritical ? 'critical_success' : (success ? 'success' : 'failure'),
    rolls: {
      check: d20RollResultToDiceRoll(checkRoll, totalMod),
    },
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: success
        ? `Your ${action.skill} check succeeds! (${checkTotal} vs DC ${dc})`
        : `Your ${action.skill} check fails. (${checkTotal} vs DC ${dc})`,
      details: action.context,
      mood: success ? 'triumph' : 'neutral',
    },
    createJournalEntry: success, // Only log successes
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// TRAVEL
// ============================================================================

async function executeTravel(
  action: TravelAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Calculate new position
  const directionDeltas: Record<TravelAction['direction'], { x: number; y: number }> = {
    north: { x: 0, y: 1 },
    south: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    west: { x: -1, y: 0 },
    northeast: { x: 1, y: 1 },
    northwest: { x: -1, y: 1 },
    southeast: { x: 1, y: -1 },
    southwest: { x: -1, y: -1 },
  };

  const delta = directionDeltas[action.direction];
  const newX = character.position.x + delta.x * action.distance;
  const newY = character.position.y + delta.y * action.distance;

  // Check for threat encounters (kidnapping, assassination, etc.)
  const threatEncounter = await checkForThreats(character, 'travel');

  // Random encounter check (15% baseline chance - in addition to threats)
  const encounterRoll = rollD20();
  const hasRandomEncounter = encounterRoll.total <= 3;

  // Threats override random encounters (more important)
  const hasEncounter = threatEncounter.triggered || hasRandomEncounter;

  // State changes
  const stateChanges: StateChange[] = [
    {
      entityId: action.actorId,
      entityType: 'character',
      field: 'position_x',
      oldValue: character.position.x,
      newValue: newX,
      delta: delta.x * action.distance,
    },
    {
      entityId: action.actorId,
      entityType: 'character',
      field: 'position_y',
      oldValue: character.position.y,
      newValue: newY,
      delta: delta.y * action.distance,
    },
  ];

  // Award exploration XP
  stateChanges.push({
    entityId: action.actorId,
    entityType: 'character',
    field: 'xp',
    oldValue: character.xp,
    newValue: character.xp + 10,
    delta: 10,
  });

  // Build narrative context with threat information
  const narrativeContext: any = {
    summary: `You travel ${action.direction} to (${newX}, ${newY}).`,
    details: hasEncounter ? 'You sense something nearby...' : 'The journey is uneventful.',
    mood: hasEncounter ? 'tense' : 'neutral',
  };

  // Add threat information if threat was triggered
  if (threatEncounter.triggered) {
    narrativeContext.threatType = threatEncounter.threatType;
    narrativeContext.threatVariant = threatEncounter.variant;
    narrativeContext.threatSeverity = threatEncounter.severity;
  }

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {
      encounter: d20RollResultToDiceRoll(encounterRoll),
    },
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext,
    triggerActivePhase: hasEncounter,
    createJournalEntry: true,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// REST
// ============================================================================

async function executeRest(
  action: RestAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Check for threat encounters (kidnapping while sleeping, etc.)
  const threatEncounter = await checkForThreats(character, 'rest', action.location);

  const stateChanges: StateChange[] = [];

  if (action.restType === 'short') {
    // Short rest: Recover HP (spend hit dice)
    const hitDieRoll = rollDice('1d8'); // Assuming d8 hit die
    const conMod = Math.floor((character.ability_scores.CON - 10) / 2);
    const healAmount = Math.min(hitDieRoll.total + conMod, character.hp_max - character.hp_current);

    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'hp_current',
      oldValue: character.hp_current,
      newValue: character.hp_current + healAmount,
      delta: healAmount,
    });
  } else {
    // Long rest: Full HP recovery, spell slots, abilities
    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'hp_current',
      oldValue: character.hp_current,
      newValue: character.hp_max,
      delta: character.hp_max - character.hp_current,
    });
  }

  // Build narrative context
  const narrativeContext: any = {
    summary: action.restType === 'short'
      ? 'You take a short rest and recover some strength.'
      : 'You sleep peacefully and wake fully refreshed.',
    mood: threatEncounter.triggered ? 'tense' : 'neutral',
  };

  // Add threat information if triggered
  if (threatEncounter.triggered) {
    narrativeContext.summary = 'Your rest is interrupted!';
    narrativeContext.threatType = threatEncounter.threatType;
    narrativeContext.threatVariant = threatEncounter.variant;
    narrativeContext.threatSeverity = threatEncounter.severity;
    narrativeContext.details = `A ${threatEncounter.variant} encounter!`;
  }

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext,
    triggerActivePhase: threatEncounter.triggered,
    createJournalEntry: true,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// INVENTORY
// ============================================================================

async function executeTakeItem(
  action: TakeItemAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Validate source exists and is accessible
  // TODO: Query database for actual loot/merchant data

  // Validate cost if purchasing
  if (action.cost && action.cost > (character.gold || 0)) {
    return {
      actionId: action.actionId,
      success: false,
      outcome: 'failure',
      rolls: {},
      stateChanges: [],
      source: {
        action,
        ruleEngineVersion: RULE_ENGINE_VERSION,
        timestamp: Date.now(),
      },
      narrativeContext: {
        summary: 'You don\'t have enough gold for that!',
        mood: 'defeat',
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  const stateChanges: StateChange[] = [];

  // Add item to inventory
  stateChanges.push({
    entityId: action.actorId,
    entityType: 'character',
    field: 'inventory',
    oldValue: [], // TODO: Query actual inventory
    newValue: [{ id: action.itemId, source: action.sourceId }],
  });

  // Deduct cost if purchasing
  if (action.cost) {
    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'gold',
      oldValue: character.gold || 0,
      newValue: (character.gold || 0) - action.cost,
      delta: -action.cost,
    });
  }

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: action.cost
        ? `You purchase the item for ${action.cost} gold.`
        : 'You take the item.',
      mood: 'neutral',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// CONVERSATION (No mechanics)
// ============================================================================

async function executeConversation(
  action: Extract<ActionSpec, { type: 'CONVERSATION' }>,
  _character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges: [], // Conversation has NO state changes
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: 'You speak...',
      mood: 'neutral',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// TUTORIAL SYSTEM (Level 0 -> Level 1)
// ============================================================================

// Spell slots granted at level 1 by class
const SPELL_SLOTS_BY_CLASS_LEVEL_1: Record<string, Record<string, number>> = {
  Bard: { '1': 2 },
  Wizard: { '1': 2 },
  Cleric: { '1': 2 },
  Sorcerer: { '1': 2 },
  Warlock: { '1': 1 }, // Warlock uses Pact Magic
  Druid: { '1': 2 },
  Paladin: { '1': 0 }, // Gets spells at level 2
  Ranger: { '1': 0 },  // Gets spells at level 2
  Fighter: {},
  Rogue: {},
  Barbarian: {},
  Monk: {},
};

async function executeSelectCantrips(
  action: SelectCantripsAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();
  const stateChanges: StateChange[] = [];
  const errors: string[] = [];

  // Validate each cantrip selection
  for (const spellName of action.spellNames) {
    const validation = await validateCantripSelection(character, spellName);

    if (!validation.valid) {
      errors.push(validation.error || 'Unknown error');
    } else {
      // Add to selected_cantrips array
      const currentCantrips = (character as any).selected_cantrips || [];
      const newCantrips = [...currentCantrips, validation.spellName];

      stateChanges.push({
        entityId: action.actorId,
        entityType: 'character',
        field: 'selected_cantrips',
        oldValue: currentCantrips,
        newValue: newCantrips,
      });

      // Update character reference for subsequent validations
      (character as any).selected_cantrips = newCantrips;
    }
  }

  // Check if all cantrips required are now selected
  const requirements = getSpellRequirements(character.class);
  const currentCantrips = (character as any).selected_cantrips || [];
  const remaining = requirements.cantrips - currentCantrips.length;

  let summary = '';
  let nextStep = '';

  if (errors.length > 0) {
    summary = `Cantrip selection failed: ${errors.join(', ')}`;
  } else if (remaining > 0) {
    summary = `You have selected ${currentCantrips.length} cantrip${currentCantrips.length > 1 ? 's' : ''}. You need ${remaining} more.`;
    nextStep = 'Please select your remaining cantrips.';
  } else {
    summary = `Cantrip selection complete! You have learned: ${currentCantrips.join(', ')}`;
    nextStep = 'Now you need to select your level 1 spells.';

    // Update tutorial state to needs_spells
    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'tutorial_state',
      oldValue: 'needs_cantrips',
      newValue: 'needs_spells',
    });
  }

  return {
    actionId: action.actionId,
    success: errors.length === 0,
    outcome: errors.length === 0 ? 'success' : 'failure',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary,
      details: nextStep,
      mood: errors.length === 0 ? 'neutral' : 'defeat',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}

async function executeSelectSpells(
  action: SelectSpellsAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();
  const stateChanges: StateChange[] = [];
  const errors: string[] = [];

  // Validate each spell selection (default to level 1)
  for (const spellName of action.spellNames) {
    const validation = await validateSpellSelection(character, spellName, 1);

    if (!validation.valid) {
      errors.push(validation.error || 'Unknown error');
    } else {
      // Add to selected_spells array
      const currentSpells = (character as any).selected_spells || [];
      const newSpells = [...currentSpells, validation.spellName];

      stateChanges.push({
        entityId: action.actorId,
        entityType: 'character',
        field: 'selected_spells',
        oldValue: currentSpells,
        newValue: newSpells,
      });

      // Update character reference for subsequent validations
      (character as any).selected_spells = newSpells;
    }
  }

  // Check if all spells required are now selected
  const requirements = getSpellRequirements(character.class);
  const requiredSpells = (requirements.spells as Record<string, number>)['1'] || 0;
  const currentSpells = (character as any).selected_spells || [];
  const remaining = requiredSpells - currentSpells.length;

  let summary = '';
  let nextStep = '';

  if (errors.length > 0) {
    summary = `Spell selection failed: ${errors.join(', ')}`;
  } else if (remaining > 0) {
    summary = `You have selected ${currentSpells.length} spell${currentSpells.length > 1 ? 's' : ''}. You need ${remaining} more.`;
    nextStep = 'Please select your remaining spells.';
  } else {
    summary = `Spell selection complete! You have learned: ${currentSpells.join(', ')}`;
    nextStep = 'You are ready to begin your adventure. Say "I\'m ready" to complete your training.';

    // Update tutorial state to complete
    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'tutorial_state',
      oldValue: 'needs_spells',
      newValue: 'complete',
    });
  }

  return {
    actionId: action.actionId,
    success: errors.length === 0,
    outcome: errors.length === 0 ? 'success' : 'failure',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary,
      details: nextStep,
      mood: errors.length === 0 ? 'neutral' : 'defeat',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}

async function executeCompleteTutorial(
  action: CompleteTutorialAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();
  const stateChanges: StateChange[] = [];

  // Verify character has completed spell selection
  const completionStatus = hasCompletedSpellSelection(character);

  if (!completionStatus.complete) {
    return {
      actionId: action.actionId,
      success: false,
      outcome: 'failure',
      rolls: {},
      stateChanges: [],
      source: {
        action,
        ruleEngineVersion: RULE_ENGINE_VERSION,
        timestamp: Date.now(),
      },
      narrativeContext: {
        summary: 'You are not ready yet!',
        details: `You still need: ${completionStatus.missing.join(', ')}`,
        mood: 'neutral',
      },
      createJournalEntry: false,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Level up from 0 to 1
  stateChanges.push({
    entityId: action.actorId,
    entityType: 'character',
    field: 'level',
    oldValue: 0,
    newValue: 1,
    delta: 1,
  });

  // Initialize spell slots based on class
  const spellSlots = SPELL_SLOTS_BY_CLASS_LEVEL_1[character.class] || {};

  if (Object.keys(spellSlots).length > 0) {
    stateChanges.push({
      entityId: action.actorId,
      entityType: 'character',
      field: 'spell_slots',
      oldValue: {},
      newValue: spellSlots,
    });
  }

  // Mark tutorial as complete
  stateChanges.push({
    entityId: action.actorId,
    entityType: 'character',
    field: 'tutorial_state',
    oldValue: 'complete',
    newValue: null,
  });

  const selectedCantrips = (character as any).selected_cantrips || [];
  const selectedSpells = (character as any).selected_spells || [];

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: `Your training is complete! You are now a Level 1 ${character.class}.`,
      details: `You have mastered ${selectedCantrips.length} cantrip${selectedCantrips.length > 1 ? 's' : ''} and ${selectedSpells.length} spell${selectedSpells.length > 1 ? 's' : ''}. Your adventure begins now!`,
      mood: 'triumph',
    },
    createJournalEntry: true,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// MAIN EXECUTOR
// ============================================================================

export async function executeAction(
  action: ActionSpec,
  character: CharacterRecord
): Promise<ActionResult> {
  switch (action.type) {
    case 'MELEE_ATTACK':
      return executeMeleeAttack(action, character);

    case 'SKILL_CHECK':
      return executeSkillCheck(action, character);

    case 'TRAVEL':
      return executeTravel(action, character);

    case 'REST':
      return executeRest(action, character);

    case 'TAKE_ITEM':
      return executeTakeItem(action, character);

    case 'EQUIP_ITEM':
      return executeEquipItem(action, character);

    case 'USE_ITEM':
      return executeUseItem(action, character);

    case 'DROP_ITEM':
      return executeDropItem(action, character);

    case 'SOCIAL_CLAIM':
      return executeSocialClaim(action, character);

    case 'CONVERSATION':
      return executeConversation(action, character);

    case 'SELECT_CANTRIPS':
      return executeSelectCantrips(action, character);

    case 'SELECT_SPELLS':
      return executeSelectSpells(action, character);

    case 'COMPLETE_TUTORIAL':
      return executeCompleteTutorial(action, character);

    case 'SKIP_INTERVIEW':
      return executeSkipInterview(action, character);

    case 'CONTINUE_INTERVIEW':
      return executeContinueInterview(action, character);

    case 'ENTER_WORLD':
      return executeEnterWorld(action, character);

    case 'REVIEW_DM_RESPONSE':
      return executeReviewDMResponse(action, character);

    // TODO: Implement remaining action types (CAST_SPELL, RANGED_ATTACK, etc.)
    default:
      throw new Error(`Action type not yet implemented: ${(action as any).type}`);
  }
}
