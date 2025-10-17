const { roll } = require('./dice');

describe('Dice Roller', () => {
  it('should roll a single die', () => {
    const result = roll('1d6');
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });

  it('should roll multiple dice', () => {
    const result = roll('2d6');
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(12);
  });

  it('should handle different-sided dice', () => {
    const result = roll('1d20');
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(20);
  });
});
