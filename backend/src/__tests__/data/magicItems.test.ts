/**
 * Tests for the D&D 5e Magic Items Database
 */

import { describe, it, expect } from '@jest/globals';
import {
  MAGIC_ITEMS,
  getMagicItemsByRarity,
  getMagicItemsByType,
  getMagicItemByName,
  getAttunementItems,
  getRandomMagicItem,
  getRandomMagicItems,
  searchMagicItems,
  getItemTypes,
  getMagicItemsStats
} from '../../data/magicItems';

describe('Magic Items Database', () => {
  describe('MAGIC_ITEMS', () => {
    it('should contain 239 items', () => {
      expect(MAGIC_ITEMS).toHaveLength(239);
    });

    it('should have valid structure for all items', () => {
      for (const item of MAGIC_ITEMS) {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('rarity');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('requiresAttunement');
        expect(item).toHaveProperty('description');

        expect(typeof item.name).toBe('string');
        expect(typeof item.rarity).toBe('string');
        expect(typeof item.type).toBe('string');
        expect(typeof item.requiresAttunement).toBe('boolean');
        expect(typeof item.description).toBe('string');

        expect(['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact'])
          .toContain(item.rarity);
      }
    });
  });

  describe('getMagicItemsByRarity', () => {
    it('should return correct counts for each rarity', () => {
      expect(getMagicItemsByRarity('common')).toHaveLength(12);
      expect(getMagicItemsByRarity('uncommon')).toHaveLength(69);
      expect(getMagicItemsByRarity('rare')).toHaveLength(79);
      expect(getMagicItemsByRarity('very-rare')).toHaveLength(51);
      expect(getMagicItemsByRarity('legendary')).toHaveLength(27);
      expect(getMagicItemsByRarity('artifact')).toHaveLength(1);
    });

    it('should return only items of the specified rarity', () => {
      const legendaryItems = getMagicItemsByRarity('legendary');
      expect(legendaryItems.every(item => item.rarity === 'legendary')).toBe(true);
    });
  });

  describe('getMagicItemsByType', () => {
    it('should return items of the specified type', () => {
      const weapons = getMagicItemsByType('weapon');
      expect(weapons.length).toBeGreaterThan(0);
      expect(weapons.every(item => item.type === 'weapon')).toBe(true);
    });

    it('should find potions', () => {
      const potions = getMagicItemsByType('potion');
      expect(potions.length).toBe(16);
    });

    it('should find rings', () => {
      const rings = getMagicItemsByType('ring');
      expect(rings.length).toBe(25);
    });
  });

  describe('getMagicItemByName', () => {
    it('should find item by exact name', () => {
      const item = getMagicItemByName('Vorpal Sword');
      expect(item).toBeDefined();
      expect(item?.name).toBe('Vorpal Sword');
      expect(item?.rarity).toBe('legendary');
    });

    it('should find item by case-insensitive name', () => {
      const item = getMagicItemByName('bag of holding');
      expect(item).toBeDefined();
      expect(item?.name).toBe('Bag of Holding');
    });

    it('should return undefined for non-existent item', () => {
      const item = getMagicItemByName('Nonexistent Sword of Awesome');
      expect(item).toBeUndefined();
    });
  });

  describe('getAttunementItems', () => {
    it('should return 126 items requiring attunement', () => {
      const attunementItems = getAttunementItems();
      expect(attunementItems).toHaveLength(126);
    });

    it('should only include items requiring attunement', () => {
      const attunementItems = getAttunementItems();
      expect(attunementItems.every(item => item.requiresAttunement)).toBe(true);
    });
  });

  describe('getRandomMagicItem', () => {
    it('should return a random item', () => {
      const item = getRandomMagicItem();
      expect(item).toBeDefined();
      expect(MAGIC_ITEMS).toContainEqual(item);
    });

    it('should return a random item of specified rarity', () => {
      const item = getRandomMagicItem('legendary');
      expect(item).toBeDefined();
      expect(item.rarity).toBe('legendary');
    });

    it('should return different items on multiple calls (probabilistic)', () => {
      const items = new Set();
      for (let i = 0; i < 10; i++) {
        items.add(getRandomMagicItem().name);
      }
      // With 239 items, we should get at least 5 different ones in 10 tries
      expect(items.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getRandomMagicItems', () => {
    it('should return requested number of items', () => {
      const items = getRandomMagicItems(5);
      expect(items).toHaveLength(5);
    });

    it('should filter by rarity', () => {
      const items = getRandomMagicItems(3, { rarity: 'uncommon' });
      expect(items).toHaveLength(3);
      expect(items.every(item => item.rarity === 'uncommon')).toBe(true);
    });

    it('should filter by type', () => {
      const items = getRandomMagicItems(3, { type: 'ring' });
      expect(items).toHaveLength(3);
      expect(items.every(item => item.type === 'ring')).toBe(true);
    });

    it('should filter by attunement requirement', () => {
      const items = getRandomMagicItems(3, { requiresAttunement: true });
      expect(items).toHaveLength(3);
      expect(items.every(item => item.requiresAttunement)).toBe(true);
    });

    it('should handle multiple filters', () => {
      const items = getRandomMagicItems(2, {
        rarity: 'rare',
        requiresAttunement: true
      });
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(item =>
        item.rarity === 'rare' && item.requiresAttunement
      )).toBe(true);
    });
  });

  describe('searchMagicItems', () => {
    it('should find items by partial name', () => {
      const items = searchMagicItems('sword');
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(item =>
        item.name.toLowerCase().includes('sword')
      )).toBe(true);
    });

    it('should be case-insensitive', () => {
      const items = searchMagicItems('POTION');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const items = searchMagicItems('zzzzz');
      expect(items).toHaveLength(0);
    });
  });

  describe('getItemTypes', () => {
    it('should return array of unique types', () => {
      const types = getItemTypes();
      expect(types.length).toBeGreaterThan(0);
      expect(new Set(types).size).toBe(types.length); // All unique
    });

    it('should include common types', () => {
      const types = getItemTypes();
      expect(types).toContain('weapon');
      expect(types).toContain('armor');
      expect(types).toContain('potion');
      expect(types).toContain('ring');
      expect(types).toContain('wondrous-item');
    });

    it('should return sorted array', () => {
      const types = getItemTypes();
      const sorted = [...types].sort();
      expect(types).toEqual(sorted);
    });
  });

  describe('getMagicItemsStats', () => {
    it('should return correct statistics', () => {
      const stats = getMagicItemsStats();

      expect(stats.total).toBe(239);
      expect(stats.requiresAttunement).toBe(126);

      expect(stats.byRarity.common).toBe(12);
      expect(stats.byRarity.uncommon).toBe(69);
      expect(stats.byRarity.rare).toBe(79);
      expect(stats.byRarity['very-rare']).toBe(51);
      expect(stats.byRarity.legendary).toBe(27);
      expect(stats.byRarity.artifact).toBe(1);

      expect(stats.types).toBeDefined();
      expect(stats.types.length).toBeGreaterThan(0);
    });

    it('should have correct type counts', () => {
      const stats = getMagicItemsStats();

      expect(stats.byType['wondrous-item']).toBe(88);
      expect(stats.byType.weapon).toBe(28);
      expect(stats.byType.ring).toBe(25);
      expect(stats.byType.potion).toBe(16);
    });
  });

  describe('Specific Magic Items', () => {
    it('should have Vorpal Sword with correct properties', () => {
      const item = getMagicItemByName('Vorpal Sword');
      expect(item).toBeDefined();
      expect(item?.rarity).toBe('legendary');
      expect(item?.requiresAttunement).toBe(true);
      expect(item?.type).toBe('weapon');
      expect(item?.properties?.bonus).toBe(3);
    });

    it('should have Bag of Holding with correct properties', () => {
      const item = getMagicItemByName('Bag of Holding');
      expect(item).toBeDefined();
      expect(item?.rarity).toBe('uncommon');
      expect(item?.requiresAttunement).toBe(false);
      expect(item?.type).toBe('container');
    });

    it('should have Potion of Healing', () => {
      const item = getMagicItemByName('Potion of Healing');
      expect(item).toBeDefined();
      expect(item?.type).toBe('potion');
      expect(item?.requiresAttunement).toBe(false);
    });

    it('should have Ring of Spell Storing', () => {
      const item = getMagicItemByName('Ring of Spell Storing');
      expect(item).toBeDefined();
      expect(item?.rarity).toBe('rare');
      expect(item?.requiresAttunement).toBe(true);
      expect(item?.type).toBe('ring');
    });

    it('should have Staff of the Magi', () => {
      const item = getMagicItemByName('Staff of the Magi');
      expect(item).toBeDefined();
      expect(item?.rarity).toBe('legendary');
      expect(item?.requiresAttunement).toBe(true);
      expect(item?.properties?.bonus).toBe(2);
      expect(item?.properties?.charges).toBe(50);
    });
  });
});
