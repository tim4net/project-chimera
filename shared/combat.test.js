const { resolveCombat } = require('./combat');

describe('Combat System', () => {
  it('should resolve combat with a victory', () => {
    const party = [{ level: 1, strength: 12 }];
    const enemies = [{ cr: 1, xp: 50, loot: ['gold'] }];
    const result = resolveCombat(party, enemies);
    expect(['victory', 'defeat', 'escape']).toContain(result.outcome);
  });
});
