// src/__tests__/game/dice.test.ts
import { rollDice } from '../../game/dice';

describe('rollDice', () => {
  let mockMathRandom: jest.SpyInstance;

  beforeEach(() => {
    // Mock Math.random to return predictable values for consistent testing
    // For 1d6, this will simulate rolling a 3 (0.5 * 6 = 3, floor + 1 = 4)
    // For 1d20, this will simulate rolling a 10 (0.5 * 20 = 10, floor + 1 = 11)
    mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    mockMathRandom.mockRestore(); // Restore original Math.random after each test
  });

  // Happy Path Tests
  test('should roll a single die (1d6)', () => {
    // Arrange
    const diceString = '1d6';
    // Act
    const result = rollDice(diceString);
    // Assert
    expect(result).toBe(4); // (0.5 * 6) + 1 = 4
    expect(mockMathRandom).toHaveBeenCalledTimes(1);
  });

  test('should roll multiple dice (2d6)', () => {
    // Arrange
    const diceString = '2d6';
    // Act
    const result = rollDice(diceString);
    // Assert
    expect(result).toBe(8); // (0.5 * 6 + 1) + (0.5 * 6 + 1) = 4 + 4 = 8
    expect(mockMathRandom).toHaveBeenCalledTimes(2);
  });

  test('should roll with a positive modifier (1d20+5)', () => {
    // Arrange
    const diceString = '1d20+5';
    // Act
    const result = rollDice(diceString);
    // Assert
    expect(result).toBe(16); // (0.5 * 20 + 1) + 5 = 11 + 5 = 16
    expect(mockMathRandom).toHaveBeenCalledTimes(1);
  });

  test('should roll multiple dice with a positive modifier (3d8+2)', () => {
    // Arrange
    const diceString = '3d8+2';
    // Act
    const result = rollDice(diceString);
    // Assert
    // (0.5 * 8 + 1) * 3 + 2 = (5) * 3 + 2 = 15 + 2 = 17
    expect(result).toBe(17);
    expect(mockMathRandom).toHaveBeenCalledTimes(3);
  });

  // Edge Case Tests
  test('should return 0 for 0d6', () => {
    // Arrange
    const diceString = '0d6';
    // Act
    const result = rollDice(diceString);
    // Assert
    expect(result).toBe(0);
    expect(mockMathRandom).not.toHaveBeenCalled(); // No dice rolled
  });

  test('should return 1 for 1d1 (minimum possible roll)', () => {
    // Arrange
    const diceString = '1d1';
    // Act
    const result = rollDice(diceString);
    // Assert
    expect(result).toBe(1); // (0.5 * 1) + 1 = 1.5, floor is 1
    expect(mockMathRandom).toHaveBeenCalledTimes(1);
  });

  test('should return 1 for 1d0 (current implementation behavior for 0-sided die)', () => {
    // Arrange
    const diceString = '1d0';
    // Act
    const result = rollDice(diceString);
    // Assert
    // Current implementation: Math.floor(Math.random() * 0) + 1 = 0 + 1 = 1
    expect(result).toBe(1);
    expect(mockMathRandom).toHaveBeenCalledTimes(1);
  });

  test('should handle large number of dice (100d6)', () => {
    // Arrange
    const diceString = '100d6';
    // Act
    const result = rollDice(diceString);
    // Assert
    expect(result).toBe(400); // 100 * (0.5 * 6 + 1) = 100 * 4 = 400
    expect(mockMathRandom).toHaveBeenCalledTimes(100);
  });

  // Invalid Input / Error Condition Tests
  test('should throw an error for invalid dice string (no "d")', () => {
    // Arrange
    const diceString = 'invalid';
    // Act & Assert
    expect(() => rollDice(diceString)).toThrow('Invalid dice string: invalid');
  });

  test('should throw an error for invalid number of dice (not a number)', () => {
    // Arrange
    const diceString = 'ad6';
    // Act & Assert
    expect(() => rollDice(diceString)).toThrow('Invalid dice string: ad6');
  });

  test('should throw an error for invalid number of sides (not a number)', () => {
    // Arrange
    const diceString = '1d_sides';
    // Act & Assert
    expect(() => rollDice(diceString)).toThrow('Invalid dice string: 1d_sides');
  });

  test('should ignore non-numeric modifier parts after a valid number', () => {
    // Arrange
    const diceString = '1d6+abc';
    // Act
    const result = rollDice(diceString);
    // Assert
    // parseInt('abc') is NaN, so modifier is ignored.
    expect(result).toBe(4); // (0.5 * 6 + 1) = 4
  });

  // Statistical Validation (without mocking Math.random)
  describe('statistical validation', () => {
    beforeEach(() => {
      mockMathRandom.mockRestore(); // Use actual Math.random for statistical tests
    });

    test('should roll 1d6 within expected range over many rolls', () => {
      const numRolls = 1000;
      const min = 1;
      const max = 6;
      let sum = 0;
      for (let i = 0; i < numRolls; i += 1) {
        const roll = rollDice('1d6').total;
        expect(roll).toBeGreaterThanOrEqual(min);
        expect(roll).toBeLessThanOrEqual(max);
        sum += roll;
      }
      const average = sum / numRolls;
      // Expect average to be close to the theoretical average (3.5 for 1d6)
      expect(average).toBeGreaterThan(3);
      expect(average).toBeLessThan(4);
    });

    test('should roll 2d6 within expected range over many rolls', () => {
      const numRolls = 1000;
      const min = 2;
      const max = 12;
      let sum = 0;
      for (let i = 0; i < numRolls; i += 1) {
        const roll = rollDice('2d6').total;
        expect(roll).toBeGreaterThanOrEqual(min);
        expect(roll).toBeLessThanOrEqual(max);
        sum += roll;
      }
      const average = sum / numRolls;
      // Expect average to be close to the theoretical average (7 for 2d6)
      expect(average).toBeGreaterThan(6.5);
      expect(average).toBeLessThan(7.5);
    });
  });

  // Specific behavior for current implementation to highlight potential improvements
  test('should incorrectly parse "1d6-1" as "1d6" with a modifier of 6', () => {
    // Arrange
    const diceString = '1d6-1';
    // Act
    const result = rollDice(diceString);
    // Assert
    // Current implementation splits on '+', so '6-1' becomes sidesPart, and modifierPart is undefined.
    // However, the split logic `const [sidesPart, modifierPart] = rest.split('+');`
    // means `rest` is '6-1', `sidesPart` is '6-1', `modifierPart` is undefined.
    // `Number.parseInt('6-1', 10)` will result in 6. So it's effectively 1d6.
    // This is a bug where negative modifiers are not handled, and malformed modifiers are partially parsed.
    expect(result).toBe(4); // (0.5 * 6 + 1) = 4
    expect(mockMathRandom).toHaveBeenCalledTimes(1);
  });

  test('should incorrectly parse "1d6+1-1" as "1d6+1" with modifier 1', () => {
    // Arrange
    const diceString = '1d6+1-1';
    // Act
    const result = rollDice(diceString);
    // Assert
    // Current implementation splits on '+', so '1-1' becomes modifierPart.
    // Number.parseInt('1-1', 10) results in 1. So it's effectively 1d6+1.
    expect(result).toBe(5); // (0.5 * 6 + 1) + 1 = 4 + 1 = 5
    expect(mockMathRandom).toHaveBeenCalledTimes(1);
  });
});
