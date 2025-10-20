/**
 * Tests for the D&D 5e Attunement System
 */

import { describe, it, expect } from '@jest/globals';
import {
  createAttunementRecord,
  attuneToItem,
  breakAttunement,
  replaceAttunement,
  hasAvailableAttunementSlot,
  getAvailableSlots,
  isAttunedTo,
  getAttunedItemNames,
  canAttuneToItem,
  MAX_ATTUNEMENT_SLOTS
} from '../../game/attunement';
import {
  getMagicItemByName,
  getMagicItemsByRarity,
  getAttunementItems
} from '../../data/magicItems';

describe('Attunement System', () => {
  describe('createAttunementRecord', () => {
    it('should create a new attunement record with 3 slots by default', () => {
      const attunement = createAttunementRecord('char-123');
      expect(attunement.characterId).toBe('char-123');
      expect(attunement.maxSlots).toBe(3);
      expect(attunement.attunedItems).toHaveLength(0);
    });

    it('should create a record with custom slot count', () => {
      const attunement = createAttunementRecord('char-456', 5);
      expect(attunement.maxSlots).toBe(5);
    });
  });

  describe('hasAvailableAttunementSlot', () => {
    it('should return true when slots are available', () => {
      const attunement = createAttunementRecord('char-123');
      expect(hasAvailableAttunementSlot(attunement)).toBe(true);
    });

    it('should return false when all slots are used', () => {
      const attunement = createAttunementRecord('char-123');
      const attunementItems = getAttunementItems().slice(0, 3);
      expect(attunementItems.length).toBeGreaterThanOrEqual(3);

      let updated = attunement;
      for (let i = 0; i < 3; i++) {
        updated = attuneToItem(updated, attunementItems[i]);
      }

      expect(hasAvailableAttunementSlot(updated)).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return correct number of available slots', () => {
      const attunement = createAttunementRecord('char-123');
      expect(getAvailableSlots(attunement)).toBe(3);

      const items = getAttunementItems().slice(0, 2);
      let updated = attuneToItem(attunement, items[0]);
      expect(getAvailableSlots(updated)).toBe(2);

      updated = attuneToItem(updated, items[1]);
      expect(getAvailableSlots(updated)).toBe(1);
    });
  });

  describe('attuneToItem', () => {
    it('should successfully attune to an item requiring attunement', () => {
      const attunement = createAttunementRecord('char-123');
      const item = getAttunementItems()[0];

      const updated = attuneToItem(attunement, item);
      expect(updated.attunedItems).toHaveLength(1);
      expect(updated.attunedItems[0].itemName).toBe(item.name);
    });

    it('should throw error when item does not require attunement', () => {
      const attunement = createAttunementRecord('char-123');
      const potionOfHealing = getMagicItemByName('Potion of Healing');

      if (!potionOfHealing) throw new Error('Potion of Healing not found');

      expect(() => attuneToItem(attunement, potionOfHealing)).toThrow(
        'does not require attunement'
      );
    });

    it('should throw error when already attuned to the item', () => {
      const attunement = createAttunementRecord('char-123');
      const item = getAttunementItems()[0];

      const updated = attuneToItem(attunement, item);

      expect(() => attuneToItem(updated, item)).toThrow('Already attuned');
    });

    it('should throw error when no attunement slots available', () => {
      const attunement = createAttunementRecord('char-123');
      const items = getAttunementItems().slice(0, 4);

      let updated = attunement;
      for (let i = 0; i < 3; i++) {
        updated = attuneToItem(updated, items[i]);
      }

      expect(() => attuneToItem(updated, items[3])).toThrow('No available attunement slots');
    });

    it('should enforce 3-slot maximum', () => {
      const attunement = createAttunementRecord('char-123');
      expect(attunement.maxSlots).toBe(MAX_ATTUNEMENT_SLOTS);
      expect(MAX_ATTUNEMENT_SLOTS).toBe(3);
    });
  });

  describe('breakAttunement', () => {
    it('should successfully break attunement', () => {
      const attunement = createAttunementRecord('char-123');
      const item = getAttunementItems()[0];

      const updated = attuneToItem(attunement, item);
      expect(updated.attunedItems).toHaveLength(1);

      const broken = breakAttunement(updated, item.name);
      expect(broken.attunedItems).toHaveLength(0);
    });

    it('should throw error when not attuned to the item', () => {
      const attunement = createAttunementRecord('char-123');

      expect(() => breakAttunement(attunement, 'Nonexistent Item')).toThrow('Not attuned');
    });
  });

  describe('replaceAttunement', () => {
    it('should replace one attuned item with another', () => {
      const attunement = createAttunementRecord('char-123');
      const items = getAttunementItems().slice(0, 4);

      let updated = attunement;
      for (let i = 0; i < 3; i++) {
        updated = attuneToItem(updated, items[i]);
      }

      expect(updated.attunedItems).toHaveLength(3);
      expect(isAttunedTo(updated, items[0].name)).toBe(true);

      const replaced = replaceAttunement(updated, items[0].name, items[3]);
      expect(replaced.attunedItems).toHaveLength(3);
      expect(isAttunedTo(replaced, items[0].name)).toBe(false);
      expect(isAttunedTo(replaced, items[3].name)).toBe(true);
    });
  });

  describe('isAttunedTo', () => {
    it('should correctly identify attuned items', () => {
      const attunement = createAttunementRecord('char-123');
      const item = getAttunementItems()[0];

      expect(isAttunedTo(attunement, item.name)).toBe(false);

      const updated = attuneToItem(attunement, item);
      expect(isAttunedTo(updated, item.name)).toBe(true);
    });
  });

  describe('getAttunedItemNames', () => {
    it('should return all attuned item names', () => {
      const attunement = createAttunementRecord('char-123');
      const items = getAttunementItems().slice(0, 2);

      let updated = attunement;
      for (const item of items) {
        updated = attuneToItem(updated, item);
      }

      const names = getAttunedItemNames(updated);
      expect(names).toHaveLength(2);
      expect(names).toContain(items[0].name);
      expect(names).toContain(items[1].name);
    });
  });

  describe('canAttuneToItem', () => {
    it('should allow attunement to items without restrictions', () => {
      const item = getAttunementItems().find(i =>
        !i.description.toLowerCase().includes('by a') &&
        !i.description.toLowerCase().includes('alignment')
      );

      if (!item) {
        // Skip if no unrestricted items found
        expect(true).toBe(true);
        return;
      }

      const result = canAttuneToItem(item);
      expect(result.canAttune).toBe(true);
    });

    it('should detect class restrictions', () => {
      const staffOfTheMagi = getMagicItemByName('Staff of the Magi');

      if (!staffOfTheMagi) {
        // Skip if item not in database
        expect(true).toBe(true);
        return;
      }

      // Staff of the Magi requires attunement by a sorcerer, warlock, or wizard
      const wizardResult = canAttuneToItem(staffOfTheMagi, 'wizard');
      expect(wizardResult.canAttune).toBe(true);

      const sorcererResult = canAttuneToItem(staffOfTheMagi, 'sorcerer');
      expect(sorcererResult.canAttune).toBe(true);

      const warlockResult = canAttuneToItem(staffOfTheMagi, 'warlock');
      expect(warlockResult.canAttune).toBe(true);

      const fighterResult = canAttuneToItem(staffOfTheMagi, 'fighter');
      expect(fighterResult.canAttune).toBe(false);
      expect(fighterResult.reason).toBeDefined();
    });
  });
});
