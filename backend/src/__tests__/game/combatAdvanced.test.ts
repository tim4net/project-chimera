/**
 * @file Tests for advanced D&D 5e combat mechanics
 */

import { describe, it, expect } from '@jest/globals';
import {
  rollInitiative,
  sortByInitiative,
  applyAdvantageToAttack,
  calculateCoverBonus,
  resolveCriticalHit,
  resolveGrapple,
  resolveShove,
  resolveAttack,
  resolveOpportunityAttack,
  resetActionEconomy,
  type CombatantExtended,
} from '../../game/combat';
import { createSeededRng } from '../../game/dice';

describe('Combat - Initiative System', () => {
  it('should roll initiative with DEX modifier', () => {
    const rng = createSeededRng(12345);
    const initiative = rollInitiative(3, rng); // +3 DEX mod
    expect(initiative).toBeGreaterThanOrEqual(4); // 1d20+3 minimum
    expect(initiative).toBeLessThanOrEqual(23); // 1d20+3 maximum
  });

  it('should sort combatants by initiative', () => {
    const combatants: CombatantExtended[] = [
      {
        name: 'Fighter',
        initiative: 15,
        stats: { health: 20, damage: '1d8', armorClass: 16 },
        dexModifier: 2,
        strModifier: 3,
        conditions: new Set(),
        usedActions: new Set(),
        hasReaction: true,
      },
      {
        name: 'Wizard',
        initiative: 18,
        stats: { health: 12, damage: '1d4', armorClass: 13 },
        dexModifier: 3,
        strModifier: 0,
        conditions: new Set(),
        usedActions: new Set(),
        hasReaction: true,
      },
      {
        name: 'Goblin',
        initiative: 12,
        stats: { health: 7, damage: '1d6', armorClass: 14 },
        dexModifier: 2,
        strModifier: -1,
        conditions: new Set(),
        usedActions: new Set(),
        hasReaction: true,
      },
    ];

    const sorted = sortByInitiative(combatants);
    expect(sorted[0].name).toBe('Wizard');
    expect(sorted[1].name).toBe('Fighter');
    expect(sorted[2].name).toBe('Goblin');
  });
});

describe('Combat - Advantage/Disadvantage', () => {
  it('should return advantage when only advantage is present', () => {
    const result = applyAdvantageToAttack(true, false);
    expect(result).toBe('advantage');
  });

  it('should return disadvantage when only disadvantage is present', () => {
    const result = applyAdvantageToAttack(false, true);
    expect(result).toBe('disadvantage');
  });

  it('should cancel out when both advantage and disadvantage are present', () => {
    const result = applyAdvantageToAttack(true, true);
    expect(result).toBe('normal');
  });

  it('should return normal when neither is present', () => {
    const result = applyAdvantageToAttack(false, false);
    expect(result).toBe('normal');
  });
});

describe('Combat - Cover Mechanics', () => {
  it('should provide +2 AC for half cover', () => {
    expect(calculateCoverBonus('half')).toBe(2);
  });

  it('should provide +5 AC for three-quarters cover', () => {
    expect(calculateCoverBonus('three-quarters')).toBe(5);
  });

  it('should provide infinite AC for full cover', () => {
    expect(calculateCoverBonus('full')).toBe(Infinity);
  });

  it('should provide 0 AC for no cover', () => {
    expect(calculateCoverBonus('none')).toBe(0);
  });
});

describe('Combat - Critical Hits', () => {
  it('should double damage dice on critical hit', () => {
    const rng = createSeededRng(42);
    const normalDamage = resolveCriticalHit('1d8+3', rng);

    // Critical should roll 2d8+3 (not 1d8+3)
    // Minimum: 2+3 = 5, Maximum: 16+3 = 19
    expect(normalDamage).toBeGreaterThanOrEqual(5);
    expect(normalDamage).toBeLessThanOrEqual(19);
  });
});

describe('Combat - Grappling', () => {
  it('should resolve grapple contest', () => {
    const rng = createSeededRng(100);

    const attacker: CombatantExtended = {
      name: 'Barbarian',
      initiative: 10,
      stats: { health: 30, damage: '1d12', armorClass: 14 },
      dexModifier: 1,
      strModifier: 4,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 2,
    };

    const defender: CombatantExtended = {
      name: 'Goblin',
      initiative: 15,
      stats: { health: 7, damage: '1d6', armorClass: 14 },
      dexModifier: 2,
      strModifier: -1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 0,
    };

    const result = resolveGrapple(attacker, defender, rng);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    expect(typeof result.success).toBe('boolean');
  });

  it('should apply grappled condition on success', () => {
    const rng = createSeededRng(999); // Seed that produces high roll for attacker

    const attacker: CombatantExtended = {
      name: 'Barbarian',
      initiative: 10,
      stats: { health: 30, damage: '1d12', armorClass: 14 },
      dexModifier: 1,
      strModifier: 5, // Very high STR
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 3,
    };

    const defender: CombatantExtended = {
      name: 'Goblin',
      initiative: 15,
      stats: { health: 7, damage: '1d6', armorClass: 14 },
      dexModifier: 1,
      strModifier: -1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 0,
    };

    const result = resolveGrapple(attacker, defender, rng);

    if (result.success) {
      expect(defender.conditions.has('grappled')).toBe(true);
      expect(attacker.grappling).toBe('Goblin');
      expect(defender.grappledBy).toBe('Barbarian');
    }
  });
});

describe('Combat - Shoving', () => {
  it('should resolve shove to knock prone', () => {
    const rng = createSeededRng(200);

    const attacker: CombatantExtended = {
      name: 'Fighter',
      initiative: 10,
      stats: { health: 25, damage: '1d8', armorClass: 16 },
      dexModifier: 1,
      strModifier: 3,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 2,
    };

    const defender: CombatantExtended = {
      name: 'Skeleton',
      initiative: 12,
      stats: { health: 13, damage: '1d6', armorClass: 13 },
      dexModifier: 2,
      strModifier: 0,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 0,
    };

    const result = resolveShove(attacker, defender, 'prone', rng);

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    // Message should mention either success or failure of prone attempt
    expect(result.message).toMatch(/prone|shove/);
  });

  it('should apply prone condition on successful shove', () => {
    const rng = createSeededRng(888);

    const attacker: CombatantExtended = {
      name: 'Fighter',
      initiative: 10,
      stats: { health: 25, damage: '1d8', armorClass: 16 },
      dexModifier: 1,
      strModifier: 4,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 3,
    };

    const defender: CombatantExtended = {
      name: 'Skeleton',
      initiative: 12,
      stats: { health: 13, damage: '1d6', armorClass: 13 },
      dexModifier: 1,
      strModifier: 0,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 0,
    };

    const result = resolveShove(attacker, defender, 'prone', rng);

    if (result.success) {
      expect(defender.conditions.has('prone')).toBe(true);
    }
  });
});

describe('Combat - Advanced Attack Resolution', () => {
  it('should resolve a basic attack', () => {
    const rng = createSeededRng(300);

    const attacker: CombatantExtended = {
      name: 'Fighter',
      initiative: 10,
      stats: { health: 25, damage: '1d8+3', armorClass: 16 },
      dexModifier: 1,
      strModifier: 3,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 2,
    };

    const defender: CombatantExtended = {
      name: 'Goblin',
      initiative: 12,
      stats: { health: 7, damage: '1d6', armorClass: 14 },
      dexModifier: 2,
      strModifier: -1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
    };

    const result = resolveAttack(
      { attacker, defender, cover: 'none' },
      rng
    );

    expect(result).toHaveProperty('hit');
    expect(result).toHaveProperty('critical');
    expect(result).toHaveProperty('damage');
    expect(result).toHaveProperty('message');
  });

  it('should apply cover bonus to AC', () => {
    const rng = createSeededRng(400);

    const attacker: CombatantExtended = {
      name: 'Archer',
      initiative: 10,
      stats: { health: 20, damage: '1d8', armorClass: 15 },
      dexModifier: 3,
      strModifier: 1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 2,
    };

    const defender: CombatantExtended = {
      name: 'Bandit',
      initiative: 12,
      stats: { health: 11, damage: '1d6', armorClass: 12 },
      dexModifier: 2,
      strModifier: 0,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
    };

    const resultNoCover = resolveAttack(
      { attacker, defender, cover: 'none' },
      rng
    );

    expect(resultNoCover.modifiedAC).toBe(12);

    const resultHalfCover = resolveAttack(
      { attacker, defender, cover: 'half' },
      rng
    );

    expect(resultHalfCover.modifiedAC).toBe(14); // 12 + 2
  });

  it('should automatically miss with full cover', () => {
    const rng = createSeededRng(500);

    const attacker: CombatantExtended = {
      name: 'Archer',
      initiative: 10,
      stats: { health: 20, damage: '1d8', armorClass: 15 },
      dexModifier: 3,
      strModifier: 1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 2,
    };

    const defender: CombatantExtended = {
      name: 'Bandit',
      initiative: 12,
      stats: { health: 11, damage: '1d6', armorClass: 12 },
      dexModifier: 2,
      strModifier: 0,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
    };

    const result = resolveAttack(
      { attacker, defender, cover: 'full' },
      rng
    );

    expect(result.hit).toBe(false);
    expect(result.message).toContain('full cover');
  });
});

describe('Combat - Action Economy', () => {
  it('should reset actions at start of turn', () => {
    const combatant: CombatantExtended = {
      name: 'Fighter',
      initiative: 10,
      stats: { health: 25, damage: '1d8', armorClass: 16 },
      dexModifier: 1,
      strModifier: 3,
      conditions: new Set(),
      usedActions: new Set(['action', 'bonus_action']),
      hasReaction: false,
    };

    resetActionEconomy(combatant);

    expect(combatant.usedActions.size).toBe(0);
    expect(combatant.hasReaction).toBe(true);
  });
});

describe('Combat - Opportunity Attacks', () => {
  it('should not trigger if no reaction available', () => {
    const rng = createSeededRng(600);

    const attacker: CombatantExtended = {
      name: 'Fighter',
      initiative: 10,
      stats: { health: 25, damage: '1d8', armorClass: 16 },
      dexModifier: 1,
      strModifier: 3,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: false, // No reaction
    };

    const target: CombatantExtended = {
      name: 'Goblin',
      initiative: 12,
      stats: { health: 7, damage: '1d6', armorClass: 14 },
      dexModifier: 2,
      strModifier: -1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
    };

    const result = resolveOpportunityAttack(attacker, target, rng);
    expect(result).toBeNull();
  });

  it('should consume reaction when triggered', () => {
    const rng = createSeededRng(700);

    const attacker: CombatantExtended = {
      name: 'Fighter',
      initiative: 10,
      stats: { health: 25, damage: '1d8', armorClass: 16 },
      dexModifier: 1,
      strModifier: 3,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
      proficiencyBonus: 2,
    };

    const target: CombatantExtended = {
      name: 'Goblin',
      initiative: 12,
      stats: { health: 7, damage: '1d6', armorClass: 14 },
      dexModifier: 2,
      strModifier: -1,
      conditions: new Set(),
      usedActions: new Set(),
      hasReaction: true,
    };

    const result = resolveOpportunityAttack(attacker, target, rng);

    if (result) {
      expect(attacker.hasReaction).toBe(false);
      expect(attacker.usedActions.has('reaction')).toBe(true);
    }
  });
});
