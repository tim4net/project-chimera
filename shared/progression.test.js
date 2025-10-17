const { canLevelUp, levelUp } = require('./progression');
const { roll } = require('./dice');

jest.mock('./dice', () => ({
  roll: jest.fn(() => 5),
}));

describe('Progression System', () => {
  it('should determine if a character can level up', () => {
    const character = { level: 1, xp: 300 };
    expect(canLevelUp(character)).toBe(true);
  });

  it('should not level up a character who does not have enough xp', () => {
    const character = { level: 1, xp: 299 };
    expect(canLevelUp(character)).toBe(false);
  });

  it('should level up a character', () => {
    const character = {
      level: 1,
      xp: 300,
      hp_max: 10,
      hit_die: 8,
      constitution: 12,
    };
    const newCharacter = levelUp(character);
    expect(newCharacter.level).toBe(2);
    expect(newCharacter.hp_max).toBe(16);
  });
});
