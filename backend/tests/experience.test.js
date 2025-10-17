const { calculateXP, levelUp } = require('../src/game/experience');

describe('experience', () => {
  describe('calculateXP', () => {
    it('should calculate the XP for a character', () => {
      const character = { level: 1 };
      const monster = { level: 1 };
      const xp = calculateXP(character, monster);
      expect(xp).toBe(100);
    });
  });

  describe('levelUp', () => {
    it('should level up a character', () => {
      const character = { level: 1, stats: { health: 50 } };
      const leveledUpCharacter = levelUp(character);
      expect(leveledUpCharacter.level).toBe(2);
      expect(leveledUpCharacter.stats.health).toBe(60);
    });
  });
});
