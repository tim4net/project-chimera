/**
 * @file Spell Slot Leveling Integration
 *
 * Integrates spell slot progression with the leveling system.
 * Automatically updates spell slots when characters level up.
 */

import {
  getSpellSlotsForLevel,
  getSpellcastingInfo,
  isSpellcaster,
  type SpellSlots,
  type WarlockSlots,
} from '../data/spellSlotProgression';

/**
 * Convert spell slot structure to database format.
 * Database stores as Record<string, number> (e.g., { "1": 4, "2": 3 })
 */
export function convertSlotsToDbFormat(
  slots: SpellSlots | WarlockSlots
): Record<string, number> {
  // Handle Warlock's Pact Magic
  if ('slotLevel' in slots) {
    return {
      [slots.slotLevel.toString()]: slots.slots,
      pact_magic: 1, // Flag to indicate Pact Magic system
    };
  }

  // Handle standard spellcasters
  const dbSlots: Record<string, number> = {};
  const slotLevels = [
    'level1', 'level2', 'level3', 'level4', 'level5',
    'level6', 'level7', 'level8', 'level9'
  ] as const;

  slotLevels.forEach((key, index) => {
    const count = slots[key];
    if (count > 0) {
      dbSlots[(index + 1).toString()] = count;
    }
  });

  return dbSlots;
}

/**
 * Get updated spell slots when leveling up.
 * Returns null if character is not a spellcaster or doesn't gain slots at this level.
 */
export function getUpdatedSpellSlots(
  characterClass: string,
  newLevel: number
): Record<string, number> | null {
  if (!isSpellcaster(characterClass)) {
    return null;
  }

  const slots = getSpellSlotsForLevel(characterClass, newLevel);
  if (!slots) {
    return null;
  }

  return convertSlotsToDbFormat(slots);
}

/**
 * Generate a descriptive message about spell slot changes when leveling up.
 */
export function getSpellSlotLevelUpMessage(
  characterClass: string,
  oldLevel: number,
  newLevel: number
): string | null {
  if (!isSpellcaster(characterClass)) {
    return null;
  }

  const oldInfo = getSpellcastingInfo(characterClass, oldLevel);
  const newInfo = getSpellcastingInfo(characterClass, newLevel);

  if (!newInfo) {
    return null;
  }

  const messages: string[] = [];

  // Handle Warlock specially
  if ('slotLevel' in newInfo.slots) {
    const oldSlots = oldInfo && 'slotLevel' in oldInfo.slots ? oldInfo.slots : null;
    const newSlots = newInfo.slots;

    if (!oldSlots) {
      messages.push(`You gain ${newSlots.slots} spell slot${newSlots.slots > 1 ? 's' : ''} of ${newSlots.slotLevel}${getOrdinalSuffix(newSlots.slotLevel)} level (Pact Magic)!`);
    } else if (newSlots.slots > oldSlots.slots) {
      messages.push(`You gain an additional spell slot (now ${newSlots.slots} total)!`);
    } else if (newSlots.slotLevel > oldSlots.slotLevel) {
      messages.push(`Your spell slots upgrade to ${newSlots.slotLevel}${getOrdinalSuffix(newSlots.slotLevel)} level!`);
    }
  } else {
    // Standard spellcasters
    const oldSlots = oldInfo && 'level1' in oldInfo.slots ? oldInfo.slots as SpellSlots : null;
    const newSlots = newInfo.slots as SpellSlots;

    const slotLevels = [
      'level1', 'level2', 'level3', 'level4', 'level5',
      'level6', 'level7', 'level8', 'level9'
    ] as const;

    slotLevels.forEach((key, index) => {
      const slotLevel = index + 1;
      const oldCount = oldSlots ? oldSlots[key] : 0;
      const newCount = newSlots[key];

      if (newCount > oldCount) {
        if (oldCount === 0) {
          messages.push(`You unlock ${newCount} ${slotLevel}${getOrdinalSuffix(slotLevel)}-level spell slot${newCount > 1 ? 's' : ''}!`);
        } else {
          const gained = newCount - oldCount;
          messages.push(`You gain ${gained} additional ${slotLevel}${getOrdinalSuffix(slotLevel)}-level spell slot${gained > 1 ? 's' : ''}!`);
        }
      }
    });
  }

  // Add cantrip info
  if (newInfo.cantripsLearned && newInfo.cantripsLearned > 0) {
    messages.push(`You can learn ${newInfo.cantripsLearned} new cantrip${newInfo.cantripsLearned > 1 ? 's' : ''}!`);
  }

  // Add spell learning info
  if (newInfo.spellsLearned && newInfo.spellsLearned > 0) {
    messages.push(`You can learn ${newInfo.spellsLearned} new spell${newInfo.spellsLearned > 1 ? 's' : ''}!`);
  }

  // Special message for first-time spellcasters
  if (oldLevel === 1 && newLevel === 2 && ['Paladin', 'Ranger'].includes(characterClass)) {
    messages.unshift('You gain the ability to cast spells!');
  }

  if (oldLevel === 2 && newLevel === 3 && ['Eldritch Knight', 'Arcane Trickster'].includes(characterClass)) {
    messages.unshift('You gain the ability to cast spells!');
  }

  return messages.length > 0 ? messages.join(' ') : null;
}

/**
 * Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Check if a character needs to select new spells/cantrips after leveling.
 */
export function needsSpellSelection(
  characterClass: string,
  newLevel: number
): {
  needsSelection: boolean;
  cantripsNeeded: number;
  spellsNeeded: number;
  newSpellLevel?: number;
} {
  const info = getSpellcastingInfo(characterClass, newLevel);

  if (!info) {
    return {
      needsSelection: false,
      cantripsNeeded: 0,
      spellsNeeded: 0,
    };
  }

  const cantripsNeeded = info.cantripsLearned || 0;
  const spellsNeeded = info.spellsLearned || 0;

  return {
    needsSelection: cantripsNeeded > 0 || spellsNeeded > 0,
    cantripsNeeded,
    spellsNeeded,
    newSpellLevel: info.newSpellLevel,
  };
}
