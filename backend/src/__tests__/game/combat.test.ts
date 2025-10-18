// src/__tests__/game/combat.test.ts
import { simulateCombat } from '../../game/combat';
import { rollDice } from '../../game/dice';
import type { Combatant } from '../../types/index';

// Mock the rollDice function
jest.mock('../../game/dice', () => ({
  rollDice: jest.fn(),
}));

const mockRollDice = rollDice as jest.MockedFunction<typeof rollDice>;

describe('simulateCombat', () => {
  let character1: Combatant;
  let character2: Combatant;

  beforeEach(() => {
    mockRollDice.mockClear();

    character1 = {
      name: 'Hero',
      stats: { health: 20, damage: '1d6', armorClass: 12 },
    };

    character2 = {
      name: 'Goblin',
      stats: { health: 15, damage: '1d4', armorClass: 10 },
    };
  });

  test('should simulate combat where character1 wins', () => {
    mockRollDice
      .mockReturnValueOnce(15).mockReturnValueOnce(4)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(15).mockReturnValueOnce(4)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(15).mockReturnValueOnce(4);

    const result = simulateCombat(character1, character2);

    expect(result.winner.name).toBe('Hero');
    expect(result.combatLog).toContain('Hero wins!');
    expect(mockRollDice).toHaveBeenCalled();
  });

  test('should declare winner if one combatant starts with 0 health', () => {
    character1.stats.health = 0;
    const result = simulateCombat(character1, character2);

    expect(result.winner.name).toBe('Goblin');
    expect(result.combatLog).toEqual(['Goblin wins!']);
    expect(mockRollDice).not.toHaveBeenCalled();
  });

  test('should ensure original combatants are not modified', () => {
    const initialHealth = character1.stats.health;
    mockRollDice.mockReturnValueOnce(15).mockReturnValueOnce(4).mockReturnValueOnce(5);
    
    simulateCombat(character1, character2);

    expect(character1.stats.health).toBe(initialHealth);
  });
});
