/**
 * @file D&D 5e Environmental Rules - Vision, Light, and Terrain
 *
 * This module provides core environmental mechanics including:
 * - Vision types and light levels
 * - Combat advantage/disadvantage based on lighting
 * - Movement cost calculations for difficult terrain
 * - Basic environmental conditions
 */

import type { AbilityScores } from '../types/index';

// --- TYPE DEFINITIONS ---

/** Light levels in D&D 5e */
export type LightLevel = 'bright' | 'dim' | 'darkness';

/** Types of vision available to creatures */
export type VisionType = 'normal' | 'darkvision' | 'blindsight' | 'tremorsense' | 'truesight';

/** Terrain types affecting movement */
export type TerrainType = 'normal' | 'difficult';

/** Weather conditions affecting gameplay */
export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'fog' | 'storm';

/** Creature with vision capabilities */
export interface CreatureVision {
  type: VisionType;
  range: number; // Range in feet (darkvision 60, etc.)
}

/** Complete environmental context for vision checks */
export interface EnvironmentalContext {
  lightLevel: LightLevel;
  weather?: WeatherCondition;
  distance: number; // Distance between creatures in feet
  obscurement?: 'lightly' | 'heavily'; // Fog, smoke, etc.
}

/** Result of a vision check */
export interface VisionCheckResult {
  canSee: boolean;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  reason: string;
}

// --- VISION & LIGHT RULES ---

/**
 * Determines if a creature can see a target based on vision type and environment.
 * Implements PHB p.183-184 vision and light rules.
 */
export function canSee(
  creatureVision: CreatureVision,
  target: { x: number; y: number },
  creature: { x: number; y: number },
  context: EnvironmentalContext
): VisionCheckResult {
  const { lightLevel, distance, obscurement } = context;

  // Calculate distance if not provided
  const actualDistance = distance || Math.sqrt(
    Math.pow(target.x - creature.x, 2) + Math.pow(target.y - creature.y, 2)
  );

  // Truesight sees through everything within range
  if (creatureVision.type === 'truesight') {
    if (actualDistance <= creatureVision.range) {
      return {
        canSee: true,
        hasAdvantage: false,
        hasDisadvantage: false,
        reason: 'Truesight pierces all illusions and darkness'
      };
    }
    return {
      canSee: false,
      hasAdvantage: false,
      hasDisadvantage: false,
      reason: 'Target beyond truesight range'
    };
  }

  // Blindsight - doesn't require light
  if (creatureVision.type === 'blindsight') {
    if (actualDistance <= creatureVision.range) {
      return {
        canSee: true,
        hasAdvantage: false,
        hasDisadvantage: false,
        reason: 'Blindsight does not rely on vision'
      };
    }
    // Beyond blindsight range, fall through to normal vision rules
  }

  // Tremorsense - detects ground vibrations
  if (creatureVision.type === 'tremorsense') {
    if (actualDistance <= creatureVision.range) {
      return {
        canSee: true,
        hasAdvantage: false,
        hasDisadvantage: false,
        reason: 'Tremorsense detects ground vibrations'
      };
    }
  }

  // Handle obscurement (fog, smoke, etc.)
  if (obscurement === 'heavily') {
    return {
      canSee: false,
      hasAdvantage: false,
      hasDisadvantage: true,
      reason: 'Heavy obscurement blocks vision'
    };
  }

  // Normal and darkvision rules
  if (lightLevel === 'bright') {
    return {
      canSee: true,
      hasAdvantage: false,
      hasDisadvantage: false,
      reason: 'Bright light provides clear vision'
    };
  }

  if (lightLevel === 'dim') {
    // Darkvision treats dim light as bright light
    if (creatureVision.type === 'darkvision' && actualDistance <= creatureVision.range) {
      return {
        canSee: true,
        hasAdvantage: false,
        hasDisadvantage: false,
        reason: 'Darkvision treats dim light as bright'
      };
    }

    // Normal vision in dim light = lightly obscured
    return {
      canSee: true,
      hasAdvantage: false,
      hasDisadvantage: true,
      reason: 'Dim light creates lightly obscured area (disadvantage on Perception)'
    };
  }

  // Darkness
  if (lightLevel === 'darkness') {
    // Darkvision treats darkness as dim light
    if (creatureVision.type === 'darkvision' && actualDistance <= creatureVision.range) {
      return {
        canSee: true,
        hasAdvantage: false,
        hasDisadvantage: true,
        reason: 'Darkvision treats darkness as dim light (lightly obscured)'
      };
    }

    // Normal vision cannot see in darkness
    return {
      canSee: false,
      hasAdvantage: false,
      hasDisadvantage: true,
      reason: 'Normal vision cannot see in complete darkness'
    };
  }

  // Default fallback
  return {
    canSee: true,
    hasAdvantage: false,
    hasDisadvantage: false,
    reason: 'Default visibility'
  };
}

/**
 * Determines advantage/disadvantage for attack rolls based on vision and light.
 * PHB p.194-195: Unseen attackers have advantage, unseen targets impose disadvantage.
 */
export function getAttackModifiers(
  attackerVision: CreatureVision,
  targetVision: CreatureVision,
  attacker: { x: number; y: number },
  target: { x: number; y: number },
  context: EnvironmentalContext
): { attackerAdvantage: boolean; attackerDisadvantage: boolean; reason: string } {
  const attackerCanSeeTarget = canSee(attackerVision, target, attacker, context);
  const targetCanSeeAttacker = canSee(targetVision, attacker, target, context);

  let attackerAdvantage = false;
  let attackerDisadvantage = false;
  let reason = '';

  // Attacker cannot see target = disadvantage
  if (!attackerCanSeeTarget.canSee) {
    attackerDisadvantage = true;
    reason += 'Attacker cannot see target (disadvantage). ';
  }

  // Target cannot see attacker = advantage
  if (!targetCanSeeAttacker.canSee) {
    attackerAdvantage = true;
    reason += 'Target cannot see attacker (advantage). ';
  }

  // Dim light provides disadvantage to Perception but not attacks
  // unless the creature truly cannot see (handled above)

  return { attackerAdvantage, attackerDisadvantage, reason: reason.trim() };
}

// --- TERRAIN & MOVEMENT ---

/**
 * Calculates movement cost in feet for a given terrain type.
 * PHB p.182: Difficult terrain costs 2 feet of movement per 1 foot traveled.
 */
export function calculateMovementCost(terrain: TerrainType, distance: number): number {
  if (terrain === 'difficult') {
    return distance * 2;
  }
  return distance;
}

/**
 * Checks if a creature can traverse terrain based on movement type.
 * Water requires swimming, climbing requires climb speed, etc.
 */
export function canTraverseTerrain(
  terrain: TerrainType,
  creatureMovement: {
    walking: number;
    swimming?: number;
    climbing?: number;
    flying?: number;
  }
): { canTraverse: boolean; movementUsed: 'walking' | 'swimming' | 'climbing' | 'flying'; reason: string } {
  // For now, simplified - can be expanded with water, cliffs, etc.
  if (terrain === 'difficult') {
    return {
      canTraverse: true,
      movementUsed: 'walking',
      reason: 'Difficult terrain costs double movement'
    };
  }

  return {
    canTraverse: true,
    movementUsed: 'walking',
    reason: 'Normal terrain'
  };
}

// --- ENVIRONMENTAL CONDITIONS ---

/**
 * Weather effects on gameplay.
 * DMG p.109-110: Weather conditions.
 */
export interface WeatherEffect {
  visibilityReduction: number; // Percentage reduction
  movementPenalty: number; // Percentage penalty
  disadvantageOn: string[]; // Skills or checks affected
  description: string;
}

export const WEATHER_EFFECTS: Record<WeatherCondition, WeatherEffect> = {
  clear: {
    visibilityReduction: 0,
    movementPenalty: 0,
    disadvantageOn: [],
    description: 'Clear skies, no weather effects'
  },
  rain: {
    visibilityReduction: 20,
    movementPenalty: 0,
    disadvantageOn: ['Perception (sight)', 'Ranged attacks'],
    description: 'Rain creates lightly obscured areas, disadvantage on Perception checks relying on sight'
  },
  snow: {
    visibilityReduction: 50,
    movementPenalty: 50,
    disadvantageOn: ['Perception (sight)', 'Survival (tracking)'],
    description: 'Heavy snow reduces visibility by half and makes terrain difficult'
  },
  fog: {
    visibilityReduction: 80,
    movementPenalty: 50,
    disadvantageOn: ['Perception (sight)'],
    description: 'Thick fog heavily obscures areas, making terrain difficult'
  },
  storm: {
    visibilityReduction: 60,
    movementPenalty: 50,
    disadvantageOn: ['Perception (all)', 'Ranged attacks', 'Concentration'],
    description: 'Storm conditions impose heavy obscurement and difficult terrain'
  }
};

/**
 * Gets weather effects for a given condition.
 */
export function getWeatherEffects(weather: WeatherCondition): WeatherEffect {
  return WEATHER_EFFECTS[weather];
}

// --- EXPORTS ---

export default {
  canSee,
  getAttackModifiers,
  calculateMovementCost,
  canTraverseTerrain,
  getWeatherEffects,
  WEATHER_EFFECTS
};
