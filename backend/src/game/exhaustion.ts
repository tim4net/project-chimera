/**
 * @file D&D 5e Exhaustion system implementation.
 *
 * Exhaustion is measured in six levels. An effect can give a creature one or more levels
 * of exhaustion, as specified in the effect's description. If an already exhausted creature
 * suffers another effect that causes exhaustion, its current level increases by the amount
 * specified. A creature suffers the effects of its current level as well as all lower levels.
 *
 * Level 6 exhaustion results in character death.
 */

import { CharacterRecord } from '../types/index.js';

/** Maximum exhaustion level before death */
const MAX_EXHAUSTION_LEVEL = 6;

/** Minimum exhaustion level (no exhaustion) */
const MIN_EXHAUSTION_LEVEL = 0;

/**
 * Exhaustion effects by level according to D&D 5e rules.
 */
const EXHAUSTION_EFFECTS: Record<number, string[]> = {
  1: ['Disadvantage on ability checks'],
  2: ['Speed halved'],
  3: ['Disadvantage on attack rolls and saving throws'],
  4: ['Hit point maximum halved'],
  5: ['Speed reduced to 0'],
  6: ['Death'],
};

/**
 * Increases a character's exhaustion level.
 * Maximum level is 6, at which point the character dies.
 *
 * @param character - The character gaining exhaustion
 * @param levels - Number of exhaustion levels to add (default: 1)
 * @returns The character's new exhaustion level
 */
export function gainExhaustion(character: CharacterRecord, levels: number = 1): number {
  const currentLevel = character.exhaustion_level || 0;
  const newLevel = Math.min(currentLevel + levels, MAX_EXHAUSTION_LEVEL);

  character.exhaustion_level = newLevel;

  return newLevel;
}

/**
 * Decreases a character's exhaustion level.
 * Minimum level is 0 (no exhaustion).
 * Finishing a long rest reduces exhaustion by 1 level.
 *
 * @param character - The character recovering from exhaustion
 * @param levels - Number of exhaustion levels to remove (default: 1)
 * @returns The character's new exhaustion level
 */
export function removeExhaustion(character: CharacterRecord, levels: number = 1): number {
  const currentLevel = character.exhaustion_level || 0;
  const newLevel = Math.max(currentLevel - levels, MIN_EXHAUSTION_LEVEL);

  character.exhaustion_level = newLevel;

  return newLevel;
}

/**
 * Gets the list of effects for a specific exhaustion level.
 * Effects are cumulative - a character suffers from all effects at their level and below.
 *
 * @param level - The exhaustion level to query (0-6)
 * @returns Array of effect descriptions for that level
 */
export function getExhaustionEffects(level: number): string[] {
  if (level < MIN_EXHAUSTION_LEVEL || level > MAX_EXHAUSTION_LEVEL) {
    return [];
  }

  if (level === 0) {
    return ['No exhaustion effects'];
  }

  return EXHAUSTION_EFFECTS[level] || [];
}

/**
 * Gets all cumulative effects for a character's current exhaustion level.
 * Returns effects from level 1 up to and including the current level.
 *
 * @param character - The character to check
 * @returns Array of all active effect descriptions
 */
export function getAllActiveEffects(character: CharacterRecord): string[] {
  const level = character.exhaustion_level || 0;

  if (level === 0) {
    return [];
  }

  const effects: string[] = [];
  for (let i = 1; i <= level; i++) {
    effects.push(...(EXHAUSTION_EFFECTS[i] || []));
  }

  return effects;
}

/**
 * Applies exhaustion penalties to character stats for mechanical purposes.
 * This returns modifiers that should be applied during gameplay calculations.
 *
 * @param character - The character to calculate penalties for
 * @returns Object containing speed modifier, disadvantage flags, and HP max modifier
 */
export function applyExhaustionPenalties(character: CharacterRecord): {
  speedMod: number; // Multiplier for speed (1.0 = normal, 0.5 = halved, 0 = immobilized)
  disadvantageOn: string[]; // Array of what has disadvantage: 'ability_checks', 'attacks', 'saves'
  hpMaxMod: number; // Multiplier for HP max (1.0 = normal, 0.5 = halved)
} {
  const level = character.exhaustion_level || 0;

  const penalties = {
    speedMod: 1.0,
    disadvantageOn: [] as string[],
    hpMaxMod: 1.0,
  };

  if (level === 0) {
    return penalties;
  }

  // Level 1: Disadvantage on ability checks
  if (level >= 1) {
    penalties.disadvantageOn.push('ability_checks');
  }

  // Level 2: Speed halved
  if (level >= 2) {
    penalties.speedMod = 0.5;
  }

  // Level 3: Disadvantage on attack rolls and saving throws
  if (level >= 3) {
    penalties.disadvantageOn.push('attacks', 'saves');
  }

  // Level 4: HP maximum halved
  if (level >= 4) {
    penalties.hpMaxMod = 0.5;
  }

  // Level 5: Speed reduced to 0
  if (level >= 5) {
    penalties.speedMod = 0;
  }

  // Level 6: Death (handled elsewhere, but included for completeness)

  return penalties;
}

/**
 * Checks if a character is exhausted (has any level of exhaustion).
 *
 * @param character - The character to check
 * @returns true if the character has any exhaustion, false otherwise
 */
export function isExhausted(character: CharacterRecord): boolean {
  const level = character.exhaustion_level || 0;
  return level > 0;
}

/**
 * Checks if a character has died from exhaustion (level 6).
 *
 * @param character - The character to check
 * @returns true if the character has exhaustion level 6, false otherwise
 */
export function isDead(character: CharacterRecord): boolean {
  const level = character.exhaustion_level || 0;
  return level >= MAX_EXHAUSTION_LEVEL;
}

/**
 * Gets a human-readable summary of a character's exhaustion state.
 * Useful for displaying to players.
 *
 * @param character - The character to summarize
 * @returns Formatted string describing exhaustion state and effects
 */
export function getExhaustionSummary(character: CharacterRecord): string {
  const level = character.exhaustion_level || 0;

  if (level === 0) {
    return 'No exhaustion';
  }

  if (level >= 6) {
    return 'Exhaustion Level 6 - DEAD';
  }

  const effects = getAllActiveEffects(character);
  return `Exhaustion Level ${level}: ${effects.join(', ')}`;
}
