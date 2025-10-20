/**
 * D&D 5e Attunement System
 *
 * Rules:
 * - Characters can attune to a maximum of 3 magic items simultaneously
 * - Attunement requires a short rest (1 hour) spent focusing on the item
 * - Breaking attunement is instant but requires the character's consent
 * - If a character tries to attune to a 4th item, they must first break attunement to another
 * - Some items require attunement by a specific class, race, or alignment
 */

import { MagicItem } from '../data/magicItems';

export interface AttunedItem {
  itemName: string;
  attunedAt: Date;
}

export interface CharacterAttunement {
  characterId: string;
  attunedItems: AttunedItem[];
  maxSlots: number;
}

/**
 * Maximum number of attunement slots per character (D&D 5e standard)
 */
export const MAX_ATTUNEMENT_SLOTS = 3;

/**
 * Check if a character has an available attunement slot
 */
export function hasAvailableAttunementSlot(attunement: CharacterAttunement): boolean {
  return attunement.attunedItems.length < attunement.maxSlots;
}

/**
 * Get the number of available attunement slots
 */
export function getAvailableSlots(attunement: CharacterAttunement): number {
  return Math.max(0, attunement.maxSlots - attunement.attunedItems.length);
}

/**
 * Check if a character is attuned to a specific item
 */
export function isAttunedTo(attunement: CharacterAttunement, itemName: string): boolean {
  return attunement.attunedItems.some(item => item.itemName === itemName);
}

/**
 * Attune to a magic item
 * @throws Error if no attunement slots available or already attuned to the item
 */
export function attuneToItem(
  attunement: CharacterAttunement,
  item: MagicItem
): CharacterAttunement {
  // Validate item requires attunement
  if (!item.requiresAttunement) {
    throw new Error(`${item.name} does not require attunement`);
  }

  // Check if already attuned
  if (isAttunedTo(attunement, item.name)) {
    throw new Error(`Already attuned to ${item.name}`);
  }

  // Check available slots
  if (!hasAvailableAttunementSlot(attunement)) {
    throw new Error(
      `No available attunement slots (${attunement.attunedItems.length}/${attunement.maxSlots}). ` +
      `Break attunement to another item first.`
    );
  }

  // Attune to the item
  return {
    ...attunement,
    attunedItems: [
      ...attunement.attunedItems,
      {
        itemName: item.name,
        attunedAt: new Date()
      }
    ]
  };
}

/**
 * Break attunement to a magic item
 * @throws Error if not attuned to the item
 */
export function breakAttunement(
  attunement: CharacterAttunement,
  itemName: string
): CharacterAttunement {
  if (!isAttunedTo(attunement, itemName)) {
    throw new Error(`Not attuned to ${itemName}`);
  }

  return {
    ...attunement,
    attunedItems: attunement.attunedItems.filter(item => item.itemName !== itemName)
  };
}

/**
 * Replace attunement (break one, attune to another)
 * Useful when all slots are full
 */
export function replaceAttunement(
  attunement: CharacterAttunement,
  removeItemName: string,
  newItem: MagicItem
): CharacterAttunement {
  const afterBreak = breakAttunement(attunement, removeItemName);
  return attuneToItem(afterBreak, newItem);
}

/**
 * Get all attuned item names
 */
export function getAttunedItemNames(attunement: CharacterAttunement): string[] {
  return attunement.attunedItems.map(item => item.itemName);
}

/**
 * Create a new attunement record for a character
 */
export function createAttunementRecord(
  characterId: string,
  maxSlots: number = MAX_ATTUNEMENT_SLOTS
): CharacterAttunement {
  return {
    characterId,
    attunedItems: [],
    maxSlots
  };
}

/**
 * Calculate attunement time (short rest = 1 hour in D&D 5e)
 */
export const ATTUNEMENT_TIME_HOURS = 1;

/**
 * Validate attunement eligibility
 * In the future, this can check class/race/alignment requirements
 */
export function canAttuneToItem(
  item: MagicItem,
  characterClass?: string,
  characterRace?: string,
  characterAlignment?: string
): { canAttune: boolean; reason?: string } {
  // Basic check: does item require attunement?
  if (!item.requiresAttunement) {
    return {
      canAttune: true
    };
  }

  // Parse description for class/race requirements
  const desc = item.description.toLowerCase();

  // Check for class restrictions (e.g., "requires attunement by a wizard")
  if (characterClass) {
    // Extract class requirements from description
    const byMatch = desc.match(/by a ([\w\s,]+?)[\.)]/);
    if (byMatch) {
      const requirements = byMatch[1];
      const allowedClasses = requirements
        .split(/,|\sor\s/)
        .map(c => c.trim())
        .filter(c => c.length > 0);

      // Check if character's class is in the allowed list
      const charClassLower = characterClass.toLowerCase();
      const isAllowed = allowedClasses.some(reqClass =>
        reqClass.toLowerCase() === charClassLower ||
        charClassLower.includes(reqClass.toLowerCase())
      );

      if (!isAllowed) {
        return {
          canAttune: false,
          reason: `Requires attunement by a ${requirements}`
        };
      }
    }
  }

  // Check for alignment restrictions (e.g., "requires attunement by a good creature")
  if (characterAlignment && desc.includes('alignment')) {
    const alignments = ['good', 'evil', 'lawful', 'chaotic', 'neutral'];
    for (const alignment of alignments) {
      if (desc.includes(`${alignment} creature`) || desc.includes(`${alignment} alignment`)) {
        if (!characterAlignment.toLowerCase().includes(alignment)) {
          return {
            canAttune: false,
            reason: `Requires ${alignment} alignment`
          };
        }
      }
    }
  }

  return { canAttune: true };
}

/**
 * Get attunement summary for display
 */
export function getAttunementSummary(attunement: CharacterAttunement): string {
  const used = attunement.attunedItems.length;
  const total = attunement.maxSlots;
  const available = total - used;

  const summary = [
    `Attunement Slots: ${used}/${total} used, ${available} available`,
    ''
  ];

  if (attunement.attunedItems.length > 0) {
    summary.push('Attuned Items:');
    attunement.attunedItems.forEach((item, index) => {
      const daysSince = Math.floor(
        (Date.now() - item.attunedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      summary.push(`  ${index + 1}. ${item.itemName} (${daysSince}d ago)`);
    });
  } else {
    summary.push('No attuned items');
  }

  return summary.join('\n');
}
