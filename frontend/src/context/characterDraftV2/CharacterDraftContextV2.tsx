/**
 * @fileoverview CharacterDraftContextV2 - 5-Step Character Creation State Management
 * Implements context with reducer pattern, localStorage persistence, and validation.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { AbilityScores } from '../../types';
import type { CharacterClass, Race } from '../../types/wizard';
import {
  characterDraftReducer,
  initialState,
  type PageNumber,
  type CharacterDraftState,
} from './characterReducer';
import type { CharacterDraft } from './validation';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  getValidationErrors,
} from './validation';
import { toBackendFormat, fromBackendFormat } from './transforms';
import { applyRacialBonuses } from '../../validation/abilities';
import { getRacialBonuses } from '../../data/racialBonuses';
import { getClassSkillCount } from '../../validation/skills';

const LOCALSTORAGE_KEY = 'characterDraft';
const DEBOUNCE_DELAY = 500; // ms

/**
 * Context value type
 */
export interface CharacterDraftContextType {
  // State
  draft: Partial<CharacterDraft>;
  currentPage: PageNumber;

  // Actions
  updateDraft: (data: Partial<CharacterDraft>) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: PageNumber) => void;
  resetDraft: () => void;

  // Validation
  validateStep1: () => boolean;
  validateStep2: () => boolean;
  validateStep3: () => boolean;
  validateStep4: () => boolean;
  validateStep5: () => boolean;
  getValidationErrors: () => string[];

  // Utility functions
  calculateModifier: (score: number) => number;
  getFinalAbilityScores: () => AbilityScores;
  calculateStartingGold: () => number;
  toBackendFormat: () => any;
  fromBackendFormat: (data: any) => CharacterDraft;
}

const CharacterDraftContext = createContext<CharacterDraftContextType | undefined>(undefined);

/**
 * Provider component
 */
export const CharacterDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(characterDraftReducer, initialState, (initial) => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initial,
          draft: parsed,
        };
      }
    } catch (error) {
      console.error('Failed to restore draft from localStorage:', error);
    }
    return initial;
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced localStorage save
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (Object.keys(state.draft).length > 0) {
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state.draft));
        }
      } catch (error) {
        console.error('Failed to save draft to localStorage:', error);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.draft]);

  // Actions
  const updateDraft = useCallback((data: Partial<CharacterDraft>) => {
    dispatch({ type: 'UPDATE_DRAFT', payload: data });
  }, []);

  const nextPage = useCallback(() => {
    // Validate current page before allowing navigation
    let canProceed = false;

    switch (state.currentPage) {
      case 1:
        canProceed = validateStep1(state.draft);
        break;
      case 2:
        canProceed = validateStep2(state.draft);
        break;
      case 3:
        canProceed = validateStep3(state.draft);
        break;
      case 4:
        canProceed = validateStep4(state.draft);
        break;
      case 5:
        canProceed = true; // Already on last page
        break;
    }

    if (canProceed) {
      dispatch({ type: 'NEXT_PAGE' });
    }
  }, [state.currentPage, state.draft]);

  const prevPage = useCallback(() => {
    dispatch({ type: 'PREV_PAGE' });
  }, []);

  const goToPage = useCallback((page: PageNumber) => {
    dispatch({ type: 'GO_TO_PAGE', payload: page });
  }, []);

  const resetDraft = useCallback(() => {
    dispatch({ type: 'RESET_DRAFT' });
    localStorage.removeItem(LOCALSTORAGE_KEY);
  }, []);

  // Validation functions
  const validateCurrentStep1 = useCallback(() => {
    return validateStep1(state.draft);
  }, [state.draft]);

  const validateCurrentStep2 = useCallback(() => {
    return validateStep2(state.draft);
  }, [state.draft]);

  const validateCurrentStep3 = useCallback(() => {
    return validateStep3(state.draft);
  }, [state.draft]);

  const validateCurrentStep4 = useCallback(() => {
    return validateStep4(state.draft);
  }, [state.draft]);

  const validateCurrentStep5 = useCallback(() => {
    return validateStep5(state.draft);
  }, [state.draft]);

  const getCurrentValidationErrors = useCallback(() => {
    return getValidationErrors(state.draft);
  }, [state.draft]);

  // Utility functions
  const calculateModifier = useCallback((score: number): number => {
    return Math.floor((score - 10) / 2);
  }, []);

  const getFinalAbilityScores = useCallback((): AbilityScores => {
    if (!state.draft.abilityScores || !state.draft.race) {
      return { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    }

    return applyRacialBonuses(state.draft.abilityScores, state.draft.race as Race);
  }, [state.draft.abilityScores, state.draft.race]);

  const calculateStartingGold = useCallback((): number => {
    if (!state.draft.class) {
      return 0;
    }

    // D&D 5e starting gold by class
    const goldDice: Record<CharacterClass, { dice: number; sides: number; multiplier: number }> = {
      Barbarian: { dice: 2, sides: 4, multiplier: 10 },
      Bard: { dice: 5, sides: 4, multiplier: 10 },
      Cleric: { dice: 5, sides: 4, multiplier: 10 },
      Druid: { dice: 2, sides: 4, multiplier: 10 },
      Fighter: { dice: 5, sides: 4, multiplier: 10 },
      Monk: { dice: 5, sides: 4, multiplier: 1 },
      Paladin: { dice: 5, sides: 4, multiplier: 10 },
      Ranger: { dice: 5, sides: 4, multiplier: 10 },
      Rogue: { dice: 4, sides: 4, multiplier: 10 },
      Sorcerer: { dice: 3, sides: 4, multiplier: 10 },
      Warlock: { dice: 4, sides: 4, multiplier: 10 },
      Wizard: { dice: 4, sides: 4, multiplier: 10 },
    };

    const config = goldDice[state.draft.class as CharacterClass];
    if (!config) {
      return 0;
    }

    // Roll dice
    let total = 0;
    for (let i = 0; i < config.dice; i++) {
      total += Math.floor(Math.random() * config.sides) + 1;
    }

    return total * config.multiplier;
  }, [state.draft.class]);

  const transformToBackend = useCallback(() => {
    return toBackendFormat(state.draft as CharacterDraft);
  }, [state.draft]);

  const transformFromBackend = useCallback((data: any) => {
    return fromBackendFormat(data);
  }, []);

  const contextValue: CharacterDraftContextType = {
    draft: state.draft,
    currentPage: state.currentPage,
    updateDraft,
    nextPage,
    prevPage,
    goToPage,
    resetDraft,
    validateStep1: validateCurrentStep1,
    validateStep2: validateCurrentStep2,
    validateStep3: validateCurrentStep3,
    validateStep4: validateCurrentStep4,
    validateStep5: validateCurrentStep5,
    getValidationErrors: getCurrentValidationErrors,
    calculateModifier,
    getFinalAbilityScores,
    calculateStartingGold,
    toBackendFormat: transformToBackend,
    fromBackendFormat: transformFromBackend,
  };

  return (
    <CharacterDraftContext.Provider value={contextValue}>
      {children}
    </CharacterDraftContext.Provider>
  );
};

/**
 * Hook to access CharacterDraftContext
 */
export const useCharacterDraft = (): CharacterDraftContextType => {
  const context = useContext(CharacterDraftContext);
  if (!context) {
    throw new Error('useCharacterDraft must be used within a CharacterDraftProvider');
  }
  return context;
};

export { CharacterDraftContext };
export type { CharacterDraft };
