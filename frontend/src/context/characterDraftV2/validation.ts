/**
 * @fileoverview Validation functions for CharacterDraftContextV2
 * Implements step-by-step validation for the 5-step character creation wizard.
 */

import type { CharacterClass, SkillName, Race } from '../../types/wizard';
import type { AbilityScores } from '../../types';
import { validatePointBuy } from '../../validation/abilities';
import { getClassSkillCount } from '../../validation/skills';

export interface CharacterDraft {
  // Step 1: Hero Concept
  name?: string;
  race?: Race;
  class?: CharacterClass;
  background?: string;

  // Step 2: Core Identity
  alignment?: string;
  gender?: string;
  personalityTraits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  avatarUrl?: string;

  // Step 3: Abilities & Skills
  abilityScores?: AbilityScores;
  proficientSkills?: SkillName[];
  skills?: SkillName[]; // Alias for proficientSkills (normalized in reducer)

  // Step 4: Loadout
  equipment?: string[];
  startingGold?: number;
  selectedEquipment?: string[];
  appearance?: string;
  portraitUrl?: string;
}

/**
 * Validate Step 1: Hero Concept
 * Required: name, race, class, background
 */
export function validateStep1(draft: Partial<CharacterDraft>): boolean {
  // Check required fields exist
  if (!draft.name || !draft.race || !draft.class || !draft.background) {
    return false;
  }

  // Validate name: 2-50 chars, alphanumeric + space/hyphen/apostrophe only
  const nameRegex = /^[a-zA-Z][a-zA-Z\s'-]{1,49}$/;
  if (!nameRegex.test(draft.name)) {
    return false;
  }

  return true;
}

/**
 * Validate Step 2: Core Identity
 * Required: alignment
 * Optional: gender, backstory fields
 */
export function validateStep2(draft: Partial<CharacterDraft>): boolean {
  // Only alignment is required
  if (!draft.alignment) {
    return false;
  }

  return true;
}

/**
 * Validate Step 3: Abilities & Skills
 * Required: abilityScores (27-point budget, 8-15 range), proficientSkills (count matches class)
 */
export function validateStep3(draft: Partial<CharacterDraft>): boolean {
  // Check ability scores exist
  if (!draft.abilityScores) {
    return false;
  }

  // Validate point-buy (27 points total, 8-15 range)
  const pointBuyResult = validatePointBuy(draft.abilityScores);
  if (!pointBuyResult.isValid) {
    return false;
  }

  // Check proficient skills - only validate if class is set
  if (draft.class) {
    if (!draft.proficientSkills) {
      return false;
    }

    // Validate skill count matches class requirement
    const requiredSkillCount = getClassSkillCount(draft.class);
    if (draft.proficientSkills.length !== requiredSkillCount) {
      return false;
    }
  }

  return true;
}

/**
 * Validate Step 4: Loadout
 * Required: at least 1 equipment item
 */
export function validateStep4(draft: Partial<CharacterDraft>): boolean {
  // Check equipment or selectedEquipment
  const equipment = draft.equipment || draft.selectedEquipment || [];

  if (equipment.length === 0) {
    return false;
  }

  return true;
}

/**
 * Validate Step 5: Review & Confirm
 * All required fields from steps 1-4 must be present
 */
export function validateStep5(draft: Partial<CharacterDraft>): boolean {
  return (
    validateStep1(draft) &&
    validateStep2(draft) &&
    validateStep3(draft) &&
    validateStep4(draft)
  );
}

/**
 * Get validation errors for current draft state
 * Returns array of error messages
 */
export function getValidationErrors(draft: Partial<CharacterDraft>): string[] {
  const errors: string[] = [];

  // Step 1 validation
  if (!draft.name) {
    errors.push('Name is required');
  } else if (draft.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (draft.name.length > 50) {
    errors.push('Name must be 50 characters or less');
  } else if (!/^[a-zA-Z][a-zA-Z\s'-]{1,49}$/.test(draft.name)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  if (!draft.race) {
    errors.push('Race is required');
  }

  if (!draft.class) {
    errors.push('Class is required');
  }

  if (!draft.background) {
    errors.push('Background is required');
  }

  // Step 2 validation
  if (!draft.alignment) {
    errors.push('Alignment is required');
  }

  // Step 3 validation
  if (draft.abilityScores) {
    const pointBuyResult = validatePointBuy(draft.abilityScores);
    if (!pointBuyResult.isValid) {
      errors.push(...pointBuyResult.errors);
    }
  } else if (draft.class) {
    errors.push('Ability scores are required');
  }

  if (draft.class && draft.proficientSkills) {
    const requiredCount = getClassSkillCount(draft.class);
    if (draft.proficientSkills.length < requiredCount) {
      errors.push(`Must select ${requiredCount} skills for ${draft.class}`);
    } else if (draft.proficientSkills.length > requiredCount) {
      errors.push(`Too many skills selected (max ${requiredCount} for ${draft.class})`);
    }
  }

  // Step 4 validation
  const equipment = draft.equipment || draft.selectedEquipment || [];
  if (equipment.length === 0 && draft.alignment) {
    errors.push('At least one equipment item is required');
  }

  return errors;
}
