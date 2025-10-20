/**
 * @file Tests for Spell Slot Progression System
 *
 * Validates D&D 5e spell slot tables and progression functions.
 */

import {
  getSpellSlotsForLevel,
  getNewSpellsLearnedCount,
  getNewCantripsCount,
  getSpellLevelUnlocked,
  isSpellcaster,
  getSpellcastingInfo,
  getSpellcastingAbility,
  type SpellSlots,
  type WarlockSlots,
} from '../../data/spellSlotProgression';

describe('Spell Slot Progression', () => {
  describe('Full Casters (Wizard, Cleric, Druid, Sorcerer, Bard)', () => {
    const fullCasters = ['Wizard', 'Cleric', 'Druid', 'Sorcerer', 'Bard'];

    test('Level 1: Should have 2 first-level slots', () => {
      fullCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 1) as SpellSlots;
        expect(slots).toBeTruthy();
        expect(slots.level1).toBe(2);
        expect(slots.level2).toBe(0);
      });
    });

    test('Level 3: Should unlock 2nd-level spells', () => {
      fullCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 3) as SpellSlots;
        expect(slots.level1).toBe(4);
        expect(slots.level2).toBe(2);
        expect(slots.level3).toBe(0);
      });
    });

    test('Level 5: Should unlock 3rd-level spells', () => {
      fullCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 5) as SpellSlots;
        expect(slots.level3).toBe(2);
      });
    });

    test('Level 9: Should unlock 5th-level spells', () => {
      fullCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 9) as SpellSlots;
        expect(slots.level5).toBe(1);
      });
    });

    test('Level 17: Should unlock 9th-level spells', () => {
      fullCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 17) as SpellSlots;
        expect(slots.level9).toBe(1);
      });
    });

    test('Level 20: Should have max progression', () => {
      fullCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 20) as SpellSlots;
        expect(slots.level1).toBe(4);
        expect(slots.level5).toBe(3);
        expect(slots.level9).toBe(1);
      });
    });
  });

  describe('Half Casters (Paladin, Ranger)', () => {
    const halfCasters = ['Paladin', 'Ranger'];

    test('Level 1: Should have NO spell slots', () => {
      halfCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 1) as SpellSlots;
        expect(slots).toBeTruthy();
        expect(slots.level1).toBe(0);
      });
    });

    test('Level 2: Should gain first spell slots', () => {
      halfCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 2) as SpellSlots;
        expect(slots.level1).toBe(2);
      });
    });

    test('Level 5: Should unlock 2nd-level spells', () => {
      halfCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 5) as SpellSlots;
        expect(slots.level1).toBe(4);
        expect(slots.level2).toBe(2);
      });
    });

    test('Level 17: Should unlock 5th-level spells (max)', () => {
      halfCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 17) as SpellSlots;
        expect(slots.level5).toBe(1);
        expect(slots.level6).toBe(0); // Should NOT have 6th level
      });
    });

    test('Level 20: Should cap at 5th-level spells', () => {
      halfCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 20) as SpellSlots;
        expect(slots.level5).toBe(2);
        expect(slots.level6).toBe(0);
      });
    });
  });

  describe('Third Casters (Eldritch Knight, Arcane Trickster)', () => {
    const thirdCasters = ['Eldritch Knight', 'Arcane Trickster'];

    test('Level 1-2: Should have NO spell slots', () => {
      thirdCasters.forEach(className => {
        const slotsL1 = getSpellSlotsForLevel(className, 1) as SpellSlots;
        const slotsL2 = getSpellSlotsForLevel(className, 2) as SpellSlots;
        expect(slotsL1.level1).toBe(0);
        expect(slotsL2.level1).toBe(0);
      });
    });

    test('Level 3: Should gain first spell slots', () => {
      thirdCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 3) as SpellSlots;
        expect(slots.level1).toBe(2);
      });
    });

    test('Level 7: Should unlock 2nd-level spells', () => {
      thirdCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 7) as SpellSlots;
        expect(slots.level2).toBe(2);
      });
    });

    test('Level 13: Should unlock 3rd-level spells', () => {
      thirdCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 13) as SpellSlots;
        expect(slots.level3).toBe(2);
      });
    });

    test('Level 19: Should unlock 4th-level spells (max)', () => {
      thirdCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 19) as SpellSlots;
        expect(slots.level4).toBe(1);
        expect(slots.level5).toBe(0); // Should NOT have 5th level
      });
    });

    test('Level 20: Should cap at 4th-level spells', () => {
      thirdCasters.forEach(className => {
        const slots = getSpellSlotsForLevel(className, 20) as SpellSlots;
        expect(slots.level4).toBe(1);
        expect(slots.level5).toBe(0);
      });
    });
  });

  describe('Warlock (Pact Magic)', () => {
    test('Level 1: Should have 1 slot at 1st level', () => {
      const slots = getSpellSlotsForLevel('Warlock', 1) as WarlockSlots;
      expect(slots.slots).toBe(1);
      expect(slots.slotLevel).toBe(1);
    });

    test('Level 2: Should have 2 slots at 1st level', () => {
      const slots = getSpellSlotsForLevel('Warlock', 2) as WarlockSlots;
      expect(slots.slots).toBe(2);
      expect(slots.slotLevel).toBe(1);
    });

    test('Level 3: Slots should upgrade to 2nd level', () => {
      const slots = getSpellSlotsForLevel('Warlock', 3) as WarlockSlots;
      expect(slots.slots).toBe(2);
      expect(slots.slotLevel).toBe(2);
    });

    test('Level 11: Should gain 3rd slot', () => {
      const slots = getSpellSlotsForLevel('Warlock', 11) as WarlockSlots;
      expect(slots.slots).toBe(3);
      expect(slots.slotLevel).toBe(5);
    });

    test('Level 17: Should gain 4th slot', () => {
      const slots = getSpellSlotsForLevel('Warlock', 17) as WarlockSlots;
      expect(slots.slots).toBe(4);
      expect(slots.slotLevel).toBe(5);
    });

    test('Level 20: Should cap at 4 slots of 5th level', () => {
      const slots = getSpellSlotsForLevel('Warlock', 20) as WarlockSlots;
      expect(slots.slots).toBe(4);
      expect(slots.slotLevel).toBe(5);
    });
  });

  describe('Non-Spellcasters', () => {
    test('Fighter, Barbarian, Rogue should return null', () => {
      expect(getSpellSlotsForLevel('Fighter', 5)).toBeNull();
      expect(getSpellSlotsForLevel('Barbarian', 10)).toBeNull();
      expect(getSpellSlotsForLevel('Rogue', 15)).toBeNull();
    });

    test('isSpellcaster should return false', () => {
      expect(isSpellcaster('Fighter')).toBe(false);
      expect(isSpellcaster('Barbarian')).toBe(false);
      expect(isSpellcaster('Rogue')).toBe(false);
    });
  });

  describe('Cantrips Known', () => {
    test('Sorcerer should start with most cantrips (4)', () => {
      const info = getSpellcastingInfo('Sorcerer', 1);
      expect(info?.cantripsKnown).toBe(4);
    });

    test('Bard should gain new cantrip at level 4', () => {
      expect(getNewCantripsCount('Bard', 4)).toBe(1);
    });

    test('Wizard should gain new cantrip at level 10', () => {
      expect(getNewCantripsCount('Wizard', 10)).toBe(1);
    });

    test('Eldritch Knight should start with cantrips at level 3', () => {
      expect(getNewCantripsCount('Eldritch Knight', 3)).toBe(2);
    });

    test('Paladin and Ranger should NOT get cantrips', () => {
      expect(getNewCantripsCount('Paladin', 1)).toBe(0);
      expect(getNewCantripsCount('Ranger', 1)).toBe(0);
    });
  });

  describe('Spells Known', () => {
    test('Sorcerer should learn 2 spells at level 1', () => {
      const info = getSpellcastingInfo('Sorcerer', 1);
      expect(info?.spellsKnown).toBe(2);
    });

    test('Bard should learn 1 new spell at level 2', () => {
      expect(getNewSpellsLearnedCount('Bard', 2)).toBe(1);
    });

    test('Ranger should learn first spells at level 2', () => {
      expect(getNewSpellsLearnedCount('Ranger', 2)).toBe(2);
    });

    test('Wizard should NOT have spellsKnown (prepares from spellbook)', () => {
      const info = getSpellcastingInfo('Wizard', 5);
      expect(info?.spellsKnown).toBeUndefined();
    });

    test('Cleric should NOT have spellsKnown (prepares from full list)', () => {
      const info = getSpellcastingInfo('Cleric', 5);
      expect(info?.spellsKnown).toBeUndefined();
    });
  });

  describe('Spell Level Unlocking', () => {
    test('Full casters unlock 2nd-level spells at level 3', () => {
      expect(getSpellLevelUnlocked('Wizard', 3)).toBe(2);
      expect(getSpellLevelUnlocked('Cleric', 3)).toBe(2);
    });

    test('Full casters unlock 9th-level spells at level 17', () => {
      expect(getSpellLevelUnlocked('Wizard', 17)).toBe(9);
    });

    test('Paladin unlocks 2nd-level spells at level 5', () => {
      expect(getSpellLevelUnlocked('Paladin', 5)).toBe(2);
    });

    test('Warlock unlocks 2nd-level spells at level 3', () => {
      expect(getSpellLevelUnlocked('Warlock', 3)).toBe(2);
    });

    test('Eldritch Knight unlocks 2nd-level spells at level 7', () => {
      expect(getSpellLevelUnlocked('Eldritch Knight', 7)).toBe(2);
    });

    test('Should return null when no new spell level unlocked', () => {
      expect(getSpellLevelUnlocked('Wizard', 2)).toBeNull();
      expect(getSpellLevelUnlocked('Wizard', 4)).toBeNull();
    });
  });

  describe('Spellcasting Ability', () => {
    test('Charisma casters', () => {
      expect(getSpellcastingAbility('Bard')).toBe('CHA');
      expect(getSpellcastingAbility('Sorcerer')).toBe('CHA');
      expect(getSpellcastingAbility('Paladin')).toBe('CHA');
      expect(getSpellcastingAbility('Warlock')).toBe('CHA');
    });

    test('Intelligence casters', () => {
      expect(getSpellcastingAbility('Wizard')).toBe('INT');
      expect(getSpellcastingAbility('Eldritch Knight')).toBe('INT');
      expect(getSpellcastingAbility('Arcane Trickster')).toBe('INT');
    });

    test('Wisdom casters', () => {
      expect(getSpellcastingAbility('Cleric')).toBe('WIS');
      expect(getSpellcastingAbility('Druid')).toBe('WIS');
      expect(getSpellcastingAbility('Ranger')).toBe('WIS');
    });

    test('Non-casters should return null', () => {
      expect(getSpellcastingAbility('Fighter')).toBeNull();
      expect(getSpellcastingAbility('Barbarian')).toBeNull();
    });
  });

  describe('Complete Spellcasting Info', () => {
    test('Wizard level 5 should have complete info', () => {
      const info = getSpellcastingInfo('Wizard', 5);
      expect(info).toBeTruthy();
      expect(info?.cantripsKnown).toBe(4);
      expect(info?.spellsKnown).toBeUndefined(); // Prepares spells
      expect(info?.newSpellLevel).toBe(3);
    });

    test('Sorcerer level 3 should show new spell learned', () => {
      const info = getSpellcastingInfo('Sorcerer', 3);
      expect(info?.spellsLearned).toBe(1);
      expect(info?.newSpellLevel).toBe(2);
    });

    test('Non-caster should return null', () => {
      const info = getSpellcastingInfo('Fighter', 5);
      expect(info).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('Invalid levels should return null or 0', () => {
      expect(getSpellSlotsForLevel('Wizard', 0)).toBeNull();
      expect(getSpellSlotsForLevel('Wizard', 21)).toBeNull();
      expect(getNewSpellsLearnedCount('Wizard', -1)).toBe(0);
      expect(getNewCantripsCount('Wizard', 25)).toBe(0);
    });

    test('Unknown class should return null or 0', () => {
      expect(getSpellSlotsForLevel('InvalidClass', 5)).toBeNull();
      expect(isSpellcaster('InvalidClass')).toBe(false);
    });
  });
});
