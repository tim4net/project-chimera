/**
 * @file Spell Tutorial Validation Functions
 * Functions for validating spell selections and processing state transitions
 */

import { getSpellByName, getSpellsForClass } from '../../data/spells';
import type { CharacterRecord, TutorialState } from '../../types';
import type { Spell } from '../../data/spellTypes';
import type { SpellValidationResult, TutorialTransitionResult } from './spellTutorialHelpers';

// ============================================================================
// SPELL VALIDATION
// ============================================================================

export function validateSpellSelection(
  spellNames: string[],
  character: CharacterRecord,
  expectedLevel: 0 | 1,
  maxCount: number,
  currentSelections: string[] = []
): SpellValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validSpells: Spell[] = [];

  const classSpells = getSpellsForClass(character.class, expectedLevel);

  for (const spellName of spellNames) {
    const spell = getSpellByName(spellName);

    if (!spell) {
      errors.push(`Spell "${spellName}" not found in database`);
      continue;
    }

    if (!spell.classes.includes(character.class)) {
      errors.push(`${spell.name} is not available to ${character.class}s`);
      continue;
    }

    if (spell.level !== expectedLevel) {
      errors.push(
        `${spell.name} is a level ${spell.level} spell, but you need to select ${
          expectedLevel === 0 ? 'cantrips' : `level ${expectedLevel} spells`
        }`
      );
      continue;
    }

    if (validSpells.some(s => s.name.toLowerCase() === spell.name.toLowerCase())) {
      errors.push(`${spell.name} was already selected in this request`);
      continue;
    }

    if (currentSelections.some(s => s.toLowerCase() === spell.name.toLowerCase())) {
      errors.push(`${spell.name} was already selected previously`);
      continue;
    }

    validSpells.push(spell);
  }

  const totalCount = validSpells.length + currentSelections.length;
  if (totalCount > maxCount) {
    errors.push(
      `Too many ${expectedLevel === 0 ? 'cantrips' : 'spells'} selected. ` +
      `Maximum is ${maxCount}, you selected ${totalCount}`
    );
    return { valid: false, validSpells: [], errors, warnings };
  }

  if (validSpells.length > 0 && totalCount < maxCount) {
    warnings.push(
      `You've selected ${totalCount} out of ${maxCount} required ${
        expectedLevel === 0 ? 'cantrips' : 'spells'
      }. You still need ${maxCount - totalCount} more.`
    );
  }

  return { valid: errors.length === 0, validSpells, errors, warnings };
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

export function processTutorialTransition(
  character: CharacterRecord,
  selectedSpells: Spell[],
  expectedCantrips: number,
  expectedSpells: number
): TutorialTransitionResult {
  const currentState = character.tutorial_state || 'needs_cantrips';
  const mockSpellSelections = { cantrips: [] as string[], spells: [] as string[] };

  if (currentState === 'needs_cantrips') {
    mockSpellSelections.cantrips.push(...selectedSpells.map(s => s.name));

    if (mockSpellSelections.cantrips.length >= expectedCantrips) {
      return {
        success: true,
        newState: 'needs_spells',
        message: `You've selected your cantrips! Now choose ${expectedSpells} level 1 spells.`,
      };
    }
    return {
      success: true,
      newState: 'needs_cantrips',
      message: `Cantrips recorded. You need ${expectedCantrips - mockSpellSelections.cantrips.length} more.`,
    };
  }

  if (currentState === 'needs_spells') {
    mockSpellSelections.spells.push(...selectedSpells.map(s => s.name));

    if (mockSpellSelections.spells.length >= expectedSpells) {
      return {
        success: true,
        newState: 'complete',
        message: `Spell selection complete! You can now level up to Level 1.`,
      };
    }
    return {
      success: true,
      newState: 'needs_spells',
      message: `Spells recorded. You need ${expectedSpells - mockSpellSelections.spells.length} more.`,
    };
  }

  return {
    success: false,
    newState: currentState,
    message: 'Tutorial already complete or invalid state',
  };
}

export function completeLevelUp(character: CharacterRecord): TutorialTransitionResult {
  if (character.level !== 0) {
    return {
      success: false,
      newState: character.tutorial_state || 'complete',
      message: 'Character is not at Level 0',
    };
  }

  if (character.tutorial_state !== 'complete') {
    return {
      success: false,
      newState: character.tutorial_state || 'needs_cantrips',
      message: 'Tutorial is not complete. Finish spell selection first.',
    };
  }

  const conModifier = Math.floor((character.ability_scores.CON - 10) / 2);
  const hitDie = character.class === 'Wizard' ? 6 : character.class === 'Bard' ? 8 : 8;
  const newMaxHP = hitDie + conModifier;

  return {
    success: true,
    newState: 'complete',
    message: `Congratulations! You are now Level 1!`,
    characterUpdates: {
      level: 1,
      hp_max: newMaxHP,
      hp_current: newMaxHP,
      spell_slots: { '1': 2 },
      hit_dice: { [`d${hitDie}`]: 1 },
    },
  };
}
