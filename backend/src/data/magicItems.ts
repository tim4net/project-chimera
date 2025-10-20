/**
 * D&D 5e SRD Magic Items Database
 * Imported from https://www.dnd5eapi.co/api/magic-items
 *
 * Total Items: 239
 * - Common: 12
 * - Uncommon: 69
 * - Rare: 79
 * - Very Rare: 51
 * - Legendary: 27
 * - Artifact: 1
 *
 * Attunement Required: 126 items
 */

export interface MagicItem {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  type: string;
  requiresAttunement: boolean;
  description: string;
  properties?: {
    bonus?: number;
    charges?: number;
    damage?: string;
    ac?: number;
    effects?: string[];
  };
}

// Import the raw data
import magicItemsData from './magicItemsData.json';

export const MAGIC_ITEMS: MagicItem[] = magicItemsData as MagicItem[];

/**
 * Get all magic items of a specific rarity
 */
export function getMagicItemsByRarity(rarity: MagicItem['rarity']): MagicItem[] {
  return MAGIC_ITEMS.filter(item => item.rarity === rarity);
}

/**
 * Get all magic items of a specific type
 */
export function getMagicItemsByType(type: string): MagicItem[] {
  return MAGIC_ITEMS.filter(item => item.type === type);
}

/**
 * Get a specific magic item by name (case-insensitive)
 */
export function getMagicItemByName(name: string): MagicItem | undefined {
  const lowerName = name.toLowerCase();
  return MAGIC_ITEMS.find(item => item.name.toLowerCase() === lowerName);
}

/**
 * Get all magic items that require attunement
 */
export function getAttunementItems(): MagicItem[] {
  return MAGIC_ITEMS.filter(item => item.requiresAttunement);
}

/**
 * Get a random magic item of a specific rarity
 */
export function getRandomMagicItem(rarity?: MagicItem['rarity']): MagicItem {
  const pool = rarity ? getMagicItemsByRarity(rarity) : MAGIC_ITEMS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Get multiple random magic items with optional filters
 */
export function getRandomMagicItems(
  count: number,
  options?: {
    rarity?: MagicItem['rarity'];
    type?: string;
    requiresAttunement?: boolean;
  }
): MagicItem[] {
  let pool = MAGIC_ITEMS;

  if (options?.rarity) {
    pool = pool.filter(item => item.rarity === options.rarity);
  }

  if (options?.type) {
    pool = pool.filter(item => item.type === options.type);
  }

  if (options?.requiresAttunement !== undefined) {
    pool = pool.filter(item => item.requiresAttunement === options.requiresAttunement);
  }

  // Shuffle and take first N items
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Search magic items by name (partial match, case-insensitive)
 */
export function searchMagicItems(query: string): MagicItem[] {
  const lowerQuery = query.toLowerCase();
  return MAGIC_ITEMS.filter(item => item.name.toLowerCase().includes(lowerQuery));
}

/**
 * Get all unique item types
 */
export function getItemTypes(): string[] {
  const types = new Set(MAGIC_ITEMS.map(item => item.type));
  return Array.from(types).sort();
}

/**
 * Get statistics about the magic items database
 */
export function getMagicItemsStats() {
  const stats = {
    total: MAGIC_ITEMS.length,
    byRarity: {} as Record<MagicItem['rarity'], number>,
    byType: {} as Record<string, number>,
    requiresAttunement: MAGIC_ITEMS.filter(i => i.requiresAttunement).length,
    types: getItemTypes()
  };

  for (const item of MAGIC_ITEMS) {
    stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
  }

  return stats;
}
