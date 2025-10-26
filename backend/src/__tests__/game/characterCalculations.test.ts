/**
 * Character Calculations Tests
 *
 * Tests for D&D 5e character calculation functions
 */

import {
  calculateAbilityModifiers,
  applyRacialBonuses,
  calculateHP,
  calculateAC,
  getStartingGold,
  getSpellSlots,
  calculateProficiencyBonus,
  getClassHitDie,
  calculateCharacterStats
} from '../../game/characterCalculations';
import type { AbilityScores } from '../../types';

describe('Character Calculations', () => {
  const validAbilityScores: AbilityScores = {
    STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
  };

  describe('calculateAbilityModifiers', () => {
    test('should calculate correct modifiers for standard scores', () => {
      const modifiers = calculateAbilityModifiers(validAbilityScores);

      expect(modifiers.STR).toBe(2); // 15 -> +2
      expect(modifiers.DEX).toBe(2); // 14 -> +2
      expect(modifiers.CON).toBe(1); // 13 -> +1
      expect(modifiers.INT).toBe(1); // 12 -> +1
      expect(modifiers.WIS).toBe(0); // 10 -> +0
      expect(modifiers.CHA).toBe(-1); // 8 -> -1
    });

    test('should calculate negative modifiers correctly', () => {
      const lowScores: AbilityScores = {
        STR: 8, DEX: 6, CON: 4, INT: 3, WIS: 1, CHA: 9
      };
      const modifiers = calculateAbilityModifiers(lowScores);

      expect(modifiers.STR).toBe(-1); // 8 -> -1
      expect(modifiers.DEX).toBe(-2); // 6 -> -2
      expect(modifiers.CON).toBe(-3); // 4 -> -3
      expect(modifiers.INT).toBe(-4); // 3 -> -4
      expect(modifiers.WIS).toBe(-5); // 1 -> -5
      expect(modifiers.CHA).toBe(-1); // 9 -> -1
    });

    test('should calculate high modifiers correctly', () => {
      const highScores: AbilityScores = {
        STR: 20, DEX: 18, CON: 16, INT: 14, WIS: 12, CHA: 10
      };
      const modifiers = calculateAbilityModifiers(highScores);

      expect(modifiers.STR).toBe(5); // 20 -> +5
      expect(modifiers.DEX).toBe(4); // 18 -> +4
      expect(modifiers.CON).toBe(3); // 16 -> +3
      expect(modifiers.INT).toBe(2); // 14 -> +2
      expect(modifiers.WIS).toBe(1); // 12 -> +1
      expect(modifiers.CHA).toBe(0); // 10 -> +0
    });

    test('should handle score of 10 (modifier 0)', () => {
      const neutralScores: AbilityScores = {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
      };
      const modifiers = calculateAbilityModifiers(neutralScores);

      Object.values(modifiers).forEach(mod => {
        expect(mod).toBe(0);
      });
    });

    test('should handle score of 11 (modifier 0)', () => {
      const scores: AbilityScores = {
        STR: 11, DEX: 11, CON: 11, INT: 11, WIS: 11, CHA: 11
      };
      const modifiers = calculateAbilityModifiers(scores);

      Object.values(modifiers).forEach(mod => {
        expect(mod).toBe(0);
      });
    });
  });

  describe('applyRacialBonuses', () => {
    test('should apply Dwarf racial bonuses (+2 CON)', () => {
      const result = applyRacialBonuses('Dwarf', validAbilityScores);

      expect(result.CON).toBe(15); // 13 + 2
      expect(result.STR).toBe(15); // unchanged
    });

    test('should apply Elf racial bonuses (+2 DEX)', () => {
      const result = applyRacialBonuses('Elf', validAbilityScores);

      expect(result.DEX).toBe(16); // 14 + 2
      expect(result.STR).toBe(15); // unchanged
    });

    test('should apply Human racial bonuses (+1 to all)', () => {
      const result = applyRacialBonuses('Human', validAbilityScores);

      expect(result.STR).toBe(16); // 15 + 1
      expect(result.DEX).toBe(15); // 14 + 1
      expect(result.CON).toBe(14); // 13 + 1
      expect(result.INT).toBe(13); // 12 + 1
      expect(result.WIS).toBe(11); // 10 + 1
      expect(result.CHA).toBe(9); // 8 + 1
    });

    test('should throw error for invalid race', () => {
      expect(() => applyRacialBonuses('InvalidRace', validAbilityScores)).toThrow('Invalid race');
    });
  });

  describe('calculateHP', () => {
    test('should calculate HP for Fighter (d10)', () => {
      const hp = calculateHP('Human', 10, 13); // CON 13 + 1 (Human) = 14 = +2 mod
      expect(hp).toBe(12); // 10 + 2
    });

    test('should calculate HP for Barbarian (d12)', () => {
      const hp = calculateHP('Human', 12, 13); // CON 13 + 1 (Human) = 14 = +2 mod
      expect(hp).toBe(14); // 12 + 2
    });

    test('should calculate HP for Wizard (d6)', () => {
      const hp = calculateHP('Human', 6, 13); // CON 13 + 1 (Human) = 14 = +2 mod
      expect(hp).toBe(8); // 6 + 2
    });

    test('should apply racial CON bonus to HP (Dwarf)', () => {
      const hp = calculateHP('Dwarf', 10, 13);
      // Dwarf gets +2 CON (13 + 2 = 15, mod +2)
      expect(hp).toBe(12); // 10 + 2
    });

    test('should handle negative CON modifier', () => {
      const hp = calculateHP('Human', 10, 8); // CON 8 = -1 mod
      expect(hp).toBe(9); // 10 - 1
    });

    test('should have minimum HP of 1', () => {
      const hp = calculateHP('Human', 1, 1); // Extreme case
      expect(hp).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateAC', () => {
    test('should calculate AC with no armor', () => {
      const ac = calculateAC('Human', 14); // DEX 14 = +2 mod
      expect(ac).toBe(12); // 10 + 2
    });

    test('should apply racial DEX bonus (Elf)', () => {
      const ac = calculateAC('Elf', 14);
      // Elf gets +2 DEX (14 + 2 = 16, mod +3)
      expect(ac).toBe(13); // 10 + 3
    });

    test('should apply armor bonus', () => {
      const ac = calculateAC('Human', 14, 5); // +5 armor bonus
      expect(ac).toBe(17); // 10 + 2 (DEX) + 5
    });

    test('should handle negative DEX modifier', () => {
      const ac = calculateAC('Human', 8); // DEX 8 = -1 mod
      expect(ac).toBe(9); // 10 - 1
    });

    test('should handle high DEX modifier', () => {
      const ac = calculateAC('Human', 20); // DEX 20 = +5 mod
      expect(ac).toBe(15); // 10 + 5
    });
  });

  describe('getStartingGold', () => {
    test('should return correct gold for all classes', () => {
      expect(getStartingGold('Barbarian')).toBe(50);
      expect(getStartingGold('Bard')).toBe(125);
      expect(getStartingGold('Cleric')).toBe(125);
      expect(getStartingGold('Druid')).toBe(50);
      expect(getStartingGold('Fighter')).toBe(125);
      expect(getStartingGold('Monk')).toBe(13);
      expect(getStartingGold('Paladin')).toBe(125);
      expect(getStartingGold('Ranger')).toBe(125);
      expect(getStartingGold('Rogue')).toBe(100);
      expect(getStartingGold('Sorcerer')).toBe(75);
      expect(getStartingGold('Warlock')).toBe(100);
      expect(getStartingGold('Wizard')).toBe(100);
    });

    test('should return default gold for unknown class', () => {
      expect(getStartingGold('UnknownClass')).toBe(100);
    });
  });

  describe('getSpellSlots', () => {
    // Full casters
    test('should give Wizard correct spell slots at level 1', () => {
      expect(getSpellSlots('Wizard', 1)).toEqual({ '1': 2 });
    });

    test('should give Wizard correct spell slots at level 3', () => {
      expect(getSpellSlots('Wizard', 3)).toEqual({ '1': 4, '2': 2 });
    });

    test('should give Bard correct spell slots at level 5', () => {
      expect(getSpellSlots('Bard', 5)).toEqual({ '1': 4, '2': 3, '3': 2 });
    });

    // Warlock (Pact Magic)
    test('should give Warlock unique spell slots at level 1', () => {
      expect(getSpellSlots('Warlock', 1)).toEqual({ '1': 1 });
    });

    test('should give Warlock correct spell slots at level 5', () => {
      expect(getSpellSlots('Warlock', 5)).toEqual({ '3': 2 });
    });

    test('should give Warlock max spell slots at level 17', () => {
      expect(getSpellSlots('Warlock', 17)).toEqual({ '5': 4 });
    });

    // Half-casters
    test('should give Paladin no spell slots at level 1', () => {
      expect(getSpellSlots('Paladin', 1)).toEqual({});
    });

    test('should give Paladin spell slots at level 2', () => {
      expect(getSpellSlots('Paladin', 2)).toEqual({ '1': 2 });
    });

    test('should give Ranger correct spell slots at level 5', () => {
      expect(getSpellSlots('Ranger', 5)).toEqual({ '1': 4, '2': 2 });
    });

    // Non-spellcasters
    test('should give Fighter no spell slots', () => {
      expect(getSpellSlots('Fighter', 1)).toEqual({});
      expect(getSpellSlots('Fighter', 10)).toEqual({});
    });

    test('should give Barbarian no spell slots', () => {
      expect(getSpellSlots('Barbarian', 1)).toEqual({});
    });

    test('should give Rogue no spell slots', () => {
      expect(getSpellSlots('Rogue', 1)).toEqual({});
    });

    test('should give Monk no spell slots', () => {
      expect(getSpellSlots('Monk', 1)).toEqual({});
    });

    // High level progression
    test('should give Wizard correct spell slots at level 9', () => {
      expect(getSpellSlots('Wizard', 9)).toEqual({
        '1': 4, '2': 3, '3': 3, '4': 3, '5': 1
      });
    });

    test('should give Cleric correct spell slots at level 20', () => {
      expect(getSpellSlots('Cleric', 20)).toEqual({
        '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 2, '8': 1, '9': 1
      });
    });
  });

  describe('calculateProficiencyBonus', () => {
    test('should return +2 for levels 1-4', () => {
      expect(calculateProficiencyBonus(1)).toBe(2);
      expect(calculateProficiencyBonus(2)).toBe(2);
      expect(calculateProficiencyBonus(3)).toBe(2);
      expect(calculateProficiencyBonus(4)).toBe(2);
    });

    test('should return +3 for levels 5-8', () => {
      expect(calculateProficiencyBonus(5)).toBe(3);
      expect(calculateProficiencyBonus(6)).toBe(3);
      expect(calculateProficiencyBonus(7)).toBe(3);
      expect(calculateProficiencyBonus(8)).toBe(3);
    });

    test('should return +4 for levels 9-12', () => {
      expect(calculateProficiencyBonus(9)).toBe(4);
      expect(calculateProficiencyBonus(10)).toBe(4);
      expect(calculateProficiencyBonus(11)).toBe(4);
      expect(calculateProficiencyBonus(12)).toBe(4);
    });

    test('should return +5 for levels 13-16', () => {
      expect(calculateProficiencyBonus(13)).toBe(5);
      expect(calculateProficiencyBonus(14)).toBe(5);
      expect(calculateProficiencyBonus(15)).toBe(5);
      expect(calculateProficiencyBonus(16)).toBe(5);
    });

    test('should return +6 for levels 17-20', () => {
      expect(calculateProficiencyBonus(17)).toBe(6);
      expect(calculateProficiencyBonus(18)).toBe(6);
      expect(calculateProficiencyBonus(19)).toBe(6);
      expect(calculateProficiencyBonus(20)).toBe(6);
    });

    test('should handle level 0 or negative (default to +2)', () => {
      expect(calculateProficiencyBonus(0)).toBe(2);
      expect(calculateProficiencyBonus(-1)).toBe(2);
    });
  });

  describe('getClassHitDie', () => {
    test('should return d12 for Barbarian', () => {
      expect(getClassHitDie('Barbarian')).toBe(12);
    });

    test('should return d10 for martial classes', () => {
      expect(getClassHitDie('Fighter')).toBe(10);
      expect(getClassHitDie('Paladin')).toBe(10);
      expect(getClassHitDie('Ranger')).toBe(10);
    });

    test('should return d8 for medium hit die classes', () => {
      expect(getClassHitDie('Bard')).toBe(8);
      expect(getClassHitDie('Cleric')).toBe(8);
      expect(getClassHitDie('Druid')).toBe(8);
      expect(getClassHitDie('Monk')).toBe(8);
      expect(getClassHitDie('Rogue')).toBe(8);
      expect(getClassHitDie('Warlock')).toBe(8);
    });

    test('should return d6 for arcane casters', () => {
      expect(getClassHitDie('Sorcerer')).toBe(6);
      expect(getClassHitDie('Wizard')).toBe(6);
    });

    test('should return d8 default for unknown class', () => {
      expect(getClassHitDie('UnknownClass')).toBe(8);
    });
  });

  describe('calculateCharacterStats', () => {
    test('should calculate complete stats for Human Fighter level 1', () => {
      const stats = calculateCharacterStats('Human', 'Fighter', validAbilityScores, 1);

      expect(stats.finalScores.STR).toBe(16); // +1 Human bonus (15 + 1)
      expect(stats.modifiers.STR).toBe(3); // 16 -> +3
      expect(stats.hp).toBe(12); // d10 + CON mod +2 (Human +1 to CON makes 14 = +2 mod)
      expect(stats.ac).toBe(12); // 10 + DEX mod +2 (Human +1 to DEX makes 15 = +2 mod)
      expect(stats.proficiencyBonus).toBe(2);
      expect(stats.spellSlots).toEqual({});
      expect(stats.hitDie).toBe(10);
    });

    test('should calculate complete stats for Dwarf Cleric level 1', () => {
      const stats = calculateCharacterStats('Dwarf', 'Cleric', validAbilityScores, 1);

      expect(stats.finalScores.CON).toBe(15); // +2 Dwarf bonus
      expect(stats.modifiers.CON).toBe(2);
      expect(stats.hp).toBe(10); // d8 + CON mod +2
      expect(stats.proficiencyBonus).toBe(2);
      expect(stats.spellSlots).toEqual({ '1': 2 });
      expect(stats.hitDie).toBe(8);
    });

    test('should calculate stats at higher levels', () => {
      const stats = calculateCharacterStats('Elf', 'Wizard', validAbilityScores, 5);

      expect(stats.proficiencyBonus).toBe(3);
      expect(stats.spellSlots).toEqual({ '1': 4, '2': 3, '3': 2 });
    });

    test('should handle all races correctly', () => {
      expect(() => calculateCharacterStats('Human', 'Fighter', validAbilityScores, 1)).not.toThrow();
      expect(() => calculateCharacterStats('Dwarf', 'Fighter', validAbilityScores, 1)).not.toThrow();
      expect(() => calculateCharacterStats('Elf', 'Fighter', validAbilityScores, 1)).not.toThrow();
      expect(() => calculateCharacterStats('Halfling', 'Fighter', validAbilityScores, 1)).not.toThrow();
    });

    test('should handle all classes correctly', () => {
      const classes = [
        'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
        'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
        'Warlock', 'Wizard'
      ];

      classes.forEach(characterClass => {
        expect(() => calculateCharacterStats('Human', characterClass, validAbilityScores, 1)).not.toThrow();
      });
    });
  });
});
