/**
 * @fileoverview Provider component for character draft context.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { DraftState, DraftAction } from './types';
import { INITIAL_STATE, STORAGE_KEY } from './types';
import { draftReducer } from './reducer';

// ============================================================================
// Context
// ============================================================================

interface CharacterDraftContextValue {
  state: DraftState;
  dispatch: React.Dispatch<DraftAction>;
}

const CharacterDraftContext = createContext<CharacterDraftContextValue | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface CharacterDraftProviderProps {
  children: React.ReactNode;
}

export function CharacterDraftProvider({ children }: CharacterDraftProviderProps) {
  const [state, dispatch] = useReducer(draftReducer, INITIAL_STATE, (initial) => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initial,
          draft: parsed.draft || {},
          currentPage: parsed.currentPage || 1,
          lastSaved: parsed.lastSaved || null,
          isModified: false,
        };
      }
    } catch (error) {
      console.error('Failed to load character draft from localStorage:', error);
    }
    return initial;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      if (state.isReset) {
        // Remove from localStorage on reset
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // Save to localStorage
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            draft: state.draft,
            currentPage: state.currentPage,
            lastSaved: state.lastSaved,
          })
        );
      }
    } catch (error) {
      console.error('Failed to save character draft to localStorage:', error);
    }
  }, [state.draft, state.currentPage, state.lastSaved, state.isReset]);

  return (
    <CharacterDraftContext.Provider value={{ state, dispatch }}>
      {children}
    </CharacterDraftContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

export function useCharacterDraftContext() {
  const context = useContext(CharacterDraftContext);
  if (!context) {
    throw new Error('useCharacterDraftContext must be used within a CharacterDraftProvider');
  }
  return context;
}
