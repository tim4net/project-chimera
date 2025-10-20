/**
 * @file D&D 5e Legendary Resistance System
 *
 * Implements the legendary resistance mechanic where powerful creatures
 * can automatically succeed on failed saving throws a limited number of times per day.
 *
 * Standard legendary creatures have 3 uses per day.
 */

export interface LegendaryResistanceState {
  usesRemaining: number; // Current uses left (0-maxUses)
  maxUses: number; // Maximum uses (usually 3)
}

export interface SaveResult {
  roll: number;
  dc: number;
  totalBonus: number;
  success: boolean;
}

export interface LegendaryResistanceResult {
  finalSuccess: boolean;
  usedLegendary: boolean;
  usesRemaining: number;
  message: string;
}

/**
 * Creates a new legendary resistance state with the specified number of uses.
 * @param uses - Number of uses (defaults to 3 per D&D 5e standard)
 * @returns A new legendary resistance state
 */
export function createLegendaryResistance(uses = 3): LegendaryResistanceState {
  if (uses < 0) {
    throw new Error('Legendary resistance uses cannot be negative');
  }

  return {
    usesRemaining: uses,
    maxUses: uses,
  };
}

/**
 * Checks if a legendary resistance can be used.
 * @param state - The current legendary resistance state
 * @returns True if uses remain, false otherwise
 */
export function canUseLegendaryResistance(state: LegendaryResistanceState): boolean {
  return state.usesRemaining > 0;
}

/**
 * Consumes one use of legendary resistance.
 * @param state - The legendary resistance state to modify
 * @returns Object with success status and remaining uses
 */
export function useLegendaryResistance(
  state: LegendaryResistanceState
): { success: boolean; usesRemaining: number } {
  if (!canUseLegendaryResistance(state)) {
    return {
      success: false,
      usesRemaining: state.usesRemaining,
    };
  }

  state.usesRemaining -= 1;

  return {
    success: true,
    usesRemaining: state.usesRemaining,
  };
}

/**
 * Resets legendary resistance to maximum uses.
 * Typically called on a long rest or new encounter.
 * @param state - The legendary resistance state to reset
 * @returns The reset state
 */
export function resetLegendaryResistance(
  state: LegendaryResistanceState
): LegendaryResistanceState {
  state.usesRemaining = state.maxUses;
  return state;
}

/**
 * Applies legendary resistance to a saving throw result.
 * If the save fails and legendary resistance is available, auto-succeed.
 * @param saveResult - The original saving throw result
 * @param legendaryState - The creature's legendary resistance state
 * @returns Result with final success status, whether legendary was used, and message
 */
export function applyToSavingThrow(
  saveResult: SaveResult,
  legendaryState: LegendaryResistanceState
): LegendaryResistanceResult {
  // If the save already succeeded, no need to use legendary resistance
  if (saveResult.success) {
    return {
      finalSuccess: true,
      usedLegendary: false,
      usesRemaining: legendaryState.usesRemaining,
      message: `Saving throw succeeded (${saveResult.roll + saveResult.totalBonus} vs DC ${saveResult.dc})`,
    };
  }

  // Save failed - check if we can use legendary resistance
  if (!canUseLegendaryResistance(legendaryState)) {
    return {
      finalSuccess: false,
      usedLegendary: false,
      usesRemaining: 0,
      message: `Saving throw failed (${saveResult.roll + saveResult.totalBonus} vs DC ${saveResult.dc}). No legendary resistances remaining!`,
    };
  }

  // Use legendary resistance to succeed
  const result = useLegendaryResistance(legendaryState);

  return {
    finalSuccess: true,
    usedLegendary: true,
    usesRemaining: result.usesRemaining,
    message: `Saving throw failed (${saveResult.roll + saveResult.totalBonus} vs DC ${saveResult.dc}), but LEGENDARY RESISTANCE used to succeed! (${result.usesRemaining}/${legendaryState.maxUses} remaining)`,
  };
}

/**
 * Gets the remaining uses as a formatted string for display.
 * @param state - The legendary resistance state
 * @returns Formatted string like "2/3" or "0/3"
 */
export function formatRemainingUses(state: LegendaryResistanceState): string {
  return `${state.usesRemaining}/${state.maxUses}`;
}

/**
 * Checks if a monster has legendary resistance based on its special abilities.
 * @param specialAbilities - Array of special abilities from monster data
 * @returns True if the monster has legendary resistance
 */
export function hasLegendaryResistance(specialAbilities: Array<{ name: string; description: string }>): boolean {
  return specialAbilities.some(
    ability => ability.name.toLowerCase().includes('legendary resistance')
  );
}

/**
 * Extracts the number of legendary resistance uses from ability description.
 * Standard is 3/day, but some creatures might have different amounts.
 * @param specialAbilities - Array of special abilities from monster data
 * @returns Number of uses, or 3 as default if legendary resistance exists
 */
export function extractLegendaryResistanceUses(
  specialAbilities: Array<{ name: string; description: string }>
): number {
  const ability = specialAbilities.find(
    a => a.name.toLowerCase().includes('legendary resistance')
  );

  if (!ability) {
    return 0;
  }

  // Try to extract number from description (e.g., "3/Day" or "3 per day" or "5 per day")
  const match = ability.description.match(/(\d+)\s*(?:\/|per)\s*(day|Day)/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  // Default to 3 if legendary resistance exists but no number specified
  return 3;
}
