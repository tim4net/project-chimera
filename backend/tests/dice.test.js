const { rollDice } = require('../src/game/dice');

describe('rollDice', () => {
  it('should roll a single die', () => {
    const result = rollDice('1d6');
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
  });

  it('should roll multiple dice', () => {
    const result = rollDice('2d6');
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(12);
  });

  it('should handle a modifier', () => {
    const result = rollDice('1d6+3');
    expect(result).toBeGreaterThanOrEqual(4);
    expect(result).toBeLessThanOrEqual(9);
  });
});
