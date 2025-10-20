/**
 * @file Tests for Spell Slot Leveling Integration
 *
 * Validates the integration between spell slot progression and leveling system.
 */

import {
  convertSlotsToDbFormat,
  getUpdatedSpellSlots,
  getSpellSlotLevelUpMessage,
  needsSpellSelection,
} from '../../services/spellSlotLevelingIntegration';
import { getSpellSlotsForLevel } from '../../data/spellSlotProgression';

describe('Spell Slot Leveling Integration', () => {
  describe('convertSlotsToDbFormat', () => {
    test('Should convert standard spell slots to database format', () => {
      const slots = getSpellSlotsForLevel('Wizard', 5);
      const dbFormat = convertSlotsToDbFormat(slots!);

      expect(dbFormat).toEqual({
        '1': 4,
        '2': 3,
        '3': 2,
      });
    });

    test('Should convert Warlock Pact Magic to database format', () => {
      const slots = getSpellSlotsForLevel('Warlock', 5);
      const dbFormat = convertSlotsToDbFormat(slots!);

      expect(dbFormat).toEqual({
        '3': 2,
        pact_magic: 1,
      });
    });

    test('Should only include non-zero slots', () => {
      const slots = getSpellSlotsForLevel('Paladin', 2);
      const dbFormat = convertSlotsToDbFormat(slots!);

      expect(dbFormat).toEqual({
        '1': 2,
      });
      expect(dbFormat['2']).toBeUndefined();
    });
  });

  describe('getUpdatedSpellSlots', () => {
    test('Should return updated slots for spellcasters', () => {
      const slots = getUpdatedSpellSlots('Wizard', 3);
      expect(slots).toEqual({
        '1': 4,
        '2': 2,
      });
    });

    test('Should return null for non-spellcasters', () => {
      const slots = getUpdatedSpellSlots('Fighter', 5);
      expect(slots).toBeNull();
    });

    test('Should handle Paladin gaining spells at level 2', () => {
      const slotsL1 = getUpdatedSpellSlots('Paladin', 1);
      const slotsL2 = getUpdatedSpellSlots('Paladin', 2);

      expect(slotsL1).toEqual({});
      expect(slotsL2).toEqual({ '1': 2 });
    });
  });

  describe('getSpellSlotLevelUpMessage', () => {
    test('Wizard leveling 1 → 2 should gain spell slot', () => {
      const message = getSpellSlotLevelUpMessage('Wizard', 1, 2);
      expect(message).toContain('1 additional 1st-level spell slot');
    });

    test('Wizard leveling 2 → 3 should unlock 2nd-level spells', () => {
      const message = getSpellSlotLevelUpMessage('Wizard', 2, 3);
      expect(message).toContain('unlock');
      expect(message).toContain('2nd-level');
    });

    test('Wizard leveling 4 → 5 should unlock 3rd-level spells', () => {
      const message = getSpellSlotLevelUpMessage('Wizard', 4, 5);
      expect(message).toContain('unlock');
      expect(message).toContain('3rd-level');
    });

    test('Bard should mention learning new cantrip at level 4', () => {
      const message = getSpellSlotLevelUpMessage('Bard', 3, 4);
      expect(message).toContain('cantrip');
    });

    test('Sorcerer should mention learning new spell', () => {
      const message = getSpellSlotLevelUpMessage('Sorcerer', 1, 2);
      expect(message).toContain('learn');
      expect(message).toContain('spell');
    });

    test('Paladin gaining spells at level 2 should have special message', () => {
      const message = getSpellSlotLevelUpMessage('Paladin', 1, 2);
      expect(message).toContain('gain the ability to cast spells');
    });

    test('Eldritch Knight gaining spells at level 3 should have special message', () => {
      const message = getSpellSlotLevelUpMessage('Eldritch Knight', 2, 3);
      expect(message).toContain('gain the ability to cast spells');
    });

    test('Warlock leveling should describe Pact Magic changes', () => {
      const message12 = getSpellSlotLevelUpMessage('Warlock', 1, 2);
      expect(message12).toContain('additional spell slot');

      const message23 = getSpellSlotLevelUpMessage('Warlock', 2, 3);
      expect(message23).toContain('upgrade');
      expect(message23).toContain('2nd level');
    });

    test('Non-spellcaster should return null', () => {
      const message = getSpellSlotLevelUpMessage('Fighter', 5, 6);
      expect(message).toBeNull();
    });

    test('No changes should return null', () => {
      // Paladin 3 → 4 has no slot increases
      const message = getSpellSlotLevelUpMessage('Paladin', 3, 4);
      expect(message).toBeNull();
    });
  });

  describe('needsSpellSelection', () => {
    test('Wizard at level 1 should need cantrip selection', () => {
      const selection = needsSpellSelection('Wizard', 1);
      expect(selection.needsSelection).toBe(true);
      expect(selection.cantripsNeeded).toBe(3);
    });

    test('Sorcerer at level 2 should need spell selection', () => {
      const selection = needsSpellSelection('Sorcerer', 2);
      expect(selection.needsSelection).toBe(true);
      expect(selection.spellsNeeded).toBe(1);
    });

    test('Bard at level 4 should need cantrip selection', () => {
      const selection = needsSpellSelection('Bard', 4);
      expect(selection.needsSelection).toBe(true);
      expect(selection.cantripsNeeded).toBe(1);
    });

    test('Wizard preparing spells should not need spell selection', () => {
      const selection = needsSpellSelection('Wizard', 2);
      expect(selection.spellsNeeded).toBe(0);
    });

    test('Should indicate new spell level unlocked', () => {
      const selection = needsSpellSelection('Wizard', 3);
      expect(selection.newSpellLevel).toBe(2);
    });

    test('Non-spellcaster should not need selection', () => {
      const selection = needsSpellSelection('Fighter', 5);
      expect(selection.needsSelection).toBe(false);
      expect(selection.cantripsNeeded).toBe(0);
      expect(selection.spellsNeeded).toBe(0);
    });

    test('Level with no new spells should not need selection', () => {
      const selection = needsSpellSelection('Paladin', 4);
      expect(selection.needsSelection).toBe(false);
    });
  });

  describe('Integration with All Classes', () => {
    test('Full casters should have progression from level 1', () => {
      ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'].forEach(className => {
        const slots = getUpdatedSpellSlots(className, 1);
        expect(slots).toBeTruthy();
        expect(slots!['1']).toBe(2);
      });
    });

    test('Half casters should start at level 2', () => {
      ['Paladin', 'Ranger'].forEach(className => {
        const slotsL1 = getUpdatedSpellSlots(className, 1);
        const slotsL2 = getUpdatedSpellSlots(className, 2);

        expect(slotsL1).toEqual({});
        expect(slotsL2!['1']).toBe(2);
      });
    });

    test('Third casters should start at level 3', () => {
      ['Eldritch Knight', 'Arcane Trickster'].forEach(className => {
        const slotsL2 = getUpdatedSpellSlots(className, 2);
        const slotsL3 = getUpdatedSpellSlots(className, 3);

        expect(slotsL2).toEqual({});
        expect(slotsL3!['1']).toBe(2);
      });
    });

    test('All spellcasters should have valid progression to level 20', () => {
      const allCasters = [
        'Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard',
        'Paladin', 'Ranger',
        'Eldritch Knight', 'Arcane Trickster',
        'Warlock'
      ];

      allCasters.forEach(className => {
        for (let level = 1; level <= 20; level++) {
          const slots = getUpdatedSpellSlots(className, level);
          expect(slots).toBeTruthy();

          // Some classes don't get spells at early levels (Paladin L1, Eldritch Knight L1-2)
          // But the function should still return a valid object (possibly empty)
          expect(typeof slots).toBe('object');
        }
      });
    });
  });

  describe('Message Formatting', () => {
    test('Messages should use proper ordinal suffixes', () => {
      const msg1 = getSpellSlotLevelUpMessage('Wizard', 2, 3);
      expect(msg1).toContain('2nd');

      const msg2 = getSpellSlotLevelUpMessage('Wizard', 4, 5);
      expect(msg2).toContain('3rd');

      const msg3 = getSpellSlotLevelUpMessage('Wizard', 6, 7);
      expect(msg3).toContain('4th');
    });

    test('Messages should use singular/plural correctly', () => {
      const msgSingle = getSpellSlotLevelUpMessage('Wizard', 1, 2);
      expect(msgSingle).toContain('slot');
      expect(msgSingle).not.toMatch(/slots(?!\s+of)/); // Should use "slot", not "slots"

      const msgPlural = getSpellSlotLevelUpMessage('Wizard', 2, 3);
      expect(msgPlural).toContain('slots');
    });
  });
});
