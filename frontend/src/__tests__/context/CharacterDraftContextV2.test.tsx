/**
 * @fileoverview TDD Tests for CharacterDraftContextV2 - 5-Step Wizard
 * Phase 1 Task 1.2: State Management Tests (30+ tests)
 *
 * RED PHASE: All tests written BEFORE implementation.
 * These tests SHOULD FAIL initially - that's the point of TDD.
 *
 * Test Coverage:
 * - Step 1: Hero Concept (4 tests)
 * - Step 2: Core Identity (4 tests)
 * - Step 3: Abilities & Skills (5 tests)
 * - Step 4: Loadout (4 tests)
 * - Step 5: Review & Confirm (3 tests)
 * - Navigation (4 tests)
 * - Context Actions (5 tests)
 * - LocalStorage Persistence (4 tests)
 * - Data Transformation (2 tests)
 * - Error Scenarios (2 tests)
 *
 * TOTAL: 37 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type {
  Race,
  CharacterClass,
  Background,
  Alignment,
  SkillName,
  CharacterDraft,
} from '../../types/wizard';
import type { AbilityScores } from '../../types';

// ============================================================================
// Test Setup - Mocks and Fixtures
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Test fixtures
const validStep1Data = {
  name: 'Thorin Oakenshield',
  race: 'Dwarf' as Race,
  class: 'Fighter' as CharacterClass,
  background: 'Soldier' as Background,
};

const validStep2Data = {
  alignment: 'Lawful Good' as Alignment,
  gender: 'Male',
  personalityTraits: ['Brave', 'Loyal'],
  ideals: ['Honor'],
  bonds: ['Protect my clan'],
  flaws: ['Stubborn'],
};

const validStep3AbilityScores: AbilityScores = {
  STR: 15,
  DEX: 12,
  CON: 14,
  INT: 10,
  WIS: 11,
  CHA: 8,
};

const validStep3Skills: SkillName[] = ['Athletics', 'Intimidation'];

const validStep4Equipment = {
  startingGold: 50,
  selectedEquipment: ['Chain Mail', 'Longsword', 'Shield'],
  portraitUrl: '/avatars/thorin.png',
};

// Mock imports (these will fail until implementation exists)
let CharacterDraftProviderV2: any;
let useCharacterDraftV2: any;

try {
  const contextModule = await import('../../context/CharacterDraftContextV2');
  CharacterDraftProviderV2 = contextModule.CharacterDraftProvider;
  useCharacterDraftV2 = contextModule.useCharacterDraft;
} catch (error) {
  // Expected to fail in RED phase
  CharacterDraftProviderV2 = ({ children }: { children: React.ReactNode }) => children;
  useCharacterDraftV2 = () => {
    throw new Error('CharacterDraftContextV2 not implemented yet');
  };
}

// ============================================================================
// STEP 1: HERO CONCEPT TESTS (4 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Step 1: Hero Concept', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should validate step 1 as complete when name, race, class, and background are filled', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft(validStep1Data);
    });

    expect(result.current.validateStep1()).toBe(true);
  });

  it('should validate step 1 as incomplete when any required field is missing', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Missing race
    act(() => {
      result.current.updateDraft({
        name: 'Thorin',
        class: 'Fighter',
        background: 'Soldier',
      });
    });

    expect(result.current.validateStep1()).toBe(false);

    // Missing name
    act(() => {
      result.current.updateDraft({
        race: 'Dwarf',
        class: 'Fighter',
        background: 'Soldier',
      });
    });

    expect(result.current.validateStep1()).toBe(false);
  });

  it('should reject invalid names (length and character validation)', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Too short (< 2 chars)
    act(() => {
      result.current.updateDraft({ ...validStep1Data, name: 'T' });
    });
    expect(result.current.validateStep1()).toBe(false);

    // Too long (> 50 chars)
    act(() => {
      result.current.updateDraft({
        ...validStep1Data,
        name: 'A'.repeat(51),
      });
    });
    expect(result.current.validateStep1()).toBe(false);

    // Special characters (should reject)
    act(() => {
      result.current.updateDraft({ ...validStep1Data, name: 'Thorin@123' });
    });
    expect(result.current.validateStep1()).toBe(false);

    // Valid name
    act(() => {
      result.current.updateDraft({ ...validStep1Data, name: 'Thorin Oakenshield' });
    });
    expect(result.current.validateStep1()).toBe(true);
  });

  it('should persist step 1 data to localStorage', async () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft(validStep1Data);
    });

    await waitFor(() => {
      const stored = localStorageMock.getItem('characterDraft');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('Thorin Oakenshield');
      expect(parsed.race).toBe('Dwarf');
      expect(parsed.class).toBe('Fighter');
      expect(parsed.background).toBe('Soldier');
    });
  });
});

// ============================================================================
// STEP 2: CORE IDENTITY TESTS (4 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Step 2: Core Identity', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should allow progression when alignment is selected', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({ alignment: 'Lawful Good' });
    });

    expect(result.current.validateStep2()).toBe(true);
  });

  it('should treat backstory fields as optional but storable', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Without backstory fields
    act(() => {
      result.current.updateDraft({ alignment: 'Lawful Good' });
    });
    expect(result.current.validateStep2()).toBe(true);

    // With backstory fields
    act(() => {
      result.current.updateDraft({
        alignment: 'Lawful Good',
        personalityTraits: ['Brave'],
        ideals: ['Honor'],
        bonds: ['Protect my clan'],
        flaws: ['Stubborn'],
      });
    });

    expect(result.current.draft.personalityTraits).toEqual(['Brave']);
    expect(result.current.draft.ideals).toEqual(['Honor']);
    expect(result.current.validateStep2()).toBe(true);
  });

  it('should save gender selection to draft', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({ gender: 'Female' });
    });

    expect(result.current.draft.gender).toBe('Female');
  });

  it('should preserve step 1 data when moving to step 2', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft(validStep1Data);
    });

    expect(result.current.draft.name).toBe('Thorin Oakenshield');

    act(() => {
      result.current.updateDraft(validStep2Data);
    });

    // Step 1 data should still be there
    expect(result.current.draft.name).toBe('Thorin Oakenshield');
    expect(result.current.draft.race).toBe('Dwarf');
    expect(result.current.draft.class).toBe('Fighter');
    expect(result.current.draft.background).toBe('Soldier');

    // Step 2 data should be added
    expect(result.current.draft.alignment).toBe('Lawful Good');
    expect(result.current.draft.gender).toBe('Male');
  });
});

// ============================================================================
// STEP 3: ABILITIES & SKILLS TESTS (5 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Step 3: Abilities & Skills', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should enforce 27-point budget for ability scores', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Valid 27-point spread
    const validScores: AbilityScores = {
      STR: 15, // 9 points
      DEX: 14, // 7 points
      CON: 13, // 5 points
      INT: 12, // 4 points
      WIS: 10, // 2 points
      CHA: 8,  // 0 points
      // Total: 27 points
    };

    act(() => {
      result.current.updateDraft({ abilityScores: validScores });
    });

    expect(result.current.validateStep3()).toBe(true);

    // Invalid: exceeds 27 points
    const invalidScores: AbilityScores = {
      STR: 15, // 9 points
      DEX: 15, // 9 points
      CON: 15, // 9 points
      INT: 15, // 9 points
      WIS: 15, // 9 points
      CHA: 15, // 9 points
      // Total: 54 points (invalid)
    };

    act(() => {
      result.current.updateDraft({ abilityScores: invalidScores });
    });

    expect(result.current.validateStep3()).toBe(false);
  });

  it('should enforce ability scores in 8-15 range', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Below minimum (7)
    const tooLow: AbilityScores = {
      STR: 7,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 11,
      CHA: 8,
    };

    act(() => {
      result.current.updateDraft({ abilityScores: tooLow });
    });

    expect(result.current.validateStep3()).toBe(false);

    // Above maximum (16)
    const tooHigh: AbilityScores = {
      STR: 16,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 11,
      CHA: 8,
    };

    act(() => {
      result.current.updateDraft({ abilityScores: tooHigh });
    });

    expect(result.current.validateStep3()).toBe(false);
  });

  it('should calculate ability modifiers correctly', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    expect(result.current.calculateModifier(8)).toBe(-1);
    expect(result.current.calculateModifier(10)).toBe(0);
    expect(result.current.calculateModifier(12)).toBe(1);
    expect(result.current.calculateModifier(14)).toBe(2);
    expect(result.current.calculateModifier(16)).toBe(3);
    expect(result.current.calculateModifier(18)).toBe(4);
    expect(result.current.calculateModifier(20)).toBe(5);
  });

  it('should apply racial bonuses correctly', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    const baseScores: AbilityScores = {
      STR: 14,
      DEX: 12,
      CON: 13,
      INT: 10,
      WIS: 11,
      CHA: 8,
    };

    act(() => {
      result.current.updateDraft({
        race: 'Dwarf',
        abilityScores: baseScores,
      });
    });

    const finalScores = result.current.getFinalAbilityScores();

    // Dwarf gets +2 CON
    expect(finalScores.CON).toBe(15);
    // Other scores unchanged
    expect(finalScores.STR).toBe(14);
    expect(finalScores.DEX).toBe(12);
  });

  it('should validate skill selection count matches class requirement', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({
        class: 'Fighter', // Fighters get 2 skill proficiencies
        abilityScores: validStep3AbilityScores,
      });
    });

    // Too few skills
    act(() => {
      result.current.updateDraft({
        proficientSkills: ['Athletics'],
      });
    });

    expect(result.current.validateStep3()).toBe(false);

    // Correct number of skills
    act(() => {
      result.current.updateDraft({
        proficientSkills: ['Athletics', 'Intimidation'],
      });
    });

    expect(result.current.validateStep3()).toBe(true);

    // Too many skills
    act(() => {
      result.current.updateDraft({
        proficientSkills: ['Athletics', 'Intimidation', 'Survival'],
      });
    });

    expect(result.current.validateStep3()).toBe(false);
  });
});

// ============================================================================
// STEP 4: LOADOUT TESTS (4 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Step 4: Loadout', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should require equipment selection for validation', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // No equipment
    expect(result.current.validateStep4()).toBe(false);

    // With equipment
    act(() => {
      result.current.updateDraft({
        equipment: ['Chain Mail', 'Longsword'],
      });
    });

    expect(result.current.validateStep4()).toBe(true);
  });

  it('should calculate starting gold correctly by class', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Fighter: 5d4 x 10 gold (avg ~125 gold)
    act(() => {
      result.current.updateDraft({ class: 'Fighter' });
    });

    const fighterGold = result.current.calculateStartingGold();
    expect(fighterGold).toBeGreaterThan(0);
    expect(fighterGold).toBeLessThanOrEqual(200);

    // Rogue: 4d4 x 10 gold
    act(() => {
      result.current.updateDraft({ class: 'Rogue' });
    });

    const rogueGold = result.current.calculateStartingGold();
    expect(rogueGold).toBeGreaterThan(0);
    expect(rogueGold).toBeLessThanOrEqual(160);
  });

  it('should save portrait URL when provided', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({
        avatarUrl: '/avatars/thorin.png',
      });
    });

    expect(result.current.draft.avatarUrl).toBe('/avatars/thorin.png');
  });

  it('should persist equipment and appearance to draft', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft(validStep4Equipment);
    });

    expect(result.current.draft.startingGold).toBe(50);
    expect(result.current.draft.equipment).toEqual([
      'Chain Mail',
      'Longsword',
      'Shield',
    ]);
    expect(result.current.draft.avatarUrl).toBe('/avatars/thorin.png');
  });
});

// ============================================================================
// STEP 5: REVIEW & CONFIRM TESTS (3 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Step 5: Review & Confirm', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should ensure all required fields are present for step 5', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Incomplete draft
    expect(result.current.validateStep5()).toBe(false);

    // Complete draft
    act(() => {
      result.current.updateDraft({
        ...validStep1Data,
        ...validStep2Data,
        abilityScores: validStep3AbilityScores,
        proficientSkills: validStep3Skills,
        ...validStep4Equipment,
      });
    });

    expect(result.current.validateStep5()).toBe(true);
  });

  it('should transform data to backend format (camelCase to snake_case)', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({
        ...validStep1Data,
        ...validStep2Data,
        abilityScores: validStep3AbilityScores,
        proficientSkills: validStep3Skills,
        ...validStep4Equipment,
      });
    });

    const backendData = result.current.toBackendFormat();

    expect(backendData).toHaveProperty('starting_gold');
    expect(backendData).toHaveProperty('proficient_skills');
    expect(backendData).toHaveProperty('ability_scores');
    expect(backendData).not.toHaveProperty('startingGold');
    expect(backendData).not.toHaveProperty('proficientSkills');
    expect(backendData).not.toHaveProperty('abilityScores');
  });

  it('should allow navigation back from review to edit any step', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.goToPage(5); // Go to review
    });

    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.goToPage(1); // Go back to edit step 1
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(3); // Jump to step 3
    });

    expect(result.current.currentPage).toBe(3);
  });
});

// ============================================================================
// NAVIGATION TESTS (4 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Navigation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should prevent progression to step 2 if step 1 is invalid', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.nextPage();
    });

    // Should stay on page 1 if validation fails
    expect(result.current.currentPage).toBe(1);

    // Complete step 1
    act(() => {
      result.current.updateDraft(validStep1Data);
    });

    act(() => {
      result.current.nextPage();
    });

    // Now should move to page 2
    expect(result.current.currentPage).toBe(2);
  });

  it('should prevent progression to step 3 if step 2 is invalid', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft(validStep1Data);
      result.current.goToPage(2);
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.nextPage();
    });

    // Should stay on page 2 if alignment not selected
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.updateDraft({ alignment: 'Lawful Good' });
    });

    act(() => {
      result.current.nextPage();
    });

    // Now should move to page 3
    expect(result.current.currentPage).toBe(3);
  });

  it('should allow backward navigation always', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(4);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(3);

    // Should stop at page 1
    act(() => {
      result.current.prevPage();
      result.current.prevPage();
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should allow direct navigation to previously completed steps', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Complete steps 1 and 2
    act(() => {
      result.current.updateDraft(validStep1Data);
      result.current.nextPage();
      result.current.updateDraft(validStep2Data);
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(3);

    // Should be able to jump back to step 1
    act(() => {
      result.current.goToPage(1);
    });

    expect(result.current.currentPage).toBe(1);

    // Should be able to jump to step 2
    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.currentPage).toBe(2);
  });
});

// ============================================================================
// CONTEXT ACTIONS TESTS (5 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Context Actions', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should merge partial updates with updateDraft', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({ name: 'Thorin' });
    });

    expect(result.current.draft.name).toBe('Thorin');

    act(() => {
      result.current.updateDraft({ race: 'Dwarf' });
    });

    // Should preserve name
    expect(result.current.draft.name).toBe('Thorin');
    expect(result.current.draft.race).toBe('Dwarf');

    act(() => {
      result.current.updateDraft({ class: 'Fighter', background: 'Soldier' });
    });

    // Should preserve all previous data
    expect(result.current.draft.name).toBe('Thorin');
    expect(result.current.draft.race).toBe('Dwarf');
    expect(result.current.draft.class).toBe('Fighter');
    expect(result.current.draft.background).toBe('Soldier');
  });

  it('should increment currentPage with nextPage', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    expect(result.current.currentPage).toBe(1);

    // Complete step 1 first
    act(() => {
      result.current.updateDraft(validStep1Data);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.updateDraft({ alignment: 'Lawful Good' });
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('should decrement currentPage with prevPage', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(4);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('should navigate directly with goToPage', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.goToPage(1);
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it('should clear all data and reset to step 1 with resetDraft', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Populate data and navigate
    act(() => {
      result.current.updateDraft({
        ...validStep1Data,
        ...validStep2Data,
      });
      result.current.goToPage(3);
    });

    expect(result.current.draft.name).toBe('Thorin Oakenshield');
    expect(result.current.currentPage).toBe(3);

    // Reset
    act(() => {
      result.current.resetDraft();
    });

    expect(result.current.draft).toEqual({});
    expect(result.current.currentPage).toBe(1);
    expect(localStorageMock.getItem('characterDraft')).toBeNull();
  });
});

// ============================================================================
// LOCALSTORAGE PERSISTENCE TESTS (4 tests)
// ============================================================================

describe('CharacterDraftContextV2 - LocalStorage Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should auto-save draft to localStorage on update', async () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft(validStep1Data);
    });

    await waitFor(() => {
      const stored = localStorageMock.getItem('characterDraft');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('Thorin Oakenshield');
    });
  });

  it('should auto-restore draft from localStorage on mount', () => {
    const storedDraft = {
      ...validStep1Data,
      ...validStep2Data,
    };

    localStorageMock.setItem('characterDraft', JSON.stringify(storedDraft));

    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    expect(result.current.draft.name).toBe('Thorin Oakenshield');
    expect(result.current.draft.race).toBe('Dwarf');
    expect(result.current.draft.alignment).toBe('Lawful Good');
  });

  it('should use localStorage key "characterDraft"', async () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({ name: 'Test' });
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('characterDraft')).not.toBeNull();
      expect(localStorageMock.getItem('characterDraftV2')).toBeNull();
      expect(localStorageMock.getItem('wizard_draft')).toBeNull();
    });
  });

  it('should debounce multiple rapid updates into one save', async () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    const setItemSpy = vi.spyOn(localStorageMock, 'setItem');

    act(() => {
      result.current.updateDraft({ name: 'A' });
      result.current.updateDraft({ name: 'AB' });
      result.current.updateDraft({ name: 'ABC' });
      result.current.updateDraft({ name: 'ABCD' });
      result.current.updateDraft({ name: 'ABCDE' });
    });

    await waitFor(() => {
      const stored = localStorageMock.getItem('characterDraft');
      const parsed = JSON.parse(stored!);
      expect(parsed.name).toBe('ABCDE');
    });

    // Should have called setItem fewer times than updates (debounced)
    expect(setItemSpy).toHaveBeenCalledTimes(1);

    setItemSpy.mockRestore();
  });
});

// ============================================================================
// DATA TRANSFORMATION TESTS (2 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Data Transformation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should transform frontend abilityScores to backend format', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    act(() => {
      result.current.updateDraft({
        ...validStep1Data,
        ...validStep2Data,
        abilityScores: validStep3AbilityScores,
        proficientSkills: validStep3Skills,
        equipment: ['Chain Mail'],
      });
    });

    const backendFormat = result.current.toBackendFormat();

    expect(backendFormat.ability_scores).toEqual({
      STR: 15,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 11,
      CHA: 8,
    });
    expect(backendFormat.proficient_skills).toEqual(['Athletics', 'Intimidation']);
  });

  it('should reconstruct frontend format from backend response', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    const backendData = {
      name: 'Thorin',
      race: 'Dwarf',
      class: 'Fighter',
      background: 'Soldier',
      alignment: 'Lawful Good',
      ability_scores: {
        STR: 15,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 11,
        CHA: 8,
      },
      proficient_skills: ['Athletics', 'Intimidation'],
      starting_gold: 50,
      equipment: ['Chain Mail'],
    };

    const frontendFormat = result.current.fromBackendFormat(backendData);

    expect(frontendFormat.abilityScores).toEqual({
      STR: 15,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 11,
      CHA: 8,
    });
    expect(frontendFormat.proficientSkills).toEqual(['Athletics', 'Intimidation']);
    expect(frontendFormat.startingGold).toBe(50);
  });
});

// ============================================================================
// ERROR SCENARIOS TESTS (2 tests)
// ============================================================================

describe('CharacterDraftContextV2 - Error Scenarios', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should provide specific validation error messages', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    const errors = result.current.getValidationErrors();

    expect(errors).toContain('Name is required');
    expect(errors).toContain('Race is required');
    expect(errors).toContain('Class is required');
    expect(errors).toContain('Background is required');

    // Add partial data
    act(() => {
      result.current.updateDraft({ name: 'T' });
    });

    const errors2 = result.current.getValidationErrors();
    expect(errors2).toContain('Name must be at least 2 characters');
  });

  it('should allow recovery from invalid state by updating fields', () => {
    const { result } = renderHook(() => useCharacterDraftV2(), {
      wrapper: CharacterDraftProviderV2,
    });

    // Start with invalid name
    act(() => {
      result.current.updateDraft({ name: 'X' });
    });

    expect(result.current.validateStep1()).toBe(false);

    // Fix the name
    act(() => {
      result.current.updateDraft({ name: 'Thorin Oakenshield' });
    });

    // Still invalid (missing other fields)
    expect(result.current.validateStep1()).toBe(false);

    // Complete step 1
    act(() => {
      result.current.updateDraft({
        race: 'Dwarf',
        class: 'Fighter',
        background: 'Soldier',
      });
    });

    // Now valid
    expect(result.current.validateStep1()).toBe(true);
  });
});
