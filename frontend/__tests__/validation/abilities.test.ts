/**
 * @fileoverview Unit tests for ability score validation (point-buy system)
 */

import { describe, it, expect } from 'vitest';
import {
  getPointCost,
  calculatePointsSpent,
  validatePointBuy,
  applyRacialBonuses,
  validateRacialBonuses,
  calculateAbilityModifier,
  calculateAllModifiers,
  validateFinalScores,
  isScoreAdjustmentValid,
  getMaxScoreForPoints,
} from '../../src/validation/abilities';
import type { AbilityScores } from '../../src/types/index';

describe('abilities - getPointCost', () => {
  it('should return correct costs for valid scores', () => {
    expect(getPointCost(8)).toBe(0);
    expect(getPointCost(9)).toBe(1);
    expect(getPointCost(10)).toBe(2);
    expect(getPointCost(11)).toBe(3);
    expect(getPointCost(12)).toBe(4);
    expect(getPointCost(13)).toBe(5);
    expect(getPointCost(14)).toBe(7);
    expect(getPointCost(15)).toBe(9);
  });

  it('should throw error for scores below 8', () => {
    expect(() => getPointCost(7)).toThrow();
    expect(() => getPointCost(0)).toThrow();
    expect(() => getPointCost(-1)).toThrow();
  });

  it('should throw error for scores above 15', () => {
    expect(() => getPointCost(16)).toThrow();
    expect(() => getPointCost(20)).toThrow();
    expect(() => getPointCost(100)).toThrow();
  });
});

describe('abilities - calculatePointsSpent', () => {
  it('should calculate total points for minimum scores', () => {
    const scores: AbilityScores = {
      STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8,
    };
    expect(calculatePointsSpent(scores)).toBe(0);
  });

  it('should calculate total points for maximum scores', () => {
    const scores: AbilityScores = {
      STR: 15, DEX: 15, CON: 15, INT: 15, WIS: 15, CHA: 15,
    };
    expect(calculatePointsSpent(scores)).toBe(54); // 9 * 6 = 54
  });

  it('should calculate total points for standard array equivalent', () => {
    const scores: AbilityScores = {
      STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };
    expect(calculatePointsSpent(scores)).toBe(27);
  });

  it('should calculate total points for mixed scores', () => {
    const scores: AbilityScores = {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
    };
    expect(calculatePointsSpent(scores)).toBe(12); // 2 * 6 = 12
  });
});

describe('abilities - validatePointBuy', () => {
  it('should accept valid 27-point allocation', () => {
    const scores: AbilityScores = {
      STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };
    const result = validatePointBuy(scores);
    expect(result.isValid).toBe(true);
    expect(result.totalPoints).toBe(27);
    expect(result.pointsRemaining).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject allocation with too many points', () => {
    const scores: AbilityScores = {
      STR: 15, DEX: 15, CON: 15, INT: 12, WIS: 10, CHA: 8,
    };
    const result = validatePointBuy(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Too many points'))).toBe(true);
  });

  it('should reject allocation with too few points', () => {
    const scores: AbilityScores = {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 8,
    };
    const result = validatePointBuy(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Not all points spent'))).toBe(true);
  });

  it('should reject scores below minimum', () => {
    const scores: AbilityScores = {
      STR: 7, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };
    const result = validatePointBuy(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('STR'))).toBe(true);
  });

  it('should reject scores above maximum', () => {
    const scores: AbilityScores = {
      STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };
    const result = validatePointBuy(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('STR'))).toBe(true);
  });

  it('should reject non-integer scores', () => {
    const scores: AbilityScores = {
      STR: 10.5, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };
    const result = validatePointBuy(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('whole number'))).toBe(true);
  });

  it('should validate edge case: all 10s except one 15', () => {
    const scores: AbilityScores = {
      STR: 15, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
    };
    const result = calculatePointsSpent(scores);
    // 9 (for 15) + 5*2 (for 10s) = 19 points
    expect(result).toBe(19);
  });

  it('should validate edge case: balanced 11s and 12s', () => {
    const scores: AbilityScores = {
      STR: 12, DEX: 12, CON: 12, INT: 11, WIS: 11, CHA: 11,
    };
    const result = calculatePointsSpent(scores);
    // 3*4 (for 12s) + 3*3 (for 11s) = 21 points
    expect(result).toBe(21);
  });
});

describe('abilities - applyRacialBonuses', () => {
  it('should apply Human racial bonuses (+1 to all)', () => {
    const baseScores: AbilityScores = {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
    };
    const result = applyRacialBonuses(baseScores, 'Human');
    expect(result).toEqual({
      STR: 11, DEX: 11, CON: 11, INT: 11, WIS: 11, CHA: 11,
    });
  });

  it('should apply Dragonborn racial bonuses (+2 STR, +1 CHA)', () => {
    const baseScores: AbilityScores = {
      STR: 13, DEX: 10, CON: 12, INT: 8, WIS: 10, CHA: 14,
    };
    const result = applyRacialBonuses(baseScores, 'Dragonborn');
    expect(result).toEqual({
      STR: 15, DEX: 10, CON: 12, INT: 8, WIS: 10, CHA: 15,
    });
  });

  it('should apply Elf racial bonuses (+2 DEX)', () => {
    const baseScores: AbilityScores = {
      STR: 10, DEX: 14, CON: 12, INT: 13, WIS: 10, CHA: 8,
    };
    const result = applyRacialBonuses(baseScores, 'Elf');
    expect(result).toEqual({
      STR: 10, DEX: 16, CON: 12, INT: 13, WIS: 10, CHA: 8,
    });
  });

  it('should apply Dwarf racial bonuses (+2 CON)', () => {
    const baseScores: AbilityScores = {
      STR: 12, DEX: 10, CON: 13, INT: 10, WIS: 12, CHA: 8,
    };
    const result = applyRacialBonuses(baseScores, 'Dwarf');
    expect(result).toEqual({
      STR: 12, DEX: 10, CON: 15, INT: 10, WIS: 12, CHA: 8,
    });
  });
});

describe('abilities - validateRacialBonuses', () => {
  it('should validate correct racial bonus application', () => {
    const baseScores: AbilityScores = {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
    };
    const finalScores: AbilityScores = {
      STR: 11, DEX: 11, CON: 11, INT: 11, WIS: 11, CHA: 11,
    };
    const result = validateRacialBonuses(baseScores, finalScores, 'Human');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect incorrect racial bonus application', () => {
    const baseScores: AbilityScores = {
      STR: 13, DEX: 10, CON: 12, INT: 8, WIS: 10, CHA: 14,
    };
    const finalScores: AbilityScores = {
      STR: 15, DEX: 10, CON: 12, INT: 8, WIS: 10, CHA: 14, // Missing CHA bonus
    };
    const result = validateRacialBonuses(baseScores, finalScores, 'Dragonborn');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('CHA'))).toBe(true);
  });
});

describe('abilities - calculateAbilityModifier', () => {
  it('should calculate negative modifiers', () => {
    expect(calculateAbilityModifier(1)).toBe(-5);
    expect(calculateAbilityModifier(3)).toBe(-4);
    expect(calculateAbilityModifier(5)).toBe(-3);
    expect(calculateAbilityModifier(7)).toBe(-2);
    expect(calculateAbilityModifier(9)).toBe(-1);
  });

  it('should calculate zero modifier', () => {
    expect(calculateAbilityModifier(10)).toBe(0);
    expect(calculateAbilityModifier(11)).toBe(0);
  });

  it('should calculate positive modifiers', () => {
    expect(calculateAbilityModifier(12)).toBe(1);
    expect(calculateAbilityModifier(14)).toBe(2);
    expect(calculateAbilityModifier(16)).toBe(3);
    expect(calculateAbilityModifier(18)).toBe(4);
    expect(calculateAbilityModifier(20)).toBe(5);
  });
});

describe('abilities - calculateAllModifiers', () => {
  it('should calculate modifiers for all abilities', () => {
    const scores: AbilityScores = {
      STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };
    const result = calculateAllModifiers(scores);
    expect(result).toEqual({
      STR: 3, DEX: 2, CON: 1, INT: 1, WIS: 0, CHA: -1,
    });
  });
});

describe('abilities - validateFinalScores', () => {
  it('should validate scores within valid range', () => {
    const scores: AbilityScores = {
      STR: 16, DEX: 14, CON: 15, INT: 13, WIS: 12, CHA: 10,
    };
    const result = validateFinalScores(scores);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject scores above 20', () => {
    const scores: AbilityScores = {
      STR: 21, DEX: 14, CON: 15, INT: 13, WIS: 12, CHA: 10,
    };
    const result = validateFinalScores(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('STR'))).toBe(true);
  });

  it('should reject scores below 1', () => {
    const scores: AbilityScores = {
      STR: 0, DEX: 14, CON: 15, INT: 13, WIS: 12, CHA: 10,
    };
    const result = validateFinalScores(scores);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('STR'))).toBe(true);
  });
});

describe('abilities - isScoreAdjustmentValid', () => {
  it('should allow increasing score within budget', () => {
    const result = isScoreAdjustmentValid(10, 12, 10);
    expect(result).toBe(true);
  });

  it('should prevent increasing score when over budget', () => {
    const result = isScoreAdjustmentValid(10, 15, 25);
    expect(result).toBe(false);
  });

  it('should allow decreasing score', () => {
    const result = isScoreAdjustmentValid(14, 10, 25);
    expect(result).toBe(true);
  });

  it('should prevent setting score above 15', () => {
    const result = isScoreAdjustmentValid(10, 16, 10);
    expect(result).toBe(false);
  });

  it('should prevent setting score below 8', () => {
    const result = isScoreAdjustmentValid(10, 7, 10);
    expect(result).toBe(false);
  });
});

describe('abilities - getMaxScoreForPoints', () => {
  it('should return 15 when all points available', () => {
    const result = getMaxScoreForPoints(8, 0);
    expect(result).toBe(15);
  });

  it('should return 14 when only 7 points available', () => {
    const result = getMaxScoreForPoints(8, 20);
    expect(result).toBe(14);
  });

  it('should return 8 when no points available', () => {
    const result = getMaxScoreForPoints(8, 27);
    expect(result).toBe(8);
  });

  it('should account for current score cost', () => {
    // Current score is 12 (costs 4), total used is 15
    // Available: 27 - 15 + 4 = 16 points
    // Can afford up to 15 (costs 9)
    const result = getMaxScoreForPoints(12, 15);
    expect(result).toBe(15);
  });
});
