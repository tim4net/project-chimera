/**
 * @file Spell Tutorial Test Helpers
 * Mock implementations and utility functions for spell tutorial tests
 */

import { getSpellByName, SPELLS_BY_LEVEL } from '../../data/spells';
import type { CharacterRecord, TutorialState } from '../../types';
import type { Spell } from '../../data/spellTypes';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SpellSelectionIntent {
  type: 'SELECT_CANTRIPS' | 'SELECT_SPELLS' | 'COMPLETE_TUTORIAL' | 'CONVERSATION';
  spellNames: string[];
  confidence: number;
}

export interface SpellValidationResult {
  valid: boolean;
  validSpells: Spell[];
  errors: string[];
  warnings: string[];
}

export interface TutorialTransitionResult {
  success: boolean;
  newState: TutorialState;
  message: string;
  characterUpdates?: Partial<CharacterRecord>;
}

// ============================================================================
// MOCK CHARACTER FACTORY
// ============================================================================

export function createMockCharacter(
  className: string,
  level: number = 0,
  tutorialState: TutorialState = 'needs_cantrips'
): CharacterRecord {
  const spellcasterClasses = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard', 'Paladin', 'Ranger'];
  const isSpellcaster = spellcasterClasses.includes(className);

  return {
    id: `char_test_${Math.random().toString(36).substring(7)}`,
    user_id: 'user_test_tutorial',
    name: `Test${className}`,
    race: 'Human',
    class: className,
    background: 'Sage',
    alignment: 'Neutral Good',
    level,
    xp: 0,
    gold: 50,
    ability_scores: { STR: 10, DEX: 12, CON: 14, INT: 15, WIS: 13, CHA: 16 },
    hp_max: level === 0 ? 10 : 12,
    hp_current: level === 0 ? 10 : 12,
    temporary_hp: 0,
    armor_class: 12,
    speed: 30,
    hit_dice: { d8: level },
    position: { x: 500, y: 500 },
    campaign_seed: 'test_seed',
    spell_slots: (level === 0 || !isSpellcaster) ? {} : { '1': 2 },
    backstory: 'A test character for spell tutorial',
    skills: null,
    portrait_url: null,
    proficiency_bonus: 2,
    tutorial_state: tutorialState,
  };
}

// ============================================================================
// SPELL SELECTION INTENT DETECTION
// ============================================================================

export function detectSpellSelectionIntent(
  message: string,
  character: CharacterRecord
): SpellSelectionIntent {
  const normalized = message.toLowerCase();

  // Flag suspicious patterns
  const suspiciousPatterns = /\b(i have|i've got|i already have|i possess)\b/i;
  if (suspiciousPatterns.test(message)) {
    return { type: 'CONVERSATION', spellNames: [], confidence: 0.9 };
  }

  // Check for completion intent
  const completionPatterns = /\b(i'm ready|ready to level|finish tutorial|done selecting)\b/i;
  if (completionPatterns.test(message) && character.tutorial_state === 'complete') {
    return { type: 'COMPLETE_TUTORIAL', spellNames: [], confidence: 0.95 };
  }

  // Extract spell names
  const spellNames: string[] = [];
  const allSpells = SPELLS_BY_LEVEL[0].concat(SPELLS_BY_LEVEL[1]);

  for (const spell of allSpells) {
    const spellPattern = new RegExp(`\\b${spell.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (spellPattern.test(message)) {
      spellNames.push(spell.name);
    }
  }

  if (spellNames.length === 0) {
    return { type: 'CONVERSATION', spellNames: [], confidence: 0.5 };
  }

  // Determine intent based on spell levels
  const selectedSpells = spellNames.map(name => getSpellByName(name)).filter(Boolean) as Spell[];
  const hasCantrips = selectedSpells.some(s => s.level === 0);
  const hasLeveledSpells = selectedSpells.some(s => s.level > 0);

  if (character.tutorial_state === 'needs_cantrips' && hasCantrips) {
    return { type: 'SELECT_CANTRIPS', spellNames, confidence: 0.9 };
  }

  if (character.tutorial_state === 'needs_spells' && hasLeveledSpells) {
    return { type: 'SELECT_SPELLS', spellNames, confidence: 0.9 };
  }

  if (hasCantrips && !hasLeveledSpells) {
    return { type: 'SELECT_CANTRIPS', spellNames, confidence: 0.8 };
  }

  if (hasLeveledSpells) {
    return { type: 'SELECT_SPELLS', spellNames, confidence: 0.8 };
  }

  return { type: 'CONVERSATION', spellNames, confidence: 0.6 };
}
