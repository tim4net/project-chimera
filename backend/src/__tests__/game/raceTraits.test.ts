/**
 * Tests for D&D 5e Racial Traits System
 */

import {
  applyRacialAbilityBonuses,
  getRacialSpeed,
  calculateLevel1HP,
  calculateBaseAC,
  getRacialLanguages,
  getRacialProficiencies,
  getDarkvisionRange,
  getRacialSize
} from '../../game/raceTraits';
import type { AbilityScores } from '../../types';

describe('Race Traits System', () => {
  const baseScores: AbilityScores = {
    STR: 10,
    DEX: 12,
    CON: 14,
    INT: 13,
    WIS: 11,
    CHA: 8
  };

  describe('applyRacialAbilityBonuses', () => {
    it('should apply Dwarf racial bonuses (+2 CON)', () => {
      const result = applyRacialAbilityBonuses('Dwarf', baseScores);
      expect(result.CON).toBe(16); // 14 + 2
      expect(result.STR).toBe(10); // unchanged
    });

    it('should apply Human racial bonuses (+1 to all)', () => {
      const result = applyRacialAbilityBonuses('Human', baseScores);
      expect(result.STR).toBe(11);
      expect(result.DEX).toBe(13);
      expect(result.CON).toBe(15);
      expect(result.INT).toBe(14);
      expect(result.WIS).toBe(12);
      expect(result.CHA).toBe(9);
    });

    it('should apply Dragonborn bonuses (+2 STR, +1 CHA)', () => {
      const result = applyRacialAbilityBonuses('Dragonborn', baseScores);
      expect(result.STR).toBe(12); // 10 + 2
      expect(result.CHA).toBe(9);  // 8 + 1
      expect(result.DEX).toBe(12); // unchanged
    });

    it('should apply Half-Orc bonuses (+2 STR, +1 CON)', () => {
      const result = applyRacialAbilityBonuses('Half-Orc', baseScores);
      expect(result.STR).toBe(12); // 10 + 2
      expect(result.CON).toBe(15); // 14 + 1
    });

    it('should apply Elf bonuses (+2 DEX)', () => {
      const result = applyRacialAbilityBonuses('Elf', baseScores);
      expect(result.DEX).toBe(14); // 12 + 2
      expect(result.STR).toBe(10); // unchanged
    });

    it('should throw error for invalid race', () => {
      expect(() => {
        applyRacialAbilityBonuses('InvalidRace', baseScores);
      }).toThrow('Invalid race: InvalidRace');
    });
  });

  describe('getRacialSpeed', () => {
    it('should return 25 ft for Dwarves', () => {
      expect(getRacialSpeed('Dwarf')).toBe(25);
    });

    it('should return 25 ft for Halflings', () => {
      expect(getRacialSpeed('Halfling')).toBe(25);
    });

    it('should return 25 ft for Gnomes', () => {
      expect(getRacialSpeed('Gnome')).toBe(25);
    });

    it('should return 30 ft for Elves', () => {
      expect(getRacialSpeed('Elf')).toBe(30);
    });

    it('should return 30 ft for Humans', () => {
      expect(getRacialSpeed('Human')).toBe(30);
    });

    it('should return 30 ft for unknown races (default)', () => {
      expect(getRacialSpeed('UnknownRace')).toBe(30);
    });
  });

  describe('calculateLevel1HP', () => {
    it('should calculate HP for Dwarf Fighter correctly', () => {
      // Dwarf: +2 CON, base CON 14 -> 16 -> +3 modifier
      // Fighter: d10 hit die
      // HP = 10 + 3 = 13
      const hp = calculateLevel1HP('Dwarf', 14, 10);
      expect(hp).toBe(13);
    });

    it('should calculate HP for Human Wizard correctly', () => {
      // Human: +1 CON, base CON 14 -> 15 -> +2 modifier
      // Wizard: d6 hit die
      // HP = 6 + 2 = 8
      const hp = calculateLevel1HP('Human', 14, 6);
      expect(hp).toBe(8);
    });

    it('should calculate HP for Half-Orc Barbarian correctly', () => {
      // Half-Orc: +1 CON, base CON 16 -> 17 -> +3 modifier
      // Barbarian: d12 hit die
      // HP = 12 + 3 = 15
      const hp = calculateLevel1HP('Half-Orc', 16, 12);
      expect(hp).toBe(15);
    });

    it('should handle low CON scores', () => {
      // Elf with CON 8 (no bonus) -> 8 -> -1 modifier
      // Sorcerer: d6 hit die
      // HP = 6 + (-1) = 5
      const hp = calculateLevel1HP('Elf', 8, 6);
      expect(hp).toBe(5);
    });
  });

  describe('calculateBaseAC', () => {
    it('should calculate AC for Elf correctly (+2 DEX)', () => {
      // Elf: +2 DEX, base DEX 12 -> 14 -> +2 modifier
      // AC = 10 + 2 = 12
      const ac = calculateBaseAC('Elf', 12);
      expect(ac).toBe(12);
    });

    it('should calculate AC for Dwarf correctly (no DEX bonus)', () => {
      // Dwarf: no DEX bonus, base DEX 14 -> 14 -> +2 modifier
      // AC = 10 + 2 = 12
      const ac = calculateBaseAC('Dwarf', 14);
      expect(ac).toBe(12);
    });

    it('should include armor bonus', () => {
      // Human: +1 DEX, base DEX 12 -> 13 -> +1 modifier
      // AC = 10 + 1 + 2 (armor) = 13
      const ac = calculateBaseAC('Human', 12, 2);
      expect(ac).toBe(13);
    });
  });

  describe('getRacialLanguages', () => {
    it('should return correct languages for Dwarf', () => {
      const languages = getRacialLanguages('Dwarf');
      expect(languages).toContain('Common');
      expect(languages).toContain('Dwarvish');
    });

    it('should return correct languages for Tiefling', () => {
      const languages = getRacialLanguages('Tiefling');
      expect(languages).toContain('Common');
      expect(languages).toContain('Infernal');
    });

    it('should return correct languages for Dragonborn', () => {
      const languages = getRacialLanguages('Dragonborn');
      expect(languages).toContain('Common');
      expect(languages).toContain('Draconic');
    });

    it('should return Common for unknown race', () => {
      const languages = getRacialLanguages('UnknownRace');
      expect(languages).toEqual(['Common']);
    });
  });

  describe('getRacialProficiencies', () => {
    it('should return weapon proficiencies for Dwarf', () => {
      const profs = getRacialProficiencies('Dwarf');
      expect(profs).toContain('Battleaxe');
      expect(profs).toContain('Handaxe');
      expect(profs.length).toBeGreaterThan(0);
    });

    it('should return Intimidation for Half-Orc', () => {
      const profs = getRacialProficiencies('Half-Orc');
      expect(profs).toContain('Intimidation');
    });

    it('should return Perception for Elf', () => {
      const profs = getRacialProficiencies('Elf');
      expect(profs).toContain('Perception');
    });

    it('should return empty array for races with no proficiencies', () => {
      const profs = getRacialProficiencies('Human');
      expect(profs).toEqual([]);
    });
  });

  describe('getDarkvisionRange', () => {
    it('should return 60 ft for Dwarf', () => {
      expect(getDarkvisionRange('Dwarf')).toBe(60);
    });

    it('should return 60 ft for Elf', () => {
      expect(getDarkvisionRange('Elf')).toBe(60);
    });

    it('should return 60 ft for Tiefling', () => {
      expect(getDarkvisionRange('Tiefling')).toBe(60);
    });

    it('should return undefined for Human (no darkvision)', () => {
      expect(getDarkvisionRange('Human')).toBeUndefined();
    });

    it('should return undefined for unknown race', () => {
      expect(getDarkvisionRange('UnknownRace')).toBeUndefined();
    });
  });

  describe('getRacialSize', () => {
    it('should return Medium for most races', () => {
      expect(getRacialSize('Human')).toBe('Medium');
      expect(getRacialSize('Elf')).toBe('Medium');
      expect(getRacialSize('Dwarf')).toBe('Medium');
      expect(getRacialSize('Dragonborn')).toBe('Medium');
    });

    it('should return Small for Halfling', () => {
      expect(getRacialSize('Halfling')).toBe('Small');
    });

    it('should return Small for Gnome', () => {
      expect(getRacialSize('Gnome')).toBe('Small');
    });

    it('should return Medium for unknown race (default)', () => {
      expect(getRacialSize('UnknownRace')).toBe('Medium');
    });
  });

  describe('Integration: Full Character Creation', () => {
    it('should correctly apply all racial bonuses for a Dwarf Fighter', () => {
      const race = 'Dwarf';
      const classHitDie = 10; // Fighter
      const baseScores: AbilityScores = {
        STR: 15,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 13,
        CHA: 8
      };

      const finalScores = applyRacialAbilityBonuses(race, baseScores);
      const speed = getRacialSpeed(race);
      const hp = calculateLevel1HP(race, baseScores.CON, classHitDie);
      const ac = calculateBaseAC(race, baseScores.DEX);
      const languages = getRacialLanguages(race);
      const darkvision = getDarkvisionRange(race);
      const size = getRacialSize(race);

      expect(finalScores.CON).toBe(16); // 14 + 2
      expect(speed).toBe(25);
      expect(hp).toBe(13); // 10 + 3 (CON mod with racial bonus)
      expect(ac).toBe(11); // 10 + 1 (DEX mod)
      expect(languages).toContain('Dwarvish');
      expect(darkvision).toBe(60);
      expect(size).toBe('Medium');
    });

    it('should correctly apply all racial bonuses for a Human Wizard', () => {
      const race = 'Human';
      const classHitDie = 6; // Wizard
      const baseScores: AbilityScores = {
        STR: 8,
        DEX: 14,
        CON: 13,
        INT: 15,
        WIS: 12,
        CHA: 10
      };

      const finalScores = applyRacialAbilityBonuses(race, baseScores);
      const speed = getRacialSpeed(race);
      const hp = calculateLevel1HP(race, baseScores.CON, classHitDie);
      const ac = calculateBaseAC(race, baseScores.DEX);
      const darkvision = getDarkvisionRange(race);

      expect(finalScores.STR).toBe(9);  // 8 + 1
      expect(finalScores.DEX).toBe(15); // 14 + 1
      expect(finalScores.CON).toBe(14); // 13 + 1
      expect(finalScores.INT).toBe(16); // 15 + 1
      expect(speed).toBe(30);
      expect(hp).toBe(8); // 6 + 2 (CON mod with racial bonus)
      expect(ac).toBe(12); // 10 + 2 (DEX mod with racial bonus)
      expect(darkvision).toBeUndefined(); // Humans don't have darkvision
    });
  });
});
