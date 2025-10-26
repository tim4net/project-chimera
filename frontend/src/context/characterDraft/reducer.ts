/**
 * @fileoverview Reducer function for character draft state management.
 */

import type { DraftState, DraftAction } from './types';
import { INITIAL_STATE } from './types';

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'UPDATE_IDENTITY':
      return {
        ...state,
        draft: {
          ...state.draft,
          ...action.payload,
        },
        isModified: true,
        isReset: false,
      };

    case 'UPDATE_CORE_ATTRIBUTES':
      return {
        ...state,
        draft: {
          ...state.draft,
          ...action.payload,
        },
        isModified: true,
        isReset: false,
      };

    case 'UPDATE_ALIGNMENT':
      return {
        ...state,
        draft: {
          ...state.draft,
          alignment: action.payload.alignment ?? state.draft.alignment,
          personalityTraits: action.payload.personalityTraits ?? state.draft.personalityTraits ?? [],
          ideals: action.payload.ideals ?? state.draft.ideals ?? [],
          bonds: action.payload.bonds ?? state.draft.bonds ?? [],
          flaws: action.payload.flaws ?? state.draft.flaws ?? [],
        },
        isModified: true,
        isReset: false,
      };

    case 'UPDATE_ABILITY_SCORES':
      return {
        ...state,
        draft: {
          ...state.draft,
          abilityScores: action.payload.finalScores ?? state.draft.abilityScores,
        },
        isModified: true,
        isReset: false,
      };

    case 'UPDATE_SKILLS':
      return {
        ...state,
        draft: {
          ...state.draft,
          proficientSkills: action.payload.proficientSkills ?? state.draft.proficientSkills ?? [],
        },
        isModified: true,
        isReset: false,
      };

    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        draft: {
          ...state.draft,
          startingGold: action.payload.startingGold ?? state.draft.startingGold ?? 0,
          equipment: action.payload.selectedEquipment ?? state.draft.equipment ?? [],
        },
        isModified: true,
        isReset: false,
      };

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        isReset: false,
      };

    case 'LOAD_DRAFT':
      return {
        ...state,
        draft: action.payload,
        isModified: false,
        lastSaved: new Date().toISOString(),
        isReset: false,
      };

    case 'SAVE_DRAFT':
      return {
        ...state,
        isModified: false,
        lastSaved: new Date().toISOString(),
        isReset: false,
      };

    case 'RESET_DRAFT':
      return { ...INITIAL_STATE, isReset: true };

    default:
      return state;
  }
}
