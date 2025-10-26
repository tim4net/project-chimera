import { describe, it, expect } from 'vitest';
import {
  getEquipmentPresetsByClass,
  validateEquipmentSelection,
  calculateEncumbrance,
} from '../equipmentService';
import type { Equipment } from '../../types/wizard';

describe('equipmentService', () => {
  describe('getEquipmentPresetsByClass', () => {
    it('should return presets for Barbarian', () => {
      const presets = getEquipmentPresetsByClass('Barbarian');
      expect(presets.length).toBeGreaterThanOrEqual(3);
      expect(presets[0]).toHaveProperty('name');
      expect(presets[0]).toHaveProperty('description');
      expect(presets[0]).toHaveProperty('equipment');
      expect(Array.isArray(presets[0].equipment)).toBe(true);
    });

    it('should return presets for Bard', () => {
      const presets = getEquipmentPresetsByClass('Bard');
      expect(presets.length).toBeGreaterThanOrEqual(3);
      expect(presets[0].equipment.length).toBeGreaterThan(0);
    });

    it('should return presets for Cleric', () => {
      const presets = getEquipmentPresetsByClass('Cleric');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Druid', () => {
      const presets = getEquipmentPresetsByClass('Druid');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Fighter', () => {
      const presets = getEquipmentPresetsByClass('Fighter');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Monk', () => {
      const presets = getEquipmentPresetsByClass('Monk');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Paladin', () => {
      const presets = getEquipmentPresetsByClass('Paladin');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Ranger', () => {
      const presets = getEquipmentPresetsByClass('Ranger');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Rogue', () => {
      const presets = getEquipmentPresetsByClass('Rogue');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Sorcerer', () => {
      const presets = getEquipmentPresetsByClass('Sorcerer');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Warlock', () => {
      const presets = getEquipmentPresetsByClass('Warlock');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return presets for Wizard', () => {
      const presets = getEquipmentPresetsByClass('Wizard');
      expect(presets.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty array for invalid class', () => {
      const presets = getEquipmentPresetsByClass('InvalidClass');
      expect(presets).toEqual([]);
    });
  });

  describe('validateEquipmentSelection', () => {
    it('should validate equipment with weapon and armor', () => {
      const equipment: Equipment[] = [
        { name: 'Longsword', type: 'weapon', weight: 3 },
        { name: 'Chain Mail', type: 'armor', weight: 55 },
        { name: 'Backpack', type: 'gear', weight: 5 },
      ];
      const result = validateEquipmentSelection(equipment);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when no weapon present', () => {
      const equipment: Equipment[] = [
        { name: 'Chain Mail', type: 'armor', weight: 55 },
        { name: 'Backpack', type: 'gear', weight: 5 },
      ];
      const result = validateEquipmentSelection(equipment);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one weapon is required');
    });

    it('should fail validation when no armor present', () => {
      const equipment: Equipment[] = [
        { name: 'Longsword', type: 'weapon', weight: 3 },
        { name: 'Backpack', type: 'gear', weight: 5 },
      ];
      const result = validateEquipmentSelection(equipment);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one armor piece is required');
    });

    it('should detect duplicate non-weapon items', () => {
      const equipment: Equipment[] = [
        { name: 'Longsword', type: 'weapon', weight: 3 },
        { name: 'Backpack', type: 'gear', weight: 5 },
        { name: 'Backpack', type: 'gear', weight: 5 },
        { name: 'Chain Mail', type: 'armor', weight: 55 },
      ];
      const result = validateEquipmentSelection(equipment);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('duplicate'))).toBe(true);
    });

    it('should allow duplicate weapons for dual-wielding', () => {
      const equipment: Equipment[] = [
        { name: 'Shortsword', type: 'weapon', weight: 2 },
        { name: 'Shortsword', type: 'weapon', weight: 2 },
        { name: 'Leather Armor', type: 'armor', weight: 10 },
      ];
      const result = validateEquipmentSelection(equipment);
      expect(result.valid).toBe(true);
    });

    it('should handle empty equipment array', () => {
      const result = validateEquipmentSelection([]);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate equipment with multiple weapons', () => {
      const equipment: Equipment[] = [
        { name: 'Longsword', type: 'weapon', weight: 3 },
        { name: 'Dagger', type: 'weapon', weight: 1 },
        { name: 'Chain Mail', type: 'armor', weight: 55 },
      ];
      const result = validateEquipmentSelection(equipment);
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateEncumbrance', () => {
    it('should calculate light load', () => {
      const equipment: Equipment[] = [
        { name: 'Dagger', type: 'weapon', weight: 1 },
        { name: 'Leather Armor', type: 'armor', weight: 10 },
        { name: 'Backpack', type: 'gear', weight: 5 },
      ];
      const result = calculateEncumbrance(equipment, 15); // STR 15 = 225 lbs capacity
      expect(result.weight).toBe(16);
      expect(result.light).toBe(true);
    });

    it('should calculate heavy load', () => {
      const equipment: Equipment[] = [
        { name: 'Longsword', type: 'weapon', weight: 3 },
        { name: 'Chain Mail', type: 'armor', weight: 55 },
        { name: 'Shield', type: 'armor', weight: 6 },
        { name: 'Backpack', type: 'gear', weight: 5 },
        { name: 'Rations', type: 'gear', weight: 20 },
        { name: 'Rope', type: 'gear', weight: 10 },
      ];
      const result = calculateEncumbrance(equipment, 8); // STR 8 = 120 lbs capacity
      expect(result.weight).toBe(99);
      expect(result.light).toBe(true);
    });

    it('should detect overencumbered state', () => {
      const equipment: Equipment[] = [
        { name: 'Plate Mail', type: 'armor', weight: 65 },
        { name: 'Greatsword', type: 'weapon', weight: 6 },
        { name: 'Heavy Gear', type: 'gear', weight: 50 },
      ];
      const result = calculateEncumbrance(equipment, 8); // STR 8 = 120 lbs capacity
      expect(result.weight).toBe(121);
      expect(result.light).toBe(false);
    });

    it('should handle empty equipment', () => {
      const result = calculateEncumbrance([], 10);
      expect(result.weight).toBe(0);
      expect(result.light).toBe(true);
    });
  });
});
