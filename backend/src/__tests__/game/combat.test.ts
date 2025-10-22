// src/__tests__/game/combat.test.ts
import { simulateCombat } from '../../game/combat';
import { rollDice } from '../../game/dice';
import type { Combatant } from '../../types/index';

// Mock the rollDice function
jest.mock('../../game/dice');

const mockRollDice = rollDice as jest.MockedFunction<typeof rollDice>;

describe('simulateCombat', () => {
  let character1: Combatant;
  let character2: Combatant;

  beforeEach(() => {
    mockRollDice.mockReset();

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
    mockRollDice.mockImplementation((dice: string) => {
      if (dice === '1d20') {
        return { total: 17, rolls: [17], modifier: 0, notation: dice };
      }
      return { total: 5, rolls: [5], modifier: 0, notation: dice };
    });

    const result = simulateCombat(character1, character2);

    expect(result.outcome).toBe('win');
    expect(result.winner).not.toBeNull();
    expect(result.winner?.name).toBe('Hero');
    expect(result.combatLog).toContain('Hero wins!');
    expect(mockRollDice).toHaveBeenCalled();
  });

  test('should declare winner if one combatant starts with 0 health', () => {
    character1.stats.health = 0;
    const result = simulateCombat(character1, character2);

    expect(result.outcome).toBe('win');
    expect(result.winner).not.toBeNull();
    expect(result.winner?.name).toBe('Goblin');
    expect(result.combatLog).toEqual(['Goblin wins!']);
    expect(mockRollDice).not.toHaveBeenCalled();
  });

  test('should ensure original combatants are not modified', () => {
    const initialHealth = character1.stats.health;
    mockRollDice
      .mockReturnValueOnce({ total: 15, rolls: [15], modifier: 0, notation: '1d20' })
      .mockReturnValueOnce({ total: 4, rolls: [4], modifier: 0, notation: '1d6' })
      .mockReturnValueOnce({ total: 5, rolls: [5], modifier: 0, notation: '1d20' });
    
    simulateCombat(character1, character2);

    expect(character1.stats.health).toBe(initialHealth);
  });

  test('should end in a draw after reaching the maximum number of turns', () => {
    character2.stats.health = character1.stats.health;
    mockRollDice.mockReturnValue({ total: 1, rolls: [1], modifier: 0, notation: '1d20' });

    const result = simulateCombat(character1, character2);

    expect(result.outcome).toBe('draw');
    expect(result.winner).toBeNull();
    expect(result.combatLog).toContain('Stalemate reached after 100 turns.');
    expect(result.combatLog).toContain('Combat ends in a draw.');
    expect(mockRollDice).toHaveBeenCalledTimes(100);
  });

  test('should report an error outcome when dice rolling fails', () => {
    mockRollDice.mockImplementation(() => {
      throw new Error('dice jam');
    });

    const result = simulateCombat(character1, character2);

    expect(result.outcome).toBe('error');
    expect(result.winner).toBeNull();
    expect(result.combatLog[0]).toContain('dice jam');
  });
});
