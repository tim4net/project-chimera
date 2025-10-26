/**
 * @file characterSubmit.ts
 * @description Service for submitting character creation data to the backend
 */

import { supabase } from '../lib/supabase';

// Types
interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

interface Backstory {
  ideal: string;
  bond: string;
  flaw: string;
}

export interface CharacterDraft {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  gender: string;
  abilityScores: AbilityScores;
  skills: string[];
  backstory: Backstory;
  equipment: string[];
  gold: number;
  portraitUrl?: string | null;
  appearance?: string;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  gold: number;
  ability_scores: AbilityScores;
  hp_max: number;
  hp_current: number;
  temporary_hp: number;
  armor_class: number;
  speed: number;
  position_x: number;
  position_y: number;
  campaign_seed: string;
  game_time_minutes: number;
  world_date_day: number;
  world_date_month: number;
  world_date_year: number;
  spell_slots: Record<string, number>;
  backstory: string | null;
  skills: string | null;
  portrait_url: string | null;
  proficiency_bonus: number;
  tutorial_state?: string;
  subclass?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CharacterSubmitError {
  error: string;
  details?: string;
}

/**
 * Submit character creation data to the backend
 * @param draft Character draft data from the creation form
 * @param userId User ID of the authenticated user
 * @returns Created character record
 * @throws Error if submission fails
 */
export async function submitCharacter(
  draft: CharacterDraft,
  userId: string
): Promise<Character> {
  try {
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('You must be logged in to create a character');
    }

    // Build the request payload matching backend expectations
    const characterData = {
      name: draft.name,
      race: draft.race,
      class: draft.class,
      background: draft.background,
      alignment: draft.alignment,
      ability_scores: draft.abilityScores, // Backend expects snake_case
      skills: draft.skills, // Backend accepts array or object
      backstory: draft.backstory,
      portrait_url: draft.portraitUrl, // Backend expects snake_case
    };

    // Make the POST request to create the character
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(characterData),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Server error (${response.status})`;

      try {
        if (contentType?.includes('application/json')) {
          const errorResponse = await response.json() as CharacterSubmitError;
          errorMessage = errorResponse.error || errorMessage;
        } else {
          // Got HTML error page (likely 502 from proxy)
          errorMessage = `Backend service error (${response.status} ${response.statusText})`;
          console.error('[CharacterSubmit] Server returned non-JSON response:', response.status);
        }
      } catch (parseError) {
        console.error('[CharacterSubmit] Failed to parse error response:', parseError);
      }

      throw new Error(errorMessage);
    }

    // Parse and return the created character
    const newCharacter = await response.json() as Character;
    console.log('[CharacterSubmit] Character created:', newCharacter.id);

    return newCharacter;
  } catch (error) {
    // Re-throw with additional context
    if (error instanceof Error) {
      console.error('[CharacterSubmit] Submission failed:', error.message);
      throw error;
    }

    // Handle unknown error types
    console.error('[CharacterSubmit] Unknown error:', error);
    throw new Error('Failed to create character: Unknown error');
  }
}
