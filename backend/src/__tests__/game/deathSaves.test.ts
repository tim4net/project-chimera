/**
 * @file Tests for D&D 5e death and dying mechanics
 */

import { describe, it, expect } from '@jest/globals';
import {
  rollDeathSave,
  processDeathSave,
  attemptStabilization,
  stabilizeCharacter,
  checkMassiveDamage,
  applyDamage,
  applyHealing,
  isDying,
  isDead,
  isStable,
  type DeathSaveState,
  type CharacterVitals,
} from '../../game/deathSaves';
import { createSeededRng } from '../../game/dice';

describe('Death Saves - Rolling', () => {
  it('should roll a death save', () => {
    const rng = createSeededRng(12345);
    const result = rollDeathSave(rng);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('critSuccess');
    expect(result).toHaveProperty('critFail');
    expect(result).toHaveProperty('roll');
    expect(result).toHaveProperty('message');
    expect(typeof result.success).toBe('boolean');
  });

  it('should recognize critical success (natural 20)', () => {
    // Seed that produces a 20
    const rng = createSeededRng(7777);

    // Keep rolling until we get a 20
    let result;
    let attempts = 0;
    do {
      result = rollDeathSave(rng);
      attempts++;
    } while (result.roll !== 20 && attempts < 100);

    if (result.roll === 20) {
      expect(result.critSuccess).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Natural 20');
    }
  });

  it('should recognize critical failure (natural 1)', () => {
    const rng = createSeededRng(1111);

    // Keep rolling until we get a 1
    let result;
    let attempts = 0;
    do {
      result = rollDeathSave(rng);
      attempts++;
    } while (result.roll !== 1 && attempts < 100);

    if (result.roll === 1) {
      expect(result.critFail).toBe(true);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Natural 1');
    }
  });

  it('should recognize normal success (10+)', () => {
    const rng = createSeededRng(54321);
    let foundNormalSuccess = false;

    for (let i = 0; i < 50; i++) {
      const result = rollDeathSave(rng);
      if (result.success && !result.critSuccess && result.roll >= 10) {
        foundNormalSuccess = true;
        expect(result.message).toContain('Death save success');
        break;
      }
    }

    expect(foundNormalSuccess).toBe(true);
  });

  it('should recognize normal failure (<10)', () => {
    const rng = createSeededRng(99999);
    let foundNormalFailure = false;

    for (let i = 0; i < 50; i++) {
      const result = rollDeathSave(rng);
      if (!result.success && !result.critFail && result.roll < 10) {
        foundNormalFailure = true;
        expect(result.message).toContain('Death save failure');
        break;
      }
    }

    expect(foundNormalFailure).toBe(true);
  });
});

describe('Death Saves - Processing', () => {
  it('should accumulate successes', () => {
    const state: DeathSaveState = { successes: 0, failures: 0, stable: false };
    const result = {
      success: true,
      critSuccess: false,
      critFail: false,
      roll: 15,
      message: 'Success',
    };

    const { newState } = processDeathSave(state, result);
    expect(newState.successes).toBe(1);
    expect(newState.failures).toBe(0);
  });

  it('should accumulate failures', () => {
    const state: DeathSaveState = { successes: 0, failures: 0, stable: false };
    const result = {
      success: false,
      critSuccess: false,
      critFail: false,
      roll: 5,
      message: 'Failure',
    };

    const { newState } = processDeathSave(state, result);
    expect(newState.successes).toBe(0);
    expect(newState.failures).toBe(1);
  });

  it('should stabilize after 3 successes', () => {
    const state: DeathSaveState = { successes: 2, failures: 0, stable: false };
    const result = {
      success: true,
      critSuccess: false,
      critFail: false,
      roll: 12,
      message: 'Success',
    };

    const { newState, isStable } = processDeathSave(state, result);
    expect(newState.successes).toBe(3);
    expect(newState.stable).toBe(true);
    expect(isStable).toBe(true);
  });

  it('should die after 3 failures', () => {
    const state: DeathSaveState = { successes: 0, failures: 2, stable: false };
    const result = {
      success: false,
      critSuccess: false,
      critFail: false,
      roll: 3,
      message: 'Failure',
    };

    const { newState, isDead } = processDeathSave(state, result);
    expect(newState.failures).toBe(3);
    expect(isDead).toBe(true);
  });

  it('should count critical failure as 2 failures', () => {
    const state: DeathSaveState = { successes: 0, failures: 1, stable: false };
    const result = {
      success: false,
      critSuccess: false,
      critFail: true,
      roll: 1,
      message: 'Critical Failure',
    };

    const { newState, isDead } = processDeathSave(state, result);
    expect(newState.failures).toBe(3);
    expect(isDead).toBe(true);
  });

  it('should regain consciousness on critical success', () => {
    const state: DeathSaveState = { successes: 1, failures: 2, stable: false };
    const result = {
      success: true,
      critSuccess: true,
      critFail: false,
      roll: 20,
      message: 'Critical Success',
    };

    const { newState, regainedConsciousness } = processDeathSave(state, result);
    expect(newState.successes).toBe(0);
    expect(newState.failures).toBe(0);
    expect(newState.stable).toBe(true);
    expect(regainedConsciousness).toBe(true);
  });
});

describe('Stabilization', () => {
  it('should succeed on Medicine check DC 10+', () => {
    const rng = createSeededRng(88888);
    const result = attemptStabilization(16, 3, true, rng); // High WIS + proficiency

    // With high WIS and proficiency, should have good chance of success
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('roll');
    expect(result.dc).toBe(10);
  });

  it('should fail on Medicine check below DC 10', () => {
    const rng = createSeededRng(11111);
    let foundFailure = false;

    // Try multiple times to find a failure
    for (let i = 0; i < 50; i++) {
      const result = attemptStabilization(8, 0, false, rng); // Low WIS, no proficiency
      if (!result.success) {
        foundFailure = true;
        expect(result.roll).toBeLessThan(10);
        expect(result.message).toContain('failed');
        break;
      }
    }

    expect(foundFailure).toBe(true);
  });

  it('should stabilize a character directly', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 1, failures: 2, stable: false },
      conditions: new Set(['dying']),
    };

    stabilizeCharacter(character);

    expect(character.deathSaves?.stable).toBe(true);
    expect(character.deathSaves?.successes).toBe(0);
    expect(character.deathSaves?.failures).toBe(0);
    expect(character.conditions?.has('dying')).toBe(false);
  });
});

describe('Massive Damage', () => {
  it('should cause instant death if damage >= max HP', () => {
    const isDead = checkMassiveDamage(40, 10, 20);
    expect(isDead).toBe(true);
  });

  it('should not cause instant death if damage < max HP', () => {
    const isDead = checkMassiveDamage(25, 10, 20);
    expect(isDead).toBe(false);
  });

  it('should handle exact max HP damage as instant death', () => {
    const isDead = checkMassiveDamage(30, 10, 20);
    expect(isDead).toBe(true);
  });
});

describe('Taking Damage', () => {
  it('should reduce HP normally', () => {
    const character: CharacterVitals = {
      hp_current: 20,
      hp_max: 20,
      conditions: new Set(),
    };

    const result = applyDamage(character, 5);

    expect(result.damageDealt).toBe(5);
    expect(result.newHP).toBe(15);
    expect(result.isUnconscious).toBe(false);
    expect(result.isDead).toBe(false);
  });

  it('should absorb damage with temporary HP first', () => {
    const character: CharacterVitals = {
      hp_current: 20,
      hp_max: 20,
      temporary_hp: 10,
      conditions: new Set(),
    };

    const result = applyDamage(character, 15);

    expect(result.tempHPAbsorbed).toBe(10);
    expect(result.damageDealt).toBe(5);
    expect(result.newHP).toBe(15);
    expect(character.temporary_hp).toBe(0);
  });

  it('should apply unconscious condition at 0 HP', () => {
    const character: CharacterVitals = {
      hp_current: 5,
      hp_max: 20,
      conditions: new Set(),
    };

    const result = applyDamage(character, 5);

    expect(result.newHP).toBe(0);
    expect(result.isUnconscious).toBe(true);
    expect(result.isDead).toBe(false);
    expect(character.conditions?.has('unconscious')).toBe(true);
    expect(character.conditions?.has('dying')).toBe(true);
    expect(character.deathSaves).toBeDefined();
  });

  it('should cause instant death from massive damage', () => {
    const character: CharacterVitals = {
      hp_current: 10,
      hp_max: 20,
      conditions: new Set(),
    };

    const result = applyDamage(character, 40);

    expect(result.instantDeath).toBe(true);
    expect(result.isDead).toBe(true);
    expect(character.conditions?.has('dead')).toBe(true);
  });

  it('should add 1 death save failure when damaged while unconscious', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 0, failures: 0, stable: false },
      conditions: new Set(['unconscious', 'dying']),
    };

    const result = applyDamage(character, 5, false);

    expect(result.deathSaveFailures).toBe(1);
    expect(character.deathSaves?.failures).toBe(1);
  });

  it('should add 2 death save failures on critical hit while unconscious', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 0, failures: 0, stable: false },
      conditions: new Set(['unconscious', 'dying']),
    };

    const result = applyDamage(character, 10, true); // Critical hit

    expect(result.deathSaveFailures).toBe(2);
    expect(character.deathSaves?.failures).toBe(2);
  });

  it('should cause death if damage while unconscious reaches 3 failures', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 0, failures: 2, stable: false },
      conditions: new Set(['unconscious', 'dying']),
    };

    const result = applyDamage(character, 5, false);

    expect(result.isDead).toBe(true);
    expect(character.deathSaves?.failures).toBe(3);
    expect(character.conditions?.has('dead')).toBe(true);
  });
});

describe('Healing', () => {
  it('should restore HP', () => {
    const character: CharacterVitals = {
      hp_current: 10,
      hp_max: 20,
      conditions: new Set(),
    };

    const result = applyHealing(character, 5);

    expect(result.hpRestored).toBe(5);
    expect(result.newHP).toBe(15);
    expect(result.regainedConsciousness).toBe(false);
  });

  it('should not exceed max HP', () => {
    const character: CharacterVitals = {
      hp_current: 18,
      hp_max: 20,
      conditions: new Set(),
    };

    const result = applyHealing(character, 10);

    expect(result.newHP).toBe(20);
    expect(character.hp_current).toBe(20);
  });

  it('should restore consciousness when healed above 0 HP', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 1, failures: 2, stable: false },
      conditions: new Set(['unconscious', 'dying']),
    };

    const result = applyHealing(character, 5);

    expect(result.regainedConsciousness).toBe(true);
    expect(result.newHP).toBe(5);
    expect(character.conditions?.has('unconscious')).toBe(false);
    expect(character.conditions?.has('dying')).toBe(false);
    expect(character.deathSaves?.successes).toBe(0);
    expect(character.deathSaves?.failures).toBe(0);
    expect(character.deathSaves?.stable).toBe(true);
  });
});

describe('Status Checks', () => {
  it('should correctly identify dying character', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 1, failures: 1, stable: false },
      conditions: new Set(['dying']),
    };

    expect(isDying(character)).toBe(true);
  });

  it('should correctly identify dead character', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 0, failures: 3, stable: false },
      conditions: new Set(['dead']),
    };

    expect(isDead(character)).toBe(true);
  });

  it('should correctly identify stable character', () => {
    const character: CharacterVitals = {
      hp_current: 0,
      hp_max: 20,
      deathSaves: { successes: 3, failures: 0, stable: true },
      conditions: new Set(),
    };

    expect(isStable(character)).toBe(true);
  });

  it('should not identify healthy character as dying', () => {
    const character: CharacterVitals = {
      hp_current: 15,
      hp_max: 20,
      conditions: new Set(),
    };

    expect(isDying(character)).toBe(false);
  });
});
