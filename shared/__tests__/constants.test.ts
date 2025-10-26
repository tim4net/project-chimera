/**
 * Tests for D&D 5e Data Constants
 *
 * Validates structure, completeness, and helper functions
 * for all game data constants.
 */

import {
  RACES,
  Race,
  getRaceByName,
  getAllRaceNames,
  CLASSES,
  CharacterClass,
  getClassByName,
  getAllClassNames,
  isSpellcaster,
  ALIGNMENTS,
  Alignment,
  getAlignmentByCode,
  getAlignmentByName,
  getAllAlignmentCodes,
  getAllAlignmentNames,
  isGoodAligned,
  isEvilAligned,
  isLawful,
  isChaotic,
  BACKGROUNDS,
  Background,
  getBackgroundByName,
  getAllBackgroundNames,
  backgroundGrantsSkill,
  SKILLS,
  Skill,
  getSkillByName,
  getAllSkillNames,
  getSkillsByAbility,
  calculateSkillModifier
} from '../constants';

describe('Races Constants', () => {
  test('should have exactly 10 races', () => {
    expect(RACES).toHaveLength(10);
  });

  test('all races should have required fields', () => {
    RACES.forEach(race => {
      expect(race).toHaveProperty('name');
      expect(race).toHaveProperty('description');
      expect(race).toHaveProperty('abilityBonuses');
      expect(race).toHaveProperty('speed');
      expect(race).toHaveProperty('languages');
      expect(race).toHaveProperty('traits');

      expect(typeof race.name).toBe('string');
      expect(typeof race.description).toBe('string');
      expect(typeof race.abilityBonuses).toBe('object');
      expect(typeof race.speed).toBe('number');
      expect(Array.isArray(race.languages)).toBe(true);
      expect(Array.isArray(race.traits)).toBe(true);
    });
  });

  test('all races should have valid speed values', () => {
    RACES.forEach(race => {
      expect(race.speed).toBeGreaterThanOrEqual(25);
      expect(race.speed).toBeLessThanOrEqual(35);
    });
  });

  test('getRaceByName should find races case-insensitively', () => {
    expect(getRaceByName('elf')).toBeDefined();
    expect(getRaceByName('ELF')).toBeDefined();
    expect(getRaceByName('Elf')).toBeDefined();
    expect(getRaceByName('Dragonborn')?.name).toBe('Dragonborn');
  });

  test('getRaceByName should return undefined for invalid race', () => {
    expect(getRaceByName('Unicorn')).toBeUndefined();
  });

  test('getAllRaceNames should return all race names', () => {
    const names = getAllRaceNames();
    expect(names).toHaveLength(10);
    expect(names).toContain('Elf');
    expect(names).toContain('Dwarf');
    expect(names).toContain('Human');
  });

  test('all races should have at least one ability bonus', () => {
    RACES.forEach(race => {
      const bonusCount = Object.keys(race.abilityBonuses).length;
      expect(bonusCount).toBeGreaterThan(0);
    });
  });

  test('all races should have at least one language', () => {
    RACES.forEach(race => {
      expect(race.languages.length).toBeGreaterThan(0);
    });
  });
});

describe('Classes Constants', () => {
  test('should have exactly 12 classes', () => {
    expect(CLASSES).toHaveLength(12);
  });

  test('all classes should have required fields', () => {
    CLASSES.forEach(cls => {
      expect(cls).toHaveProperty('name');
      expect(cls).toHaveProperty('description');
      expect(cls).toHaveProperty('hitDie');
      expect(cls).toHaveProperty('spellcasting');
      expect(cls).toHaveProperty('skills');
      expect(cls).toHaveProperty('skillCount');

      expect(typeof cls.name).toBe('string');
      expect(typeof cls.description).toBe('string');
      expect(typeof cls.hitDie).toBe('number');
      expect(typeof cls.spellcasting).toBe('object');
      expect(Array.isArray(cls.skills)).toBe(true);
      expect(typeof cls.skillCount).toBe('number');
    });
  });

  test('all classes should have valid hit dice', () => {
    CLASSES.forEach(cls => {
      expect([6, 8, 10, 12]).toContain(cls.hitDie);
    });
  });

  test('all spellcasting classes should have spell slots', () => {
    CLASSES.forEach(cls => {
      if (cls.spellcasting.enabled) {
        expect(cls.spellSlots).toBeDefined();
        expect(cls.spellcasting.ability).toBeDefined();
        expect(['INT', 'WIS', 'CHA']).toContain(cls.spellcasting.ability);
      }
    });
  });

  test('getClassByName should find classes case-insensitively', () => {
    expect(getClassByName('wizard')).toBeDefined();
    expect(getClassByName('WIZARD')).toBeDefined();
    expect(getClassByName('Wizard')).toBeDefined();
    expect(getClassByName('Fighter')?.name).toBe('Fighter');
  });

  test('getClassByName should return undefined for invalid class', () => {
    expect(getClassByName('Jester')).toBeUndefined();
  });

  test('getAllClassNames should return all class names', () => {
    const names = getAllClassNames();
    expect(names).toHaveLength(12);
    expect(names).toContain('Wizard');
    expect(names).toContain('Fighter');
    expect(names).toContain('Cleric');
  });

  test('isSpellcaster should correctly identify spellcasting classes', () => {
    expect(isSpellcaster('Wizard')).toBe(true);
    expect(isSpellcaster('Cleric')).toBe(true);
    expect(isSpellcaster('Fighter')).toBe(false);
    expect(isSpellcaster('Barbarian')).toBe(false);
  });

  test('all classes should have appropriate skill counts', () => {
    CLASSES.forEach(cls => {
      expect(cls.skillCount).toBeGreaterThan(0);
      expect(cls.skillCount).toBeLessThanOrEqual(4);
      expect(cls.skills.length).toBeGreaterThanOrEqual(cls.skillCount);
    });
  });

  test('Bard should have access to all skills', () => {
    const bard = getClassByName('Bard');
    expect(bard?.skills.length).toBe(18);
  });
});

describe('Alignments Constants', () => {
  test('should have exactly 9 alignments', () => {
    expect(ALIGNMENTS).toHaveLength(9);
  });

  test('all alignments should have required fields', () => {
    ALIGNMENTS.forEach(alignment => {
      expect(alignment).toHaveProperty('code');
      expect(alignment).toHaveProperty('name');
      expect(alignment).toHaveProperty('description');
      expect(alignment).toHaveProperty('philosophy');
      expect(alignment).toHaveProperty('example');

      expect(typeof alignment.code).toBe('string');
      expect(typeof alignment.name).toBe('string');
      expect(typeof alignment.description).toBe('string');
      expect(typeof alignment.philosophy).toBe('string');
      expect(typeof alignment.example).toBe('string');
    });
  });

  test('all alignment codes should be valid two-letter codes', () => {
    const validCodes = ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'];
    ALIGNMENTS.forEach(alignment => {
      expect(validCodes).toContain(alignment.code);
    });
  });

  test('getAlignmentByCode should find alignments case-insensitively', () => {
    expect(getAlignmentByCode('lg')).toBeDefined();
    expect(getAlignmentByCode('LG')).toBeDefined();
    expect(getAlignmentByCode('Lg')).toBeDefined();
    expect(getAlignmentByCode('CE')?.name).toBe('Chaotic Evil');
  });

  test('getAlignmentByName should find alignments case-insensitively', () => {
    expect(getAlignmentByName('lawful good')).toBeDefined();
    expect(getAlignmentByName('LAWFUL GOOD')).toBeDefined();
    expect(getAlignmentByName('Chaotic Evil')?.code).toBe('CE');
  });

  test('getAllAlignmentCodes should return all codes', () => {
    const codes = getAllAlignmentCodes();
    expect(codes).toHaveLength(9);
    expect(codes).toContain('LG');
    expect(codes).toContain('N');
    expect(codes).toContain('CE');
  });

  test('getAllAlignmentNames should return all names', () => {
    const names = getAllAlignmentNames();
    expect(names).toHaveLength(9);
    expect(names).toContain('Lawful Good');
    expect(names).toContain('True Neutral');
    expect(names).toContain('Chaotic Evil');
  });

  test('isGoodAligned should correctly identify good alignments', () => {
    expect(isGoodAligned('LG')).toBe(true);
    expect(isGoodAligned('NG')).toBe(true);
    expect(isGoodAligned('CG')).toBe(true);
    expect(isGoodAligned('N')).toBe(false);
    expect(isGoodAligned('LE')).toBe(false);
  });

  test('isEvilAligned should correctly identify evil alignments', () => {
    expect(isEvilAligned('LE')).toBe(true);
    expect(isEvilAligned('NE')).toBe(true);
    expect(isEvilAligned('CE')).toBe(true);
    expect(isEvilAligned('N')).toBe(false);
    expect(isEvilAligned('LG')).toBe(false);
  });

  test('isLawful should correctly identify lawful alignments', () => {
    expect(isLawful('LG')).toBe(true);
    expect(isLawful('LN')).toBe(true);
    expect(isLawful('LE')).toBe(true);
    expect(isLawful('N')).toBe(false);
    expect(isLawful('CG')).toBe(false);
  });

  test('isChaotic should correctly identify chaotic alignments', () => {
    expect(isChaotic('CG')).toBe(true);
    expect(isChaotic('CN')).toBe(true);
    expect(isChaotic('CE')).toBe(true);
    expect(isChaotic('N')).toBe(false);
    expect(isChaotic('LG')).toBe(false);
  });
});

describe('Backgrounds Constants', () => {
  test('should have exactly 6 backgrounds', () => {
    expect(BACKGROUNDS).toHaveLength(6);
  });

  test('all backgrounds should have required fields', () => {
    BACKGROUNDS.forEach(bg => {
      expect(bg).toHaveProperty('name');
      expect(bg).toHaveProperty('description');
      expect(bg).toHaveProperty('skillBonuses');
      expect(bg).toHaveProperty('otherBenefits');
      expect(bg).toHaveProperty('feature');

      expect(typeof bg.name).toBe('string');
      expect(typeof bg.description).toBe('string');
      expect(Array.isArray(bg.skillBonuses)).toBe(true);
      expect(Array.isArray(bg.otherBenefits)).toBe(true);
      expect(typeof bg.feature).toBe('object');
      expect(bg.feature).toHaveProperty('name');
      expect(bg.feature).toHaveProperty('description');
    });
  });

  test('all backgrounds should grant exactly 2 skill proficiencies', () => {
    BACKGROUNDS.forEach(bg => {
      expect(bg.skillBonuses).toHaveLength(2);
    });
  });

  test('getBackgroundByName should find backgrounds case-insensitively', () => {
    expect(getBackgroundByName('acolyte')).toBeDefined();
    expect(getBackgroundByName('ACOLYTE')).toBeDefined();
    expect(getBackgroundByName('Acolyte')).toBeDefined();
    expect(getBackgroundByName('Soldier')?.name).toBe('Soldier');
  });

  test('getBackgroundByName should return undefined for invalid background', () => {
    expect(getBackgroundByName('Space Pirate')).toBeUndefined();
  });

  test('getAllBackgroundNames should return all background names', () => {
    const names = getAllBackgroundNames();
    expect(names).toHaveLength(6);
    expect(names).toContain('Acolyte');
    expect(names).toContain('Criminal');
    expect(names).toContain('Soldier');
  });

  test('backgroundGrantsSkill should correctly identify granted skills', () => {
    expect(backgroundGrantsSkill('Acolyte', 'Insight')).toBe(true);
    expect(backgroundGrantsSkill('Acolyte', 'Religion')).toBe(true);
    expect(backgroundGrantsSkill('Acolyte', 'Stealth')).toBe(false);
    expect(backgroundGrantsSkill('Criminal', 'Stealth')).toBe(true);
  });

  test('all backgrounds should have a unique feature', () => {
    const featureNames = BACKGROUNDS.map(bg => bg.feature.name);
    const uniqueFeatures = new Set(featureNames);
    expect(uniqueFeatures.size).toBe(BACKGROUNDS.length);
  });
});

describe('Skills Constants', () => {
  test('should have exactly 18 skills', () => {
    expect(SKILLS).toHaveLength(18);
  });

  test('all skills should have required fields', () => {
    SKILLS.forEach(skill => {
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('description');
      expect(skill).toHaveProperty('ability');
      expect(skill).toHaveProperty('examples');

      expect(typeof skill.name).toBe('string');
      expect(typeof skill.description).toBe('string');
      expect(typeof skill.ability).toBe('string');
      expect(Array.isArray(skill.examples)).toBe(true);
    });
  });

  test('all skills should have valid ability scores', () => {
    const validAbilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    SKILLS.forEach(skill => {
      expect(validAbilities).toContain(skill.ability);
    });
  });

  test('getSkillByName should find skills case-insensitively', () => {
    expect(getSkillByName('perception')).toBeDefined();
    expect(getSkillByName('PERCEPTION')).toBeDefined();
    expect(getSkillByName('Perception')).toBeDefined();
    expect(getSkillByName('Stealth')?.ability).toBe('DEX');
  });

  test('getSkillByName should return undefined for invalid skill', () => {
    expect(getSkillByName('Flying')).toBeUndefined();
  });

  test('getAllSkillNames should return all skill names', () => {
    const names = getAllSkillNames();
    expect(names).toHaveLength(18);
    expect(names).toContain('Perception');
    expect(names).toContain('Stealth');
    expect(names).toContain('Arcana');
  });

  test('getSkillsByAbility should return correct skills', () => {
    const dexSkills = getSkillsByAbility('DEX');
    expect(dexSkills.length).toBeGreaterThan(0);
    dexSkills.forEach(skill => {
      expect(skill.ability).toBe('DEX');
    });

    const wisSkills = getSkillsByAbility('WIS');
    expect(wisSkills.length).toBeGreaterThan(0);
    wisSkills.forEach(skill => {
      expect(skill.ability).toBe('WIS');
    });
  });

  test('each ability should have at least one associated skill', () => {
    const abilities: Array<'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'> = ['STR', 'DEX', 'INT', 'WIS', 'CHA'];
    abilities.forEach(ability => {
      const skills = getSkillsByAbility(ability);
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  test('calculateSkillModifier should calculate correctly without proficiency', () => {
    // Ability score 14 = +2 modifier, no proficiency
    expect(calculateSkillModifier(14, 2, false)).toBe(2);
    // Ability score 10 = +0 modifier, no proficiency
    expect(calculateSkillModifier(10, 2, false)).toBe(0);
  });

  test('calculateSkillModifier should calculate correctly with proficiency', () => {
    // Ability score 14 = +2 modifier, +2 proficiency
    expect(calculateSkillModifier(14, 2, true)).toBe(4);
    // Ability score 16 = +3 modifier, +3 proficiency
    expect(calculateSkillModifier(16, 3, true)).toBe(6);
  });

  test('calculateSkillModifier should calculate correctly with expertise', () => {
    // Ability score 14 = +2 modifier, +2 proficiency, expertise (x2)
    expect(calculateSkillModifier(14, 2, true, true)).toBe(6);
    // Ability score 18 = +4 modifier, +4 proficiency, expertise (x2)
    expect(calculateSkillModifier(18, 4, true, true)).toBe(12);
  });

  test('all skills should have at least 2 examples', () => {
    SKILLS.forEach(skill => {
      expect(skill.examples.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Cross-Constant Integration', () => {
  test('all background skills should exist in SKILLS', () => {
    BACKGROUNDS.forEach(bg => {
      bg.skillBonuses.forEach(skillName => {
        const skill = getSkillByName(skillName);
        expect(skill).toBeDefined();
      });
    });
  });

  test('all class skills should exist in SKILLS', () => {
    CLASSES.forEach(cls => {
      cls.skills.forEach(skillName => {
        const skill = getSkillByName(skillName);
        expect(skill).toBeDefined();
      });
    });
  });

  test('all spellcasting abilities should be valid ability scores', () => {
    const validAbilities = ['INT', 'WIS', 'CHA'];
    CLASSES.forEach(cls => {
      if (cls.spellcasting.enabled && cls.spellcasting.ability) {
        expect(validAbilities).toContain(cls.spellcasting.ability);
      }
    });
  });

  test('all race ability bonuses should be valid ability scores', () => {
    const validAbilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    RACES.forEach(race => {
      Object.keys(race.abilityBonuses).forEach(ability => {
        expect(validAbilities).toContain(ability);
      });
    });
  });
});
