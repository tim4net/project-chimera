/**
 * @file D&D 5e Inspiration system implementation.
 *
 * Inspiration represents a character's connection to the narrative and roleplay.
 * It can be awarded by the DM for exceptional roleplay, clever thinking, or
 * achieving character goals. A character can only have one inspiration point at a time.
 *
 * When a character has inspiration, they can use it to gain advantage on one:
 * - Attack roll
 * - Ability check
 * - Saving throw
 */

import { CharacterRecord } from '../types/index.js';

/**
 * Awards inspiration to a character.
 * A character can only have one inspiration point - this sets it to true.
 *
 * @param character - The character to award inspiration to
 * @returns void
 */
export function awardInspiration(character: CharacterRecord): void {
  character.inspiration = true;
}

/**
 * Uses a character's inspiration point.
 * This consumes the inspiration (sets to false) and returns whether it was available.
 * The caller is responsible for applying advantage to the appropriate roll.
 *
 * @param character - The character using inspiration
 * @returns Object indicating if inspiration was available and consumed
 */
export function useInspiration(character: CharacterRecord): { hadInspiration: boolean } {
  const hadInspiration = character.inspiration || false;

  // Always set to false, whether it was consumed or ensuring it's defined
  character.inspiration = false;

  return { hadInspiration };
}

/**
 * Checks if a character currently has inspiration.
 *
 * @param character - The character to check
 * @returns true if the character has inspiration, false otherwise
 */
export function hasInspiration(character: CharacterRecord): boolean {
  return character.inspiration || false;
}

/**
 * Gets a human-readable description of the inspiration mechanic.
 * Useful for displaying help text to players.
 *
 * @returns Description of how inspiration works
 */
export function getInspirationDescription(): string {
  return `Inspiration is a reward for exceptional roleplay, clever thinking, or achieving character goals. ` +
    `You can only have one inspiration point at a time. When you have inspiration, you can spend it to ` +
    `gain advantage on one attack roll, ability check, or saving throw.`;
}
