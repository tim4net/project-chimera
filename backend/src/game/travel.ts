/**
 * @file D&D 5e Travel and Exploration Mechanics
 *
 * This module provides travel pace, marching order, and exploration rules
 * including foraging, navigation, and random encounters.
 */

import { rollDice, rollAbilityCheck } from './dice';
import type { AbilityScores } from '../types/index';

// --- TYPE DEFINITIONS ---

/** Travel pace options */
export type TravelPace = 'slow' | 'normal' | 'fast';

/** Marching order positions */
export type MarchingPosition = 'front' | 'middle' | 'rear';

/** Activity while traveling */
export type TravelActivity =
  | 'navigating'
  | 'drawing_map'
  | 'tracking'
  | 'foraging'
  | 'staying_alert'
  | 'stealthy';

/** Travel pace configuration */
export interface TravelPaceConfig {
  speed: number; // Miles per hour
  milesPerDay: number; // Assuming 8 hours travel
  stealthPenalty: number; // Penalty to Stealth checks (0 = no penalty, -5 = fast pace)
  perceptionPenalty: number; // Penalty to passive Perception (0 = no penalty, -5 = fast pace)
  canStealth: boolean; // Can the group use Stealth while traveling?
  canForage: boolean; // Can the group forage while traveling?
  description: string;
}

/** Navigation difficulty */
export interface NavigationCheck {
  terrain: 'easy' | 'moderate' | 'difficult' | 'treacherous';
  dc: number;
  consequence: string;
}

/** Foraging result */
export interface ForagingResult {
  success: boolean;
  foodPounds: number; // Pounds of food found
  waterGallons: number; // Gallons of water found
  description: string;
}

/** Encounter check result */
export interface EncounterCheckResult {
  encounterOccurs: boolean;
  roll: number;
  threshold: number;
  description: string;
}

// --- TRAVEL PACE ---

/**
 * Travel pace configurations from PHB p.181-182
 * - Slow: 2 mph, can use Stealth
 * - Normal: 3 mph, standard travel
 * - Fast: 4 mph, -5 passive Perception
 */
export const TRAVEL_PACE: Record<TravelPace, TravelPaceConfig> = {
  slow: {
    speed: 2,
    milesPerDay: 18, // 9 hours at slow pace
    stealthPenalty: 0,
    perceptionPenalty: 0,
    canStealth: true,
    canForage: true,
    description: 'Slow pace allows for careful movement and stealth'
  },
  normal: {
    speed: 3,
    milesPerDay: 24, // 8 hours at normal pace
    stealthPenalty: -999, // Cannot stealth at normal pace (represented as impossible)
    perceptionPenalty: 0,
    canStealth: false,
    canForage: true,
    description: 'Normal pace balances speed and awareness'
  },
  fast: {
    speed: 4,
    milesPerDay: 30, // 7.5 hours at fast pace
    stealthPenalty: -999,
    perceptionPenalty: -5,
    canStealth: false,
    canForage: false,
    description: 'Fast pace prioritizes speed but reduces awareness (-5 passive Perception)'
  }
};

/**
 * Calculates travel distance based on pace and duration.
 * @param pace - Travel pace
 * @param hours - Hours of travel
 * @returns Distance traveled in miles
 */
export function calculateTravelDistance(pace: TravelPace, hours: number): number {
  const config = TRAVEL_PACE[pace];
  return config.speed * hours;
}

/**
 * Gets passive Perception with pace penalty applied.
 * PHB p.181: Fast pace imposes -5 penalty to passive Perception.
 */
export function getPassivePerception(
  wisdomScore: number,
  proficiencyBonus: number,
  proficient: boolean,
  pace: TravelPace
): number {
  const wisModifier = Math.floor((wisdomScore - 10) / 2);
  const profBonus = proficient ? proficiencyBonus : 0;
  const paceConfig = TRAVEL_PACE[pace];

  return 10 + wisModifier + profBonus + paceConfig.perceptionPenalty;
}

// --- NAVIGATION ---

/**
 * Navigation DCs by terrain difficulty (DMG p.111-112)
 */
export const NAVIGATION_DCS: Record<string, NavigationCheck> = {
  road: {
    terrain: 'easy',
    dc: 5,
    consequence: 'Travel time increased by 25%'
  },
  plains: {
    terrain: 'easy',
    dc: 10,
    consequence: 'Travel time increased by 25%'
  },
  forest: {
    terrain: 'moderate',
    dc: 15,
    consequence: 'Travel time increased by 50%'
  },
  swamp: {
    terrain: 'difficult',
    dc: 15,
    consequence: 'Travel time increased by 50%, possible random encounter'
  },
  mountains: {
    terrain: 'difficult',
    dc: 15,
    consequence: 'Travel time increased by 50%, risk of getting lost'
  },
  desert: {
    terrain: 'treacherous',
    dc: 20,
    consequence: 'Become lost, travel time doubled'
  },
  underdark: {
    terrain: 'treacherous',
    dc: 20,
    consequence: 'Become hopelessly lost, may trigger encounters'
  }
};

/**
 * Makes a navigation check to avoid getting lost.
 * PHB p.111: Survival check to navigate difficult terrain.
 * @param terrain - Terrain key from NAVIGATION_DCS
 * @param abilityScores - Navigator's ability scores
 * @param proficient - Is navigator proficient in Survival?
 * @param proficiencyBonus - Navigator's proficiency bonus
 * @param options - Optional RNG and advantage
 */
export function makeNavigationCheck(
  terrain: string,
  abilityScores: AbilityScores,
  proficient: boolean,
  proficiencyBonus: number,
  options?: { rng?: () => number; advantage?: boolean }
): { success: boolean; roll: number; dc: number; consequence: string } {
  const navDC = NAVIGATION_DCS[terrain] || NAVIGATION_DCS.plains;

  const roll = rollAbilityCheck({
    ability: 'Survival',
    abilityScore: abilityScores.WIS,
    proficiencyBonus,
    proficient,
    advantage: options?.advantage ? 'advantage' : undefined,
    rng: options?.rng
  });

  const success = roll.total >= navDC.dc;

  return {
    success,
    roll: roll.total,
    dc: navDC.dc,
    consequence: success ? 'Navigation successful' : navDC.consequence
  };
}

// --- FORAGING ---

/**
 * Attempts to forage for food and water while traveling.
 * PHB p.111: Survival check to forage, DC 10 provides 1d6 + WIS pounds of food.
 * @param abilityScores - Forager's ability scores
 * @param proficient - Is forager proficient in Survival?
 * @param proficiencyBonus - Forager's proficiency bonus
 * @param terrain - Terrain type affects availability
 * @param options - Optional RNG
 */
export function forage(
  abilityScores: AbilityScores,
  proficient: boolean,
  proficiencyBonus: number,
  terrain: 'abundant' | 'normal' | 'scarce' | 'barren',
  options?: { rng?: () => number }
): ForagingResult {
  // DC varies by terrain
  const dcByTerrain = {
    abundant: 5,
    normal: 10,
    scarce: 15,
    barren: 20
  };

  const dc = dcByTerrain[terrain];

  const roll = rollAbilityCheck({
    ability: 'Survival',
    abilityScore: abilityScores.WIS,
    proficiencyBonus,
    proficient,
    rng: options?.rng
  });

  const success = roll.total >= dc;

  if (!success) {
    return {
      success: false,
      foodPounds: 0,
      waterGallons: 0,
      description: `Foraging failed (rolled ${roll.total} vs DC ${dc})`
    };
  }

  // On success: 1d6 + WIS modifier pounds of food per day
  const wisModifier = Math.floor((abilityScores.WIS - 10) / 2);
  const foodRoll = rollDice('1d6', options);
  const foodPounds = Math.max(1, foodRoll.total + wisModifier);

  // Water: 1d6 gallons if in appropriate terrain
  const waterRoll = rollDice('1d6', options);
  const waterGallons = terrain === 'barren' ? 0 : waterRoll.total;

  return {
    success: true,
    foodPounds,
    waterGallons,
    description: `Foraging successful! Found ${foodPounds} lbs food${waterGallons > 0 ? ` and ${waterGallons} gallons water` : ''}`
  };
}

// --- RANDOM ENCOUNTERS ---

/**
 * Checks for random encounters during travel.
 * DMG p.86: Roll d20 every 4-8 hours, encounter on 18+.
 * @param encounterThreshold - Roll threshold for encounter (typically 18)
 * @param options - Optional RNG
 */
export function checkForEncounter(
  encounterThreshold: number = 18,
  options?: { rng?: () => number }
): EncounterCheckResult {
  const roll = rollDice('1d20', options).total;
  const encounterOccurs = roll >= encounterThreshold;

  return {
    encounterOccurs,
    roll,
    threshold: encounterThreshold,
    description: encounterOccurs
      ? `Encounter! (rolled ${roll}, threshold ${encounterThreshold})`
      : `No encounter (rolled ${roll}, threshold ${encounterThreshold})`
  };
}

// --- FORCED MARCH ---

/**
 * Calculates exhaustion from forced march.
 * PHB p.181: Traveling more than 8 hours requires CON save or gain exhaustion.
 * @param hours - Total hours traveled
 * @param abilityScores - Traveler's ability scores
 * @param proficiencyBonus - Traveler's proficiency bonus
 * @param options - Optional RNG
 */
export function checkForcedMarch(
  hours: number,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  options?: { rng?: () => number }
): { exhausted: boolean; saveRoll?: number; saveDC?: number; description: string } {
  if (hours <= 8) {
    return {
      exhausted: false,
      description: 'Travel within normal limits (8 hours or less)'
    };
  }

  // DC = 10 + 1 per hour beyond 8
  const saveDC = 10 + (hours - 8);

  const saveRoll = rollAbilityCheck({
    ability: 'Constitution',
    abilityScore: abilityScores.CON,
    proficiencyBonus,
    proficient: false,
    rng: options?.rng
  });

  const exhausted = saveRoll.total < saveDC;

  return {
    exhausted,
    saveRoll: saveRoll.total,
    saveDC,
    description: exhausted
      ? `Forced march exhaustion! CON save ${saveRoll.total} failed vs DC ${saveDC}`
      : `Forced march endured. CON save ${saveRoll.total} passed vs DC ${saveDC}`
  };
}

// --- RESTING ---

/**
 * Rest types and their benefits
 * PHB p.186: Short rest (1 hour), Long rest (8 hours)
 */
export type RestType = 'short' | 'long';

export interface RestBenefits {
  type: RestType;
  duration: string;
  benefits: string[];
}

export const REST_RULES: Record<RestType, RestBenefits> = {
  short: {
    type: 'short',
    duration: '1 hour',
    benefits: [
      'Spend Hit Dice to regain HP',
      'Regain some class features (e.g., Fighter\'s Action Surge)',
      'No spell slot recovery (except Warlock)'
    ]
  },
  long: {
    type: 'long',
    duration: '8 hours',
    benefits: [
      'Regain all HP',
      'Regain up to half your Hit Dice (minimum 1)',
      'Regain all spell slots',
      'Regain all class features',
      'Remove one level of exhaustion'
    ]
  }
};

// --- EXPORTS ---

export default {
  TRAVEL_PACE,
  NAVIGATION_DCS,
  REST_RULES,
  calculateTravelDistance,
  getPassivePerception,
  makeNavigationCheck,
  forage,
  checkForEncounter,
  checkForcedMarch
};
