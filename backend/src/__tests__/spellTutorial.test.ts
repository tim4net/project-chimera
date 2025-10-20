/**
 * @file Level 0 Tutorial Spell Selection System - Test Suite
 *
 * Comprehensive tests for spell selection tutorial covering:
 * - Intent detection, validation, state transitions, level-up, multi-class support
 */

import { getSpellByName, getSpellsForClass, SPELLS_BY_LEVEL } from '../data/spells';
import { getKnownSpellsCount } from '../game/spellcasting';
import {
  createMockCharacter,
  detectSpellSelectionIntent,
} from './helpers/spellTutorialHelpers';
import {
  validateSpellSelection,
  processTutorialTransition,
  completeLevelUp,
} from './helpers/spellTutorialValidation';

// ============================================================================
// TEST SUITE 1: SPELL SELECTION INTENT DETECTION
// ============================================================================

describe('Spell Selection Intent Detection', () => {
  let bardChar: ReturnType<typeof createMockCharacter>;

  beforeEach(() => {
    bardChar = createMockCharacter('Bard', 0, 'needs_cantrips');
  });

  test('should detect SELECT_CANTRIPS from "I choose Vicious Mockery"', () => {
    const result = detectSpellSelectionIntent("I choose Vicious Mockery", bardChar);
    expect(result.type).toBe('SELECT_CANTRIPS');
    expect(result.spellNames).toContain('Vicious Mockery');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  test('should detect SELECT_SPELLS from "Healing Word and Charm Person"', () => {
    bardChar.tutorial_state = 'needs_spells';
    const result = detectSpellSelectionIntent("Healing Word and Charm Person", bardChar);
    expect(result.type).toBe('SELECT_SPELLS');
    expect(result.spellNames.length).toBeGreaterThanOrEqual(2);
  });

  test('should detect SELECT_CANTRIPS from "I\'ll take Mage Hand"', () => {
    const result = detectSpellSelectionIntent("I'll take Mage Hand", bardChar);
    expect(result.type).toBe('SELECT_CANTRIPS');
    expect(result.spellNames).toContain('Mage Hand');
  });

  test('should NOT trigger on suspicious pattern "I have Fireball"', () => {
    const result = detectSpellSelectionIntent("I have Fireball", bardChar);
    expect(result.type).toBe('CONVERSATION');
    expect(result.spellNames).toHaveLength(0);
  });

  test('should detect COMPLETE_TUTORIAL when ready and tutorial complete', () => {
    bardChar.tutorial_state = 'complete';
    const result = detectSpellSelectionIntent("I'm ready to level up", bardChar);
    expect(result.type).toBe('COMPLETE_TUTORIAL');
  });
});

// ============================================================================
// TEST SUITE 2: SPELL VALIDATION
// ============================================================================

describe('Spell Validation', () => {
  let bardChar: ReturnType<typeof createMockCharacter>;

  beforeEach(() => {
    bardChar = createMockCharacter('Bard', 0, 'needs_cantrips');
  });

  test('should accept valid Bard cantrip (Vicious Mockery)', () => {
    const result = validateSpellSelection(['Vicious Mockery'], bardChar, 0, 2);
    expect(result.valid).toBe(true);
    expect(result.validSpells).toHaveLength(1);
    expect(result.validSpells[0].name).toBe('Vicious Mockery');
  });

  test('should reject invalid spell not on Bard list (Fireball)', () => {
    const result = validateSpellSelection(['Fireball'], bardChar, 0, 2);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not available'))).toBe(true);
  });

  test('should reject wrong spell level (Sleep when selecting cantrips)', () => {
    const result = validateSpellSelection(['Sleep'], bardChar, 0, 2);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('level 1 spell'))).toBe(true);
  });

  test('should reject duplicate selection in same request', () => {
    const result = validateSpellSelection(['Mage Hand', 'Mage Hand'], bardChar, 0, 2);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('already selected'))).toBe(true);
  });

  test('should reject duplicate with previous selections', () => {
    const result = validateSpellSelection(['Vicious Mockery'], bardChar, 0, 2, ['Vicious Mockery']);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('already selected previously'))).toBe(true);
  });

  test('should reject too many spells (5 spells when limit is 4)', () => {
    bardChar.tutorial_state = 'needs_spells';
    const result = validateSpellSelection(
      ['Cure Wounds', 'Healing Word', 'Bane', 'Charm Person', 'Thunderwave'],
      bardChar,
      1,
      4
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Too many'))).toBe(true);
  });

  test('should warn when selecting too few spells (1 cantrip when needs 2)', () => {
    const result = validateSpellSelection(['Vicious Mockery'], bardChar, 0, 2);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('should accept multiple valid cantrips', () => {
    const result = validateSpellSelection(['Vicious Mockery', 'Mage Hand'], bardChar, 0, 2);
    expect(result.valid).toBe(true);
    expect(result.validSpells).toHaveLength(2);
  });
});

// ============================================================================
// TEST SUITE 3: TUTORIAL STATE TRANSITIONS
// ============================================================================

describe('Tutorial State Transitions', () => {
  test('should transition from needs_cantrips to needs_spells after 2 cantrips', () => {
    const bardChar = createMockCharacter('Bard', 0, 'needs_cantrips');
    const validSpells = [getSpellByName('Vicious Mockery')!, getSpellByName('Mage Hand')!];
    const result = processTutorialTransition(bardChar, validSpells, 2, 4);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('needs_spells');
  });

  test('should transition from needs_spells to complete after 4 spells', () => {
    const bardChar = createMockCharacter('Bard', 0, 'needs_spells');
    const validSpells = [
      getSpellByName('Cure Wounds')!,
      getSpellByName('Healing Word')!,
      getSpellByName('Bane')!,
      getSpellByName('Charm Person')!,
    ];
    const result = processTutorialTransition(bardChar, validSpells, 2, 4);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('complete');
  });

  test('should stay in needs_cantrips if incomplete', () => {
    const bardChar = createMockCharacter('Bard', 0, 'needs_cantrips');
    const validSpells = [getSpellByName('Vicious Mockery')!];
    const result = processTutorialTransition(bardChar, validSpells, 2, 4);

    expect(result.success).toBe(true);
    expect(result.newState).toBe('needs_cantrips');
  });
});

// ============================================================================
// TEST SUITE 4: LEVEL-UP COMPLETION
// ============================================================================

describe('Level-Up Completion', () => {
  test('should level up from 0 to 1 when tutorial complete', () => {
    const bardChar = createMockCharacter('Bard', 0, 'complete');
    const result = completeLevelUp(bardChar);

    expect(result.success).toBe(true);
    expect(result.characterUpdates?.level).toBe(1);
    expect(result.characterUpdates?.spell_slots).toEqual({ '1': 2 });
  });

  test('should calculate HP correctly (8 + CON mod)', () => {
    const bardChar = createMockCharacter('Bard', 0, 'complete');
    bardChar.ability_scores.CON = 14;
    const result = completeLevelUp(bardChar);

    expect(result.characterUpdates?.hp_max).toBe(10); // 8 + 2
  });

  test('should block level-up if tutorial incomplete', () => {
    const bardChar = createMockCharacter('Bard', 0, 'needs_spells');
    const result = completeLevelUp(bardChar);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not complete/i);
  });

  test('should block level-up if already above level 0', () => {
    const bardChar = createMockCharacter('Bard', 1, 'complete');
    const result = completeLevelUp(bardChar);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TEST SUITE 5: MULTI-CLASS SUPPORT
// ============================================================================

describe('Multi-Class Tutorial Support', () => {
  test('Wizard tutorial: 2 cantrips, 6 spells', () => {
    const wizardChar = createMockCharacter('Wizard', 0, 'needs_cantrips');
    const cantripResult = validateSpellSelection(['Fire Bolt', 'Mage Hand'], wizardChar, 0, 2);

    expect(cantripResult.valid).toBe(true);
    expect(getKnownSpellsCount('Wizard', 1)).toBe(6);
  });

  test('Cleric tutorial works with different spell list', () => {
    const clericChar = createMockCharacter('Cleric', 0, 'needs_cantrips');
    const result = validateSpellSelection(['Sacred Flame', 'Guidance'], clericChar, 0, 2);

    expect(result.valid).toBe(true);
    expect(result.validSpells).toHaveLength(2);
  });

  test('Fighter skips tutorial (non-spellcaster at level 1)', () => {
    const fighterChar = createMockCharacter('Fighter', 1, 'complete');

    expect(getKnownSpellsCount('Fighter', 1)).toBe(0);
    expect(fighterChar.spell_slots).toEqual({});
  });

  test('Sorcerer tutorial: different spell counts', () => {
    const sorcererChar = createMockCharacter('Sorcerer', 0, 'needs_cantrips');
    const cantripResult = validateSpellSelection(
      ['Fire Bolt', 'Mage Hand', 'Light', 'Prestidigitation'],
      sorcererChar,
      0,
      4
    );

    expect(cantripResult.valid).toBe(true);
    expect(getKnownSpellsCount('Sorcerer', 1)).toBe(2);
  });
});

// ============================================================================
// TEST SUITE 6: ERROR CASES AND INTEGRATION
// ============================================================================

describe('Error Cases and Edge Cases', () => {
  test('should handle empty spell name list', () => {
    const bardChar = createMockCharacter('Bard', 0, 'needs_cantrips');
    const result = validateSpellSelection([], bardChar, 0, 2);

    expect(result.valid).toBe(true);
    expect(result.validSpells).toHaveLength(0);
  });

  test('should handle unknown spell names gracefully', () => {
    const bardChar = createMockCharacter('Bard', 0, 'needs_cantrips');
    const result = validateSpellSelection(['Nonexistent Spell'], bardChar, 0, 2);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not found'))).toBe(true);
  });

  test('Complete Bard tutorial from start to level 1', () => {
    const bard = createMockCharacter('Bard', 0, 'needs_cantrips');

    // Select cantrips
    const cantripValidation = validateSpellSelection(['Vicious Mockery', 'Mage Hand'], bard, 0, 2);
    expect(cantripValidation.valid).toBe(true);

    const cantripTransition = processTutorialTransition(bard, cantripValidation.validSpells, 2, 4);
    expect(cantripTransition.newState).toBe('needs_spells');

    bard.tutorial_state = cantripTransition.newState;

    // Select spells
    const spellValidation = validateSpellSelection(
      ['Cure Wounds', 'Healing Word', 'Bane', 'Charm Person'],
      bard,
      1,
      4
    );
    expect(spellValidation.valid).toBe(true);

    const spellTransition = processTutorialTransition(bard, spellValidation.validSpells, 2, 4);
    expect(spellTransition.newState).toBe('complete');

    // Level up
    bard.tutorial_state = spellTransition.newState;
    const levelUp = completeLevelUp(bard);

    expect(levelUp.success).toBe(true);
    expect(levelUp.characterUpdates?.level).toBe(1);
  });
});

// ============================================================================
// TEST SUITE 7: SPELL DATA INTEGRITY
// ============================================================================

describe('Spell Data Integrity', () => {
  test('Bard should have access to correct cantrips', () => {
    const bardCantrips = getSpellsForClass('Bard', 0);
    const cantripNames = bardCantrips.map(s => s.name);

    expect(cantripNames).toContain('Vicious Mockery');
    expect(cantripNames).toContain('Mage Hand');
  });

  test('All cantrips should have level 0', () => {
    const cantrips = SPELLS_BY_LEVEL[0];
    cantrips.forEach(spell => expect(spell.level).toBe(0));
  });

  test('Class lists should be properly formatted', () => {
    const spell = getSpellByName('Vicious Mockery');
    expect(spell).toBeDefined();
    expect(spell!.classes).toContain('Bard');
  });
});

console.log('\n' + '='.repeat(80));
console.log('🧙 LEVEL 0 TUTORIAL SPELL SELECTION - COMPREHENSIVE TEST SUITE');
console.log('='.repeat(80));
