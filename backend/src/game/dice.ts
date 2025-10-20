/**
 * @file A comprehensive D&D 5e dice rolling system.
 *
 * This module provides functions for various dice rolls required in D&D 5e,
 * including basic rolls, ability checks, saving throws, attack rolls, and damage rolls,
 * with support for advantage, disadvantage, proficiency, and critical hits.
 */

// --- TYPE DEFINITIONS ---

/** Represents the result of a basic dice roll (e.g., '2d6+3'). */
export type DiceRollResult = {
  total: number;
  rolls: number[];
  modifier: number;
  notation: string;
};

/** Represents the result of a d20 roll, including modifiers and context. */
export type D20RollResult = {
  total: number;
  raw: number; // The raw d20 roll after advantage/disadvantage is applied
  rolls: number[]; // The actual dice rolls (1 or 2 dice)
  kept: number; // The die roll that was kept
  mode: 'normal' | 'advantage' | 'disadvantage';
  modifiers: {
    abilityModifier: number;
    proficiencyBonus: number;
  };
  isCritical: boolean;
  isFumble: boolean;
};

/** Extends D20RollResult for ability-based checks. */
export type AbilityRollResult = D20RollResult & {
  ability: string;
  proficient: boolean;
};

/** Represents a single component of a damage roll (e.g., 'slashing', 'fire'). */
export type DamageComponentResult = {
  type: string;
  rolls: number[];
  modifier: number;
  total: number;
};

/** Represents the result of a complete damage roll with multiple components. */
export type DamageRollResult = {
  total: number;
  components: DamageComponentResult[];
  critical: boolean;
};

// --- HELPERS ---

const DICE_NOTATION_REGEX = /^(\d+)d(\d+)([+-]\d+)?$/;

/**
 * Parses a dice notation string (e.g., '2d6+3', '1d20-1').
 * @internal
 */
const _parseNotation = (notation: string) => {
  const match = notation.match(DICE_NOTATION_REGEX);
  if (!match) {
    throw new Error(`Invalid dice string: ${notation}`);
  }
  const [, numDice, sides, modifierStr] = match;
  return {
    numDice: parseInt(numDice, 10),
    sides: parseInt(sides, 10),
    modifier: modifierStr ? parseInt(modifierStr, 10) : 0,
  };
};

/**
 * Rolls a single die.
 * @internal
 */
const _rollSingleDie = (sides: number, rng: () => number): number => {
  return Math.floor(rng() * sides) + 1;
};

// --- PUBLIC API ---

/**
 * Creates a seeded pseudo-random number generator for deterministic results.
 * Uses the Mulberry32 algorithm.
 * @param seed - The seed for the RNG.
 * @returns A function that returns a random number between 0 (inclusive) and 1 (exclusive).
 */
export const createSeededRng = (seed: number): (() => number) => {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Calculates the D&D 5e ability modifier for a given ability score.
 * @param score - The ability score (e.g., 18).
 * @returns The calculated modifier (e.g., 4).
 */
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Rolls dice based on a standard notation string (e.g., '2d6+3').
 * @param notation - The dice notation string.
 * @param options - Optional parameters, including a custom RNG.
 * @returns A detailed result of the dice roll.
 */
export const rollDice = (
  notation: string,
  options?: { rng?: () => number },
): DiceRollResult => {
  const rng = options?.rng ?? Math.random;
  const { numDice, sides, modifier } = _parseNotation(notation);

  const rolls = Array.from({ length: numDice }, () => _rollSingleDie(sides, rng));
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

  return { total, rolls, modifier, notation };
};

/**
 * Performs a d20 roll, handling advantage and disadvantage.
 * @param options - Configuration for the d20 roll.
 * @returns A detailed result of the d20 roll.
 */
export const rollD20 = (options?: {
  advantage?: 'advantage' | 'disadvantage';
  abilityModifier?: number;
  proficiencyBonus?: number;
  rng?: () => number;
}): D20RollResult => {
  const rng = options?.rng ?? Math.random;
  const mode = options?.advantage ?? 'normal';
  const abilityModifier = options?.abilityModifier ?? 0;
  const proficiencyBonus = options?.proficiencyBonus ?? 0;

  const roll1 = _rollSingleDie(20, rng);
  let kept = roll1;
  let rolls = [roll1];

  if (mode !== 'normal') {
    const roll2 = _rollSingleDie(20, rng);
    rolls.push(roll2);
    if (mode === 'advantage') {
      kept = Math.max(roll1, roll2);
    } else {
      kept = Math.min(roll1, roll2);
    }
  }

  return {
    total: kept + abilityModifier + proficiencyBonus,
    raw: kept,
    rolls,
    kept,
    mode,
    modifiers: { abilityModifier, proficiencyBonus },
    isCritical: kept === 20,
    isFumble: kept === 1,
  };
};

/**
 * Internal helper for rolling ability checks, saving throws, and attack rolls.
 * @internal
 */
const _rollD20WithContext = (options: {
  contextName: string;
  abilityScore: number;
  proficiencyBonus?: number;
  proficient?: boolean;
  advantage?: 'advantage' | 'disadvantage';
  rng?: () => number;
}): AbilityRollResult => {
  const abilityModifier = calculateAbilityModifier(options.abilityScore);
  const profBonus = options.proficient ? options.proficiencyBonus ?? 0 : 0;

  const d20Result = rollD20({
    advantage: options.advantage,
    abilityModifier,
    proficiencyBonus: profBonus,
    rng: options.rng,
  });

  return {
    ...d20Result,
    ability: options.contextName,
    proficient: options.proficient ?? false,
  };
};

/**
 * Performs an ability check.
 * @param options - Configuration for the ability check.
 * @returns The result of the ability check.
 */
export const rollAbilityCheck = (options: {
  ability: string;
  abilityScore: number;
  proficiencyBonus?: number;
  proficient?: boolean;
  advantage?: 'advantage' | 'disadvantage';
  rng?: () => number;
}): AbilityRollResult => {
  return _rollD20WithContext({ ...options, contextName: options.ability });
};

/**
 * Performs a saving throw.
 * @param options - Configuration for the saving throw.
 * @returns The result of the saving throw.
 */
export const rollSavingThrow = (options: {
  save: string;
  abilityScore: number;
  proficiencyBonus?: number;
  proficient?: boolean;
  advantage?: 'advantage' | 'disadvantage';
  rng?: () => number;
}): AbilityRollResult => {
  return _rollD20WithContext({ ...options, contextName: options.save });
};

/**
 * Performs an attack roll.
 * @param options - Configuration for the attack roll.
 * @returns The result of the attack roll.
 */
export const rollAttackRoll = (options: {
  ability: string;
  abilityScore: number;
  proficiencyBonus?: number;
  proficient?: boolean;
  advantage?: 'advantage' | 'disadvantage';
  rng?: () => number;
}): AbilityRollResult => {
  return _rollD20WithContext({ ...options, contextName: options.ability });
};

/**
 * Rolls damage, handling multiple components and critical hits.
 * @param options - Configuration for the damage roll.
 * @returns The aggregated result of the damage roll.
 */
export const rollDamage = (options: {
  components: { notation: string; type: string }[];
  critical?: boolean;
  rng?: () => number;
}): DamageRollResult => {
  const rng = options?.rng ?? Math.random;
  let totalDamage = 0;
  const componentResults: DamageComponentResult[] = [];

  for (const component of options.components) {
    const { numDice, sides, modifier } = _parseNotation(component.notation);
    const diceToRoll = options.critical ? numDice * 2 : numDice;

    const rolls = Array.from({ length: diceToRoll }, () =>
      _rollSingleDie(sides, rng),
    );
    const componentTotal = rolls.reduce((sum, r) => sum + r, 0) + modifier;

    componentResults.push({
      type: component.type,
      rolls,
      modifier,
      total: componentTotal,
    });
    totalDamage += componentTotal;
  }

  return {
    total: totalDamage,
    components: componentResults,
    critical: options.critical ?? false,
  };
};

// Backward compatibility: export default for existing code
export default rollDice;
