/**
 * @fileoverview CharacterDraftContextV2 - 5-Step Character Creation Wizard
 * Phase 1 Task 1.2: State Management Implementation
 *
 * STUB FILE: This is a minimal stub to allow tests to import.
 * Full implementation comes in GREEN phase (Phase 1 Task 1.3)
 */

import React, { createContext, useContext } from 'react';
import type { CharacterDraft } from '../types/wizard';
import type { AbilityScores } from '../types';

// Stub context type
interface CharacterDraftContextV2Type {
  draft: Partial<CharacterDraft>;
  currentPage: 1 | 2 | 3 | 4 | 5;
  updateDraft: (updates: Partial<CharacterDraft>) => void;
  validateStep1: () => boolean;
  validateStep2: () => boolean;
  validateStep3: () => boolean;
  validateStep4: () => boolean;
  validateStep5: () => boolean;
  calculateModifier: (score: number) => number;
  getFinalAbilityScores: () => AbilityScores;
  calculateStartingGold: () => number;
  toBackendFormat: () => any;
  fromBackendFormat: (data: any) => Partial<CharacterDraft>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: 1 | 2 | 3 | 4 | 5) => void;
  resetDraft: () => void;
  getValidationErrors: () => string[];
}

const CharacterDraftContextV2 = createContext<CharacterDraftContextV2Type | null>(null);

export function CharacterDraftProvider({ children }: { children: React.ReactNode }) {
  // Stub implementation - throws errors for all methods
  const value: CharacterDraftContextV2Type = {
    draft: {},
    currentPage: 1,
    updateDraft: () => {
      throw new Error('Not implemented');
    },
    validateStep1: () => {
      throw new Error('Not implemented');
    },
    validateStep2: () => {
      throw new Error('Not implemented');
    },
    validateStep3: () => {
      throw new Error('Not implemented');
    },
    validateStep4: () => {
      throw new Error('Not implemented');
    },
    validateStep5: () => {
      throw new Error('Not implemented');
    },
    calculateModifier: () => {
      throw new Error('Not implemented');
    },
    getFinalAbilityScores: () => {
      throw new Error('Not implemented');
    },
    calculateStartingGold: () => {
      throw new Error('Not implemented');
    },
    toBackendFormat: () => {
      throw new Error('Not implemented');
    },
    fromBackendFormat: () => {
      throw new Error('Not implemented');
    },
    nextPage: () => {
      throw new Error('Not implemented');
    },
    prevPage: () => {
      throw new Error('Not implemented');
    },
    goToPage: () => {
      throw new Error('Not implemented');
    },
    resetDraft: () => {
      throw new Error('Not implemented');
    },
    getValidationErrors: () => {
      throw new Error('Not implemented');
    },
  };

  return (
    <CharacterDraftContextV2.Provider value={value}>
      {children}
    </CharacterDraftContextV2.Provider>
  );
}

export function useCharacterDraft() {
  const context = useContext(CharacterDraftContextV2);
  if (!context) {
    throw new Error('useCharacterDraft must be used within a CharacterDraftProvider');
  }
  return context;
}
