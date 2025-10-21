/**
 * Characters API Client
 * Handles character creation and retrieval
 */

import axios from 'axios';
import type { Character } from '../types/index.js';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface CreateCharacterPayload {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  abilityScores: AbilityScores;
  skills?: Record<string, unknown> | null;
  backstory?: Record<string, unknown> | null;
  portraitUrl?: string | null;
}

export interface CreateCharacterResponse {
  id: string;
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  hp_current: number;
  hp_max: number;
  position: { x: number; y: number };
  ability_scores: AbilityScores;
  tutorial_state?: string | null;
  // ... other character fields
}

/**
 * Create a new character
 */
export const createCharacter = async (
  payload: CreateCharacterPayload,
  accessToken: string
): Promise<CreateCharacterResponse> => {
  const response = await axios.post<CreateCharacterResponse>(
    `${BACKEND_URL}/api/characters`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  return response.data;
};

/**
 * Get all characters for a user by email
 */
export const getCharactersByEmail = async (email: string): Promise<Character[]> => {
  const response = await axios.get<Character[]>(
    `${BACKEND_URL}/api/characters/user/${email}`
  );

  return response.data;
};

/**
 * Get a specific character by ID
 */
export const getCharacterById = async (characterId: string): Promise<Character> => {
  const response = await axios.get<Character>(
    `${BACKEND_URL}/api/characters/${characterId}`
  );

  return response.data;
};

/**
 * Delete a character
 */
export const deleteCharacter = async (
  characterId: string,
  accessToken: string
): Promise<void> => {
  await axios.delete(
    `${BACKEND_URL}/api/characters/${characterId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
};
