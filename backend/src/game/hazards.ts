/**
 * @file D&D 5e Environmental Hazards
 *
 * This module provides hazard mechanics including:
 * - Falling damage
 * - Environmental damage sources (fire, lava, acid, cold)
 * - Suffocation and drowning
 * - Temperature extremes
 */

import { rollDice } from './dice';
import type { AbilityScores } from '../types/index';
import { calculateAbilityModifier } from './dice';

// --- TYPE DEFINITIONS ---

/** Damage types in D&D 5e */
export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder';

/** Ability scores for saving throws */
export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

/** Hazard with saving throw requirement */
export interface Hazard {
  name: string;
  damagePerRound?: string; // Dice notation (e.g., "1d10")
  damageType: DamageType;
  savingThrow?: {
    ability: Ability;
    dc: number;
    successEffect: 'half' | 'none' | 'escape';
  };
  description: string;
  onset?: number; // Rounds before damage begins (for suffocation)
}

/** Result of hazard damage calculation */
export interface HazardDamageResult {
  damage: number;
  damageType: DamageType;
  saved: boolean;
  description: string;
}

// --- FALLING DAMAGE ---

/**
 * Calculates falling damage based on distance fallen.
 * PHB p.183: A creature takes 1d6 bludgeoning damage per 10 feet fallen, max 20d6.
 * @param distanceFeet - Distance fallen in feet
 * @returns Dice notation for falling damage
 */
export function calculateFallingDamage(distanceFeet: number): string {
  if (distanceFeet <= 0) {
    return '0d6';
  }

  // 1d6 per 10 feet, max 20d6
  const dice = Math.min(Math.floor(distanceFeet / 10), 20);
  return `${dice}d6`;
}

/**
 * Rolls falling damage and returns result.
 * @param distanceFeet - Distance fallen in feet
 * @param options - Optional RNG for deterministic results
 */
export function rollFallingDamage(
  distanceFeet: number,
  options?: { rng?: () => number }
): { damage: number; notation: string; fatal: boolean } {
  const notation = calculateFallingDamage(distanceFeet);

  if (notation === '0d6') {
    return { damage: 0, notation, fatal: false };
  }

  const result = rollDice(notation, options);

  // Falls of 100+ feet (10d6+) are often fatal to low-level characters
  const fatal = distanceFeet >= 100;

  return {
    damage: result.total,
    notation,
    fatal
  };
}

// --- ENVIRONMENTAL HAZARDS ---

/**
 * Common environmental hazards from DMG p.110-111
 */
export const HAZARDS: Record<string, Hazard> = {
  fire: {
    name: 'Fire',
    damagePerRound: '1d10',
    damageType: 'fire',
    description: 'A burning creature or object takes 1d10 fire damage per round'
  },
  lava: {
    name: 'Lava',
    damagePerRound: '10d10',
    damageType: 'fire',
    description: 'Contact with lava deals 10d10 fire damage per round'
  },
  acid: {
    name: 'Acid Pool',
    damagePerRound: '2d10',
    damageType: 'acid',
    description: 'Immersion in acid deals 2d10 acid damage per round'
  },
  coldWater: {
    name: 'Extreme Cold',
    damagePerRound: '1d6',
    damageType: 'cold',
    savingThrow: {
      ability: 'CON',
      dc: 10,
      successEffect: 'none'
    },
    description: 'Exposure to extreme cold requires a DC 10 CON save or take 1d6 cold damage per hour'
  },
  extremeHeat: {
    name: 'Extreme Heat',
    damagePerRound: '1d6',
    damageType: 'fire',
    savingThrow: {
      ability: 'CON',
      dc: 10,
      successEffect: 'none'
    },
    description: 'Exposure to extreme heat requires a DC 10 CON save or gain one level of exhaustion per hour'
  },
  suffocation: {
    name: 'Suffocation',
    damagePerRound: '1d10',
    damageType: 'bludgeoning',
    onset: 0, // Set dynamically based on CON modifier
    description: 'A creature can hold breath for 1 + CON modifier minutes (minimum 30 seconds). After that, survives for rounds equal to CON modifier (minimum 1), then drops to 0 HP'
  },
  lightning: {
    name: 'Lightning Strike',
    damagePerRound: '8d6',
    damageType: 'lightning',
    savingThrow: {
      ability: 'DEX',
      dc: 15,
      successEffect: 'half'
    },
    description: 'Lightning strike deals 8d6 lightning damage, DEX save DC 15 for half'
  },
  thunderwave: {
    name: 'Thunder Damage',
    damagePerRound: '2d8',
    damageType: 'thunder',
    savingThrow: {
      ability: 'CON',
      dc: 12,
      successEffect: 'half'
    },
    description: 'Deafening thunder deals 2d8 thunder damage, CON save DC 12 for half'
  }
};

/**
 * Applies hazard damage to a creature.
 * @param hazardKey - Key from HAZARDS object
 * @param abilityScores - Creature's ability scores for saving throws
 * @param options - Optional RNG and proficiency bonus
 */
export function applyHazardDamage(
  hazardKey: string,
  abilityScores: AbilityScores,
  options?: { rng?: () => number; proficiencyBonus?: number }
): HazardDamageResult {
  const hazard = HAZARDS[hazardKey];

  if (!hazard) {
    return {
      damage: 0,
      damageType: 'bludgeoning',
      saved: true,
      description: `Unknown hazard: ${hazardKey}`
    };
  }

  let damage = 0;
  let saved = false;

  // Roll damage if applicable
  if (hazard.damagePerRound) {
    const damageRoll = rollDice(hazard.damagePerRound, options);
    damage = damageRoll.total;
  }

  // Apply saving throw if applicable
  if (hazard.savingThrow) {
    const abilityScore = abilityScores[hazard.savingThrow.ability];
    const modifier = calculateAbilityModifier(abilityScore);
    const profBonus = options?.proficiencyBonus || 0;

    // Roll saving throw (d20 + modifier + proficiency)
    const saveRoll = rollDice('1d20', options).total + modifier + profBonus;
    saved = saveRoll >= hazard.savingThrow.dc;

    // Apply save effect
    if (saved) {
      if (hazard.savingThrow.successEffect === 'half') {
        damage = Math.floor(damage / 2);
      } else if (hazard.savingThrow.successEffect === 'none') {
        damage = 0;
      }
    }
  }

  return {
    damage,
    damageType: hazard.damageType,
    saved,
    description: `${hazard.name}: ${damage} ${hazard.damageType} damage${saved ? ' (saved)' : ''}`
  };
}

// --- SUFFOCATION & DROWNING ---

/**
 * Calculates how long a creature can hold its breath.
 * PHB p.183: 1 + CON modifier minutes (minimum 30 seconds)
 * @param abilityScores - Creature's ability scores
 * @returns Duration in minutes
 */
export function calculateBreathHoldingDuration(abilityScores: AbilityScores): number {
  const conModifier = calculateAbilityModifier(abilityScores.CON);
  const minutes = 1 + conModifier;
  return Math.max(minutes, 0.5); // Minimum 30 seconds
}

/**
 * Calculates survival rounds after breath runs out.
 * PHB p.183: CON modifier rounds (minimum 1)
 * @param abilityScores - Creature's ability scores
 * @returns Rounds survived
 */
export function calculateSuffocationRounds(abilityScores: AbilityScores): number {
  const conModifier = calculateAbilityModifier(abilityScores.CON);
  return Math.max(conModifier, 1);
}

// --- EXHAUSTION ---

/**
 * Exhaustion levels and their effects.
 * PHB p.291: Exhaustion is a special condition with 6 levels.
 */
export interface ExhaustionLevel {
  level: number;
  effect: string;
}

export const EXHAUSTION_LEVELS: ExhaustionLevel[] = [
  { level: 1, effect: 'Disadvantage on ability checks' },
  { level: 2, effect: 'Speed halved' },
  { level: 3, effect: 'Disadvantage on attack rolls and saving throws' },
  { level: 4, effect: 'Hit point maximum halved' },
  { level: 5, effect: 'Speed reduced to 0' },
  { level: 6, effect: 'Death' }
];

/**
 * Gets exhaustion effects for a given level.
 */
export function getExhaustionEffects(level: number): string[] {
  if (level <= 0) return [];
  if (level >= 6) return ['Death'];

  return EXHAUSTION_LEVELS
    .filter(e => e.level <= level)
    .map(e => e.effect);
}

// --- TEMPERATURE EXTREMES ---

/**
 * Temperature categories and their effects.
 * DMG p.110: Extreme cold and heat.
 */
export type TemperatureCategory = 'extreme_cold' | 'cold' | 'normal' | 'hot' | 'extreme_heat';

export interface TemperatureEffect {
  saveRequired: boolean;
  saveDC: number;
  saveAbility: Ability;
  damageOnFail?: string;
  exhaustionOnFail?: boolean;
  frequency: string; // How often saves are required
  description: string;
}

export const TEMPERATURE_EFFECTS: Record<TemperatureCategory, TemperatureEffect> = {
  extreme_cold: {
    saveRequired: true,
    saveDC: 10,
    saveAbility: 'CON',
    exhaustionOnFail: true,
    frequency: 'Every hour',
    description: 'DC 10 CON save every hour or gain one level of exhaustion'
  },
  cold: {
    saveRequired: false,
    saveDC: 0,
    saveAbility: 'CON',
    frequency: 'None',
    description: 'No mechanical effects, uncomfortable but survivable'
  },
  normal: {
    saveRequired: false,
    saveDC: 0,
    saveAbility: 'CON',
    frequency: 'None',
    description: 'Comfortable temperature, no effects'
  },
  hot: {
    saveRequired: false,
    saveDC: 0,
    saveAbility: 'CON',
    frequency: 'None',
    description: 'Uncomfortable but manageable, no mechanical effects'
  },
  extreme_heat: {
    saveRequired: true,
    saveDC: 10,
    saveAbility: 'CON',
    exhaustionOnFail: true,
    frequency: 'Every hour',
    description: 'DC 10 CON save every hour or gain one level of exhaustion'
  }
};

// --- EXPORTS ---

export default {
  calculateFallingDamage,
  rollFallingDamage,
  applyHazardDamage,
  calculateBreathHoldingDuration,
  calculateSuffocationRounds,
  getExhaustionEffects,
  HAZARDS,
  EXHAUSTION_LEVELS,
  TEMPERATURE_EFFECTS
};
