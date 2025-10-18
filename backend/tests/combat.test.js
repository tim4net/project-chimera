const { simulateCombat } = require('../src/game/combat');

describe('simulateCombat', () => {
  it('should simulate a combat and return a winner', () => {
    const character1 = {
      name: 'Hero',
      stats: { health: 50, damage: '1d6', armorClass: 15 },
    };
    const character2 = {
      name: 'Monster',
      stats: { health: 30, damage: '1d4', armorClass: 12 },
    };

    const { winner, combatLog, outcome } = simulateCombat(character1, character2);

    expect(['win', 'draw', 'error']).toContain(outcome);
    if (outcome === 'win') {
      expect(winner).toBeDefined();
    } else {
      expect(winner).toBeNull();
    }
    expect(combatLog).toBeInstanceOf(Array);
    expect(combatLog.length).toBeGreaterThan(0);
  });
});
