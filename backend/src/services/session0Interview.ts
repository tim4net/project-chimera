/**
 * Session 0 Interview - Stub implementation
 * Note: Session 0 interview system has been simplified in current MVP
 */

import type { CharacterRecord } from '../types';

/**
 * Get interview prompt for character's current tutorial state
 * Returns a simple prompt - full interview system was removed in favor of direct character creation
 */
export function getInterviewPrompt(character: CharacterRecord): Promise<string> {
  const state = character.tutorial_state;

  // Simple default prompt based on tutorial state
  const prompts: Record<string, string> = {
    'interview_welcome': `Welcome, ${character.name}! I am The Chronicler, your guide in the world of Nuaibria.`,
    'interview_class_intro': `As a ${character.class}, you have chosen an exciting path. Let's continue your journey.`,
    'needs_equipment': `It's time to select your starting equipment, ${character.name}.`,
    'interview_backstory': `Tell me about your character's background and motivations.`,
    'interview_complete': `Your interview is complete. Welcome to Nuaibria!`,
    'needs_subclass': `You need to select a subclass for your ${character.class}.`,
    'needs_cantrips': `Select your starting cantrips.`,
    'needs_spells': `Select your starting spells.`,
  };

  const prompt = state ? (prompts[state] || `Continue your character setup.`) : `Welcome to Nuaibria!`;

  return Promise.resolve(prompt);
}

/**
 * Get available cantrips from database for a given class
 * Stub implementation - returns empty array
 */
export async function getAvailableCantripsFromDB(characterClass: string): Promise<Array<{ name: string; description: string }>> {
  // TODO: Implement database query when spell system is fully integrated
  console.warn(`[session0Interview] getAvailableCantripsFromDB stub called for ${characterClass}`);
  return [];
}

/**
 * Get available spells from database for a given class and level
 * Stub implementation - returns empty array
 */
export async function getAvailableSpellsFromDB(characterClass: string, spellLevel: number): Promise<Array<{ name: string; level: number; description: string }>> {
  // TODO: Implement database query when spell system is fully integrated
  console.warn(`[session0Interview] getAvailableSpellsFromDB stub called for ${characterClass} level ${spellLevel}`);
  return [];
}
