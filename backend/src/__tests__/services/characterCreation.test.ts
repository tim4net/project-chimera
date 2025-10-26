/**
 * Character Creation Service Tests
 *
 * Comprehensive test suite for character creation validation,
 * calculations, and record generation.
 */

import {
  validateCharacterData,
  createCharacterRecord,
  generateCharacterDefaults,
  calculateStats,
  getCharacterMetadata,
  type CharacterCreationData
} from '../../services/characterCreation';
import type { AbilityScores } from '../../types';

describe('Character Creation Service', () => {
  // Valid test data
  const validAbilityScores: AbilityScores = {
    STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
  };

  const validCharacterData: CharacterCreationData = {
    name: 'Test Character',
    race: 'Human',
    class: 'Fighter',
    background: 'Soldier',
    alignment: 'Lawful Good',
    abilityScores: validAbilityScores,
    skills: null,
    backstory: null,
    portraitUrl: null
  };

  describe('validateCharacterData', () => {
    // Happy path tests
    test('should validate complete character data successfully', () => {
      expect(() => validateCharacterData(validCharacterData)).not.toThrow();
    });

    test('should validate character with optional fields as null', () => {
      const data: CharacterCreationData = {
        ...validCharacterData,
        skills: null,
        backstory: null,
        portraitUrl: null
      };
      expect(() => validateCharacterData(data)).not.toThrow();
    });

    // Validation error tests
    test('should throw error for missing name', () => {
      const data = { ...validCharacterData, name: '' };
      expect(() => validateCharacterData(data)).toThrow('Character name is required');
    });

    test('should throw error for missing race', () => {
      const data = { ...validCharacterData, race: '' };
      expect(() => validateCharacterData(data)).toThrow('Race is required');
    });

    test('should throw error for missing class', () => {
      const data = { ...validCharacterData, class: '' };
      expect(() => validateCharacterData(data)).toThrow('Class is required');
    });

    test('should throw error for missing background', () => {
      const data = { ...validCharacterData, background: '' };
      expect(() => validateCharacterData(data)).toThrow('Background is required');
    });

    test('should throw error for missing alignment', () => {
      const data = { ...validCharacterData, alignment: '' };
      expect(() => validateCharacterData(data)).toThrow('Alignment is required');
    });

    test('should throw error for missing ability scores', () => {
      const data = { ...validCharacterData, abilityScores: null as any };
      expect(() => validateCharacterData(data)).toThrow('Ability scores are required');
    });

    test('should throw error for invalid class name', () => {
      const data = { ...validCharacterData, class: 'InvalidClass' };
      expect(() => validateCharacterData(data)).toThrow('Invalid class');
    });

    test('should throw error for invalid point-buy scores (too high)', () => {
      const invalidScores = {
        STR: 18, DEX: 18, CON: 18, INT: 18, WIS: 18, CHA: 18
      };
      const data = { ...validCharacterData, abilityScores: invalidScores };
      expect(() => validateCharacterData(data)).toThrow('Invalid ability scores for point-buy');
    });

    test('should throw error for invalid point-buy scores (exceeds 27 points)', () => {
      const invalidScores = {
        STR: 15, DEX: 15, CON: 15, INT: 10, WIS: 8, CHA: 8
      }; // Costs 29 points
      const data = { ...validCharacterData, abilityScores: invalidScores };
      expect(() => validateCharacterData(data)).toThrow('Invalid ability scores for point-buy');
    });

    test('should throw error for name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      const data = { ...validCharacterData, name: longName };
      expect(() => validateCharacterData(data)).toThrow('Character name must be 100 characters or less');
    });

    test('should throw error for missing STR ability score', () => {
      const invalidScores = { ...validAbilityScores, STR: undefined as any };
      const data = { ...validCharacterData, abilityScores: invalidScores };
      expect(() => validateCharacterData(data)).toThrow('Ability score STR must be a number');
    });

    test('should throw error for non-numeric ability score', () => {
      const invalidScores = { ...validAbilityScores, DEX: 'not a number' as any };
      const data = { ...validCharacterData, abilityScores: invalidScores };
      expect(() => validateCharacterData(data)).toThrow('Ability score DEX must be a number');
    });
  });

  describe('calculateStats', () => {
    // HP calculation tests
    test('should calculate HP correctly for Fighter (d10 hit die)', () => {
      const stats = calculateStats('Human', 'Fighter', validAbilityScores, 1);
      // Human gets +1 to all (CON 13 + 1 = 14 = +2 mod)
      // Fighter d10 = 10 + 2 = 12 HP
      expect(stats.hp).toBe(12);
    });

    test('should calculate HP correctly for Barbarian (d12 hit die)', () => {
      const stats = calculateStats('Human', 'Barbarian', validAbilityScores, 1);
      // Human gets +1 to all (CON 13 + 1 = 14 = +2 mod)
      // Barbarian d12 = 12 + 2 = 14 HP
      expect(stats.hp).toBe(14);
    });

    test('should calculate HP correctly for Wizard (d6 hit die)', () => {
      const stats = calculateStats('Human', 'Wizard', validAbilityScores, 1);
      // Human gets +1 to all (CON 13 + 1 = 14 = +2 mod)
      // Wizard d6 = 6 + 2 = 8 HP
      expect(stats.hp).toBe(8);
    });

    test('should calculate HP with racial CON bonus (Dwarf)', () => {
      const stats = calculateStats('Dwarf', 'Fighter', validAbilityScores, 1);
      // Dwarf gets +2 CON (13 + 2 = 15, mod +2)
      // Fighter d10 = 10 + 2 = 12 HP
      expect(stats.hp).toBe(12);
    });

    test('should calculate minimum 1 HP even with negative CON modifier', () => {
      const lowConScores: AbilityScores = {
        STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8
      };
      const stats = calculateStats('Human', 'Wizard', lowConScores, 1);
      // Wizard d6 = 6 + (-1 CON mod) = 5 HP (minimum is 1, but 5 > 1)
      expect(stats.hp).toBeGreaterThanOrEqual(1);
    });

    // AC calculation tests
    test('should calculate AC correctly with no armor', () => {
      const stats = calculateStats('Human', 'Wizard', validAbilityScores, 1);
      // Human gets +1 to all (DEX 14 + 1 = 15 = +2 mod)
      // AC = 10 + 2 = 12
      expect(stats.ac).toBe(12);
    });

    test('should calculate AC with racial DEX bonus (Elf)', () => {
      const stats = calculateStats('Elf', 'Rogue', validAbilityScores, 1);
      // Elf gets +2 DEX (14 + 2 = 16, mod +3)
      // AC = 10 + 3 = 13
      expect(stats.ac).toBe(13);
    });

    test('should calculate AC with high DEX score', () => {
      const highDexScores: AbilityScores = {
        STR: 8, DEX: 15, CON: 8, INT: 8, WIS: 8, CHA: 8
      };
      const stats = calculateStats('Human', 'Rogue', highDexScores, 1);
      // Human gets +1 to all (DEX 15 + 1 = 16 = +3 mod)
      // AC = 10 + 3 = 13
      expect(stats.ac).toBe(13);
    });

    // Ability score modifier tests
    test('should apply racial ability bonuses correctly (Dwarf)', () => {
      const stats = calculateStats('Dwarf', 'Fighter', validAbilityScores, 1);
      // Dwarf gets +2 CON
      expect(stats.finalScores.CON).toBe(15); // 13 + 2
      expect(stats.finalScores.STR).toBe(15); // unchanged
    });

    test('should apply racial ability bonuses correctly (Elf)', () => {
      const stats = calculateStats('Elf', 'Wizard', validAbilityScores, 1);
      // Elf gets +2 DEX
      expect(stats.finalScores.DEX).toBe(16); // 14 + 2
      expect(stats.finalScores.INT).toBe(12); // unchanged
    });

    test('should calculate ability modifiers correctly', () => {
      const stats = calculateStats('Human', 'Fighter', validAbilityScores, 1);
      // Human gets +1 to all ability scores
      expect(stats.modifiers.STR).toBe(3); // 15 + 1 = 16 -> +3
      expect(stats.modifiers.DEX).toBe(2); // 14 + 1 = 15 -> +2
      expect(stats.modifiers.CON).toBe(2); // 13 + 1 = 14 -> +2
      expect(stats.modifiers.INT).toBe(1); // 12 + 1 = 13 -> +1
      expect(stats.modifiers.WIS).toBe(0); // 10 + 1 = 11 -> +0
      expect(stats.modifiers.CHA).toBe(-1); // 8 + 1 = 9 -> -1
    });

    // Proficiency bonus tests
    test('should calculate proficiency bonus +2 at level 1', () => {
      const stats = calculateStats('Human', 'Fighter', validAbilityScores, 1);
      expect(stats.proficiencyBonus).toBe(2);
    });

    test('should calculate proficiency bonus +3 at level 5', () => {
      const stats = calculateStats('Human', 'Fighter', validAbilityScores, 5);
      expect(stats.proficiencyBonus).toBe(3);
    });

    test('should calculate proficiency bonus +6 at level 20', () => {
      const stats = calculateStats('Human', 'Fighter', validAbilityScores, 20);
      expect(stats.proficiencyBonus).toBe(6);
    });

    // Spell slots tests
    test('should give no spell slots to non-spellcaster (Fighter)', () => {
      const stats = calculateStats('Human', 'Fighter', validAbilityScores, 1);
      expect(stats.spellSlots).toEqual({});
    });

    test('should give 2 level 1 spell slots to full caster (Wizard)', () => {
      const stats = calculateStats('Human', 'Wizard', validAbilityScores, 1);
      expect(stats.spellSlots).toEqual({ '1': 2 });
    });

    test('should give 1 level 1 spell slot to Warlock', () => {
      const stats = calculateStats('Human', 'Warlock', validAbilityScores, 1);
      expect(stats.spellSlots).toEqual({ '1': 1 });
    });

    test('should give no spell slots to half-caster at level 1 (Paladin)', () => {
      const stats = calculateStats('Human', 'Paladin', validAbilityScores, 1);
      expect(stats.spellSlots).toEqual({});
    });

    test('should give spell slots to half-caster at level 2 (Paladin)', () => {
      const stats = calculateStats('Human', 'Paladin', validAbilityScores, 2);
      expect(stats.spellSlots).toEqual({ '1': 2 });
    });

    test('should calculate correct spell slots for level 3 Wizard', () => {
      const stats = calculateStats('Human', 'Wizard', validAbilityScores, 3);
      expect(stats.spellSlots).toEqual({ '1': 4, '2': 2 });
    });

    // Hit die tests
    test('should return correct hit die for each class', () => {
      expect(calculateStats('Human', 'Barbarian', validAbilityScores, 1).hitDie).toBe(12);
      expect(calculateStats('Human', 'Fighter', validAbilityScores, 1).hitDie).toBe(10);
      expect(calculateStats('Human', 'Bard', validAbilityScores, 1).hitDie).toBe(8);
      expect(calculateStats('Human', 'Wizard', validAbilityScores, 1).hitDie).toBe(6);
    });
  });

  describe('generateCharacterDefaults', () => {
    test('should generate defaults for Fighter', () => {
      const defaults = generateCharacterDefaults('Human', 'Fighter');
      expect(defaults.speed).toBe(30); // Human speed
      expect(defaults.startingLevel).toBe(1);
      expect(defaults.campaignSeed).toBe('nuaibria-shared-world-v1');
      expect(defaults.startingEquipment.length).toBeGreaterThan(0);
      expect(defaults.startingGold).toBe(125); // Fighter starting gold
    });

    test('should set tutorial state for Cleric (needs subclass at level 1)', () => {
      const defaults = generateCharacterDefaults('Human', 'Cleric');
      expect(defaults.tutorialState).toBe('needs_subclass');
    });

    test('should set tutorial state for Warlock (needs subclass at level 1)', () => {
      const defaults = generateCharacterDefaults('Human', 'Warlock');
      expect(defaults.tutorialState).toBe('needs_subclass');
    });

    test('should not set tutorial state for Fighter', () => {
      const defaults = generateCharacterDefaults('Human', 'Fighter');
      expect(defaults.tutorialState).toBeUndefined();
    });

    test('should include racial languages (Dwarf)', () => {
      const defaults = generateCharacterDefaults('Dwarf', 'Fighter');
      expect(defaults.racialLanguages).toContain('Common');
      expect(defaults.racialLanguages).toContain('Dwarvish');
    });

    test('should include racial proficiencies (Dwarf)', () => {
      const defaults = generateCharacterDefaults('Dwarf', 'Fighter');
      expect(defaults.racialProficiencies.length).toBeGreaterThan(0);
    });

    test('should include darkvision for Dwarf', () => {
      const defaults = generateCharacterDefaults('Dwarf', 'Fighter');
      expect(defaults.darkvisionRange).toBe(60);
    });

    test('should not include darkvision for Human', () => {
      const defaults = generateCharacterDefaults('Human', 'Fighter');
      expect(defaults.darkvisionRange).toBeUndefined();
    });

    test('should have correct speed for Dwarf (25 ft)', () => {
      const defaults = generateCharacterDefaults('Dwarf', 'Fighter');
      expect(defaults.speed).toBe(25);
    });

    test('should have correct starting gold for different classes', () => {
      expect(generateCharacterDefaults('Human', 'Barbarian').startingGold).toBe(50);
      expect(generateCharacterDefaults('Human', 'Bard').startingGold).toBe(125);
      expect(generateCharacterDefaults('Human', 'Monk').startingGold).toBe(13);
      expect(generateCharacterDefaults('Human', 'Wizard').startingGold).toBe(100);
    });
  });

  describe('createCharacterRecord', () => {
    const userId = 'test-user-id-123';

    test('should create complete character record', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      expect(record.user_id).toBe(userId);
      expect(record.name).toBe('Test Character');
      expect(record.race).toBe('Human');
      expect(record.class).toBe('Fighter');
      expect(record.background).toBe('Soldier');
      expect(record.level).toBe(1);
      expect(record.xp).toBe(0);
      expect(record.hp_current).toBe(record.hp_max);
      expect(record.temporary_hp).toBe(0);
    });

    test('should map full alignment name to abbreviation', () => {
      const record = createCharacterRecord(validCharacterData, userId);
      expect(record.alignment).toBe('LG'); // Lawful Good -> LG
    });

    test('should handle alignment abbreviations', () => {
      const data = { ...validCharacterData, alignment: 'N' };
      const record = createCharacterRecord(data, userId);
      expect(record.alignment).toBe('N');
    });

    test('should apply racial bonuses to final ability scores', () => {
      const dwarfData = { ...validCharacterData, race: 'Dwarf' };
      const record = createCharacterRecord(dwarfData, userId);

      // Dwarf gets +2 CON
      expect(record.ability_scores.CON).toBe(15); // 13 + 2
    });

    test('should use custom starting position if provided', () => {
      const customPosition = { x: 100, y: 200 };
      const record = createCharacterRecord(validCharacterData, userId, customPosition);

      expect(record.position_x).toBe(100);
      expect(record.position_y).toBe(200);
    });

    test('should use default starting position if not provided', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      // Default is 500, 500
      expect(record.position_x).toBe(500);
      expect(record.position_y).toBe(500);
    });

    test('should initialize world date correctly', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      expect(record.world_date_day).toBe(1);
      expect(record.world_date_month).toBe(1);
      expect(record.world_date_year).toBe(0);
      expect(record.game_time_minutes).toBe(0);
    });

    test('should set spell slots for spellcasters', () => {
      const wizardData = { ...validCharacterData, class: 'Wizard' };
      const record = createCharacterRecord(wizardData, userId);

      expect(record.spell_slots).toEqual({ '1': 2 });
    });

    test('should set empty spell slots for non-spellcasters', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      expect(record.spell_slots).toEqual({});
    });

    test('should serialize backstory object to JSON', () => {
      const backstory = { origin: 'Test origin', motivation: 'Test motivation' };
      const data = { ...validCharacterData, backstory };
      const record = createCharacterRecord(data, userId);

      expect(record.backstory).toBe(JSON.stringify(backstory));
    });

    test('should handle null backstory', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      expect(record.backstory).toBeNull();
    });

    test('should serialize skills object to JSON', () => {
      const skills = { Athletics: true, Perception: true };
      const data = { ...validCharacterData, skills };
      const record = createCharacterRecord(data, userId);

      expect(record.skills).toBe(JSON.stringify(skills));
    });

    test('should set portrait URL if provided', () => {
      const data = { ...validCharacterData, portraitUrl: 'https://example.com/portrait.jpg' };
      const record = createCharacterRecord(data, userId);

      expect(record.portrait_url).toBe('https://example.com/portrait.jpg');
    });

    test('should throw validation errors for invalid data', () => {
      const invalidData = { ...validCharacterData, name: '' };

      expect(() => createCharacterRecord(invalidData, userId)).toThrow();
    });

    test('should set correct hit dice for character class', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      // Fighter has d10 hit die
      expect(record.hit_dice).toEqual({ '10': 1 });
    });

    test('should set campaign seed correctly', () => {
      const record = createCharacterRecord(validCharacterData, userId);

      expect(record.campaign_seed).toBe('nuaibria-shared-world-v1');
    });
  });

  describe('getCharacterMetadata', () => {
    test('should return metadata with racial information', () => {
      const metadata = getCharacterMetadata(
        'Dwarf',
        'Fighter',
        validAbilityScores,
        { ...validAbilityScores, CON: 15 } // After +2 CON bonus
      );

      expect(metadata.racialLanguages).toContain('Common');
      expect(metadata.racialLanguages).toContain('Dwarvish');
      expect(metadata.darkvisionRange).toBe(60);
      expect(metadata.racialProficiencies.length).toBeGreaterThan(0);
    });

    test('should calculate applied bonuses correctly', () => {
      const baseScores = validAbilityScores;
      const finalScores = { ...validAbilityScores, CON: 15 }; // +2 CON

      const metadata = getCharacterMetadata('Dwarf', 'Fighter', baseScores, finalScores);

      expect(metadata.appliedBonuses.CON).toBe(2);
      expect(metadata.appliedBonuses.STR).toBe(0);
    });

    test('should include both base and final scores', () => {
      const baseScores = validAbilityScores;
      const finalScores = { ...validAbilityScores, CON: 15 };

      const metadata = getCharacterMetadata('Dwarf', 'Fighter', baseScores, finalScores);

      expect(metadata.baseScores).toEqual(baseScores);
      expect(metadata.finalScores).toEqual(finalScores);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle unknown race gracefully', () => {
      const invalidData = { ...validCharacterData, race: 'UnknownRace' };

      expect(() => createCharacterRecord(invalidData, 'user-id')).toThrow();
    });

    test('should handle extremely long character names', () => {
      const data = { ...validCharacterData, name: 'a'.repeat(101) };

      expect(() => validateCharacterData(data)).toThrow();
    });

    test('should validate all required ability scores are present', () => {
      const incompleteScores = { STR: 10, DEX: 10, CON: 10 } as any;
      const data = { ...validCharacterData, abilityScores: incompleteScores };

      expect(() => validateCharacterData(data)).toThrow();
    });
  });
});
