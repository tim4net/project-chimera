/**
 * @file Unit tests for the D&D 5e Exhaustion system.
 */

import {
  gainExhaustion,
  removeExhaustion,
  getExhaustionEffects,
  getAllActiveEffects,
  applyExhaustionPenalties,
  isExhausted,
  isDead,
  getExhaustionSummary,
} from '../../game/exhaustion';
import { CharacterRecord } from '../../types/index';

describe('Exhaustion System', () => {
  let mockCharacter: Partial<CharacterRecord>;

  beforeEach(() => {
    mockCharacter = {
      id: 'test-char-1',
      name: 'Test Hero',
      exhaustion_level: 0,
      speed: 30,
      hp_max: 50,
    };
  });

  describe('gainExhaustion', () => {
    it('should increase exhaustion level by 1 by default', () => {
      const newLevel = gainExhaustion(mockCharacter as CharacterRecord);
      expect(newLevel).toBe(1);
      expect(mockCharacter.exhaustion_level).toBe(1);
    });

    it('should increase exhaustion level by specified amount', () => {
      const newLevel = gainExhaustion(mockCharacter as CharacterRecord, 3);
      expect(newLevel).toBe(3);
      expect(mockCharacter.exhaustion_level).toBe(3);
    });

    it('should cap at level 6', () => {
      const newLevel = gainExhaustion(mockCharacter as CharacterRecord, 10);
      expect(newLevel).toBe(6);
      expect(mockCharacter.exhaustion_level).toBe(6);
    });

    it('should stack existing exhaustion', () => {
      mockCharacter.exhaustion_level = 2;
      const newLevel = gainExhaustion(mockCharacter as CharacterRecord, 2);
      expect(newLevel).toBe(4);
    });

    it('should handle undefined exhaustion_level', () => {
      delete mockCharacter.exhaustion_level;
      const newLevel = gainExhaustion(mockCharacter as CharacterRecord);
      expect(newLevel).toBe(1);
    });
  });

  describe('removeExhaustion', () => {
    it('should decrease exhaustion level by 1 by default', () => {
      mockCharacter.exhaustion_level = 3;
      const newLevel = removeExhaustion(mockCharacter as CharacterRecord);
      expect(newLevel).toBe(2);
      expect(mockCharacter.exhaustion_level).toBe(2);
    });

    it('should decrease exhaustion level by specified amount', () => {
      mockCharacter.exhaustion_level = 5;
      const newLevel = removeExhaustion(mockCharacter as CharacterRecord, 3);
      expect(newLevel).toBe(2);
    });

    it('should floor at level 0', () => {
      mockCharacter.exhaustion_level = 2;
      const newLevel = removeExhaustion(mockCharacter as CharacterRecord, 5);
      expect(newLevel).toBe(0);
    });

    it('should handle removing from level 0', () => {
      mockCharacter.exhaustion_level = 0;
      const newLevel = removeExhaustion(mockCharacter as CharacterRecord);
      expect(newLevel).toBe(0);
    });
  });

  describe('getExhaustionEffects', () => {
    it('should return correct effects for level 1', () => {
      const effects = getExhaustionEffects(1);
      expect(effects).toContain('Disadvantage on ability checks');
    });

    it('should return correct effects for level 2', () => {
      const effects = getExhaustionEffects(2);
      expect(effects).toContain('Speed halved');
    });

    it('should return correct effects for level 3', () => {
      const effects = getExhaustionEffects(3);
      expect(effects).toContain('Disadvantage on attack rolls and saving throws');
    });

    it('should return correct effects for level 4', () => {
      const effects = getExhaustionEffects(4);
      expect(effects).toContain('Hit point maximum halved');
    });

    it('should return correct effects for level 5', () => {
      const effects = getExhaustionEffects(5);
      expect(effects).toContain('Speed reduced to 0');
    });

    it('should return death for level 6', () => {
      const effects = getExhaustionEffects(6);
      expect(effects).toContain('Death');
    });

    it('should return no effects message for level 0', () => {
      const effects = getExhaustionEffects(0);
      expect(effects).toContain('No exhaustion effects');
    });

    it('should return empty array for invalid levels', () => {
      expect(getExhaustionEffects(-1)).toEqual([]);
      expect(getExhaustionEffects(7)).toEqual([]);
    });
  });

  describe('getAllActiveEffects', () => {
    it('should return empty array for level 0', () => {
      mockCharacter.exhaustion_level = 0;
      const effects = getAllActiveEffects(mockCharacter as CharacterRecord);
      expect(effects).toEqual([]);
    });

    it('should return cumulative effects for level 3', () => {
      mockCharacter.exhaustion_level = 3;
      const effects = getAllActiveEffects(mockCharacter as CharacterRecord);
      expect(effects).toHaveLength(3);
      expect(effects).toContain('Disadvantage on ability checks');
      expect(effects).toContain('Speed halved');
      expect(effects).toContain('Disadvantage on attack rolls and saving throws');
    });

    it('should return all effects for level 6', () => {
      mockCharacter.exhaustion_level = 6;
      const effects = getAllActiveEffects(mockCharacter as CharacterRecord);
      expect(effects.length).toBeGreaterThanOrEqual(6);
      expect(effects).toContain('Death');
    });
  });

  describe('applyExhaustionPenalties', () => {
    it('should return no penalties at level 0', () => {
      mockCharacter.exhaustion_level = 0;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.speedMod).toBe(1.0);
      expect(penalties.disadvantageOn).toEqual([]);
      expect(penalties.hpMaxMod).toBe(1.0);
    });

    it('should apply disadvantage on ability checks at level 1', () => {
      mockCharacter.exhaustion_level = 1;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.disadvantageOn).toContain('ability_checks');
      expect(penalties.speedMod).toBe(1.0);
      expect(penalties.hpMaxMod).toBe(1.0);
    });

    it('should halve speed at level 2', () => {
      mockCharacter.exhaustion_level = 2;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.speedMod).toBe(0.5);
      expect(penalties.disadvantageOn).toContain('ability_checks');
    });

    it('should add attack and save disadvantage at level 3', () => {
      mockCharacter.exhaustion_level = 3;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.disadvantageOn).toContain('ability_checks');
      expect(penalties.disadvantageOn).toContain('attacks');
      expect(penalties.disadvantageOn).toContain('saves');
    });

    it('should halve HP max at level 4', () => {
      mockCharacter.exhaustion_level = 4;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.hpMaxMod).toBe(0.5);
    });

    it('should reduce speed to 0 at level 5', () => {
      mockCharacter.exhaustion_level = 5;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.speedMod).toBe(0);
    });

    it('should apply all penalties cumulatively at level 6', () => {
      mockCharacter.exhaustion_level = 6;
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.speedMod).toBe(0);
      expect(penalties.hpMaxMod).toBe(0.5);
      expect(penalties.disadvantageOn.length).toBe(3);
    });
  });

  describe('isExhausted', () => {
    it('should return false at level 0', () => {
      mockCharacter.exhaustion_level = 0;
      expect(isExhausted(mockCharacter as CharacterRecord)).toBe(false);
    });

    it('should return true at any level above 0', () => {
      for (let level = 1; level <= 6; level++) {
        mockCharacter.exhaustion_level = level;
        expect(isExhausted(mockCharacter as CharacterRecord)).toBe(true);
      }
    });

    it('should handle undefined exhaustion_level', () => {
      delete mockCharacter.exhaustion_level;
      expect(isExhausted(mockCharacter as CharacterRecord)).toBe(false);
    });
  });

  describe('isDead', () => {
    it('should return false for levels 0-5', () => {
      for (let level = 0; level <= 5; level++) {
        mockCharacter.exhaustion_level = level;
        expect(isDead(mockCharacter as CharacterRecord)).toBe(false);
      }
    });

    it('should return true at level 6', () => {
      mockCharacter.exhaustion_level = 6;
      expect(isDead(mockCharacter as CharacterRecord)).toBe(true);
    });
  });

  describe('getExhaustionSummary', () => {
    it('should return "No exhaustion" at level 0', () => {
      mockCharacter.exhaustion_level = 0;
      const summary = getExhaustionSummary(mockCharacter as CharacterRecord);
      expect(summary).toBe('No exhaustion');
    });

    it('should return level and effects for levels 1-5', () => {
      mockCharacter.exhaustion_level = 3;
      const summary = getExhaustionSummary(mockCharacter as CharacterRecord);
      expect(summary).toContain('Exhaustion Level 3');
      expect(summary).toContain('Disadvantage');
    });

    it('should indicate death at level 6', () => {
      mockCharacter.exhaustion_level = 6;
      const summary = getExhaustionSummary(mockCharacter as CharacterRecord);
      expect(summary).toContain('DEAD');
      expect(summary).toContain('Level 6');
    });
  });

  describe('Exhaustion workflow', () => {
    it('should follow complete gain -> long rest cycle', () => {
      // Start with no exhaustion
      expect(isExhausted(mockCharacter as CharacterRecord)).toBe(false);

      // Gain exhaustion from forced march
      gainExhaustion(mockCharacter as CharacterRecord, 2);
      expect(mockCharacter.exhaustion_level).toBe(2);
      expect(isExhausted(mockCharacter as CharacterRecord)).toBe(true);

      // Check penalties
      const penalties = applyExhaustionPenalties(mockCharacter as CharacterRecord);
      expect(penalties.speedMod).toBe(0.5);

      // Long rest removes 1 level
      removeExhaustion(mockCharacter as CharacterRecord, 1);
      expect(mockCharacter.exhaustion_level).toBe(1);

      // Another long rest
      removeExhaustion(mockCharacter as CharacterRecord, 1);
      expect(mockCharacter.exhaustion_level).toBe(0);
      expect(isExhausted(mockCharacter as CharacterRecord)).toBe(false);
    });

    it('should handle death from exhaustion', () => {
      // Extreme situation - gain 6 levels
      gainExhaustion(mockCharacter as CharacterRecord, 6);
      expect(mockCharacter.exhaustion_level).toBe(6);
      expect(isDead(mockCharacter as CharacterRecord)).toBe(true);

      const summary = getExhaustionSummary(mockCharacter as CharacterRecord);
      expect(summary).toContain('DEAD');
    });
  });
});
