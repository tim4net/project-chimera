// src/__tests__/game/rules.test.ts
import { validatePointBuy } from '../../game/rules';
import type { AbilityScores } from '../../types/index';

describe('validatePointBuy', () => {
  // Happy Path Tests
  test('should return true for a valid 27-point buy allocation', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
    }; // Costs: 9 + 7 + 5 + 4 + 2 + 0 = 27
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(true);
  });

  test('should return true for an allocation using less than 27 points', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    }; // Costs: 2 * 6 = 12
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(true);
  });

  test('should return true for an allocation with exactly 0 points (all 8s)', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8
    }; // Costs: 0 * 6 = 0
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(true);
  });

  // Invalid Input / Edge Case Tests
  test('should return false for an allocation exceeding 27 points', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 15, DEX: 15, CON: 15, INT: 8, WIS: 8, CHA: 8
    }; // Costs: 9 + 9 + 9 + 0 + 0 + 0 = 27. This is exactly 27.
    const scoresOver: AbilityScores = {
      STR: 15, DEX: 15, CON: 15, INT: 10, WIS: 8, CHA: 8
    }; // Costs: 9 + 9 + 9 + 2 + 0 + 0 = 29
    // Act
    const resultExact = validatePointBuy(scores);
    const resultOver = validatePointBuy(scoresOver);
    // Assert
    expect(resultExact).toBe(true); // Ensure the 27-point exact case passes
    expect(resultOver).toBe(false);
  });

  test('should return false if any score is below 8', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 7, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    };
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(false);
  });

  test('should return false if any score is above 15', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 16, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    };
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(false);
  });

  test('should return false if multiple scores are invalid (below and above range)', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 7, DEX: 16, CON: 10, INT: 10, WIS: 10, CHA: 10
    };
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(false);
  });

  test('should return false for an allocation with all 15s (exceeds points)', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 15, DEX: 15, CON: 15, INT: 15, WIS: 15, CHA: 15
    }; // Costs: 9 * 6 = 54
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(false);
  });

  test('should handle scores at the minimum and maximum valid range (8 and 15)', () => {
    // Arrange
    const scores: AbilityScores = {
      STR: 8, DEX: 8, CON: 8, INT: 15, WIS: 15, CHA: 15
    }; // Costs: 0*3 + 9*3 = 27
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(true);
  });

  test('should return false if a score is not a valid point buy value (e.g., 17)', () => {
    // Arrange
    // This case is implicitly covered by the `score > 15` check, but good to be explicit.
    const scores: AbilityScores = {
      STR: 17, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    };
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(false);
  });

  test('should return false if a score is not a valid point buy value (e.g., 6)', () => {
    // Arrange
    // This case is implicitly covered by the `score < 8` check.
    const scores: AbilityScores = {
      STR: 6, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    };
    // Act
    const result = validatePointBuy(scores);
    // Assert
    expect(result).toBe(false);
  });
});
