/**
 * @fileoverview State reducer for CharacterDraftContextV2
 * Manages draft state, navigation, and validation.
 */

import type { CharacterDraft } from './validation';

export type PageNumber = 1 | 2 | 3 | 4 | 5;

export interface CharacterDraftState {
  draft: Partial<CharacterDraft>;
  currentPage: PageNumber;
  completedSteps: Set<number>;
}

export type CharacterDraftAction =
  | { type: 'UPDATE_DRAFT'; payload: Partial<CharacterDraft> }
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' }
  | { type: 'GO_TO_PAGE'; payload: PageNumber }
  | { type: 'RESET_DRAFT' }
  | { type: 'MARK_STEP_COMPLETE'; payload: number }
  | { type: 'RESTORE_DRAFT'; payload: Partial<CharacterDraft> };

export const initialState: CharacterDraftState = {
  draft: {},
  currentPage: 1,
  completedSteps: new Set(),
};

/**
 * Character draft reducer
 */
export function characterDraftReducer(
  state: CharacterDraftState,
  action: CharacterDraftAction
): CharacterDraftState {
  switch (action.type) {
    case 'UPDATE_DRAFT':
      // Normalize fields
      const payload = { ...action.payload };

      // Normalize equipment fields: selectedEquipment ↔ equipment
      if (payload.selectedEquipment && !payload.equipment) {
        payload.equipment = payload.selectedEquipment;
      }
      if (payload.equipment && !payload.selectedEquipment) {
        payload.selectedEquipment = payload.equipment;
      }

      // Normalize avatar fields: portraitUrl ↔ avatarUrl
      if (payload.portraitUrl && !payload.avatarUrl) {
        payload.avatarUrl = payload.portraitUrl;
      }
      if (payload.avatarUrl && !payload.portraitUrl) {
        payload.portraitUrl = payload.avatarUrl;
      }

      return {
        ...state,
        draft: {
          ...state.draft,
          ...payload,
        },
      };

    case 'NEXT_PAGE':
      // Can only move forward if current page <= 4 (can't go past page 5)
      if (state.currentPage < 5) {
        const newPage = (state.currentPage + 1) as PageNumber;
        return {
          ...state,
          currentPage: newPage,
        };
      }
      return state;

    case 'PREV_PAGE':
      // Can only move backward if current page > 1
      if (state.currentPage > 1) {
        const newPage = (state.currentPage - 1) as PageNumber;
        return {
          ...state,
          currentPage: newPage,
        };
      }
      return state;

    case 'GO_TO_PAGE':
      // Allow direct navigation to any page
      return {
        ...state,
        currentPage: action.payload,
      };

    case 'MARK_STEP_COMPLETE':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };

    case 'RESET_DRAFT':
      return {
        ...initialState,
        completedSteps: new Set(),
      };

    case 'RESTORE_DRAFT':
      return {
        ...state,
        draft: action.payload,
      };

    default:
      return state;
  }
}
