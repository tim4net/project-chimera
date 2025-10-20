/**
 * @file Tests for Legendary Resistance System
 */

import {
  createLegendaryResistance,
  canUseLegendaryResistance,
  useLegendaryResistance,
  resetLegendaryResistance,
  applyToSavingThrow,
  formatRemainingUses,
  hasLegendaryResistance,
  extractLegendaryResistanceUses,
  type LegendaryResistanceState,
  type SaveResult,
} from '../../game/legendaryResistance';

describe('Legendary Resistance System', () => {
  describe('createLegendaryResistance', () => {
    it('should create state with default 3 uses', () => {
      const state = createLegendaryResistance();
      expect(state.usesRemaining).toBe(3);
      expect(state.maxUses).toBe(3);
    });

    it('should create state with custom uses', () => {
      const state = createLegendaryResistance(5);
      expect(state.usesRemaining).toBe(5);
      expect(state.maxUses).toBe(5);
    });

    it('should throw error for negative uses', () => {
      expect(() => createLegendaryResistance(-1)).toThrow();
    });

    it('should allow zero uses', () => {
      const state = createLegendaryResistance(0);
      expect(state.usesRemaining).toBe(0);
      expect(state.maxUses).toBe(0);
    });
  });

  describe('canUseLegendaryResistance', () => {
    it('should return true when uses remain', () => {
      const state = createLegendaryResistance(3);
      expect(canUseLegendaryResistance(state)).toBe(true);
    });

    it('should return false when no uses remain', () => {
      const state = createLegendaryResistance(0);
      expect(canUseLegendaryResistance(state)).toBe(false);
    });

    it('should return false after all uses consumed', () => {
      const state = createLegendaryResistance(1);
      useLegendaryResistance(state);
      expect(canUseLegendaryResistance(state)).toBe(false);
    });
  });

  describe('useLegendaryResistance', () => {
    it('should consume one use successfully', () => {
      const state = createLegendaryResistance(3);
      const result = useLegendaryResistance(state);

      expect(result.success).toBe(true);
      expect(result.usesRemaining).toBe(2);
      expect(state.usesRemaining).toBe(2);
    });

    it('should fail when no uses remain', () => {
      const state = createLegendaryResistance(0);
      const result = useLegendaryResistance(state);

      expect(result.success).toBe(false);
      expect(result.usesRemaining).toBe(0);
      expect(state.usesRemaining).toBe(0);
    });

    it('should decrement uses correctly multiple times', () => {
      const state = createLegendaryResistance(3);

      useLegendaryResistance(state);
      expect(state.usesRemaining).toBe(2);

      useLegendaryResistance(state);
      expect(state.usesRemaining).toBe(1);

      useLegendaryResistance(state);
      expect(state.usesRemaining).toBe(0);
    });

    it('should not go below zero uses', () => {
      const state = createLegendaryResistance(1);

      useLegendaryResistance(state);
      useLegendaryResistance(state);
      useLegendaryResistance(state);

      expect(state.usesRemaining).toBe(0);
    });
  });

  describe('resetLegendaryResistance', () => {
    it('should restore uses to maximum', () => {
      const state = createLegendaryResistance(3);
      useLegendaryResistance(state);
      useLegendaryResistance(state);

      expect(state.usesRemaining).toBe(1);

      resetLegendaryResistance(state);
      expect(state.usesRemaining).toBe(3);
    });

    it('should work with custom max uses', () => {
      const state = createLegendaryResistance(5);
      useLegendaryResistance(state);

      resetLegendaryResistance(state);
      expect(state.usesRemaining).toBe(5);
      expect(state.maxUses).toBe(5);
    });

    it('should work when already at max', () => {
      const state = createLegendaryResistance(3);
      resetLegendaryResistance(state);

      expect(state.usesRemaining).toBe(3);
    });
  });

  describe('applyToSavingThrow', () => {
    it('should not use legendary resistance on successful save', () => {
      const state = createLegendaryResistance(3);
      const saveResult: SaveResult = {
        roll: 15,
        dc: 15,
        totalBonus: 5,
        success: true,
      };

      const result = applyToSavingThrow(saveResult, state);

      expect(result.finalSuccess).toBe(true);
      expect(result.usedLegendary).toBe(false);
      expect(result.usesRemaining).toBe(3);
      expect(state.usesRemaining).toBe(3); // Should not be consumed
    });

    it('should use legendary resistance on failed save', () => {
      const state = createLegendaryResistance(3);
      const saveResult: SaveResult = {
        roll: 8,
        dc: 15,
        totalBonus: 2,
        success: false,
      };

      const result = applyToSavingThrow(saveResult, state);

      expect(result.finalSuccess).toBe(true);
      expect(result.usedLegendary).toBe(true);
      expect(result.usesRemaining).toBe(2);
      expect(state.usesRemaining).toBe(2); // Should be consumed
    });

    it('should fail when no legendary resistances remain', () => {
      const state = createLegendaryResistance(0);
      const saveResult: SaveResult = {
        roll: 8,
        dc: 15,
        totalBonus: 2,
        success: false,
      };

      const result = applyToSavingThrow(saveResult, state);

      expect(result.finalSuccess).toBe(false);
      expect(result.usedLegendary).toBe(false);
      expect(result.usesRemaining).toBe(0);
    });

    it('should include roll details in message', () => {
      const state = createLegendaryResistance(3);
      const saveResult: SaveResult = {
        roll: 10,
        dc: 18,
        totalBonus: 3,
        success: false,
      };

      const result = applyToSavingThrow(saveResult, state);

      expect(result.message).toContain('13');
      expect(result.message).toContain('18');
      expect(result.message).toContain('LEGENDARY RESISTANCE');
      expect(result.message).toContain('2/3');
    });
  });

  describe('formatRemainingUses', () => {
    it('should format uses correctly', () => {
      const state = createLegendaryResistance(3);
      expect(formatRemainingUses(state)).toBe('3/3');

      useLegendaryResistance(state);
      expect(formatRemainingUses(state)).toBe('2/3');

      useLegendaryResistance(state);
      expect(formatRemainingUses(state)).toBe('1/3');

      useLegendaryResistance(state);
      expect(formatRemainingUses(state)).toBe('0/3');
    });

    it('should work with custom max uses', () => {
      const state = createLegendaryResistance(5);
      expect(formatRemainingUses(state)).toBe('5/5');
    });
  });

  describe('hasLegendaryResistance', () => {
    it('should detect legendary resistance ability', () => {
      const abilities = [
        { name: 'Amphibious', description: 'Can breathe air and water' },
        { name: 'Legendary Resistance', description: 'Can succeed on failed saves' },
      ];

      expect(hasLegendaryResistance(abilities)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const abilities = [
        { name: 'legendary resistance', description: 'Test' },
      ];

      expect(hasLegendaryResistance(abilities)).toBe(true);
    });

    it('should return false when not present', () => {
      const abilities = [
        { name: 'Magic Resistance', description: 'Advantage on saves' },
      ];

      expect(hasLegendaryResistance(abilities)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(hasLegendaryResistance([])).toBe(false);
    });
  });

  describe('extractLegendaryResistanceUses', () => {
    it('should extract uses from "3/Day" format', () => {
      const abilities = [
        {
          name: 'Legendary Resistance',
          description: 'If the dragon fails a saving throw, it can choose to succeed instead (3/Day).',
        },
      ];

      expect(extractLegendaryResistanceUses(abilities)).toBe(3);
    });

    it('should extract uses from "per day" format', () => {
      const abilities = [
        {
          name: 'Legendary Resistance',
          description: 'Can succeed on a failed save 5 per day.',
        },
      ];

      expect(extractLegendaryResistanceUses(abilities)).toBe(5);
    });

    it('should default to 3 when no number specified', () => {
      const abilities = [
        {
          name: 'Legendary Resistance',
          description: 'If the dragon fails a saving throw, it can choose to succeed instead.',
        },
      ];

      expect(extractLegendaryResistanceUses(abilities)).toBe(3);
    });

    it('should return 0 when legendary resistance not present', () => {
      const abilities = [
        { name: 'Magic Resistance', description: 'Advantage on saves' },
      ];

      expect(extractLegendaryResistanceUses(abilities)).toBe(0);
    });

    it('should handle empty array', () => {
      expect(extractLegendaryResistanceUses([])).toBe(0);
    });
  });

  describe('Integration: Full combat scenario', () => {
    it('should handle multiple failed saves in one encounter', () => {
      const state = createLegendaryResistance(3);

      // First failed save
      const save1: SaveResult = { roll: 5, dc: 18, totalBonus: 3, success: false };
      const result1 = applyToSavingThrow(save1, state);
      expect(result1.finalSuccess).toBe(true);
      expect(result1.usedLegendary).toBe(true);
      expect(state.usesRemaining).toBe(2);

      // Second failed save
      const save2: SaveResult = { roll: 7, dc: 16, totalBonus: 2, success: false };
      const result2 = applyToSavingThrow(save2, state);
      expect(result2.finalSuccess).toBe(true);
      expect(result2.usedLegendary).toBe(true);
      expect(state.usesRemaining).toBe(1);

      // Third failed save
      const save3: SaveResult = { roll: 6, dc: 17, totalBonus: 4, success: false };
      const result3 = applyToSavingThrow(save3, state);
      expect(result3.finalSuccess).toBe(true);
      expect(result3.usedLegendary).toBe(true);
      expect(state.usesRemaining).toBe(0);

      // Fourth failed save - no more legendary resistances
      const save4: SaveResult = { roll: 8, dc: 19, totalBonus: 5, success: false };
      const result4 = applyToSavingThrow(save4, state);
      expect(result4.finalSuccess).toBe(false);
      expect(result4.usedLegendary).toBe(false);
      expect(state.usesRemaining).toBe(0);
    });

    it('should not waste legendary resistance on successful saves', () => {
      const state = createLegendaryResistance(3);

      // Successful save
      const save1: SaveResult = { roll: 18, dc: 15, totalBonus: 5, success: true };
      const result1 = applyToSavingThrow(save1, state);
      expect(result1.usedLegendary).toBe(false);
      expect(state.usesRemaining).toBe(3);

      // Another successful save
      const save2: SaveResult = { roll: 20, dc: 18, totalBonus: 3, success: true };
      const result2 = applyToSavingThrow(save2, state);
      expect(result2.usedLegendary).toBe(false);
      expect(state.usesRemaining).toBe(3);
    });
  });
});
