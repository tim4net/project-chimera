/**
 * @fileoverview Unit tests for character validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  identitySchema,
  coreAttributesSchema,
  alignmentSchema,
  abilityScoresSchema,
  skillsSchema,
  equipmentSchema,
  characterDraftSchema,
} from '../../src/validation/character';

describe('character - identitySchema', () => {
  it('should validate valid identity data', () => {
    const data = {
      name: 'Thorin Oakenshield',
      age: 150,
      description: 'A brave dwarf warrior',
      avatarUrl: 'https://example.com/avatar.png',
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate minimal identity data', () => {
    const data = {
      name: 'Jo',
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject name that is too short', () => {
    const data = {
      name: 'A',
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject name that is too long', () => {
    const data = {
      name: 'A'.repeat(51),
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject name with invalid characters', () => {
    const data = {
      name: 'Test@123',
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept name with hyphens and apostrophes', () => {
    const data = {
      name: "O'Brien-Smith",
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject negative age', () => {
    const data = {
      name: 'Test',
      age: -5,
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject age over 1000', () => {
    const data = {
      name: 'Test',
      age: 1001,
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid avatar URL', () => {
    const data = {
      name: 'Test',
      avatarUrl: 'not-a-url',
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should transform empty avatar URL to undefined', () => {
    const data = {
      name: 'Test',
      avatarUrl: '',
    };
    const result = identitySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatarUrl).toBeUndefined();
    }
  });
});

describe('character - coreAttributesSchema', () => {
  it('should validate valid core attributes', () => {
    const data = {
      race: 'Dwarf',
      class: 'Fighter',
      background: 'Soldier',
    };
    const result = coreAttributesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid race', () => {
    const data = {
      race: 'Klingon',
      class: 'Fighter',
      background: 'Soldier',
    };
    const result = coreAttributesSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid class', () => {
    const data = {
      race: 'Dwarf',
      class: 'Jedi',
      background: 'Soldier',
    };
    const result = coreAttributesSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid background', () => {
    const data = {
      race: 'Dwarf',
      class: 'Fighter',
      background: 'Time Traveler',
    };
    const result = coreAttributesSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('character - alignmentSchema', () => {
  it('should validate valid alignment data', () => {
    const data = {
      alignment: 'Lawful Good',
      personalityTraits: ['Brave', 'Loyal'],
      ideals: ['Justice'],
      bonds: ['My family'],
      flaws: ['Stubborn'],
    };
    const result = alignmentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid alignment', () => {
    const data = {
      alignment: 'Chaotic Awesome',
      personalityTraits: ['Brave'],
      ideals: ['Justice'],
      bonds: ['My family'],
      flaws: ['Stubborn'],
    };
    const result = alignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept all valid alignments', () => {
    const alignments = [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
    ];

    alignments.forEach(alignment => {
      const data = {
        alignment,
        personalityTraits: ['Test'],
        ideals: ['Test'],
        bonds: ['Test'],
        flaws: ['Test'],
      };
      const result = alignmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('should reject empty personality traits', () => {
    const data = {
      alignment: 'Lawful Good',
      personalityTraits: [],
      ideals: ['Justice'],
      bonds: ['My family'],
      flaws: ['Stubborn'],
    };
    const result = alignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject too many personality traits', () => {
    const data = {
      alignment: 'Lawful Good',
      personalityTraits: ['1', '2', '3', '4', '5'],
      ideals: ['Justice'],
      bonds: ['My family'],
      flaws: ['Stubborn'],
    };
    const result = alignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty ideals', () => {
    const data = {
      alignment: 'Lawful Good',
      personalityTraits: ['Brave'],
      ideals: [],
      bonds: ['My family'],
      flaws: ['Stubborn'],
    };
    const result = alignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject too many ideals', () => {
    const data = {
      alignment: 'Lawful Good',
      personalityTraits: ['Brave'],
      ideals: ['1', '2', '3'],
      bonds: ['My family'],
      flaws: ['Stubborn'],
    };
    const result = alignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('character - abilityScoresSchema', () => {
  it('should validate valid ability scores', () => {
    const data = {
      baseScores: {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
      pointsRemaining: 0,
      finalScores: {
        STR: 17, DEX: 14, CON: 14, INT: 12, WIS: 10, CHA: 8,
      },
    };
    const result = abilityScoresSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject base score below 8', () => {
    const data = {
      baseScores: {
        STR: 7, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
      pointsRemaining: 0,
      finalScores: {
        STR: 9, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
    };
    const result = abilityScoresSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject base score above 15', () => {
    const data = {
      baseScores: {
        STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
      pointsRemaining: 0,
      finalScores: {
        STR: 18, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
    };
    const result = abilityScoresSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject final score above 20', () => {
    const data = {
      baseScores: {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
      pointsRemaining: 0,
      finalScores: {
        STR: 21, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
      },
    };
    const result = abilityScoresSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('character - skillsSchema', () => {
  it('should validate valid skills', () => {
    const data = {
      proficientSkills: ['Athletics', 'Perception', 'Insight', 'Religion'],
      backgroundSkills: ['Insight', 'Religion'],
      classSkills: ['Athletics', 'Perception'],
    };
    const result = skillsSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject too few proficient skills', () => {
    const data = {
      proficientSkills: ['Athletics'],
      backgroundSkills: [],
      classSkills: ['Athletics'],
    };
    const result = skillsSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject too many proficient skills', () => {
    const data = {
      proficientSkills: ['Athletics', 'Acrobatics', 'Arcana', 'Animal Handling', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature'],
      backgroundSkills: [],
      classSkills: [],
    };
    const result = skillsSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid skill names', () => {
    const data = {
      proficientSkills: ['Flying', 'Perception'],
      backgroundSkills: [],
      classSkills: ['Flying', 'Perception'],
    };
    const result = skillsSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('character - equipmentSchema', () => {
  it('should validate valid equipment', () => {
    const data = {
      startingGold: 100,
      selectedEquipment: ['Longsword', 'Shield', 'Chain Mail'],
      weapon: 'Longsword',
      armor: 'Chain Mail',
      tools: ['Smithing Tools'],
    };
    const result = equipmentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject negative gold', () => {
    const data = {
      startingGold: -10,
      selectedEquipment: ['Longsword'],
    };
    const result = equipmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject too much gold', () => {
    const data = {
      startingGold: 1001,
      selectedEquipment: ['Longsword'],
    };
    const result = equipmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty equipment list', () => {
    const data = {
      startingGold: 100,
      selectedEquipment: [],
    };
    const result = equipmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('character - characterDraftSchema', () => {
  it('should validate complete character draft', () => {
    const data = {
      name: 'Thorin Oakenshield',
      age: 150,
      description: 'A brave dwarf warrior',
      race: 'Dwarf',
      class: 'Fighter',
      background: 'Soldier',
      alignment: 'Lawful Good',
      personalityTraits: ['Brave', 'Loyal'],
      ideals: ['Justice'],
      bonds: ['My clan'],
      flaws: ['Stubborn'],
      abilityScores: {
        STR: 17, DEX: 14, CON: 15, INT: 12, WIS: 10, CHA: 8,
      },
      proficientSkills: ['Athletics', 'Intimidation', 'Perception', 'Survival'],
      startingGold: 150,
      equipment: ['Longsword', 'Shield', 'Chain Mail', 'Backpack'],
    };
    const result = characterDraftSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject incomplete character draft', () => {
    const data = {
      name: 'Thorin',
      race: 'Dwarf',
      // Missing class, background, etc.
    };
    const result = characterDraftSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
