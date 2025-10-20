/**
 * @file Advanced D&D 5e Combat System
 *
 * This module implements comprehensive 5e combat mechanics including:
 * - Initiative system
 * - Critical hits and misses
 * - Advantage/Disadvantage
 * - Grappling and shoving
 * - Cover mechanics
 * - Ranged combat rules
 * - Two-weapon fighting
 * - Opportunity attacks
 * - Action economy tracking
 */

import {
  rollDice,
  rollD20,
  rollDamage,
  rollAbilityCheck,
  calculateAbilityModifier
} from './dice';
import type { Combatant, CombatResult } from '../types';

const MAX_TURNS = 100;

// --- TYPE DEFINITIONS ---

export type CoverType = 'none' | 'half' | 'three-quarters' | 'full';
export type ActionType = 'action' | 'bonus_action' | 'reaction' | 'movement';

export interface CombatantExtended extends Combatant {
  initiative: number;
  dexModifier: number;
  strModifier: number;
  conditions: Set<string>;
  usedActions: Set<ActionType>;
  hasReaction: boolean;
  grappling?: string; // ID of combatant being grappled
  grappledBy?: string; // ID of combatant grappling this one
  position?: { x: number; y: number };
  proficiencyBonus?: number;
  weapons?: {
    mainHand?: WeaponInfo;
    offHand?: WeaponInfo;
  };
}

export interface WeaponInfo {
  name: string;
  damage: string;
  properties: Set<'light' | 'finesse' | 'reach' | 'ranged' | 'thrown'>;
  range?: { normal: number; long: number };
}

export interface AttackContext {
  attacker: CombatantExtended;
  defender: CombatantExtended;
  cover: CoverType;
  advantageReason?: string;
  disadvantageReason?: string;
  isRanged?: boolean;
  isOffHandAttack?: boolean;
}

export interface AttackResult {
  hit: boolean;
  critical: boolean;
  fumble: boolean;
  damage: number;
  attackRoll: number;
  modifiedAC: number;
  hadAdvantage: boolean;
  hadDisadvantage: boolean;
  message: string;
}

// --- INITIATIVE SYSTEM ---

/**
 * Rolls initiative for a combatant based on their DEX modifier.
 * @param dexMod - The combatant's Dexterity modifier
 * @param rng - Optional RNG function for deterministic testing
 * @returns The initiative value (1d20 + DEX modifier)
 */
export const rollInitiative = (dexMod: number, rng?: () => number): number => {
  const roll = rollD20({ abilityModifier: dexMod, rng });
  return roll.total;
};

/**
 * Sorts combatants by initiative (highest first).
 * @param combatants - Array of combatants with initiative values
 * @returns Sorted array of combatants
 */
export const sortByInitiative = (
  combatants: CombatantExtended[]
): CombatantExtended[] => {
  return [...combatants].sort((a, b) => b.initiative - a.initiative);
};

// --- ADVANTAGE/DISADVANTAGE IN COMBAT ---

/**
 * Determines the final advantage state based on multiple factors.
 * If both advantage and disadvantage are present, they cancel out.
 * @param hasAdvantage - Whether the combatant has advantage
 * @param hasDisadvantage - Whether the combatant has disadvantage
 * @returns The final advantage state
 */
export const applyAdvantageToAttack = (
  hasAdvantage: boolean,
  hasDisadvantage: boolean
): 'normal' | 'advantage' | 'disadvantage' => {
  if (hasAdvantage && hasDisadvantage) {
    return 'normal'; // They cancel out
  }
  if (hasAdvantage) {
    return 'advantage';
  }
  if (hasDisadvantage) {
    return 'disadvantage';
  }
  return 'normal';
};

// --- COVER MECHANICS ---

/**
 * Calculates the AC bonus provided by cover.
 * @param coverType - The type of cover the defender has
 * @returns AC bonus value
 */
export const calculateCoverBonus = (coverType: CoverType): number => {
  switch (coverType) {
    case 'half':
      return 2;
    case 'three-quarters':
      return 5;
    case 'full':
      return Infinity; // Can't be targeted directly
    case 'none':
    default:
      return 0;
  }
};

// --- CRITICAL HIT RESOLUTION ---

/**
 * Resolves a critical hit by doubling the damage dice.
 * Uses the rollDamage function from dice.ts with critical flag.
 * @param damageNotation - The damage dice notation (e.g., '1d8+3')
 * @param rng - Optional RNG function for deterministic testing
 * @returns The total critical damage
 */
export const resolveCriticalHit = (
  damageNotation: string,
  rng?: () => number
): number => {
  const damageResult = rollDamage({
    components: [{ notation: damageNotation, type: 'slashing' }],
    critical: true,
    rng,
  });
  return damageResult.total;
};

// --- GRAPPLING ---

/**
 * Resolves a grapple attempt.
 * Attacker makes STR (Athletics) check vs defender's STR (Athletics) or DEX (Acrobatics).
 * @param attacker - The combatant attempting to grapple
 * @param defender - The combatant being grappled
 * @param rng - Optional RNG function
 * @returns Whether the grapple succeeds
 */
export const resolveGrapple = (
  attacker: CombatantExtended,
  defender: CombatantExtended,
  rng?: () => number
): { success: boolean; message: string } => {
  // Attacker rolls STR (Athletics)
  const attackerRoll = rollAbilityCheck({
    ability: 'Athletics',
    abilityScore: 10 + attacker.strModifier * 2, // Reconstruct ability score from modifier
    proficiencyBonus: attacker.proficiencyBonus || 0,
    proficient: true, // Assume proficiency in Athletics for grappling
    rng,
  });

  // Defender chooses best between STR (Athletics) or DEX (Acrobatics)
  const defenderStrRoll = rollAbilityCheck({
    ability: 'Athletics',
    abilityScore: 10 + defender.strModifier * 2,
    proficiencyBonus: defender.proficiencyBonus || 0,
    proficient: true,
    rng,
  });

  const defenderDexRoll = rollAbilityCheck({
    ability: 'Acrobatics',
    abilityScore: 10 + defender.dexModifier * 2,
    proficiencyBonus: defender.proficiencyBonus || 0,
    proficient: false, // Assume not proficient by default
    rng,
  });

  const defenderBestRoll = Math.max(defenderStrRoll.total, defenderDexRoll.total);
  const success = attackerRoll.total > defenderBestRoll;

  if (success) {
    attacker.grappling = defender.name;
    defender.grappledBy = attacker.name;
    defender.conditions.add('grappled');
    return {
      success: true,
      message: `${attacker.name} successfully grapples ${defender.name} (${attackerRoll.total} vs ${defenderBestRoll})`,
    };
  } else {
    return {
      success: false,
      message: `${attacker.name} fails to grapple ${defender.name} (${attackerRoll.total} vs ${defenderBestRoll})`,
    };
  }
};

// --- SHOVING ---

/**
 * Resolves a shove attempt (push or knock prone).
 * Similar to grappling: STR (Athletics) vs STR (Athletics) or DEX (Acrobatics).
 * @param attacker - The combatant attempting to shove
 * @param defender - The combatant being shoved
 * @param shoveType - 'push' or 'prone'
 * @param rng - Optional RNG function
 * @returns Whether the shove succeeds and its effects
 */
export const resolveShove = (
  attacker: CombatantExtended,
  defender: CombatantExtended,
  shoveType: 'push' | 'prone',
  rng?: () => number
): { success: boolean; message: string } => {
  const attackerRoll = rollAbilityCheck({
    ability: 'Athletics',
    abilityScore: 10 + attacker.strModifier * 2,
    proficiencyBonus: attacker.proficiencyBonus || 0,
    proficient: true,
    rng,
  });

  const defenderStrRoll = rollAbilityCheck({
    ability: 'Athletics',
    abilityScore: 10 + defender.strModifier * 2,
    proficiencyBonus: defender.proficiencyBonus || 0,
    proficient: true,
    rng,
  });

  const defenderDexRoll = rollAbilityCheck({
    ability: 'Acrobatics',
    abilityScore: 10 + defender.dexModifier * 2,
    proficiencyBonus: defender.proficiencyBonus || 0,
    proficient: false,
    rng,
  });

  const defenderBestRoll = Math.max(defenderStrRoll.total, defenderDexRoll.total);
  const success = attackerRoll.total > defenderBestRoll;

  if (success) {
    if (shoveType === 'prone') {
      defender.conditions.add('prone');
      return {
        success: true,
        message: `${attacker.name} knocks ${defender.name} prone (${attackerRoll.total} vs ${defenderBestRoll})`,
      };
    } else {
      // Push 5 feet away (if position tracking is enabled)
      return {
        success: true,
        message: `${attacker.name} pushes ${defender.name} 5 feet away (${attackerRoll.total} vs ${defenderBestRoll})`,
      };
    }
  } else {
    return {
      success: false,
      message: `${attacker.name} fails to shove ${defender.name} (${attackerRoll.total} vs ${defenderBestRoll})`,
    };
  }
};

// --- ADVANCED ATTACK RESOLUTION ---

/**
 * Performs a complete attack with all 5e rules applied.
 * @param context - The attack context including attacker, defender, cover, etc.
 * @param rng - Optional RNG function
 * @returns Detailed attack result
 */
export const resolveAttack = (
  context: AttackContext,
  rng?: () => number
): AttackResult => {
  const { attacker, defender, cover, isRanged, isOffHandAttack } = context;

  // Determine advantage/disadvantage
  let hasAdvantage = false;
  let hasDisadvantage = false;

  // Prone gives advantage to melee attacks, disadvantage to ranged
  if (defender.conditions.has('prone')) {
    if (isRanged) {
      hasDisadvantage = true;
    } else {
      hasAdvantage = true;
    }
  }

  // Attacker is prone: disadvantage on attacks
  if (attacker.conditions.has('prone')) {
    hasDisadvantage = true;
  }

  // Ranged attack while adjacent to enemy: disadvantage
  if (isRanged && isAdjacentToEnemy(attacker, defender)) {
    hasDisadvantage = true;
  }

  // Apply advantage/disadvantage
  const advantageState = applyAdvantageToAttack(hasAdvantage, hasDisadvantage);

  // Calculate modified AC with cover
  const coverBonus = calculateCoverBonus(cover);
  const modifiedAC = defender.stats.armorClass + coverBonus;

  // Full cover: attack automatically misses
  if (cover === 'full') {
    return {
      hit: false,
      critical: false,
      fumble: false,
      damage: 0,
      attackRoll: 0,
      modifiedAC,
      hadAdvantage: false,
      hadDisadvantage: false,
      message: `${attacker.name}'s attack misses ${defender.name} (full cover)`,
    };
  }

  // Roll attack
  const attackRoll = rollD20({
    advantage: advantageState === 'normal' ? undefined : advantageState,
    abilityModifier: attacker.strModifier, // Simplified: assume STR-based attacks
    proficiencyBonus: attacker.proficiencyBonus || 0,
    rng,
  });

  // Check for critical hit or fumble
  if (attackRoll.isCritical) {
    const critDamage = resolveCriticalHit(attacker.stats.damage, rng);
    return {
      hit: true,
      critical: true,
      fumble: false,
      damage: critDamage,
      attackRoll: attackRoll.total,
      modifiedAC,
      hadAdvantage: advantageState === 'advantage',
      hadDisadvantage: advantageState === 'disadvantage',
      message: `${attacker.name} critically hits ${defender.name} for ${critDamage} damage!`,
    };
  }

  if (attackRoll.isFumble) {
    return {
      hit: false,
      critical: false,
      fumble: true,
      damage: 0,
      attackRoll: attackRoll.total,
      modifiedAC,
      hadAdvantage: advantageState === 'advantage',
      hadDisadvantage: advantageState === 'disadvantage',
      message: `${attacker.name} fumbles their attack against ${defender.name}!`,
    };
  }

  // Check if attack hits
  if (attackRoll.total >= modifiedAC) {
    let damage = rollDice(attacker.stats.damage, { rng }).total;

    // Off-hand attack: no ability modifier to damage
    if (isOffHandAttack) {
      const abilityBonus = attacker.strModifier;
      damage = Math.max(1, damage - abilityBonus); // Minimum 1 damage
    }

    return {
      hit: true,
      critical: false,
      fumble: false,
      damage,
      attackRoll: attackRoll.total,
      modifiedAC,
      hadAdvantage: advantageState === 'advantage',
      hadDisadvantage: advantageState === 'disadvantage',
      message: `${attacker.name} hits ${defender.name} for ${damage} damage (${attackRoll.total} vs AC ${modifiedAC})`,
    };
  } else {
    return {
      hit: false,
      critical: false,
      fumble: false,
      damage: 0,
      attackRoll: attackRoll.total,
      modifiedAC,
      hadAdvantage: advantageState === 'advantage',
      hadDisadvantage: advantageState === 'disadvantage',
      message: `${attacker.name} misses ${defender.name} (${attackRoll.total} vs AC ${modifiedAC})`,
    };
  }
};

// --- HELPER FUNCTIONS ---

/**
 * Checks if two combatants are adjacent (within 5 feet).
 * For simplified combat, assumes they're adjacent if not specified otherwise.
 */
const isAdjacentToEnemy = (
  attacker: CombatantExtended,
  defender: CombatantExtended
): boolean => {
  if (attacker.position && defender.position) {
    const dx = Math.abs(attacker.position.x - defender.position.x);
    const dy = Math.abs(attacker.position.y - defender.position.y);
    return dx <= 1 && dy <= 1; // Adjacent or same square
  }
  return true; // Assume adjacent if positions not tracked
};

/**
 * Resolves an opportunity attack when a combatant leaves reach.
 */
export const resolveOpportunityAttack = (
  attacker: CombatantExtended,
  target: CombatantExtended,
  rng?: () => number
): AttackResult | null => {
  // Check if attacker has reaction available
  if (!attacker.hasReaction) {
    return null;
  }

  // Check if target is within reach
  if (!isAdjacentToEnemy(attacker, target)) {
    return null;
  }

  // Use reaction
  attacker.hasReaction = false;
  attacker.usedActions.add('reaction');

  // Resolve attack
  return resolveAttack(
    {
      attacker,
      defender: target,
      cover: 'none',
      isRanged: false,
    },
    rng
  );
};

/**
 * Resets action economy at the start of a combatant's turn.
 */
export const resetActionEconomy = (combatant: CombatantExtended): void => {
  combatant.usedActions.clear();
  combatant.hasReaction = true;
};

// --- LEGACY COMBAT FUNCTION (for backward compatibility) ---

export const simulateCombat = (character1: Combatant, character2: Combatant): CombatResult => {
  const combatLog: string[] = [];
  const attackerState: Combatant = { ...character1, stats: { ...character1.stats } };
  const defenderState: Combatant = { ...character2, stats: { ...character2.stats } };

  let attacker = attackerState;
  let defender = defenderState;
  let turns = 0;

  while (attacker.stats.health > 0 && defender.stats.health > 0 && turns < MAX_TURNS) {
    turns += 1;

    let attackRoll: number;
    try {
      attackRoll = rollDice('1d20').total;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown dice error';
      combatLog.push(`Combat halted: failed to roll attack dice for ${attacker.name} (${message}).`);
      return { winner: null, combatLog, outcome: 'error' };
    }

    if (attackRoll >= defender.stats.armorClass) {
      let damageRoll: number;
      try {
        damageRoll = rollDice(attacker.stats.damage).total;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown dice error';
        combatLog.push(`Combat halted: failed to roll damage dice for ${attacker.name} (${message}).`);
        return { winner: null, combatLog, outcome: 'error' };
      }

      defender.stats.health -= damageRoll;
      combatLog.push(`${attacker.name} hits ${defender.name} for ${damageRoll} damage.`);
    } else {
      combatLog.push(`${attacker.name} misses ${defender.name}.`);
    }

    if (defender.stats.health <= 0) {
      break;
    }

    [attacker, defender] = [defender, attacker];
  }

  if (attacker.stats.health > 0 && defender.stats.health <= 0) {
    combatLog.push(`${attacker.name} wins!`);
    return { winner: attacker, combatLog, outcome: 'win' };
  }

  if (defender.stats.health > 0 && attacker.stats.health <= 0) {
    combatLog.push(`${defender.name} wins!`);
    return { winner: defender, combatLog, outcome: 'win' };
  }

  combatLog.push(`Stalemate reached after ${MAX_TURNS} turns.`);

  if (attacker.stats.health === defender.stats.health) {
    combatLog.push('Combat ends in a draw.');
    return { winner: null, combatLog, outcome: 'draw' };
  }

  const stalemateWinner = attacker.stats.health > defender.stats.health ? attacker : defender;
  combatLog.push(`${stalemateWinner.name} declared winner by remaining health.`);
  return { winner: stalemateWinner, combatLog, outcome: 'win' };
};

export default simulateCombat;
