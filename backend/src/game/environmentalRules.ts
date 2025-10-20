/**
 * @file D&D 5e Environmental Rules - Main Export
 *
 * Comprehensive barrel export for all environmental systems:
 * - Vision and light mechanics
 * - Environmental hazards and damage
 * - Trap mechanics
 * - Travel and exploration rules
 *
 * Import everything: import * as EnvironmentalRules from './environmentalRules';
 * Or selectively: import { canSee, COMMON_TRAPS, TRAVEL_PACE } from './environmentalRules';
 */

// Re-export everything from environment module
export * from './environment';
export { default as Environment } from './environment';

// Re-export everything from hazards module
export * from './hazards';
export { default as Hazards } from './hazards';

// Re-export everything from traps module
export * from './traps';
export { default as Traps } from './traps';

// Re-export everything from travel module
export * from './travel';
export { default as Travel } from './travel';

/**
 * Quick reference guide for DMs and developers
 */
export const ENVIRONMENTAL_RULES_GUIDE = {
  vision: {
    description: 'Vision and light level mechanics',
    functions: ['canSee', 'getAttackModifiers'],
    types: ['LightLevel', 'VisionType', 'CreatureVision']
  },
  terrain: {
    description: 'Movement and terrain mechanics',
    functions: ['calculateMovementCost', 'canTraverseTerrain'],
    types: ['TerrainType']
  },
  weather: {
    description: 'Weather effects on gameplay',
    functions: ['getWeatherEffects'],
    constants: ['WEATHER_EFFECTS']
  },
  hazards: {
    description: 'Environmental damage and hazards',
    functions: [
      'calculateFallingDamage',
      'rollFallingDamage',
      'applyHazardDamage',
      'calculateBreathHoldingDuration',
      'calculateSuffocationRounds',
      'getExhaustionEffects'
    ],
    constants: ['HAZARDS', 'EXHAUSTION_LEVELS', 'TEMPERATURE_EFFECTS']
  },
  traps: {
    description: 'Trap detection, disarming, and triggering',
    functions: ['attemptTrapDetection', 'attemptTrapDisarm', 'triggerTrap'],
    constants: ['COMMON_TRAPS'],
    types: ['Trap', 'TrapEffect', 'TriggerType']
  },
  travel: {
    description: 'Travel pace, navigation, and exploration',
    functions: [
      'calculateTravelDistance',
      'getPassivePerception',
      'makeNavigationCheck',
      'forage',
      'checkForEncounter',
      'checkForcedMarch'
    ],
    constants: ['TRAVEL_PACE', 'NAVIGATION_DCS', 'REST_RULES'],
    types: ['TravelPace', 'TravelActivity']
  }
};

/**
 * Common use cases and example code
 */
export const USAGE_EXAMPLES = {
  vision: `
    // Check if a creature can see a target
    import { canSee } from './environmentalRules';

    const creatureVision = { type: 'darkvision', range: 60 };
    const result = canSee(
      creatureVision,
      { x: 100, y: 100 }, // target position
      { x: 90, y: 90 },   // creature position
      { lightLevel: 'dim', distance: 15 }
    );

    console.log(result.canSee); // true with darkvision
  `,

  falling: `
    // Calculate falling damage
    import { rollFallingDamage } from './environmentalRules';

    const fall = rollFallingDamage(50); // 50 feet
    console.log(fall.notation); // "5d6"
    console.log(fall.damage);   // Rolled damage (e.g., 18)
  `,

  traps: `
    // Detect and disarm a trap
    import { COMMON_TRAPS, attemptTrapDetection, attemptTrapDisarm } from './environmentalRules';

    const trap = COMMON_TRAPS.poison_dart;
    const abilityScores = { STR: 10, DEX: 16, CON: 14, INT: 12, WIS: 13, CHA: 8 };

    // Try to detect
    const detection = attemptTrapDetection(trap, abilityScores, true, 2);
    if (detection.detected) {
      // Try to disarm
      const disarm = attemptTrapDisarm(trap, abilityScores, true, 2);
      console.log(disarm.disarmed ? 'Trap disarmed!' : 'Failed to disarm');
    }
  `,

  travel: `
    // Calculate travel distance and check for encounters
    import { calculateTravelDistance, checkForEncounter, TRAVEL_PACE } from './environmentalRules';

    const distance = calculateTravelDistance('normal', 8); // 24 miles
    const encounter = checkForEncounter(18); // Check for random encounter

    console.log(\`Traveled \${distance} miles\`);
    if (encounter.encounterOccurs) {
      console.log('Random encounter!');
    }
  `
};
