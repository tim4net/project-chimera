import { describe, it, expect } from 'vitest';
import {
  calculateModifier,
  applyRacialBonuses,
  calculateHitPoints,
  calculateArmorClass,
  calculateProficiencyBonus,
} from '../abilityScoreService';
import type { AbilityScores } from '../../types/wizard';

describe('abilityScoreService', () => {
  describe('calculateModifier', () => {
    it('should calculate modifier for score 3 (-4)', () => {
      expect(calculateModifier(3)).toBe(-4);
    });

    it('should calculate modifier for score 8 (-1)', () => {
      expect(calculateModifier(8)).toBe(-1);
    });

    it('should calculate modifier for score 10 (0)', () => {
      expect(calculateModifier(10)).toBe(0);
    });

    it('should calculate modifier for score 11 (0)', () => {
      expect(calculateModifier(11)).toBe(0);
    });

    it('should calculate modifier for score 12 (+1)', () => {
      expect(calculateModifier(12)).toBe(1);
    });

    it('should calculate modifier for score 15 (+2)', () => {
      expect(calculateModifier(15)).toBe(2);
    });

    it('should calculate modifier for score 18 (+4)', () => {
      expect(calculateModifier(18)).toBe(4);
    });

    it('should calculate modifier for score 20 (+5)', () => {
      expect(calculateModifier(20)).toBe(5);
    });
  });

  describe('applyRacialBonuses', () => {
    const baseScores: AbilityScores = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    it('should apply Dwarf bonuses (+2 CON)', () => {
      const result = applyRacialBonuses(baseScores, 'Dwarf');
      expect(result.constitution).toBe(12);
      expect(result.strength).toBe(10);
    });

    it('should apply Elf bonuses (+2 DEX)', () => {
      const result = applyRacialBonuses(baseScores, 'Elf');
      expect(result.dexterity).toBe(12);
      expect(result.strength).toBe(10);
    });

    it('should apply Halfling bonuses (+2 DEX)', () => {
      const result = applyRacialBonuses(baseScores, 'Halfling');
      expect(result.dexterity).toBe(12);
      expect(result.strength).toBe(10);
    });

    it('should apply Human bonuses (+1 ALL)', () => {
      const result = applyRacialBonuses(baseScores, 'Human');
      expect(result.strength).toBe(11);
      expect(result.dexterity).toBe(11);
      expect(result.constitution).toBe(11);
      expect(result.intelligence).toBe(11);
      expect(result.wisdom).toBe(11);
      expect(result.charisma).toBe(11);
    });

    it('should apply Dragonborn bonuses (+2 STR, +1 CHA)', () => {
      const result = applyRacialBonuses(baseScores, 'Dragonborn');
      expect(result.strength).toBe(12);
      expect(result.charisma).toBe(11);
      expect(result.dexterity).toBe(10);
    });

    it('should apply Gnome bonuses (+2 INT)', () => {
      const result = applyRacialBonuses(baseScores, 'Gnome');
      expect(result.intelligence).toBe(12);
      expect(result.strength).toBe(10);
    });

    it('should apply Half-Elf bonuses (+2 CHA)', () => {
      const result = applyRacialBonuses(baseScores, 'Half-Elf');
      expect(result.charisma).toBe(12);
      // Note: +1 to two other abilities is player choice, defaults to STR and DEX
      expect(result.strength).toBe(11);
      expect(result.dexterity).toBe(11);
    });

    it('should apply Half-Orc bonuses (+2 STR, +1 CON)', () => {
      const result = applyRacialBonuses(baseScores, 'Half-Orc');
      expect(result.strength).toBe(12);
      expect(result.constitution).toBe(11);
      expect(result.dexterity).toBe(10);
    });

    it('should return unchanged scores for invalid race', () => {
      const result = applyRacialBonuses(baseScores, 'InvalidRace');
      expect(result).toEqual(baseScores);
    });

    it('should handle edge case with max scores', () => {
      const highScores: AbilityScores = {
        strength: 15,
        dexterity: 15,
        constitution: 15,
        intelligence: 15,
        wisdom: 15,
        charisma: 15,
      };
      const result = applyRacialBonuses(highScores, 'Human');
      expect(result.strength).toBe(16);
      expect(result.dexterity).toBe(16);
    });
  });

  describe('calculateHitPoints', () => {
    it('should calculate HP for d8 hit die with +2 CON mod at level 1', () => {
      expect(calculateHitPoints(8, 2, 1)).toBe(10);
    });

    it('should calculate HP with negative CON mod (minimum 1 HP)', () => {
      expect(calculateHitPoints(6, -2, 1)).toBe(4);
    });

    it('should calculate HP with high CON mod', () => {
      expect(calculateHitPoints(10, 4, 1)).toBe(14);
    });

    it('should calculate HP for multiple levels (level 3)', () => {
      // Level 1: 8 + 2 = 10
      // Level 2: 10 + (5 + 2) = 17 (average of d8 is 5)
      // Level 3: 17 + (5 + 2) = 24
      expect(calculateHitPoints(8, 2, 3)).toBe(24);
    });

    it('should ensure minimum 1 HP per level with negative CON mod', () => {
      // Even with -4 CON mod, should get minimum 1 HP per level
      const hp = calculateHitPoints(6, -4, 1);
      expect(hp).toBeGreaterThanOrEqual(1);
    });

    it('should scale HP correctly with different hit dice', () => {
      expect(calculateHitPoints(12, 0, 1)).toBe(12); // Barbarian d12
      expect(calculateHitPoints(6, 0, 1)).toBe(6); // Wizard d6
    });
  });

  describe('calculateArmorClass', () => {
    it('should calculate AC with no armor and no DEX mod', () => {
      expect(calculateArmorClass(10, 0)).toBe(10);
    });

    it('should calculate AC with positive DEX mod', () => {
      expect(calculateArmorClass(10, 3)).toBe(13);
    });

    it('should calculate AC with negative DEX mod', () => {
      expect(calculateArmorClass(10, -1)).toBe(9);
    });

    it('should calculate AC with armor base', () => {
      expect(calculateArmorClass(14, 2)).toBe(16); // Leather armor + DEX
    });

    it('should handle high DEX mod', () => {
      expect(calculateArmorClass(10, 5)).toBe(15);
    });
  });

  describe('calculateProficiencyBonus', () => {
    it('should return +2 for levels 1-4', () => {
      expect(calculateProficiencyBonus(1)).toBe(2);
      expect(calculateProficiencyBonus(2)).toBe(2);
      expect(calculateProficiencyBonus(3)).toBe(2);
      expect(calculateProficiencyBonus(4)).toBe(2);
    });

    it('should return +3 for levels 5-8', () => {
      expect(calculateProficiencyBonus(5)).toBe(3);
      expect(calculateProficiencyBonus(8)).toBe(3);
    });

    it('should return +4 for levels 9-12', () => {
      expect(calculateProficiencyBonus(9)).toBe(4);
      expect(calculateProficiencyBonus(12)).toBe(4);
    });

    it('should return +5 for levels 13-16', () => {
      expect(calculateProficiencyBonus(13)).toBe(5);
      expect(calculateProficiencyBonus(16)).toBe(5);
    });

    it('should return +6 for levels 17-20', () => {
      expect(calculateProficiencyBonus(17)).toBe(6);
      expect(calculateProficiencyBonus(20)).toBe(6);
    });

    it('should default to level 1 when no level provided', () => {
      expect(calculateProficiencyBonus()).toBe(2);
    });
  });
});
