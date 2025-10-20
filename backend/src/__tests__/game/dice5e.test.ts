// Comprehensive D&D 5e Dice System Test Suite
// This file tests ALL 5e mechanics including advantage/disadvantage,
// proficiency, saving throws, attack rolls, and damage rolls

import * as diceModule from '../../game/dice';

// Type definitions for expected 5e dice system API
type DiceRollResult = {
  total: number;
  rolls: number[];
  modifier: number;
  notation: string;
};

type D20RollResult = {
  total: number;
  raw: number;
  rolls: number[];
  kept: number;
  mode: 'normal' | 'advantage' | 'disadvantage';
  modifiers: {
    abilityModifier: number;
    proficiencyBonus: number;
  };
  isCritical: boolean;
  isFumble: boolean;
};

type AbilityRollResult = D20RollResult & {
  ability: string;
  proficient: boolean;
};

type DamageComponentResult = {
  type: string;
  rolls: number[];
  modifier: number;
  total: number;
};

type DamageRollResult = {
  total: number;
  components: DamageComponentResult[];
  critical: boolean;
};

type DnDDiceModule = {
  rollDice: (notation: string, options?: { rng?: () => number }) => DiceRollResult;
  rollD20: (options?: {
    advantage?: 'advantage' | 'disadvantage';
    abilityModifier?: number;
    proficiencyBonus?: number;
    rng?: () => number;
  }) => D20RollResult;
  calculateAbilityModifier: (score: number) => number;
  rollAbilityCheck: (options: {
    ability: string;
    abilityScore: number;
    proficiencyBonus?: number;
    proficient?: boolean;
    advantage?: 'advantage' | 'disadvantage';
    rng?: () => number;
  }) => AbilityRollResult;
  rollSavingThrow: (options: {
    save: string;
    abilityScore: number;
    proficiencyBonus?: number;
    proficient?: boolean;
    advantage?: 'advantage' | 'disadvantage';
    rng?: () => number;
  }) => AbilityRollResult;
  rollAttackRoll: (options: {
    ability: string;
    abilityScore: number;
    proficiencyBonus?: number;
    proficient?: boolean;
    advantage?: 'advantage' | 'disadvantage';
    rng?: () => number;
  }) => AbilityRollResult;
  rollDamage: (options: {
    components: { notation: string; type: string }[];
    critical?: boolean;
    rng?: () => number;
  }) => DamageRollResult;
  createSeededRng: (seed: number) => () => number;
};

const {
  rollDice,
  rollD20,
  calculateAbilityModifier,
  rollAbilityCheck,
  rollSavingThrow,
  rollAttackRoll,
  rollDamage,
  createSeededRng,
} = diceModule as unknown as DnDDiceModule;

// Helper: Create sequence-based RNG for predictable testing
const sequenceRng = (sequence: number[]) => {
  let i = 0;
  return () => {
    const value = sequence[i];
    i += 1;
    return value ?? 0;
  };
};

describe('D&D 5e Dice System', () => {
  describe('Enhanced Basic Dice Rolls', () => {
    it('parses NdN+M notation with deterministic RNG', () => {
      const rng = sequenceRng([0.0, 0.5]); // -> rolls: 1 and 4
      const result = rollDice('2d6+3', { rng });
      expect(result.total).toBe(8);
      expect(result.rolls).toEqual([1, 4]);
      expect(result.modifier).toBe(3);
      expect(result.notation).toBe('2d6+3');
    });

    it('supports negative modifiers (1d20-2)', () => {
      const rng = sequenceRng([0.55]); // -> roll: 12
      const result = rollDice('1d20-2', { rng });
      expect(result.total).toBe(10);
      expect(result.rolls).toEqual([12]);
      expect(result.modifier).toBe(-2);
    });

    it('handles zero modifier explicitly', () => {
      const rng = sequenceRng([0.75]); // -> roll: 16
      const result = rollDice('1d20+0', { rng });
      expect(result.total).toBe(16);
      expect(result.modifier).toBe(0);
    });
  });

  describe('Advantage and Disadvantage', () => {
    it('rolls with advantage - keeps highest of 2d20', () => {
      const rng = sequenceRng([0.05, 0.75]); // -> rolls: 2 and 16
      const result = rollD20({ advantage: 'advantage', rng });
      expect(result.rolls).toEqual([2, 16]);
      expect(result.kept).toBe(16);
      expect(result.total).toBe(16);
      expect(result.mode).toBe('advantage');
      expect(result.isCritical).toBe(false);
    });

    it('rolls with disadvantage - keeps lowest of 2d20', () => {
      const rng = sequenceRng([0.9, 0.1]); // -> rolls: 19 and 3
      const result = rollD20({ advantage: 'disadvantage', rng });
      expect(result.rolls).toEqual([19, 3]);
      expect(result.kept).toBe(3);
      expect(result.total).toBe(3);
      expect(result.mode).toBe('disadvantage');
      expect(result.isFumble).toBe(false);
    });

    it('detects critical hit (nat 20) with advantage', () => {
      const rng = sequenceRng([0.999, 0.5]); // -> rolls: 20 and 11
      const result = rollD20({ advantage: 'advantage', rng });
      expect(result.kept).toBe(20);
      expect(result.isCritical).toBe(true);
    });

    it('detects fumble (nat 1) with disadvantage', () => {
      const rng = sequenceRng([0.001, 0.5]); // -> rolls: 1 and 11
      const result = rollD20({ advantage: 'disadvantage', rng });
      expect(result.kept).toBe(1);
      expect(result.isFumble).toBe(true);
    });
  });

  describe('Ability Modifiers (5e Rules)', () => {
    it.each([
      [1, -5],
      [3, -4],
      [8, -1],
      [10, 0],
      [11, 0],
      [12, 1],
      [15, 2],
      [18, 4],
      [20, 5],
      [30, 10],
    ])('calculates modifier for ability score %d as %d', (score, expected) => {
      expect(calculateAbilityModifier(score)).toBe(expected);
    });
  });

  describe('Ability Checks with Proficiency', () => {
    it('adds ability modifier + proficiency when proficient', () => {
      const rng = sequenceRng([0.5]); // -> roll: 11
      const result = rollAbilityCheck({
        ability: 'Dexterity',
        abilityScore: 18,
        proficiencyBonus: 3,
        proficient: true,
        rng,
      });
      expect(result.kept).toBe(11);
      expect(result.modifiers.abilityModifier).toBe(4);
      expect(result.modifiers.proficiencyBonus).toBe(3);
      expect(result.total).toBe(18); // 11 + 4 + 3
      expect(result.proficient).toBe(true);
      expect(result.ability).toBe('Dexterity');
    });

    it('omits proficiency when not proficient', () => {
      const rng = sequenceRng([0.25]); // -> roll: 6
      const result = rollAbilityCheck({
        ability: 'Intelligence',
        abilityScore: 12,
        proficiencyBonus: 2,
        proficient: false,
        rng,
      });
      expect(result.kept).toBe(6);
      expect(result.total).toBe(7); // 6 + 1 (ability mod)
      expect(result.modifiers.proficiencyBonus).toBe(0);
      expect(result.proficient).toBe(false);
    });

    it('applies advantage to ability checks', () => {
      const rng = sequenceRng([0.3, 0.7]); // -> rolls: 7 and 15
      const result = rollAbilityCheck({
        ability: 'Strength',
        abilityScore: 16,
        proficiencyBonus: 2,
        proficient: true,
        advantage: 'advantage',
        rng,
      });
      expect(result.rolls).toEqual([7, 15]);
      expect(result.kept).toBe(15);
      expect(result.total).toBe(20); // 15 + 3 (ability) + 2 (prof)
    });
  });

  describe('Saving Throws', () => {
    it('applies proficiency when proficient in the save', () => {
      const rng = sequenceRng([0.4]); // -> roll: 9
      const result = rollSavingThrow({
        save: 'Wisdom',
        abilityScore: 14,
        proficiencyBonus: 3,
        proficient: true,
        rng,
      });
      expect(result.total).toBe(14); // 9 + 2 (ability) + 3 (prof)
      expect(result.modifiers.abilityModifier).toBe(2);
      expect(result.modifiers.proficiencyBonus).toBe(3);
      expect(result.ability).toBe('Wisdom');
      expect(result.proficient).toBe(true);
    });

    it('does not apply proficiency when not proficient', () => {
      const rng = sequenceRng([0.95]); // -> roll: 20
      const result = rollSavingThrow({
        save: 'Charisma',
        abilityScore: 8,
        proficiencyBonus: 3,
        proficient: false,
        rng,
      });
      expect(result.total).toBe(19); // 20 + (-1) ability
      expect(result.modifiers.proficiencyBonus).toBe(0);
      expect(result.ability).toBe('Charisma');
    });
  });

  describe('Attack Rolls & Critical Hits', () => {
    it('marks natural 20 as critical', () => {
      const rng = sequenceRng([0.999]); // -> roll: 20
      const result = rollAttackRoll({
        ability: 'Strength',
        abilityScore: 18,
        proficiencyBonus: 4,
        proficient: true,
        rng,
      });
      expect(result.raw).toBe(20);
      expect(result.isCritical).toBe(true);
      expect(result.total).toBe(28); // 20 + 4 (ability) + 4 (prof)
      expect(result.modifiers.abilityModifier).toBe(4);
    });

    it('handles negative ability modifiers', () => {
      const rng = sequenceRng([0.2]); // -> roll: 5
      const result = rollAttackRoll({
        ability: 'Strength',
        abilityScore: 7,
        proficiencyBonus: 2,
        proficient: false,
        rng,
      });
      expect(result.total).toBe(3); // 5 + (-2) ability, no prof
      expect(result.modifiers.abilityModifier).toBe(-2);
      expect(result.modifiers.proficiencyBonus).toBe(0);
      expect(result.isCritical).toBe(false);
    });
  });

  describe('Damage Rolls', () => {
    it('aggregates multiple damage types', () => {
      const rng = sequenceRng([0.2, 0.8, 0.125]); // 2d6 -> 2 & 5, 1d8 -> 2
      const result = rollDamage({
        components: [
          { notation: '2d6+3', type: 'slashing' },
          { notation: '1d8', type: 'fire' },
        ],
        rng,
      });
      expect(result.total).toBe(12);
      expect(result.critical).toBe(false);
      expect(result.components).toEqual([
        { type: 'slashing', rolls: [2, 5], modifier: 3, total: 10 },
        { type: 'fire', rolls: [2], modifier: 0, total: 2 },
      ]);
    });

    it('doubles damage dice on critical hits', () => {
      const rng = sequenceRng([0.1, 0.6]); // -> rolls: 1 and 5
      const result = rollDamage({
        components: [{ notation: '1d8+2', type: 'piercing' }],
        critical: true,
        rng,
      });
      expect(result.total).toBe(8); // (1 + 5) + 2
      expect(result.components[0]).toEqual({
        type: 'piercing',
        rolls: [1, 5],
        modifier: 2,
        total: 8,
      });
      expect(result.critical).toBe(true);
    });
  });

  describe('Seeded RNG for Fairness', () => {
    it('produces deterministic sequences for a given seed', () => {
      const seed = 42;
      const rngA = createSeededRng(seed);
      const rngB = createSeededRng(seed);
      const sequenceA = Array.from({ length: 5 }, () => rngA());
      const sequenceB = Array.from({ length: 5 }, () => rngB());
      expect(sequenceA).toEqual(sequenceB);
      sequenceA.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      });
    });

    it('produces different sequences for different seeds', () => {
      const rngA = createSeededRng(1);
      const rngB = createSeededRng(2);
      const sequenceA = Array.from({ length: 3 }, () => rngA());
      const sequenceB = Array.from({ length: 3 }, () => rngB());
      expect(sequenceA).not.toEqual(sequenceB);
    });
  });
});
