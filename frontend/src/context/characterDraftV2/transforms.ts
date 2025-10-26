/**
 * @fileoverview Data transformation utilities for CharacterDraftContextV2
 * Handles conversion between frontend (camelCase) and backend (snake_case) formats.
 */

import type { CharacterDraft } from './validation';

/**
 * Backend character payload format (snake_case)
 */
export interface BackendCharacterPayload {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  gender?: string;
  personality_traits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  avatar_url?: string;
  ability_scores: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  proficient_skills: string[];
  equipment: string[];
  starting_gold: number;
  portrait_url?: string;
}

/**
 * Transform frontend draft to backend format
 * Converts camelCase to snake_case
 */
export function toBackendFormat(draft: CharacterDraft): BackendCharacterPayload {
  if (!draft.name || !draft.race || !draft.class || !draft.background || !draft.alignment) {
    throw new Error('Missing required fields for backend transformation');
  }

  if (!draft.abilityScores) {
    throw new Error('Ability scores are required');
  }

  if (!draft.proficientSkills) {
    throw new Error('Proficient skills are required');
  }

  const equipment = draft.equipment || draft.selectedEquipment || [];

  return {
    name: draft.name,
    race: draft.race,
    class: draft.class,
    background: draft.background,
    alignment: draft.alignment,
    gender: draft.gender,
    personality_traits: draft.personalityTraits,
    ideals: draft.ideals,
    bonds: draft.bonds,
    flaws: draft.flaws,
    avatar_url: draft.avatarUrl || draft.portraitUrl,
    ability_scores: {
      STR: draft.abilityScores.STR,
      DEX: draft.abilityScores.DEX,
      CON: draft.abilityScores.CON,
      INT: draft.abilityScores.INT,
      WIS: draft.abilityScores.WIS,
      CHA: draft.abilityScores.CHA,
    },
    proficient_skills: draft.proficientSkills,
    equipment,
    starting_gold: draft.startingGold || 0,
    portrait_url: draft.portraitUrl || draft.avatarUrl,
  };
}

/**
 * Transform backend response to frontend format
 * Converts snake_case to camelCase
 */
export function fromBackendFormat(backendData: any): CharacterDraft {
  return {
    name: backendData.name,
    race: backendData.race,
    class: backendData.class,
    background: backendData.background,
    alignment: backendData.alignment,
    gender: backendData.gender,
    personalityTraits: backendData.personality_traits,
    ideals: backendData.ideals,
    bonds: backendData.bonds,
    flaws: backendData.flaws,
    avatarUrl: backendData.avatar_url || backendData.portrait_url,
    abilityScores: backendData.ability_scores,
    proficientSkills: backendData.proficient_skills,
    equipment: backendData.equipment,
    startingGold: backendData.starting_gold,
    portraitUrl: backendData.portrait_url || backendData.avatar_url,
  };
}
