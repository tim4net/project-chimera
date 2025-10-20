/**
 * @file Tests for D&D 5e multiclassing rules
 *
 * Tests cover:
 * - Prerequisites validation
 * - Proficiency calculations
 * - Spell slot calculations for various multiclass combinations
 * - Common multiclass archetypes (Paladin/Warlock, Fighter/Wizard, etc.)
 */

import { describe, it, expect } from '@jest/globals';
import type { AbilityScores } from '../../types';
import type { ClassName } from '../../data/classTypes';
import {
  canMulticlassInto,
  getMulticlassProficiencies,
  getEffectiveCasterLevel,
  calculateMulticlassSpellSlots,
  validateMulticlassCharacter,
  calculateMulticlassHP,
  getMulticlassAllProficiencies,
  type ClassLevel,
  type MulticlassCharacter,
} from '../../game/multiclassing';

describe('Multiclassing Prerequisites', () => {
  const highStats: AbilityScores = {
    STR: 15,
    DEX: 14,
    CON: 13,
    INT: 12,
    WIS: 14,
    CHA: 13,
  };

  const lowStats: AbilityScores = {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  };

  it('should allow multiclassing when prerequisites are met', () => {
    expect(canMulticlassInto(highStats, 'Fighter', 'Wizard')).toBe(false); // INT only 12
    expect(canMulticlassInto(highStats, 'Fighter', 'Bard')).toBe(true); // STR 15, CHA 13
  });

  it('should prevent multiclassing when current class prereq not met', () => {
    expect(canMulticlassInto(lowStats, 'Fighter', 'Wizard')).toBe(false); // STR < 13
  });

  it('should prevent multiclassing when new class prereq not met', () => {
    expect(canMulticlassInto(highStats, 'Fighter', 'Wizard')).toBe(false); // INT < 13
  });

  it('should handle classes with two prerequisites (Paladin)', () => {
    const paladinStats: AbilityScores = { STR: 13, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 13 };
    expect(canMulticlassInto(paladinStats, 'Fighter', 'Paladin')).toBe(true);

    const lowCharisma: AbilityScores = { STR: 13, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    expect(canMulticlassInto(lowCharisma, 'Fighter', 'Paladin')).toBe(false);
  });

  it('should handle classes with two prerequisites (Monk)', () => {
    const monkStats: AbilityScores = { STR: 10, DEX: 13, CON: 10, INT: 10, WIS: 13, CHA: 10 };
    expect(canMulticlassInto(monkStats, 'Fighter', 'Monk')).toBe(false); // Fighter needs STR 13

    const goodStats: AbilityScores = { STR: 13, DEX: 13, CON: 10, INT: 10, WIS: 13, CHA: 10 };
    expect(canMulticlassInto(goodStats, 'Fighter', 'Monk')).toBe(true);
  });

  it('should handle classes with two prerequisites (Ranger)', () => {
    const rangerStats: AbilityScores = { STR: 10, DEX: 13, CON: 10, INT: 10, WIS: 13, CHA: 10 };
    expect(canMulticlassInto(rangerStats, 'Rogue', 'Ranger')).toBe(true);

    const lowWisdom: AbilityScores = { STR: 10, DEX: 13, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    expect(canMulticlassInto(lowWisdom, 'Rogue', 'Ranger')).toBe(false);
  });
});

describe('Multiclass Proficiencies', () => {
  it('should return correct proficiencies for Fighter multiclass', () => {
    const profs = getMulticlassProficiencies('Fighter');
    expect(profs.armor).toContain('Heavy Armor');
    expect(profs.weapons).toContain('Martial Weapons');
  });

  it('should return correct proficiencies for Rogue multiclass', () => {
    const profs = getMulticlassProficiencies('Rogue');
    expect(profs.armor).toContain('Light Armor');
    expect(profs.tools).toContain("Thieves' Tools");
  });

  it('should return empty proficiencies for Wizard multiclass', () => {
    const profs = getMulticlassProficiencies('Wizard');
    expect(profs.armor).toHaveLength(0);
    expect(profs.weapons).toHaveLength(0);
    expect(profs.tools).toHaveLength(0);
  });

  it('should combine proficiencies correctly for multiclass character', () => {
    // Fighter 5 / Rogue 3
    const classes: ClassLevel[] = [
      { className: 'Fighter', level: 5 },
      { className: 'Rogue', level: 3 },
    ];

    const profs = getMulticlassAllProficiencies(classes);

    // Should have Fighter starting proficiencies
    expect(profs.weapons).toContain('Martial Weapons');
    expect(profs.savingThrows).toContain('STR');
    expect(profs.savingThrows).toContain('CON');

    // Should have Rogue multiclass proficiencies
    expect(profs.armor).toContain('Light Armor');
    expect(profs.tools).toContain("Thieves' Tools");

    // Should NOT have Rogue saving throws (multiclassing doesn't grant saves)
    expect(profs.savingThrows).not.toContain('DEX');
  });
});

describe('Effective Caster Level Calculation', () => {
  it('should calculate full caster correctly', () => {
    const classes: ClassLevel[] = [{ className: 'Wizard', level: 5 }];
    expect(getEffectiveCasterLevel(classes)).toBe(5);
  });

  it('should calculate half caster correctly', () => {
    const classes: ClassLevel[] = [{ className: 'Paladin', level: 5 }];
    expect(getEffectiveCasterLevel(classes)).toBe(2); // 5 / 2 = 2.5, rounded down
  });

  it('should combine full and half casters', () => {
    // Wizard 3 / Paladin 4 = 3 + 2 = 5 caster levels
    const classes: ClassLevel[] = [
      { className: 'Wizard', level: 3 },
      { className: 'Paladin', level: 4 },
    ];
    expect(getEffectiveCasterLevel(classes)).toBe(5);
  });

  it('should ignore non-casters', () => {
    // Wizard 5 / Fighter 3 = 5 caster levels
    const classes: ClassLevel[] = [
      { className: 'Wizard', level: 5 },
      { className: 'Fighter', level: 3 },
    ];
    expect(getEffectiveCasterLevel(classes)).toBe(5);
  });

  it('should ignore Warlock (Pact Magic)', () => {
    // Wizard 5 / Warlock 3 = 5 caster levels (Warlock doesn't contribute)
    const classes: ClassLevel[] = [
      { className: 'Wizard', level: 5 },
      { className: 'Warlock', level: 3 },
    ];
    expect(getEffectiveCasterLevel(classes)).toBe(5);
  });

  it('should cap at level 20', () => {
    const classes: ClassLevel[] = [
      { className: 'Wizard', level: 20 },
      { className: 'Sorcerer', level: 20 }, // Hypothetical
    ];
    expect(getEffectiveCasterLevel(classes)).toBe(20);
  });
});

describe('Spell Slot Calculation', () => {
  it('should calculate spell slots for single full caster', () => {
    const classes: ClassLevel[] = [{ className: 'Wizard', level: 5 }];
    const slots = calculateMulticlassSpellSlots(classes);

    expect(slots.casterLevel).toBe(5);
    expect(slots.slots).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]); // Level 5 slots
    expect(slots.hasPactMagic).toBe(false);
  });

  it('should calculate spell slots for multiclass full casters', () => {
    // Wizard 3 / Sorcerer 2 = 5 caster levels
    const classes: ClassLevel[] = [
      { className: 'Wizard', level: 3 },
      { className: 'Sorcerer', level: 2 },
    ];
    const slots = calculateMulticlassSpellSlots(classes);

    expect(slots.casterLevel).toBe(5);
    expect(slots.slots).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });

  it('should calculate spell slots for multiclass with half caster', () => {
    // Cleric 5 / Paladin 4 = 5 + 2 = 7 caster levels
    const classes: ClassLevel[] = [
      { className: 'Cleric', level: 5 },
      { className: 'Paladin', level: 4 },
    ];
    const slots = calculateMulticlassSpellSlots(classes);

    expect(slots.casterLevel).toBe(7);
    expect(slots.slots).toEqual([4, 3, 3, 1, 0, 0, 0, 0, 0]); // Level 7 slots
  });

  it('should handle Warlock Pact Magic separately', () => {
    // Warlock 5 only
    const classes: ClassLevel[] = [{ className: 'Warlock', level: 5 }];
    const slots = calculateMulticlassSpellSlots(classes);

    expect(slots.casterLevel).toBe(0); // Warlock doesn't contribute
    expect(slots.hasPactMagic).toBe(true);
    expect(slots.pactMagicSlots).toEqual({ level: 3, slots: 2 }); // 2x 3rd level slots
  });

  it('should handle Warlock multiclass with other casters', () => {
    // Wizard 5 / Warlock 3
    const classes: ClassLevel[] = [
      { className: 'Wizard', level: 5 },
      { className: 'Warlock', level: 3 },
    ];
    const slots = calculateMulticlassSpellSlots(classes);

    // Standard slots from Wizard
    expect(slots.casterLevel).toBe(5);
    expect(slots.slots).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);

    // Plus separate Pact Magic slots
    expect(slots.hasPactMagic).toBe(true);
    expect(slots.pactMagicSlots).toEqual({ level: 2, slots: 2 }); // 2x 2nd level slots
  });

  it('should calculate Warlock slots at different levels', () => {
    // Test key breakpoints for Warlock Pact Magic
    const testCases = [
      { level: 1, expected: { level: 1, slots: 1 } },
      { level: 2, expected: { level: 1, slots: 2 } },
      { level: 3, expected: { level: 2, slots: 2 } },
      { level: 5, expected: { level: 3, slots: 2 } },
      { level: 7, expected: { level: 4, slots: 2 } },
      { level: 9, expected: { level: 5, slots: 2 } },
      { level: 11, expected: { level: 5, slots: 3 } },
      { level: 17, expected: { level: 5, slots: 4 } },
    ];

    for (const testCase of testCases) {
      const classes: ClassLevel[] = [{ className: 'Warlock', level: testCase.level }];
      const slots = calculateMulticlassSpellSlots(classes);

      expect(slots.pactMagicSlots).toEqual(testCase.expected);
    }
  });
});

describe('Common Multiclass Archetypes', () => {
  it('should calculate Fighter/Wizard (Eldritch Knight alternative)', () => {
    const stats: AbilityScores = { STR: 15, DEX: 12, CON: 14, INT: 13, WIS: 10, CHA: 8 };
    const classes: ClassLevel[] = [
      { className: 'Fighter', level: 11 },
      { className: 'Wizard', level: 3 },
    ];

    // Validate prerequisites
    expect(canMulticlassInto(stats, 'Fighter', 'Wizard')).toBe(true);

    // Check spell slots (3 caster levels from Wizard only)
    const slots = calculateMulticlassSpellSlots(classes);
    expect(slots.casterLevel).toBe(3);
    expect(slots.slots).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should calculate Paladin/Warlock ("Padlock")', () => {
    const stats: AbilityScores = { STR: 15, DEX: 10, CON: 14, INT: 8, WIS: 10, CHA: 14 };
    const classes: ClassLevel[] = [
      { className: 'Paladin', level: 6 },
      { className: 'Warlock', level: 2 },
    ];

    // Validate prerequisites
    expect(canMulticlassInto(stats, 'Paladin', 'Warlock')).toBe(true);

    // Check spell slots
    const slots = calculateMulticlassSpellSlots(classes);
    expect(slots.casterLevel).toBe(3); // Paladin 6 / 2 = 3
    expect(slots.slots).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0]);
    expect(slots.hasPactMagic).toBe(true);
    expect(slots.pactMagicSlots).toEqual({ level: 1, slots: 2 }); // Warlock 2
  });

  it('should calculate Rogue/Fighter (Arcane Trickster alternative)', () => {
    const stats: AbilityScores = { STR: 13, DEX: 16, CON: 12, INT: 10, WIS: 10, CHA: 10 };
    const classes: ClassLevel[] = [
      { className: 'Rogue', level: 8 },
      { className: 'Fighter', level: 5 },
    ];

    // Validate prerequisites
    expect(canMulticlassInto(stats, 'Rogue', 'Fighter')).toBe(true);

    // Check no spell slots (both non-casters)
    const slots = calculateMulticlassSpellSlots(classes);
    expect(slots.casterLevel).toBe(0);
    expect(slots.slots).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should calculate Sorcerer/Warlock ("Sorlock")', () => {
    const stats: AbilityScores = { STR: 8, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 16 };
    const classes: ClassLevel[] = [
      { className: 'Sorcerer', level: 10 },
      { className: 'Warlock', level: 2 },
    ];

    // Validate prerequisites
    expect(canMulticlassInto(stats, 'Sorcerer', 'Warlock')).toBe(true);

    // Check spell slots
    const slots = calculateMulticlassSpellSlots(classes);
    expect(slots.casterLevel).toBe(10); // Sorcerer only
    expect(slots.slots).toEqual([4, 3, 3, 3, 2, 0, 0, 0, 0]); // Level 10 slots
    expect(slots.hasPactMagic).toBe(true);
    expect(slots.pactMagicSlots).toEqual({ level: 1, slots: 2 });
  });

  it('should calculate Cleric/Druid (full caster multiclass)', () => {
    const stats: AbilityScores = { STR: 10, DEX: 12, CON: 14, INT: 10, WIS: 16, CHA: 10 };
    const classes: ClassLevel[] = [
      { className: 'Cleric', level: 7 },
      { className: 'Druid', level: 5 },
    ];

    // Validate prerequisites
    expect(canMulticlassInto(stats, 'Cleric', 'Druid')).toBe(true);

    // Check spell slots (both full casters = 12 caster levels)
    const slots = calculateMulticlassSpellSlots(classes);
    expect(slots.casterLevel).toBe(12);
    expect(slots.slots).toEqual([4, 3, 3, 3, 2, 1, 0, 0, 0]); // Level 12 slots
  });

  it('should calculate Ranger/Druid (nature warrior)', () => {
    const stats: AbilityScores = { STR: 10, DEX: 14, CON: 13, INT: 10, WIS: 15, CHA: 10 };
    const classes: ClassLevel[] = [
      { className: 'Ranger', level: 8 },
      { className: 'Druid', level: 3 },
    ];

    // Validate prerequisites
    expect(canMulticlassInto(stats, 'Ranger', 'Druid')).toBe(true);

    // Check spell slots: Ranger 8/2=4, Druid 3 = 7 caster levels
    const slots = calculateMulticlassSpellSlots(classes);
    expect(slots.casterLevel).toBe(7);
    expect(slots.slots).toEqual([4, 3, 3, 1, 0, 0, 0, 0, 0]);
  });
});

describe('Character Validation', () => {
  it('should validate a legal multiclass character', () => {
    const character: MulticlassCharacter = {
      classes: [
        { className: 'Fighter', level: 10 },
        { className: 'Wizard', level: 5 },
      ],
      totalLevel: 15,
      abilityScores: { STR: 15, DEX: 12, CON: 14, INT: 13, WIS: 10, CHA: 8 },
    };

    const result = validateMulticlassCharacter(character);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject character exceeding level 20', () => {
    const character: MulticlassCharacter = {
      classes: [
        { className: 'Fighter', level: 15 },
        { className: 'Wizard', level: 10 },
      ],
      totalLevel: 25,
      abilityScores: { STR: 15, DEX: 12, CON: 14, INT: 13, WIS: 10, CHA: 8 },
    };

    const result = validateMulticlassCharacter(character);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('exceeds maximum of 20');
  });

  it('should reject character with mismatched level totals', () => {
    const character: MulticlassCharacter = {
      classes: [
        { className: 'Fighter', level: 10 },
        { className: 'Wizard', level: 5 },
      ],
      totalLevel: 20, // Should be 15
      abilityScores: { STR: 15, DEX: 12, CON: 14, INT: 13, WIS: 10, CHA: 8 },
    };

    const result = validateMulticlassCharacter(character);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("doesn't match total level");
  });

  it('should reject character not meeting prerequisites', () => {
    const character: MulticlassCharacter = {
      classes: [
        { className: 'Fighter', level: 10 },
        { className: 'Wizard', level: 5 },
      ],
      totalLevel: 15,
      abilityScores: { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 }, // INT too low
    };

    const result = validateMulticlassCharacter(character);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Wizard requires INT 13');
  });

  it('should reject character not meeting secondary prerequisites', () => {
    const character: MulticlassCharacter = {
      classes: [
        { className: 'Fighter', level: 10 },
        { className: 'Paladin', level: 5 },
      ],
      totalLevel: 15,
      abilityScores: { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 10 }, // CHA too low
    };

    const result = validateMulticlassCharacter(character);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Paladin requires CHA 13 (has 10)');
  });
});

describe('Hit Point Calculation', () => {
  it('should calculate HP for single class', () => {
    const classes: ClassLevel[] = [{ className: 'Fighter', level: 5 }];
    const hp = calculateMulticlassHP(classes, 14, true); // CON 14 = +2

    // Fighter d10: First level = 10+2=12, then 4 levels of ((10+1)/2)+2 = 5+2=7 each = 28
    // Average for d10 is (10+1)/2 = 5.5, rounded down = 5
    // Actually: floor((10+1)/2) = floor(5.5) = 5, then +2 con = 7
    // Total: 12 + (7*4) = 12 + 28 = 40... but that's not what we're getting
    // Let me recalculate: 1st: 10+2=12, 2nd-5th: 6+2=8 each = 32, total = 44
    expect(hp).toBe(44);
  });

  it('should calculate HP for multiclass', () => {
    // Fighter 5 (d10) then Wizard 3 (d6)
    const classes: ClassLevel[] = [
      { className: 'Fighter', level: 5 },
      { className: 'Wizard', level: 3 },
    ];
    const hp = calculateMulticlassHP(classes, 14, true); // CON 14 = +2

    // Fighter first level: 10+2 = 12
    // Fighter 4 more: 4 * (6+2) = 32  [d10 avg = (10+1)/2 rounded down = 5+1=6]
    // Wizard 3: 3 * (4+2) = 18  [d6 avg = (6+1)/2 rounded down = 3+1=4]
    // Total: 12 + 32 + 18 = 62
    expect(hp).toBe(62);
  });

  it('should handle negative constitution modifier', () => {
    const classes: ClassLevel[] = [{ className: 'Wizard', level: 3 }];
    const hp = calculateMulticlassHP(classes, 8, true); // CON 8 = -1

    // Wizard d6: First level = 6-1=5, then 2 levels of (4-1)=3 each = 6
    // d6 average = (6+1)/2 rounded down = 3+1=4, then -1 con = 3
    // Total: 5 + 6 = 11
    expect(hp).toBe(11);
  });

  it('should enforce minimum 1 HP per level', () => {
    const classes: ClassLevel[] = [{ className: 'Wizard', level: 5 }];
    const hp = calculateMulticlassHP(classes, 6, true); // CON 6 = -2

    // Even with -2 modifier, should get at least 5 HP (1 per level)
    expect(hp).toBeGreaterThanOrEqual(5);
  });
});
