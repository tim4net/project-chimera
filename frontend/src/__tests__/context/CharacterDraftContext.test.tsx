/**
 * @fileoverview Tests for CharacterDraftContext and useCharacterDraft hook.
 * Comprehensive test coverage for state management, localStorage persistence,
 * and validation logic.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CharacterDraftProvider, useCharacterDraft, STORAGE_KEY } from '../../context/characterDraft';
import type {
  IdentityData,
  CoreAttributesData,
  AlignmentData,
  AbilityScoresData,
  SkillsData,
  EquipmentData,
  CharacterDraft,
} from '../../types/wizard';
import type { AbilityScores } from '../../types';

// ============================================================================
// Test Setup
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
});

// Test data fixtures
const mockIdentityData: IdentityData = {
  name: 'Thorin Ironforge',
  age: 150,
  description: 'A stout dwarf warrior',
  avatarUrl: '/avatars/thorin.png',
};

const mockCoreAttributesData: CoreAttributesData = {
  race: 'Dwarf',
  class: 'Fighter',
  background: 'Soldier',
};

const mockAlignmentData: AlignmentData = {
  alignment: 'Lawful Good',
  personalityTraits: ['Brave', 'Loyal'],
  ideals: ['Honor', 'Justice'],
  bonds: ['Protect my homeland'],
  flaws: ['Stubborn'],
};

const mockAbilityScores: AbilityScores = {
  STR: 16,
  DEX: 12,
  CON: 15,
  INT: 10,
  WIS: 11,
  CHA: 8,
};

const mockAbilityScoresData: AbilityScoresData = {
  baseScores: { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 11, CHA: 8 },
  pointsRemaining: 0,
  finalScores: mockAbilityScores,
};

const mockSkillsData: SkillsData = {
  proficientSkills: ['Athletics', 'Intimidation', 'Survival'],
  backgroundSkills: ['Athletics', 'Intimidation'],
  classSkills: ['Survival'],
};

const mockEquipmentData: EquipmentData = {
  startingGold: 50,
  selectedEquipment: ['Longsword', 'Shield', 'Chain Mail'],
  weapon: 'Longsword',
  armor: 'Chain Mail',
  tools: [],
};

// ============================================================================
// Tests: Context Provider
// ============================================================================

describe('CharacterDraftContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Provider Initialization', () => {
    it('should provide initial empty state', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      expect(result.current.draft).toEqual({});
      expect(result.current.currentPage).toBe(1);
      expect(result.current.isModified).toBe(false);
      expect(result.current.lastSaved).toBeNull();
    });

    it('should load state from localStorage on mount', () => {
      const storedState = {
        draft: mockIdentityData,
        currentPage: 2,
        lastSaved: '2025-01-20T12:00:00.000Z',
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedState));

      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      expect(result.current.draft).toEqual(mockIdentityData);
      expect(result.current.currentPage).toBe(2);
      expect(result.current.lastSaved).toBe('2025-01-20T12:00:00.000Z');
      expect(result.current.isModified).toBe(false);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem(STORAGE_KEY, 'invalid-json{');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      expect(result.current.draft).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load character draft from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // Tests: Update Step Actions
  // ============================================================================

  describe('updateStep - Identity', () => {
    it('should update identity data', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
      });

      expect(result.current.draft.name).toBe('Thorin Ironforge');
      expect(result.current.draft.age).toBe(150);
      expect(result.current.draft.description).toBe('A stout dwarf warrior');
      expect(result.current.isModified).toBe(true);
    });

    it('should preserve unmodified fields when partially updating identity', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', { name: 'Thorin' });
      });

      act(() => {
        result.current.updateStep('identity', { age: 150 });
      });

      expect(result.current.draft.name).toBe('Thorin');
      expect(result.current.draft.age).toBe(150);
    });
  });

  describe('updateStep - Core Attributes', () => {
    it('should update core attributes data', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('coreAttributes', mockCoreAttributesData);
      });

      expect(result.current.draft.race).toBe('Dwarf');
      expect(result.current.draft.class).toBe('Fighter');
      expect(result.current.draft.background).toBe('Soldier');
      expect(result.current.isModified).toBe(true);
    });
  });

  describe('updateStep - Alignment', () => {
    it('should update alignment data', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('alignment', mockAlignmentData);
      });

      expect(result.current.draft.alignment).toBe('Lawful Good');
      expect(result.current.draft.personalityTraits).toEqual(['Brave', 'Loyal']);
      expect(result.current.draft.ideals).toEqual(['Honor', 'Justice']);
      expect(result.current.draft.bonds).toEqual(['Protect my homeland']);
      expect(result.current.draft.flaws).toEqual(['Stubborn']);
      expect(result.current.isModified).toBe(true);
    });

    it('should handle partial alignment updates', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('alignment', { alignment: 'Lawful Good' });
      });

      expect(result.current.draft.alignment).toBe('Lawful Good');
      expect(result.current.draft.personalityTraits).toEqual([]);
      expect(result.current.draft.ideals).toEqual([]);
    });
  });

  describe('updateStep - Ability Scores', () => {
    it('should update ability scores from finalScores', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('abilityScores', mockAbilityScoresData);
      });

      expect(result.current.draft.abilityScores).toEqual(mockAbilityScores);
      expect(result.current.isModified).toBe(true);
    });
  });

  describe('updateStep - Skills', () => {
    it('should update skills data', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('skills', mockSkillsData);
      });

      expect(result.current.draft.proficientSkills).toEqual([
        'Athletics',
        'Intimidation',
        'Survival',
      ]);
      expect(result.current.isModified).toBe(true);
    });
  });

  describe('updateStep - Equipment', () => {
    it('should update equipment data', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('equipment', mockEquipmentData);
      });

      expect(result.current.draft.startingGold).toBe(50);
      expect(result.current.draft.equipment).toEqual(['Longsword', 'Shield', 'Chain Mail']);
      expect(result.current.isModified).toBe(true);
    });
  });

  // ============================================================================
  // Tests: Navigation
  // ============================================================================

  describe('Page Navigation', () => {
    it('should navigate to specific page', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
    });

    it('should navigate to next page', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(3);
    });

    it('should not navigate beyond page 3', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.goToPage(3);
      });

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(3);
    });

    it('should navigate to previous page', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.goToPage(3);
      });

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should not navigate before page 1', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  // ============================================================================
  // Tests: Draft Management
  // ============================================================================

  describe('Draft Management', () => {
    it('should save draft and update lastSaved timestamp', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
      });

      expect(result.current.isModified).toBe(true);

      act(() => {
        result.current.saveDraft();
      });

      expect(result.current.isModified).toBe(false);
      expect(result.current.lastSaved).not.toBeNull();
    });

    it('should load draft from external source', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      const externalDraft: Partial<CharacterDraft> = {
        ...mockIdentityData,
        ...mockCoreAttributesData,
      };

      act(() => {
        result.current.loadDraft(externalDraft);
      });

      expect(result.current.draft.name).toBe('Thorin Ironforge');
      expect(result.current.draft.race).toBe('Dwarf');
      expect(result.current.isModified).toBe(false);
      expect(result.current.lastSaved).not.toBeNull();
    });

    it('should reset draft to initial state', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
        result.current.goToPage(2);
      });

      expect(result.current.draft.name).toBe('Thorin Ironforge');
      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.resetDraft();
      });

      expect(result.current.draft).toEqual({});
      expect(result.current.currentPage).toBe(1);
      expect(result.current.isModified).toBe(false);
      expect(result.current.lastSaved).toBeNull();
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  // ============================================================================
  // Tests: LocalStorage Persistence
  // ============================================================================

  describe('LocalStorage Persistence', () => {
    it('should persist draft to localStorage on update', async () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
      });

      await waitFor(() => {
        const stored = localStorageMock.getItem(STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.draft.name).toBe('Thorin Ironforge');
      });
    });

    it('should persist page navigation to localStorage', async () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.goToPage(2);
      });

      await waitFor(() => {
        const stored = localStorageMock.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        expect(parsed.currentPage).toBe(2);
      });
    });

    it('should handle localStorage write failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save character draft to localStorage:',
          expect.any(Error)
        );
      });

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // Tests: Validation
  // ============================================================================

  describe('Validation', () => {
    it('should validate page 1 requirements', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      expect(result.current.isPageValid()).toBe(false);

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
        result.current.updateStep('coreAttributes', mockCoreAttributesData);
        result.current.updateStep('alignment', mockAlignmentData);
      });

      expect(result.current.isPageValid()).toBe(true);
    });

    it('should validate page 2 requirements', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.isPageValid()).toBe(false);

      act(() => {
        result.current.updateStep('abilityScores', mockAbilityScoresData);
        result.current.updateStep('skills', mockSkillsData);
      });

      expect(result.current.isPageValid()).toBe(true);
    });

    it('should validate page 3 requirements', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.isPageValid()).toBe(false);

      act(() => {
        result.current.updateStep('equipment', mockEquipmentData);
      });

      expect(result.current.isPageValid()).toBe(true);
    });

    it('should return validation errors for missing fields', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      const errors = result.current.getValidationErrors();

      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('race');
      expect(errors).toHaveProperty('class');
      expect(errors).toHaveProperty('background');
      expect(errors).toHaveProperty('alignment');
      expect(errors).toHaveProperty('abilityScores');
      expect(errors).toHaveProperty('proficientSkills');
      expect(errors).toHaveProperty('equipment');
    });

    it('should return no validation errors when draft is complete', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      act(() => {
        result.current.updateStep('identity', mockIdentityData);
        result.current.updateStep('coreAttributes', mockCoreAttributesData);
        result.current.updateStep('alignment', mockAlignmentData);
        result.current.updateStep('abilityScores', mockAbilityScoresData);
        result.current.updateStep('skills', mockSkillsData);
        result.current.updateStep('equipment', mockEquipmentData);
      });

      const errors = result.current.getValidationErrors();
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  // ============================================================================
  // Tests: Error Handling
  // ============================================================================

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useCharacterDraft());
      }).toThrow('useCharacterDraftContext must be used within a CharacterDraftProvider');
    });

    it('should handle unknown step names gracefully', () => {
      const { result } = renderHook(() => useCharacterDraft(), {
        wrapper: CharacterDraftProvider,
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        result.current.updateStep('unknownStep' as any, {});
      });

      expect(consoleSpy).toHaveBeenCalledWith('Unknown step name: unknownStep');
      consoleSpy.mockRestore();
    });
  });
});
