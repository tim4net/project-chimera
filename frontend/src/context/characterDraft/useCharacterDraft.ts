/**
 * @fileoverview Main hook for character draft state management.
 * Provides methods for updating draft state, navigation, and validation.
 */

import { useCallback } from 'react';
import type { WizardStep, CharacterDraft } from '../../types/wizard';
import type {
  IdentityData,
  CoreAttributesData,
  AlignmentData,
  AbilityScoresData,
  SkillsData,
  EquipmentData,
} from '../../types/wizard';
import { useCharacterDraftContext } from './CharacterDraftProvider';

export function useCharacterDraft() {
  const { state, dispatch } = useCharacterDraftContext();

  const updateStep = useCallback(
    (stepName: WizardStep, data: object) => {
      switch (stepName) {
        case 'identity':
          dispatch({ type: 'UPDATE_IDENTITY', payload: data as Partial<IdentityData> });
          break;
        case 'coreAttributes':
          dispatch({ type: 'UPDATE_CORE_ATTRIBUTES', payload: data as Partial<CoreAttributesData> });
          break;
        case 'alignment':
          dispatch({ type: 'UPDATE_ALIGNMENT', payload: data as Partial<AlignmentData> });
          break;
        case 'abilityScores':
          dispatch({ type: 'UPDATE_ABILITY_SCORES', payload: data as Partial<AbilityScoresData> });
          break;
        case 'skills':
          dispatch({ type: 'UPDATE_SKILLS', payload: data as Partial<SkillsData> });
          break;
        case 'equipment':
          dispatch({ type: 'UPDATE_EQUIPMENT', payload: data as Partial<EquipmentData> });
          break;
        default:
          console.warn(`Unknown step name: ${stepName}`);
      }
    },
    [dispatch]
  );

  const goToPage = useCallback(
    (pageNumber: 1 | 2 | 3) => {
      dispatch({ type: 'SET_PAGE', payload: pageNumber });
    },
    [dispatch]
  );

  const nextPage = useCallback(() => {
    if (state.currentPage < 3) {
      dispatch({ type: 'SET_PAGE', payload: (state.currentPage + 1) as 1 | 2 | 3 });
    }
  }, [state.currentPage, dispatch]);

  const prevPage = useCallback(() => {
    if (state.currentPage > 1) {
      dispatch({ type: 'SET_PAGE', payload: (state.currentPage - 1) as 1 | 2 | 3 });
    }
  }, [state.currentPage, dispatch]);

  const saveDraft = useCallback(() => {
    dispatch({ type: 'SAVE_DRAFT' });
  }, [dispatch]);

  const loadDraft = useCallback(
    (draft: Partial<CharacterDraft>) => {
      dispatch({ type: 'LOAD_DRAFT', payload: draft });
    },
    [dispatch]
  );

  const resetDraft = useCallback(() => {
    dispatch({ type: 'RESET_DRAFT' });
    // localStorage removal is handled by useEffect
  }, [dispatch]);

  // Validation: Page 1 (Identity, Core Attributes, Alignment)
  const isPage1Valid = useCallback(() => {
    const { draft } = state;
    return !!(
      draft.name &&
      draft.race &&
      draft.class &&
      draft.background &&
      draft.alignment
    );
  }, [state]);

  // Validation: Page 2 (Ability Scores, Skills)
  const isPage2Valid = useCallback(() => {
    const { draft } = state;
    return !!(
      draft.abilityScores &&
      draft.proficientSkills &&
      draft.proficientSkills.length > 0
    );
  }, [state]);

  // Validation: Page 3 (Equipment)
  const isPage3Valid = useCallback(() => {
    const { draft } = state;
    return !!(draft.equipment && draft.equipment.length > 0);
  }, [state]);

  const isPageValid = useCallback((): boolean => {
    switch (state.currentPage) {
      case 1:
        return isPage1Valid();
      case 2:
        return isPage2Valid();
      case 3:
        return isPage3Valid();
      default:
        return false;
    }
  }, [state.currentPage, isPage1Valid, isPage2Valid, isPage3Valid]);

  const getValidationErrors = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const { draft } = state;

    if (!draft.name) errors.name = 'Name is required';
    if (!draft.race) errors.race = 'Race is required';
    if (!draft.class) errors.class = 'Class is required';
    if (!draft.background) errors.background = 'Background is required';
    if (!draft.alignment) errors.alignment = 'Alignment is required';
    if (!draft.abilityScores) errors.abilityScores = 'Ability scores are required';
    if (!draft.proficientSkills || draft.proficientSkills.length === 0) {
      errors.proficientSkills = 'At least one skill proficiency is required';
    }
    if (!draft.equipment || draft.equipment.length === 0) {
      errors.equipment = 'At least one piece of equipment is required';
    }

    return errors;
  }, [state]);

  return {
    draft: state.draft,
    currentPage: state.currentPage,
    isModified: state.isModified,
    lastSaved: state.lastSaved,
    updateStep,
    goToPage,
    nextPage,
    prevPage,
    saveDraft,
    loadDraft,
    resetDraft,
    isPageValid,
    getValidationErrors,
  };
}
