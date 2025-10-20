/**
 * D&D 5e Spell Slots per Class per Level
 *
 * This table defines how many spell slots each spellcasting class
 * has at each character level for spell levels 1-9.
 *
 * Based on D&D 5e SRD rules.
 */

export interface SpellSlotsByLevel {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface ClassSpellSlots {
  [characterLevel: number]: SpellSlotsByLevel;
}

/**
 * Full Casters (Bard, Cleric, Druid, Sorcerer, Wizard)
 * Gain 9th level spells at character level 17
 */
export const FULL_CASTER_SLOTS: ClassSpellSlots = {
  1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
  18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 1, level7: 1, level8: 1, level9: 1 },
  19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 1, level8: 1, level9: 1 },
  20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 2, level8: 1, level9: 1 },
};

/**
 * Half Casters (Paladin, Ranger)
 * Gain 5th level spells at character level 17
 * Start spellcasting at level 2
 */
export const HALF_CASTER_SLOTS: ClassSpellSlots = {
  1: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
};

/**
 * Third Casters (Eldritch Knight, Arcane Trickster)
 * Gain 4th level spells at character level 19
 * Start spellcasting at level 3
 */
export const THIRD_CASTER_SLOTS: ClassSpellSlots = {
  1: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  18: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  19: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  20: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
};

/**
 * Warlock Pact Magic
 * Warlocks use Pact Magic instead of traditional spell slots
 * They have fewer slots but they're all the same level and recharge on short rest
 */
export const WARLOCK_PACT_SLOTS: ClassSpellSlots = {
  1: { level1: 1, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 0, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 0, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 0, level2: 0, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 0, level2: 0, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 0, level2: 0, level3: 0, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 0, level2: 0, level3: 0, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  12: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  13: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  14: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  15: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  16: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  17: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
  18: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
  19: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
  20: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
};

/**
 * Get spell slots for a character class at a given level
 */
export function getSpellSlotsForClass(
  className: string,
  characterLevel: number
): SpellSlotsByLevel {
  const normalizedClass = className.toLowerCase();

  // Full casters
  if (['bard', 'cleric', 'druid', 'sorcerer', 'wizard'].includes(normalizedClass)) {
    return FULL_CASTER_SLOTS[characterLevel] || FULL_CASTER_SLOTS[1];
  }

  // Half casters
  if (['paladin', 'ranger'].includes(normalizedClass)) {
    return HALF_CASTER_SLOTS[characterLevel] || HALF_CASTER_SLOTS[1];
  }

  // Warlock (Pact Magic)
  if (normalizedClass === 'warlock') {
    return WARLOCK_PACT_SLOTS[characterLevel] || WARLOCK_PACT_SLOTS[1];
  }

  // Third casters (subclasses)
  if (['eldritch knight', 'arcane trickster'].includes(normalizedClass)) {
    return THIRD_CASTER_SLOTS[characterLevel] || THIRD_CASTER_SLOTS[1];
  }

  // Non-casters get no spell slots
  return {
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0,
    level6: 0,
    level7: 0,
    level8: 0,
    level9: 0,
  };
}

/**
 * Get the maximum spell level a character can cast
 */
export function getMaxSpellLevel(className: string, characterLevel: number): number {
  const slots = getSpellSlotsForClass(className, characterLevel);

  for (let level = 9; level >= 1; level--) {
    const key = `level${level}` as keyof SpellSlotsByLevel;
    if (slots[key] > 0) {
      return level;
    }
  }

  return 0; // No spell slots
}
