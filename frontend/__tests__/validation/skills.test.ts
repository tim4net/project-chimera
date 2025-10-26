/**
 * @fileoverview Unit tests for skill selection validation
 */

import { describe, it, expect } from 'vitest';
import {
  getClassSkillCount,
  getClassSkillOptions,
  getBackgroundSkills,
  validateClassSkills,
  validateBackgroundSkills,
  validateSkillSelection,
  combineSkills,
  canSelectSkill,
  canDeselectSkill,
  getRemainingSkillSlots,
  getAvailableSkills,
} from '../../src/validation/skills';
import type { SkillName } from '../../src/types/wizard';

describe('skills - getClassSkillCount', () => {
  it('should return correct skill counts for each class', () => {
    expect(getClassSkillCount('Barbarian')).toBe(2);
    expect(getClassSkillCount('Bard')).toBe(3);
    expect(getClassSkillCount('Rogue')).toBe(4);
    expect(getClassSkillCount('Fighter')).toBe(2);
    expect(getClassSkillCount('Wizard')).toBe(2);
  });
});

describe('skills - getClassSkillOptions', () => {
  it('should return skill options for Barbarian', () => {
    const skills = getClassSkillOptions('Barbarian');
    expect(skills).toContain('Athletics');
    expect(skills).toContain('Survival');
    expect(skills).not.toContain('Arcana');
  });

  it('should return all skills for Bard', () => {
    const skills = getClassSkillOptions('Bard');
    expect(skills.length).toBeGreaterThan(15); // Bards can choose any skill
    expect(skills).toContain('Acrobatics');
    expect(skills).toContain('Arcana');
    expect(skills).toContain('Stealth');
  });

  it('should return skill options for Rogue', () => {
    const skills = getClassSkillOptions('Rogue');
    expect(skills).toContain('Stealth');
    expect(skills).toContain('Sleight of Hand');
    expect(skills).toContain('Deception');
  });
});

describe('skills - getBackgroundSkills', () => {
  it('should return correct skills for Acolyte background', () => {
    const skills = getBackgroundSkills('Acolyte');
    expect(skills).toEqual(['Insight', 'Religion']);
  });

  it('should return correct skills for Criminal background', () => {
    const skills = getBackgroundSkills('Criminal');
    expect(skills).toEqual(['Deception', 'Stealth']);
  });

  it('should return correct skills for Sage background', () => {
    const skills = getBackgroundSkills('Sage');
    expect(skills).toEqual(['Arcana', 'History']);
  });
});

describe('skills - validateClassSkills', () => {
  it('should validate correct number of skills for Fighter', () => {
    const skills: SkillName[] = ['Athletics', 'Perception'];
    const result = validateClassSkills(skills, 'Fighter');
    expect(result.isValid).toBe(true);
    expect(result.selectedCount).toBe(2);
    expect(result.maxAllowed).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject too few skills', () => {
    const skills: SkillName[] = ['Athletics'];
    const result = validateClassSkills(skills, 'Fighter');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Must select 2 skills'))).toBe(true);
    expect(result.missingCount).toBe(1);
  });

  it('should reject too many skills', () => {
    const skills: SkillName[] = ['Athletics', 'Perception', 'Survival'];
    const result = validateClassSkills(skills, 'Fighter');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Too many skills'))).toBe(true);
  });

  it('should reject invalid skills for class', () => {
    const skills: SkillName[] = ['Athletics', 'Arcana']; // Arcana not available to Fighter
    const result = validateClassSkills(skills, 'Fighter');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Arcana'))).toBe(true);
  });

  it('should reject duplicate skills', () => {
    const skills: SkillName[] = ['Athletics', 'Athletics'];
    const result = validateClassSkills(skills, 'Fighter');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  it('should validate correct number of skills for Rogue (4 skills)', () => {
    const skills: SkillName[] = ['Stealth', 'Sleight of Hand', 'Deception', 'Investigation'];
    const result = validateClassSkills(skills, 'Rogue');
    expect(result.isValid).toBe(true);
    expect(result.selectedCount).toBe(4);
  });

  it('should validate correct number of skills for Bard (3 skills)', () => {
    const skills: SkillName[] = ['Acrobatics', 'Arcana', 'Persuasion'];
    const result = validateClassSkills(skills, 'Bard');
    expect(result.isValid).toBe(true);
    expect(result.selectedCount).toBe(3);
  });
});

describe('skills - validateBackgroundSkills', () => {
  it('should validate correct background skills', () => {
    const skills: SkillName[] = ['Insight', 'Religion'];
    const result = validateBackgroundSkills(skills, 'Acolyte');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing background skills', () => {
    const skills: SkillName[] = ['Insight']; // Missing Religion
    const result = validateBackgroundSkills(skills, 'Acolyte');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Religion'))).toBe(true);
  });

  it('should reject unexpected background skills', () => {
    const skills: SkillName[] = ['Insight', 'Religion', 'Arcana']; // Arcana not from Acolyte
    const result = validateBackgroundSkills(skills, 'Acolyte');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Arcana'))).toBe(true);
  });
});

describe('skills - validateSkillSelection', () => {
  it('should validate complete valid skill selection', () => {
    const classSkills: SkillName[] = ['Athletics', 'Perception'];
    const backgroundSkills: SkillName[] = ['Insight', 'Religion'];
    const result = validateSkillSelection(classSkills, backgroundSkills, 'Fighter', 'Acolyte');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject overlapping skills', () => {
    const classSkills: SkillName[] = ['Athletics', 'Insight']; // Insight also from background
    const backgroundSkills: SkillName[] = ['Insight', 'Religion'];
    const result = validateSkillSelection(classSkills, backgroundSkills, 'Fighter', 'Acolyte');
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('overlap'))).toBe(true);
  });

  it('should reject invalid class skill count', () => {
    const classSkills: SkillName[] = ['Athletics']; // Only 1 skill, need 2
    const backgroundSkills: SkillName[] = ['Deception', 'Stealth'];
    const result = validateSkillSelection(classSkills, backgroundSkills, 'Rogue', 'Criminal');
    expect(result.isValid).toBe(false);
  });
});

describe('skills - combineSkills', () => {
  it('should combine skills without duplicates', () => {
    const classSkills: SkillName[] = ['Athletics', 'Perception'];
    const backgroundSkills: SkillName[] = ['Insight', 'Religion'];
    const result = combineSkills(classSkills, backgroundSkills);
    expect(result).toHaveLength(4);
    expect(result).toContain('Athletics');
    expect(result).toContain('Perception');
    expect(result).toContain('Insight');
    expect(result).toContain('Religion');
  });

  it('should remove duplicates when combining', () => {
    const classSkills: SkillName[] = ['Athletics', 'Insight'];
    const backgroundSkills: SkillName[] = ['Insight', 'Religion'];
    const result = combineSkills(classSkills, backgroundSkills);
    expect(result).toHaveLength(3);
    expect(result.filter(s => s === 'Insight')).toHaveLength(1);
  });
});

describe('skills - canSelectSkill', () => {
  it('should allow selecting valid skill', () => {
    const current: SkillName[] = ['Athletics'];
    const result = canSelectSkill('Perception', current, 'Fighter');
    expect(result).toBe(true);
  });

  it('should prevent selecting already selected skill', () => {
    const current: SkillName[] = ['Athletics', 'Perception'];
    const result = canSelectSkill('Athletics', current, 'Fighter');
    expect(result).toBe(false);
  });

  it('should prevent selecting skill not available to class', () => {
    const current: SkillName[] = ['Athletics'];
    const result = canSelectSkill('Arcana', current, 'Fighter');
    expect(result).toBe(false);
  });

  it('should prevent selecting when limit reached', () => {
    const current: SkillName[] = ['Athletics', 'Perception'];
    const result = canSelectSkill('Survival', current, 'Fighter');
    expect(result).toBe(false);
  });
});

describe('skills - canDeselectSkill', () => {
  it('should allow deselecting selected skill', () => {
    const current: SkillName[] = ['Athletics', 'Perception'];
    const result = canDeselectSkill('Athletics', current);
    expect(result).toBe(true);
  });

  it('should prevent deselecting unselected skill', () => {
    const current: SkillName[] = ['Athletics', 'Perception'];
    const result = canDeselectSkill('Survival', current);
    expect(result).toBe(false);
  });
});

describe('skills - getRemainingSkillSlots', () => {
  it('should return remaining slots for Fighter', () => {
    const current: SkillName[] = ['Athletics'];
    const result = getRemainingSkillSlots(current, 'Fighter');
    expect(result).toBe(1);
  });

  it('should return 0 when all slots filled', () => {
    const current: SkillName[] = ['Athletics', 'Perception'];
    const result = getRemainingSkillSlots(current, 'Fighter');
    expect(result).toBe(0);
  });

  it('should return all slots when none selected', () => {
    const current: SkillName[] = [];
    const result = getRemainingSkillSlots(current, 'Rogue');
    expect(result).toBe(4);
  });
});

describe('skills - getAvailableSkills', () => {
  it('should return available skills excluding selected', () => {
    const classSkills: SkillName[] = ['Athletics'];
    const backgroundSkills: SkillName[] = ['Insight', 'Religion'];
    const result = getAvailableSkills('Fighter', classSkills, backgroundSkills);
    expect(result).not.toContain('Athletics');
    expect(result).not.toContain('Insight');
    expect(result).not.toContain('Religion');
    expect(result).toContain('Perception');
  });

  it('should return all class skills when none selected', () => {
    const classSkills: SkillName[] = [];
    const backgroundSkills: SkillName[] = [];
    const result = getAvailableSkills('Fighter', classSkills, backgroundSkills);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Athletics');
    expect(result).toContain('Perception');
  });
});
