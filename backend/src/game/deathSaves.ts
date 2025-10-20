/**
 * @file D&D 5e Death and Dying System
 *
 * This module implements the death saving throw mechanics from D&D 5e:
 * - Death saving throws (3 successes = stabilized, 3 failures = dead)
 * - Stabilization through Medicine checks
 * - Massive damage rules (instant death)
 * - Unconscious condition at 0 HP
 */

import { rollD20, rollAbilityCheck } from './dice';

// --- TYPE DEFINITIONS ---

/**
 * Tracks the state of a character's death saving throws.
 */
export interface DeathSaveState {
  successes: number; // 0-3
  failures: number; // 0-3
  stable: boolean;
}

/**
 * Result of a single death saving throw.
 */
export interface DeathSaveResult {
  success: boolean;
  critSuccess: boolean;
  critFail: boolean;
  roll: number;
  message: string;
}

/**
 * Result of a stabilization attempt.
 */
export interface StabilizationResult {
  success: boolean;
  roll: number;
  dc: number;
  message: string;
}

/**
 * Character state relevant to death and dying.
 */
export interface CharacterVitals {
  hp_current: number;
  hp_max: number;
  temporary_hp?: number;
  deathSaves?: DeathSaveState;
  conditions?: Set<string>;
}

// --- CONSTANTS ---

const DEATH_SAVE_DC = 10;
const STABILIZATION_DC = 10;
const CRITICAL_HIT_ROLL = 20;
const CRITICAL_FAIL_ROLL = 1;

// --- DEATH SAVING THROWS ---

/**
 * Rolls a death saving throw.
 * - Natural 20: Character regains 1 HP and becomes conscious
 * - Natural 1: Counts as two failures
 * - 10+: Success
 * - <10: Failure
 *
 * @param rng - Optional RNG function for deterministic testing
 * @returns The result of the death save
 */
export const rollDeathSave = (rng?: () => number): DeathSaveResult => {
  const roll = rollD20({ rng });
  const rawRoll = roll.raw;

  // Critical success: regain 1 HP
  if (rawRoll === CRITICAL_HIT_ROLL) {
    return {
      success: true,
      critSuccess: true,
      critFail: false,
      roll: rawRoll,
      message: 'Natural 20! You regain 1 HP and become conscious!',
    };
  }

  // Critical failure: counts as two failures
  if (rawRoll === CRITICAL_FAIL_ROLL) {
    return {
      success: false,
      critSuccess: false,
      critFail: true,
      roll: rawRoll,
      message: 'Natural 1! Death save fails twice!',
    };
  }

  // Normal success
  if (rawRoll >= DEATH_SAVE_DC) {
    return {
      success: true,
      critSuccess: false,
      critFail: false,
      roll: rawRoll,
      message: `Death save success (rolled ${rawRoll})`,
    };
  }

  // Normal failure
  return {
    success: false,
    critSuccess: false,
    critFail: false,
    roll: rawRoll,
    message: `Death save failure (rolled ${rawRoll})`,
  };
};

/**
 * Processes a death save result and updates the character's death save state.
 * @param state - The current death save state
 * @param result - The result of the death save
 * @returns Updated death save state and status
 */
export const processDeathSave = (
  state: DeathSaveState,
  result: DeathSaveResult
): {
  newState: DeathSaveState;
  isDead: boolean;
  isStable: boolean;
  regainedConsciousness: boolean;
} => {
  const newState = { ...state };
  let isDead = false;
  let isStable = false;
  let regainedConsciousness = false;

  // Critical success: regain 1 HP
  if (result.critSuccess) {
    newState.successes = 0;
    newState.failures = 0;
    newState.stable = true;
    regainedConsciousness = true;
    return { newState, isDead, isStable: true, regainedConsciousness };
  }

  // Critical failure: two failures
  if (result.critFail) {
    newState.failures = Math.min(3, newState.failures + 2);
  } else if (result.success) {
    newState.successes = Math.min(3, newState.successes + 1);
  } else {
    newState.failures = Math.min(3, newState.failures + 1);
  }

  // Check for death
  if (newState.failures >= 3) {
    isDead = true;
    return { newState, isDead, isStable: false, regainedConsciousness };
  }

  // Check for stabilization
  if (newState.successes >= 3) {
    newState.stable = true;
    isStable = true;
  }

  return { newState, isDead, isStable, regainedConsciousness };
};

// --- STABILIZATION ---

/**
 * Attempts to stabilize a dying character using a Medicine check.
 * DC 10 Wisdom (Medicine) check required.
 *
 * @param healerWisdom - The healer's Wisdom score
 * @param proficiencyBonus - The healer's proficiency bonus (if proficient in Medicine)
 * @param proficient - Whether the healer is proficient in Medicine
 * @param rng - Optional RNG function
 * @returns The result of the stabilization attempt
 */
export const attemptStabilization = (
  healerWisdom: number,
  proficiencyBonus: number = 0,
  proficient: boolean = false,
  rng?: () => number
): StabilizationResult => {
  const check = rollAbilityCheck({
    ability: 'Medicine',
    abilityScore: healerWisdom,
    proficiencyBonus,
    proficient,
    rng,
  });

  const success = check.total >= STABILIZATION_DC;

  return {
    success,
    roll: check.total,
    dc: STABILIZATION_DC,
    message: success
      ? `Stabilization successful! (${check.total} vs DC ${STABILIZATION_DC})`
      : `Stabilization failed. (${check.total} vs DC ${STABILIZATION_DC})`,
  };
};

/**
 * Stabilizes a character directly (e.g., through magic or successful Medicine check).
 * @param character - The character to stabilize
 */
export const stabilizeCharacter = (character: CharacterVitals): void => {
  if (character.deathSaves) {
    character.deathSaves.stable = true;
    character.deathSaves.successes = 0;
    character.deathSaves.failures = 0;
  }

  if (character.conditions) {
    character.conditions.delete('dying');
  }
};

// --- MASSIVE DAMAGE ---

/**
 * Checks if massive damage causes instant death.
 * If damage reduces you to 0 HP and the remaining damage equals or exceeds your HP max,
 * you die instantly.
 *
 * @param damage - The amount of damage dealt
 * @param currentHP - The character's current HP before damage
 * @param maxHP - The character's maximum HP
 * @returns Whether the character dies instantly
 */
export const checkMassiveDamage = (
  damage: number,
  currentHP: number,
  maxHP: number
): boolean => {
  // Calculate remaining HP after damage
  const remainingHP = currentHP - damage;

  // If reduced to 0 or below, check if overkill damage >= max HP
  if (remainingHP <= 0) {
    const overkillDamage = Math.abs(remainingHP);
    return overkillDamage >= maxHP;
  }

  return false;
};

// --- TAKING DAMAGE ---

/**
 * Applies damage to a character and handles unconsciousness/death.
 * This function encapsulates the full damage-taking process including:
 * - Temporary HP absorption
 * - HP reduction
 * - Unconsciousness at 0 HP
 * - Massive damage instant death
 * - Death save failures from damage while unconscious
 *
 * @param character - The character taking damage
 * @param damage - The amount of damage
 * @param isCritical - Whether the damage is from a critical hit (causes 2 death save failures)
 * @returns Status information about what happened
 */
export const applyDamage = (
  character: CharacterVitals,
  damage: number,
  isCritical: boolean = false
): {
  damageDealt: number;
  tempHPAbsorbed: number;
  newHP: number;
  isUnconscious: boolean;
  isDead: boolean;
  instantDeath: boolean;
  deathSaveFailures?: number;
  message: string;
} => {
  let remainingDamage = damage;
  let tempHPAbsorbed = 0;

  // Apply temporary HP first
  if (character.temporary_hp && character.temporary_hp > 0) {
    tempHPAbsorbed = Math.min(character.temporary_hp, remainingDamage);
    character.temporary_hp -= tempHPAbsorbed;
    remainingDamage -= tempHPAbsorbed;
  }

  const previousHP = character.hp_current;

  // Check for massive damage before applying
  const instantDeath = checkMassiveDamage(
    remainingDamage,
    character.hp_current,
    character.hp_max
  );

  if (instantDeath) {
    character.hp_current = 0;
    if (!character.conditions) {
      character.conditions = new Set();
    }
    character.conditions.add('dead');

    return {
      damageDealt: remainingDamage,
      tempHPAbsorbed,
      newHP: 0,
      isUnconscious: true,
      isDead: true,
      instantDeath: true,
      message: `Massive damage! Instant death (damage ${damage} >= max HP ${character.hp_max})`,
    };
  }

  // Apply damage to HP
  character.hp_current = Math.max(0, character.hp_current - remainingDamage);

  // Handle unconsciousness at 0 HP
  if (character.hp_current === 0 && previousHP > 0) {
    if (!character.conditions) {
      character.conditions = new Set();
    }
    character.conditions.add('unconscious');
    character.conditions.add('dying');

    // Initialize death saves
    if (!character.deathSaves) {
      character.deathSaves = {
        successes: 0,
        failures: 0,
        stable: false,
      };
    }

    return {
      damageDealt: remainingDamage,
      tempHPAbsorbed,
      newHP: character.hp_current,
      isUnconscious: true,
      isDead: false,
      instantDeath: false,
      message: 'Reduced to 0 HP and unconscious. Begin making death saving throws.',
    };
  }

  // Handle damage while already unconscious
  if (character.hp_current === 0 && previousHP === 0) {
    if (!character.deathSaves) {
      character.deathSaves = {
        successes: 0,
        failures: 0,
        stable: false,
      };
    }

    // Taking damage while unconscious causes 1 death save failure
    // Critical hit causes 2 failures
    const failuresAdded = isCritical ? 2 : 1;
    character.deathSaves.failures = Math.min(
      3,
      character.deathSaves.failures + failuresAdded
    );

    const isDead = character.deathSaves.failures >= 3;

    if (isDead) {
      if (!character.conditions) {
        character.conditions = new Set();
      }
      character.conditions.add('dead');
    }

    return {
      damageDealt: remainingDamage,
      tempHPAbsorbed,
      newHP: 0,
      isUnconscious: true,
      isDead,
      instantDeath: false,
      deathSaveFailures: failuresAdded,
      message: isCritical
        ? `Critical hit while unconscious! 2 death save failures (total: ${character.deathSaves.failures}/3)`
        : `Damaged while unconscious! 1 death save failure (total: ${character.deathSaves.failures}/3)`,
    };
  }

  return {
    damageDealt: remainingDamage,
    tempHPAbsorbed,
    newHP: character.hp_current,
    isUnconscious: false,
    isDead: false,
    instantDeath: false,
    message: `Took ${remainingDamage} damage${tempHPAbsorbed > 0 ? ` (${tempHPAbsorbed} absorbed by temp HP)` : ''}.`,
  };
};

// --- HEALING ---

/**
 * Restores HP to a character and removes unconscious condition if brought above 0 HP.
 * @param character - The character to heal
 * @param healingAmount - The amount of HP to restore
 * @returns Information about the healing
 */
export const applyHealing = (
  character: CharacterVitals,
  healingAmount: number
): {
  hpRestored: number;
  newHP: number;
  regainedConsciousness: boolean;
  message: string;
} => {
  const previousHP = character.hp_current;
  const wasUnconscious = character.conditions?.has('unconscious') || false;

  // Apply healing
  character.hp_current = Math.min(
    character.hp_max,
    character.hp_current + healingAmount
  );

  const hpRestored = character.hp_current - previousHP;
  const regainedConsciousness = wasUnconscious && character.hp_current > 0;

  // Remove unconscious and dying conditions if healed above 0 HP
  if (regainedConsciousness && character.conditions) {
    character.conditions.delete('unconscious');
    character.conditions.delete('dying');

    // Reset death saves
    if (character.deathSaves) {
      character.deathSaves.successes = 0;
      character.deathSaves.failures = 0;
      character.deathSaves.stable = true;
    }
  }

  return {
    hpRestored,
    newHP: character.hp_current,
    regainedConsciousness,
    message: regainedConsciousness
      ? `Healed for ${hpRestored} HP and regained consciousness!`
      : `Healed for ${hpRestored} HP.`,
  };
};

// --- UTILITY FUNCTIONS ---

/**
 * Checks if a character is currently dying (at 0 HP and not stable).
 */
export const isDying = (character: CharacterVitals): boolean => {
  return (
    character.hp_current === 0 &&
    character.conditions?.has('dying') === true &&
    character.deathSaves?.stable !== true
  );
};

/**
 * Checks if a character is dead.
 */
export const isDead = (character: CharacterVitals): boolean => {
  return (
    character.conditions?.has('dead') === true ||
    (character.deathSaves?.failures ?? 0) >= 3
  );
};

/**
 * Checks if a character is stable (at 0 HP but stabilized).
 */
export const isStable = (character: CharacterVitals): boolean => {
  return (
    character.hp_current === 0 &&
    character.deathSaves?.stable === true &&
    !isDead(character)
  );
};
