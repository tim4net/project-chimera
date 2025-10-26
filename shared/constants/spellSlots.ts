/**
 * D&D 5e Spell Slot Progression
 *
 * Defines spell slot progression tables for different caster types.
 * Used by classes.ts to assign spell slots to spellcasting classes.
 */

export type SpellSlotProgression = {
  [level: number]: number[];
};

/**
 * Full casters (Bard, Cleric, Druid, Sorcerer, Wizard)
 * Gain spell slots at every level
 */
export const FULL_CASTER_SLOTS: SpellSlotProgression = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

/**
 * Half casters (Paladin, Ranger)
 * Gain spell slots starting at level 2, progressing slower
 */
export const HALF_CASTER_SLOTS: SpellSlotProgression = {
  2: [2],
  3: [3],
  4: [3],
  5: [4, 2],
  6: [4, 2],
  7: [4, 3],
  8: [4, 3],
  9: [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2]
};

/**
 * Pact casters (Warlock)
 * Few spell slots but they recharge on short rest and are always max level
 */
export const PACT_CASTER_SLOTS: SpellSlotProgression = {
  1: [1],
  2: [2],
  3: [2],
  4: [2],
  5: [2],
  6: [2],
  7: [2],
  8: [2],
  9: [2],
  10: [2],
  11: [3],
  12: [3],
  13: [3],
  14: [3],
  15: [3],
  16: [3],
  17: [4],
  18: [4],
  19: [4],
  20: [4]
};

/**
 * Helper function to get spell slots for a class at a specific level
 */
export function getSpellSlotsForLevel(
  casterType: 'full' | 'half' | 'pact' | 'none',
  level: number
): number[] | undefined {
  if (casterType === 'none') {
    return undefined;
  }

  const progressionTable = {
    full: FULL_CASTER_SLOTS,
    half: HALF_CASTER_SLOTS,
    pact: PACT_CASTER_SLOTS
  }[casterType];

  return progressionTable[level];
}
