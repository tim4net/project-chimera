/**
 * @fileoverview Skill selection validation for character creation.
 * Handles class skill constraints and background skill assignment.
 */

import type { SkillName, CharacterClass, Background } from '../types/wizard';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Skill selection validation result
 */
export interface SkillValidationResult extends ValidationResult {
  selectedCount: number;
  maxAllowed: number;
  missingCount: number;
}

/**
 * Class skill configuration (how many skills each class can choose)
 */
export const CLASS_SKILL_COUNTS: Record<CharacterClass, number> = {
  Barbarian: 2,
  Bard: 3,
  Cleric: 2,
  Druid: 2,
  Fighter: 2,
  Monk: 2,
  Paladin: 2,
  Ranger: 3,
  Rogue: 4,
  Sorcerer: 2,
  Warlock: 2,
  Wizard: 2,
};

/**
 * Available skills for each class
 */
export const CLASS_SKILL_OPTIONS: Record<CharacterClass, SkillName[]> = {
  Barbarian: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
  Bard: [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival'
  ], // Bards can choose any skills
  Cleric: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
  Druid: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
  Fighter: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
  Monk: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
  Paladin: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
  Ranger: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
  Rogue: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
  Sorcerer: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
  Warlock: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
  Wizard: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
};

/**
 * Background skill assignments (automatic skill proficiencies from backgrounds)
 */
export const BACKGROUND_SKILLS: Record<Background, SkillName[]> = {
  Acolyte: ['Insight', 'Religion'],
  Charlatan: ['Deception', 'Sleight of Hand'],
  Criminal: ['Deception', 'Stealth'],
  Entertainer: ['Acrobatics', 'Performance'],
  'Folk Hero': ['Animal Handling', 'Survival'],
  'Guild Artisan': ['Insight', 'Persuasion'],
  Hermit: ['Medicine', 'Religion'],
  Noble: ['History', 'Persuasion'],
  Outlander: ['Athletics', 'Survival'],
  Sage: ['Arcana', 'History'],
  Sailor: ['Athletics', 'Perception'],
  Soldier: ['Athletics', 'Intimidation'],
  Urchin: ['Sleight of Hand', 'Stealth'],
};

/**
 * Get the number of skills a class can select
 * @param characterClass - Character class
 * @returns Number of skills allowed
 */
export function getClassSkillCount(characterClass: CharacterClass): number {
  return CLASS_SKILL_COUNTS[characterClass];
}

/**
 * Get available skill options for a class
 * @param characterClass - Character class
 * @returns Array of available skill names
 */
export function getClassSkillOptions(characterClass: CharacterClass): SkillName[] {
  return CLASS_SKILL_OPTIONS[characterClass];
}

/**
 * Get automatic skills from background
 * @param background - Character background
 * @returns Array of skill names granted by background
 */
export function getBackgroundSkills(background: Background): SkillName[] {
  return BACKGROUND_SKILLS[background];
}

/**
 * Validate class skill selection
 * @param selectedSkills - Skills selected by the player
 * @param characterClass - Character class
 * @returns Validation result
 */
export function validateClassSkills(
  selectedSkills: SkillName[],
  characterClass: CharacterClass
): SkillValidationResult {
  const errors: string[] = [];
  const maxAllowed = getClassSkillCount(characterClass);
  const availableSkills = getClassSkillOptions(characterClass);
  const selectedCount = selectedSkills.length;

  // Check count
  if (selectedCount < maxAllowed) {
    const missingCount = maxAllowed - selectedCount;
    errors.push(`Must select ${maxAllowed} skills for ${characterClass} (${missingCount} more required)`);
  } else if (selectedCount > maxAllowed) {
    const excessCount = selectedCount - maxAllowed;
    errors.push(`Too many skills selected: ${selectedCount}/${maxAllowed} (${excessCount} too many)`);
  }

  // Check if all selected skills are valid for the class
  selectedSkills.forEach((skill) => {
    if (!availableSkills.includes(skill)) {
      errors.push(`${skill} is not available for ${characterClass}`);
    }
  });

  // Check for duplicates
  const uniqueSkills = new Set(selectedSkills);
  if (uniqueSkills.size !== selectedSkills.length) {
    errors.push('Duplicate skills selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    selectedCount,
    maxAllowed,
    missingCount: Math.max(0, maxAllowed - selectedCount),
  };
}

/**
 * Validate background skill assignment
 * @param backgroundSkills - Skills that should be granted by background
 * @param background - Character background
 * @returns Validation result
 */
export function validateBackgroundSkills(
  backgroundSkills: SkillName[],
  background: Background
): ValidationResult {
  const errors: string[] = [];
  const expectedSkills = getBackgroundSkills(background);

  // Check if all expected skills are present
  expectedSkills.forEach((skill) => {
    if (!backgroundSkills.includes(skill)) {
      errors.push(`Missing background skill: ${skill} (from ${background})`);
    }
  });

  // Check if there are unexpected skills
  backgroundSkills.forEach((skill) => {
    if (!expectedSkills.includes(skill)) {
      errors.push(`Unexpected background skill: ${skill} (not from ${background})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete skill selection (class + background)
 * @param classSkills - Skills selected from class options
 * @param backgroundSkills - Skills granted by background
 * @param characterClass - Character class
 * @param background - Character background
 * @returns Validation result
 */
export function validateSkillSelection(
  classSkills: SkillName[],
  backgroundSkills: SkillName[],
  characterClass: CharacterClass,
  background: Background
): ValidationResult {
  const errors: string[] = [];

  // Validate class skills
  const classValidation = validateClassSkills(classSkills, characterClass);
  if (!classValidation.isValid) {
    errors.push(...classValidation.errors);
  }

  // Validate background skills
  const backgroundValidation = validateBackgroundSkills(backgroundSkills, background);
  if (!backgroundValidation.isValid) {
    errors.push(...backgroundValidation.errors);
  }

  // Check for overlap between class and background skills
  const overlap = classSkills.filter((skill) => backgroundSkills.includes(skill));
  if (overlap.length > 0) {
    errors.push(`Skills overlap between class and background: ${overlap.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Combine class and background skills into proficient skills list
 * @param classSkills - Skills selected from class options
 * @param backgroundSkills - Skills granted by background
 * @returns Combined list of proficient skills (no duplicates)
 */
export function combineSkills(classSkills: SkillName[], backgroundSkills: SkillName[]): SkillName[] {
  const allSkills = [...backgroundSkills, ...classSkills];
  return Array.from(new Set(allSkills));
}

/**
 * Check if a skill can be selected given current selections
 * @param skill - Skill to check
 * @param currentSelections - Currently selected skills
 * @param characterClass - Character class
 * @returns Whether the skill can be selected
 */
export function canSelectSkill(
  skill: SkillName,
  currentSelections: SkillName[],
  characterClass: CharacterClass
): boolean {
  // Check if already selected
  if (currentSelections.includes(skill)) {
    return false;
  }

  // Check if skill is available for class
  const availableSkills = getClassSkillOptions(characterClass);
  if (!availableSkills.includes(skill)) {
    return false;
  }

  // Check if we've reached the limit
  const maxAllowed = getClassSkillCount(characterClass);
  if (currentSelections.length >= maxAllowed) {
    return false;
  }

  return true;
}

/**
 * Check if a skill can be deselected
 * @param skill - Skill to check
 * @param currentSelections - Currently selected skills
 * @returns Whether the skill can be deselected
 */
export function canDeselectSkill(skill: SkillName, currentSelections: SkillName[]): boolean {
  return currentSelections.includes(skill);
}

/**
 * Get remaining skill slots for a class
 * @param currentSelections - Currently selected skills
 * @param characterClass - Character class
 * @returns Number of remaining skill slots
 */
export function getRemainingSkillSlots(
  currentSelections: SkillName[],
  characterClass: CharacterClass
): number {
  const maxAllowed = getClassSkillCount(characterClass);
  return Math.max(0, maxAllowed - currentSelections.length);
}

/**
 * Filter available skills (excluding already selected and background skills)
 * @param characterClass - Character class
 * @param classSkills - Currently selected class skills
 * @param backgroundSkills - Skills granted by background
 * @returns Array of available skills that can be selected
 */
export function getAvailableSkills(
  characterClass: CharacterClass,
  classSkills: SkillName[],
  backgroundSkills: SkillName[]
): SkillName[] {
  const allAvailable = getClassSkillOptions(characterClass);
  const alreadySelected = [...classSkills, ...backgroundSkills];
  return allAvailable.filter((skill) => !alreadySelected.includes(skill));
}
