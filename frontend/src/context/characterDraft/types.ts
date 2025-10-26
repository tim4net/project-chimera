/**
 * @fileoverview Type definitions for character draft state management.
 */

import type {
  CharacterDraft,
  IdentityData,
  CoreAttributesData,
  AlignmentData,
  AbilityScoresData,
  SkillsData,
  EquipmentData,
} from '../../types/wizard';

export interface DraftState {
  draft: Partial<CharacterDraft>;
  currentPage: 1 | 2 | 3;
  isModified: boolean;
  lastSaved: string | null;
  isReset: boolean;
}

export type DraftAction =
  | { type: 'UPDATE_IDENTITY'; payload: Partial<IdentityData> }
  | { type: 'UPDATE_CORE_ATTRIBUTES'; payload: Partial<CoreAttributesData> }
  | { type: 'UPDATE_ALIGNMENT'; payload: Partial<AlignmentData> }
  | { type: 'UPDATE_ABILITY_SCORES'; payload: Partial<AbilityScoresData> }
  | { type: 'UPDATE_SKILLS'; payload: Partial<SkillsData> }
  | { type: 'UPDATE_EQUIPMENT'; payload: Partial<EquipmentData> }
  | { type: 'SET_PAGE'; payload: 1 | 2 | 3 }
  | { type: 'LOAD_DRAFT'; payload: Partial<CharacterDraft> }
  | { type: 'SAVE_DRAFT' }
  | { type: 'RESET_DRAFT' };

export const INITIAL_STATE: DraftState = {
  draft: {},
  currentPage: 1,
  isModified: false,
  lastSaved: null,
  isReset: false,
};

export const STORAGE_KEY = 'nuaibria_character_draft';
