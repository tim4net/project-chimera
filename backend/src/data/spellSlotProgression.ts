/**
 * @file Spell Slot Progression - D&D 5e Spellcasting
 *
 * Comprehensive spell slot tables for all spellcasting classes from PHB.
 * Includes progression for full casters, half casters, third casters, and Warlock's unique Pact Magic.
 *
 * Reference: D&D 5e Player's Handbook (PHB)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SpellSlots {
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

export interface WarlockSlots {
  slots: number;          // Number of spell slots
  slotLevel: number;      // Level of all slots (1-5)
}

export interface SpellcastingInfo {
  slots: SpellSlots | WarlockSlots;
  cantripsKnown: number;
  spellsKnown?: number;   // For classes that know a limited number of spells
  spellsLearned?: number; // Number of NEW spells learned at this level
  cantripsLearned?: number; // Number of NEW cantrips learned at this level
  newSpellLevel?: number; // The highest spell level newly available at this level
}

export type SpellcastingClass =
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Sorcerer'
  | 'Wizard'
  | 'Paladin'
  | 'Ranger'
  | 'Eldritch Knight'
  | 'Arcane Trickster'
  | 'Warlock';

// ============================================================================
// FULL CASTERS (Bard, Cleric, Druid, Sorcerer, Wizard)
// ============================================================================

const FULL_CASTER_SLOTS: Record<number, SpellSlots> = {
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

// ============================================================================
// HALF CASTERS (Paladin, Ranger)
// ============================================================================

const HALF_CASTER_SLOTS: Record<number, SpellSlots> = {
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

// ============================================================================
// THIRD CASTERS (Eldritch Knight, Arcane Trickster)
// ============================================================================

const THIRD_CASTER_SLOTS: Record<number, SpellSlots> = {
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

// ============================================================================
// WARLOCK (Pact Magic - Unique System)
// ============================================================================

const WARLOCK_SLOTS: Record<number, WarlockSlots> = {
  1: { slots: 1, slotLevel: 1 },
  2: { slots: 2, slotLevel: 1 },
  3: { slots: 2, slotLevel: 2 },
  4: { slots: 2, slotLevel: 2 },
  5: { slots: 2, slotLevel: 3 },
  6: { slots: 2, slotLevel: 3 },
  7: { slots: 2, slotLevel: 4 },
  8: { slots: 2, slotLevel: 4 },
  9: { slots: 2, slotLevel: 5 },
  10: { slots: 2, slotLevel: 5 },
  11: { slots: 3, slotLevel: 5 },
  12: { slots: 3, slotLevel: 5 },
  13: { slots: 3, slotLevel: 5 },
  14: { slots: 3, slotLevel: 5 },
  15: { slots: 3, slotLevel: 5 },
  16: { slots: 3, slotLevel: 5 },
  17: { slots: 4, slotLevel: 5 },
  18: { slots: 4, slotLevel: 5 },
  19: { slots: 4, slotLevel: 5 },
  20: { slots: 4, slotLevel: 5 },
};

// ============================================================================
// CANTRIPS KNOWN
// ============================================================================

const CANTRIPS_KNOWN: Record<string, Record<number, number>> = {
  Bard: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  Cleric: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5,
  },
  Druid: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  Sorcerer: {
    1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6,
    11: 6, 12: 6, 13: 6, 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6,
  },
  Wizard: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5,
  },
  'Eldritch Knight': {
    1: 0, 2: 0, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 3,
    11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
  },
  'Arcane Trickster': {
    1: 0, 2: 0, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  Warlock: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
  },
  // Paladin and Ranger do not get cantrips
  Paladin: {},
  Ranger: {},
};

// ============================================================================
// SPELLS KNOWN (for classes that don't prepare from full list)
// ============================================================================

const SPELLS_KNOWN: Record<string, Record<number, number>> = {
  Bard: {
    1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
    11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22,
  },
  Sorcerer: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
    11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15,
  },
  Ranger: {
    1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6,
    11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11,
  },
  'Eldritch Knight': {
    1: 0, 2: 0, 3: 3, 4: 4, 5: 4, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7,
    11: 8, 12: 8, 13: 9, 14: 10, 15: 10, 16: 11, 17: 11, 18: 11, 19: 12, 20: 13,
  },
  'Arcane Trickster': {
    1: 0, 2: 0, 3: 3, 4: 4, 5: 4, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7,
    11: 8, 12: 8, 13: 9, 14: 10, 15: 10, 16: 11, 17: 11, 18: 11, 19: 12, 20: 13,
  },
  Warlock: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10,
    11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15,
  },
  // Cleric, Druid, Wizard, and Paladin prepare spells from full class list
  Cleric: {},
  Druid: {},
  Wizard: {},
  Paladin: {},
};

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Get spell slots for a character at a specific level.
 * Returns proper slots structure based on class type.
 */
export function getSpellSlotsForLevel(
  characterClass: string,
  level: number
): SpellSlots | WarlockSlots | null {
  if (level < 1 || level > 20) {
    console.warn(`[SpellSlotProgression] Invalid level: ${level}`);
    return null;
  }

  // Warlock uses unique Pact Magic system
  if (characterClass === 'Warlock') {
    return WARLOCK_SLOTS[level];
  }

  // Full casters
  if (['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'].includes(characterClass)) {
    return FULL_CASTER_SLOTS[level];
  }

  // Half casters
  if (['Paladin', 'Ranger'].includes(characterClass)) {
    return HALF_CASTER_SLOTS[level];
  }

  // Third casters
  if (['Eldritch Knight', 'Arcane Trickster'].includes(characterClass)) {
    return THIRD_CASTER_SLOTS[level];
  }

  // Non-spellcasting class
  return null;
}

/**
 * Get the number of NEW spells learned when leveling up.
 * Returns 0 if no new spells, or if class prepares spells.
 */
export function getNewSpellsLearnedCount(characterClass: string, level: number): number {
  if (level < 1 || level > 20) return 0;

  const spellsKnownTable = SPELLS_KNOWN[characterClass];
  if (!spellsKnownTable) return 0; // Class prepares spells or doesn't cast

  const currentSpells = spellsKnownTable[level] || 0;
  const previousSpells = level > 1 ? (spellsKnownTable[level - 1] || 0) : 0;

  return Math.max(0, currentSpells - previousSpells);
}

/**
 * Get the number of NEW cantrips learned when leveling up.
 * Returns 0 if no new cantrips.
 */
export function getNewCantripsCount(characterClass: string, level: number): number {
  if (level < 1 || level > 20) return 0;

  const cantripsKnownTable = CANTRIPS_KNOWN[characterClass];
  if (!cantripsKnownTable) return 0; // Class doesn't get cantrips

  const currentCantrips = cantripsKnownTable[level] || 0;
  const previousCantrips = level > 1 ? (cantripsKnownTable[level - 1] || 0) : 0;

  return Math.max(0, currentCantrips - previousCantrips);
}

/**
 * Get the highest NEW spell level unlocked at this level.
 * Returns null if no new spell level is unlocked.
 */
export function getSpellLevelUnlocked(characterClass: string, level: number): number | null {
  if (level < 1 || level > 20) return null;

  const currentSlots = getSpellSlotsForLevel(characterClass, level);
  if (!currentSlots) return null;

  // Handle Warlock's Pact Magic
  if ('slotLevel' in currentSlots) {
    const previousSlots = level > 1 ? getSpellSlotsForLevel(characterClass, level - 1) : null;
    if (!previousSlots || !('slotLevel' in previousSlots)) {
      return currentSlots.slotLevel; // First level
    }
    if (currentSlots.slotLevel > previousSlots.slotLevel) {
      return currentSlots.slotLevel;
    }
    return null;
  }

  // Handle standard spellcasters
  const previousSlots = level > 1 ? getSpellSlotsForLevel(characterClass, level - 1) : null;

  // Check each spell level to find newly unlocked ones
  const spellLevels = [
    'level1', 'level2', 'level3', 'level4', 'level5',
    'level6', 'level7', 'level8', 'level9'
  ] as const;

  for (let i = spellLevels.length - 1; i >= 0; i--) {
    const slotKey = spellLevels[i];
    const currentCount = currentSlots[slotKey];
    const previousCount = previousSlots ? (previousSlots as SpellSlots)[slotKey] : 0;

    if (currentCount > 0 && previousCount === 0) {
      return i + 1; // Return the spell level (1-9)
    }
  }

  return null; // No new spell level unlocked
}

/**
 * Check if a class is a spellcaster.
 */
export function isSpellcaster(characterClass: string): boolean {
  return getSpellSlotsForLevel(characterClass, 1) !== null ||
         ['Paladin', 'Ranger', 'Eldritch Knight', 'Arcane Trickster'].includes(characterClass);
}

/**
 * Get complete spellcasting info for a level.
 * Useful for displaying in UI or determining what selections are needed.
 */
export function getSpellcastingInfo(characterClass: string, level: number): SpellcastingInfo | null {
  if (!isSpellcaster(characterClass)) return null;

  const slots = getSpellSlotsForLevel(characterClass, level);
  if (!slots) return null;

  const cantripsKnownTable = CANTRIPS_KNOWN[characterClass];
  const spellsKnownTable = SPELLS_KNOWN[characterClass];

  return {
    slots,
    cantripsKnown: cantripsKnownTable?.[level] || 0,
    spellsKnown: spellsKnownTable?.[level] || undefined,
    spellsLearned: getNewSpellsLearnedCount(characterClass, level),
    cantripsLearned: getNewCantripsCount(characterClass, level),
    newSpellLevel: getSpellLevelUnlocked(characterClass, level) || undefined,
  };
}

/**
 * Get the spellcasting ability for a class (for save DC and attack bonus).
 * Returns the ability score key (e.g., 'CHA', 'INT', 'WIS').
 */
export function getSpellcastingAbility(characterClass: string): 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' | null {
  const abilityMap: Record<string, 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'> = {
    Bard: 'CHA',
    Cleric: 'WIS',
    Druid: 'WIS',
    Sorcerer: 'CHA',
    Wizard: 'INT',
    Paladin: 'CHA',
    Ranger: 'WIS',
    'Eldritch Knight': 'INT',
    'Arcane Trickster': 'INT',
    Warlock: 'CHA',
  };

  return abilityMap[characterClass] || null;
}
