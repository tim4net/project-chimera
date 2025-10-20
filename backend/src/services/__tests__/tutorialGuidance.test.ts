/**
 * Tests for Tutorial Guidance System
 */

import {
  getTutorialContext,
  validateCantripSelection,
  validateSpellSelection,
  getStartingSpellInfo,
} from '../tutorialGuidance';
import type { CharacterRecord } from '../../types';

describe('Tutorial Guidance System', () => {
  const mockCharacter = (
    charClass: string,
    level: number,
    tutorialState?: 'needs_cantrips' | 'needs_spells' | 'complete'
  ): CharacterRecord => ({
    id: 'test-id',
    user_id: 'test-user',
    name: 'Test Character',
    race: 'Human',
    class: charClass,
    background: 'Sage',
    alignment: 'Neutral Good',
    level,
    xp: 0,
    gold: 15,
    ability_scores: {
      STR: 10,
      DEX: 14,
      CON: 12,
      INT: 16,
      WIS: 13,
      CHA: 8,
    },
    hp_max: 8,
    hp_current: 8,
    temporary_hp: 0,
    armor_class: 12,
    speed: 30,
    hit_dice: { d8: 1 },
    position: { x: 0, y: 0 },
    campaign_seed: 'test-campaign',
    spell_slots: {},
    backstory: null,
    skills: null,
    portrait_url: null,
    proficiency_bonus: 2,
    tutorial_state: tutorialState,
  });

  describe('getTutorialContext', () => {
    it('should return empty string for non-Level 0 characters', () => {
      const character = mockCharacter('Wizard', 1, 'needs_cantrips');
      const context = getTutorialContext(character);
      expect(context).toBe('');
    });

    it('should return empty string when tutorial is complete', () => {
      const character = mockCharacter('Wizard', 0, 'complete');
      const context = getTutorialContext(character);
      expect(context).toBe('');
    });

    it('should return cantrip selection prompt for Wizard', () => {
      const character = mockCharacter('Wizard', 0, 'needs_cantrips');
      const context = getTutorialContext(character);

      expect(context).toContain('CANTRIP SELECTION');
      expect(context).toContain('Wizard');
      expect(context).toContain('You must choose exactly 3 cantrips');
    });

    it('should return cantrip selection prompt for Bard', () => {
      const character = mockCharacter('Bard', 0, 'needs_cantrips');
      const context = getTutorialContext(character);

      expect(context).toContain('CANTRIP SELECTION');
      expect(context).toContain('Bard');
      expect(context).toContain('You must choose exactly 2 cantrips');
    });

    it('should return spell selection prompt for Sorcerer', () => {
      const character = mockCharacter('Sorcerer', 0, 'needs_spells');
      const context = getTutorialContext(character);

      expect(context).toContain('LEVEL 1 SPELL SELECTION');
      expect(context).toContain('Sorcerer');
      expect(context).toContain('You must choose exactly 2 spells');
    });

    it('should explain spell preparation for Cleric', () => {
      const character = mockCharacter('Cleric', 0, 'needs_spells');
      const context = getTutorialContext(character);

      expect(context).toContain('SPELL PREPARATION');
      expect(context).toContain('Cleric');
      expect(context).toContain('prepare');
    });
  });

  describe('validateCantripSelection', () => {
    it('should validate correct Wizard cantrip selection', () => {
      const result = validateCantripSelection('Wizard', [
        'Fire Bolt',
        'Mage Hand',
        'Prestidigitation'
      ]);

      expect(result.valid).toBe(true);
    });

    it('should reject too few cantrips', () => {
      const result = validateCantripSelection('Wizard', ['Fire Bolt']);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('exactly 3');
    });

    it('should reject too many cantrips', () => {
      const result = validateCantripSelection('Wizard', [
        'Fire Bolt',
        'Mage Hand',
        'Prestidigitation',
        'Light'
      ]);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('exactly 3');
    });

    it('should reject invalid cantrip for class', () => {
      const result = validateCantripSelection('Wizard', [
        'Fire Bolt',
        'Mage Hand',
        'Eldritch Blast' // Warlock-only
      ]);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('not a valid cantrip');
    });

    it('should validate correct Bard cantrip selection', () => {
      const result = validateCantripSelection('Bard', [
        'Vicious Mockery',
        'Prestidigitation'
      ]);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateSpellSelection', () => {
    it('should validate correct Wizard spell selection', () => {
      const result = validateSpellSelection('Wizard', [
        'Magic Missile',
        'Shield',
        'Detect Magic',
        'Mage Armor',
        'Identify',
        'Sleep'
      ]);

      expect(result.valid).toBe(true);
    });

    it('should accept prepare-spells classes without selections', () => {
      const result = validateSpellSelection('Cleric', []);

      expect(result.valid).toBe(true);
      expect(result.message).toContain('prepares spells');
    });

    it('should reject wrong number of spells for Sorcerer', () => {
      const result = validateSpellSelection('Sorcerer', ['Magic Missile']);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('exactly 2');
    });

    it('should reject invalid spell for class', () => {
      const result = validateSpellSelection('Wizard', [
        'Magic Missile',
        'Shield',
        'Detect Magic',
        'Mage Armor',
        'Identify',
        'Cure Wounds' // Cleric/Bard/Druid/Paladin/Ranger only
      ]);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('not a valid');
    });
  });

  describe('getStartingSpellInfo', () => {
    it('should return correct info for Wizard', () => {
      const info = getStartingSpellInfo('Wizard');

      expect(info.cantrips).toBe(3);
      expect(info.spells).toBe(6);
      expect(info.prepareSpells).toBe(false);
    });

    it('should return correct info for Bard', () => {
      const info = getStartingSpellInfo('Bard');

      expect(info.cantrips).toBe(2);
      expect(info.spells).toBe(4);
      expect(info.prepareSpells).toBe(false);
    });

    it('should return correct info for Cleric (prepare spells)', () => {
      const info = getStartingSpellInfo('Cleric');

      expect(info.cantrips).toBe(3);
      expect(info.spells).toBe(0);
      expect(info.prepareSpells).toBe(true);
    });

    it('should return correct info for Sorcerer', () => {
      const info = getStartingSpellInfo('Sorcerer');

      expect(info.cantrips).toBe(4);
      expect(info.spells).toBe(2);
      expect(info.prepareSpells).toBe(false);
    });

    it('should return zeros for non-spellcasting class', () => {
      const info = getStartingSpellInfo('Fighter');

      expect(info.cantrips).toBe(0);
      expect(info.spells).toBe(0);
      expect(info.prepareSpells).toBe(false);
    });
  });
});
