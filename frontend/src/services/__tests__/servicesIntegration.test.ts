/**
 * @file servicesIntegration.test.ts
 * @description Integration tests for services working together
 */

import { describe, it, expect } from 'vitest';
import {
  calculateModifier,
  applyRacialBonuses,
  calculateHitPoints,
  calculateArmorClass,
  calculateProficiencyBonus,
} from '../abilityScoreService';
import {
  getEquipmentPresetsByClass,
  validateEquipmentSelection,
  calculateEncumbrance,
} from '../equipmentService';
import type { AbilityScores } from '../../types/wizard';

describe('Services Integration Tests', () => {
  describe('Complete character calculation flow', () => {
    it('should calculate all stats for a Fighter character', () => {
      // Step 1: Base ability scores
      const baseScores: AbilityScores = {
        strength: 15,
        dexterity: 12,
        constitution: 14,
        intelligence: 8,
        wisdom: 10,
        charisma: 10,
      };

      // Step 2: Apply racial bonuses (Human)
      const finalScores = applyRacialBonuses(baseScores, 'Human');
      expect(finalScores.strength).toBe(16); // +1 from Human

      // Step 3: Calculate modifiers
      const strMod = calculateModifier(finalScores.strength);
      const dexMod = calculateModifier(finalScores.dexterity);
      const conMod = calculateModifier(finalScores.constitution);
      expect(strMod).toBe(3);
      expect(dexMod).toBe(1);
      expect(conMod).toBe(2);

      // Step 4: Calculate HP (Fighter d10 hit die)
      const hp = calculateHitPoints(10, conMod, 1);
      expect(hp).toBe(12); // 10 + 2

      // Step 5: Calculate AC (Chain Mail base 16 + DEX mod, but heavy armor ignores DEX)
      const ac = calculateArmorClass(16, 0); // Heavy armor
      expect(ac).toBe(16);

      // Step 6: Calculate proficiency bonus
      const profBonus = calculateProficiencyBonus(1);
      expect(profBonus).toBe(2);

      // Step 7: Get equipment
      const presets = getEquipmentPresetsByClass('Fighter');
      expect(presets.length).toBeGreaterThanOrEqual(3);
      const knightPreset = presets[0];
      expect(knightPreset.equipment.length).toBeGreaterThan(0);

      // Step 8: Validate equipment
      const validation = validateEquipmentSelection(knightPreset.equipment);
      expect(validation.valid).toBe(true);

      // Step 9: Calculate encumbrance
      const encumbrance = calculateEncumbrance(knightPreset.equipment, finalScores.strength);
      expect(encumbrance.weight).toBeGreaterThan(0);
      expect(encumbrance.light).toBeDefined();
    });

    it('should calculate all stats for a Wizard character', () => {
      const baseScores: AbilityScores = {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 15,
        wisdom: 10,
        charisma: 10,
      };

      // Apply Gnome bonuses
      const finalScores = applyRacialBonuses(baseScores, 'Gnome');
      expect(finalScores.intelligence).toBe(17); // +2 from Gnome

      const intMod = calculateModifier(finalScores.intelligence);
      const dexMod = calculateModifier(finalScores.dexterity);
      const conMod = calculateModifier(finalScores.constitution);
      expect(intMod).toBe(3);
      expect(dexMod).toBe(2);
      expect(conMod).toBe(1);

      // Wizard d6 hit die
      const hp = calculateHitPoints(6, conMod, 1);
      expect(hp).toBe(7); // 6 + 1

      // Wizard with no armor (10 base + DEX)
      const ac = calculateArmorClass(10, dexMod);
      expect(ac).toBe(12);

      // Get wizard equipment
      const presets = getEquipmentPresetsByClass('Wizard');
      expect(presets.length).toBeGreaterThanOrEqual(3);
      const validation = validateEquipmentSelection(presets[0].equipment);
      expect(validation.valid).toBe(true);
    });

    it('should handle Barbarian with high STR and encumbrance', () => {
      const baseScores: AbilityScores = {
        strength: 15,
        dexterity: 14,
        constitution: 15,
        intelligence: 8,
        wisdom: 10,
        charisma: 8,
      };

      // Apply Half-Orc bonuses
      const finalScores = applyRacialBonuses(baseScores, 'Half-Orc');
      expect(finalScores.strength).toBe(17); // +2
      expect(finalScores.constitution).toBe(16); // +1

      const conMod = calculateModifier(finalScores.constitution);
      expect(conMod).toBe(3);

      // Barbarian d12 hit die
      const hp = calculateHitPoints(12, conMod, 1);
      expect(hp).toBe(15); // 12 + 3

      // Get Barbarian equipment
      const presets = getEquipmentPresetsByClass('Barbarian');
      const berserkerPreset = presets[0];

      // Check encumbrance with high STR
      const encumbrance = calculateEncumbrance(berserkerPreset.equipment, finalScores.strength);
      expect(encumbrance.light).toBe(true); // Should be able to carry equipment easily
    });
  });

  describe('Edge cases and validation integration', () => {
    it('should handle minimum ability scores gracefully', () => {
      const lowScores: AbilityScores = {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      };

      const finalScores = applyRacialBonuses(lowScores, 'Human');
      const conMod = calculateModifier(finalScores.constitution);
      expect(conMod).toBe(-1); // 9 ability score

      // Even with negative CON, should get minimum HP
      const hp = calculateHitPoints(6, conMod, 1);
      expect(hp).toBeGreaterThanOrEqual(1);
    });

    it('should validate equipment from all class presets', () => {
      const classes = [
        'Barbarian',
        'Bard',
        'Cleric',
        'Druid',
        'Fighter',
        'Monk',
        'Paladin',
        'Ranger',
        'Rogue',
        'Sorcerer',
        'Warlock',
        'Wizard',
      ];

      classes.forEach((className) => {
        const presets = getEquipmentPresetsByClass(className);
        expect(presets.length).toBeGreaterThanOrEqual(3);

        presets.forEach((preset) => {
          const validation = validateEquipmentSelection(preset.equipment);
          expect(validation.valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
        });
      });
    });

    it('should calculate correct AC for different armor types', () => {
      // Leather armor (light) - AC 11 + DEX mod
      const highDex = calculateModifier(16); // +3
      const leatherAC = calculateArmorClass(11, highDex);
      expect(leatherAC).toBe(14);

      // Chain mail (heavy) - AC 16, no DEX
      const chainAC = calculateArmorClass(16, 0);
      expect(chainAC).toBe(16);

      // No armor - AC 10 + DEX
      const noArmorAC = calculateArmorClass(10, highDex);
      expect(noArmorAC).toBe(13);
    });

    it('should scale HP correctly across multiple levels', () => {
      const conMod = calculateModifier(14); // +2

      // Fighter d10
      const level1HP = calculateHitPoints(10, conMod, 1);
      const level5HP = calculateHitPoints(10, conMod, 5);
      const level10HP = calculateHitPoints(10, conMod, 10);

      expect(level1HP).toBe(12); // 10 + 2
      expect(level5HP).toBeGreaterThan(level1HP);
      expect(level10HP).toBeGreaterThan(level5HP);

      // Proficiency bonus should scale too
      expect(calculateProficiencyBonus(1)).toBe(2);
      expect(calculateProficiencyBonus(5)).toBe(3);
      expect(calculateProficiencyBonus(9)).toBe(4);
    });

    it('should handle invalid race without breaking calculations', () => {
      const scores: AbilityScores = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      };

      const result = applyRacialBonuses(scores, 'InvalidRace');
      expect(result).toEqual(scores); // Should return unchanged

      // Rest of calculations should still work
      const mod = calculateModifier(result.strength);
      expect(mod).toBe(0);

      const hp = calculateHitPoints(8, mod, 1);
      expect(hp).toBe(8);
    });

    it('should detect overencumbered state correctly', () => {
      const lowStrength = 8; // Capacity: 120 lbs

      // Heavy equipment load
      const heavyEquipment = [
        { name: 'Plate Mail', type: 'armor', weight: 65 },
        { name: 'Greatsword', type: 'weapon', weight: 6 },
        { name: 'Shield', type: 'armor', weight: 6 },
        { name: 'Heavy Pack', type: 'gear', weight: 50 },
      ];

      const encumbrance = calculateEncumbrance(heavyEquipment as any, lowStrength);
      expect(encumbrance.weight).toBe(127);
      expect(encumbrance.light).toBe(false); // Overencumbered
    });
  });
});
