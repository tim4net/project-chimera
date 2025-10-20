/**
 * @file Spell Validator - Validates spell selections during Level 0 tutorial
 *
 * This service ensures players can only select valid spells for their class
 * and respects quantity limits (e.g., Bard: 2 cantrips, 4 level-1 spells).
 *
 * Security: All validation happens server-side. Players cannot bypass limits.
 */

import { supabaseServiceClient } from './supabaseClient';
import type { CharacterRecord } from '../types';

// Spell requirements by class (for level 1)
const SPELL_REQUIREMENTS = {
  Bard: {
    cantrips: 2,
    spells: { '1': 4 },
  },
  Wizard: {
    cantrips: 3,
    spells: { '1': 6 },
  },
  Cleric: {
    cantrips: 3,
    spells: { '1': 2 }, // Clerics prepare spells, not learn them (but we'll use selection for simplicity)
  },
  Sorcerer: {
    cantrips: 4,
    spells: { '1': 2 },
  },
  Warlock: {
    cantrips: 2,
    spells: { '1': 2 },
  },
  Druid: {
    cantrips: 2,
    spells: { '1': 2 }, // Druids prepare spells
  },
  Paladin: {
    cantrips: 0,
    spells: { '1': 0 }, // Paladins get spells at level 2
  },
  Ranger: {
    cantrips: 0,
    spells: { '1': 0 }, // Rangers get spells at level 2
  },
  // Non-casters don't need spell selection
  Fighter: { cantrips: 0, spells: {} },
  Rogue: { cantrips: 0, spells: {} },
  Barbarian: { cantrips: 0, spells: {} },
  Monk: { cantrips: 0, spells: {} },
};

interface SpellRecord {
  id: string;
  name: string;
  level: number;
  school: string;
  classes: string[];
  description: string;
}

export interface SpellValidationResult {
  valid: boolean;
  error?: string;
  spellId?: string;
  spellName?: string;
}

/**
 * Check if a class is a spellcaster that needs tutorial spell selection
 */
export function isSpellcaster(characterClass: string): boolean {
  const requirements = SPELL_REQUIREMENTS[characterClass as keyof typeof SPELL_REQUIREMENTS];
  if (!requirements) return false;
  return requirements.cantrips > 0 || Object.keys(requirements.spells).length > 0;
}

/**
 * Get spell requirements for a class
 */
export function getSpellRequirements(characterClass: string) {
  return SPELL_REQUIREMENTS[characterClass as keyof typeof SPELL_REQUIREMENTS] || { cantrips: 0, spells: {} };
}

/**
 * Validate cantrip selection
 */
export async function validateCantripSelection(
  character: CharacterRecord,
  spellName: string
): Promise<SpellValidationResult> {
  // Step 1: Get spell requirements for class
  const requirements = getSpellRequirements(character.class);

  if (requirements.cantrips === 0) {
    return {
      valid: false,
      error: `${character.class} does not learn cantrips.`,
    };
  }

  // Step 2: Check if already selected maximum cantrips
  const selectedCantrips = (character as any).selected_cantrips || [];
  if (selectedCantrips.length >= requirements.cantrips) {
    return {
      valid: false,
      error: `You have already selected ${requirements.cantrips} cantrip${requirements.cantrips > 1 ? 's' : ''}. Maximum reached.`,
    };
  }

  // Step 3: Check for duplicates
  if (selectedCantrips.includes(spellName)) {
    return {
      valid: false,
      error: `You have already selected ${spellName}.`,
    };
  }

  // Step 4: Query spells table to verify spell exists and is a cantrip
  const { data: spells, error } = await supabaseServiceClient
    .from('spells')
    .select('*')
    .ilike('name', spellName)
    .eq('level', 0) // Cantrips are level 0
    .single();

  if (error || !spells) {
    return {
      valid: false,
      error: `Cannot find cantrip "${spellName}". Please check the spelling.`,
    };
  }

  const spell = spells as SpellRecord;

  // Step 5: Verify spell is available to class
  if (!spell.classes.includes(character.class)) {
    const availableClasses = spell.classes.join(', ');
    return {
      valid: false,
      error: `${spellName} is not available to ${character.class}. Available to: ${availableClasses}`,
    };
  }

  // All checks passed
  return {
    valid: true,
    spellId: spell.id,
    spellName: spell.name,
  };
}

/**
 * Validate spell selection (level 1+ spells)
 */
export async function validateSpellSelection(
  character: CharacterRecord,
  spellName: string,
  spellLevel: number = 1
): Promise<SpellValidationResult> {
  // Step 1: Get spell requirements for class
  const requirements = getSpellRequirements(character.class);

  const levelKey = spellLevel.toString();
  const maxSpells = (requirements.spells as Record<string, number>)[levelKey] || 0;

  if (maxSpells === 0) {
    return {
      valid: false,
      error: `${character.class} does not learn level ${spellLevel} spells at Level 1.`,
    };
  }

  // Step 2: Check if already selected maximum spells for this level
  const selectedSpells = (character as any).selected_spells || [];
  if (selectedSpells.length >= maxSpells) {
    return {
      valid: false,
      error: `You have already selected ${maxSpells} spell${maxSpells > 1 ? 's' : ''}. Maximum reached.`,
    };
  }

  // Step 3: Check for duplicates
  if (selectedSpells.includes(spellName)) {
    return {
      valid: false,
      error: `You have already selected ${spellName}.`,
    };
  }

  // Step 4: Query spells table to verify spell exists and is correct level
  const { data: spells, error } = await supabaseServiceClient
    .from('spells')
    .select('*')
    .ilike('name', spellName)
    .eq('level', spellLevel)
    .single();

  if (error || !spells) {
    return {
      valid: false,
      error: `Cannot find level ${spellLevel} spell "${spellName}". Please check the spelling.`,
    };
  }

  const spell = spells as SpellRecord;

  // Step 5: Verify spell is available to class
  if (!spell.classes.includes(character.class)) {
    const availableClasses = spell.classes.join(', ');
    return {
      valid: false,
      error: `${spellName} is not available to ${character.class}. Available to: ${availableClasses}`,
    };
  }

  // All checks passed
  return {
    valid: true,
    spellId: spell.id,
    spellName: spell.name,
  };
}

/**
 * Check if character has completed spell selection requirements
 */
export function hasCompletedSpellSelection(character: CharacterRecord): {
  complete: boolean;
  missing: string[];
} {
  const requirements = getSpellRequirements(character.class);
  const missing: string[] = [];

  // Check cantrips
  const selectedCantrips = (character as any).selected_cantrips || [];
  if (requirements.cantrips > 0 && selectedCantrips.length < requirements.cantrips) {
    const remaining = requirements.cantrips - selectedCantrips.length;
    missing.push(`${remaining} more cantrip${remaining > 1 ? 's' : ''}`);
  }

  // Check spells
  const selectedSpells = (character as any).selected_spells || [];
  const requiredLevel1Spells = (requirements.spells as Record<string, number>)['1'] || 0;
  if (requiredLevel1Spells > 0 && selectedSpells.length < requiredLevel1Spells) {
    const remaining = requiredLevel1Spells - selectedSpells.length;
    missing.push(`${remaining} more level-1 spell${remaining > 1 ? 's' : ''}`);
  }

  return {
    complete: missing.length === 0,
    missing,
  };
}

/**
 * Get available cantrips for a class
 */
export async function getAvailableCantrips(characterClass: string): Promise<SpellRecord[]> {
  const { data, error } = await supabaseServiceClient
    .from('spells')
    .select('*')
    .eq('level', 0)
    .contains('classes', [characterClass])
    .order('name');

  if (error) {
    console.error('Error fetching cantrips:', error);
    return [];
  }

  return data as SpellRecord[];
}

/**
 * Get available spells for a class at a specific level
 */
export async function getAvailableSpells(characterClass: string, spellLevel: number = 1): Promise<SpellRecord[]> {
  const { data, error } = await supabaseServiceClient
    .from('spells')
    .select('*')
    .eq('level', spellLevel)
    .contains('classes', [characterClass])
    .order('name');

  if (error) {
    console.error('Error fetching spells:', error);
    return [];
  }

  return data as SpellRecord[];
}
