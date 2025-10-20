/**
 * @file Player-Facing Tension - What players actually see (vague warnings)
 *
 * This module provides the UI-safe version of threat information.
 * NEVER expose percentages, dice rolls, or mechanical details!
 *
 * Players should feel tension but not see the math.
 */

import type { CharacterRecord } from '../types';
import { calculateTensionLevel } from './tensionCalculator';

// ============================================================================
// PLAYER-FACING TENSION INDICATOR
// ============================================================================

export interface PlayerTensionInfo {
  hasThreats: boolean;
  feeling: string; // What the player "feels"
  icon: string; // UI icon
  color: string; // UI color
  shouldShowWarning: boolean; // Show warning badge in UI
}

/**
 * Get player-facing tension information (safe for UI display)
 */
export function getPlayerTensionInfo(character: CharacterRecord): PlayerTensionInfo {
  const tension = calculateTensionLevel(character);

  const info: Record<string, PlayerTensionInfo> = {
    peaceful: {
      hasThreats: false,
      feeling: 'Safe',
      icon: '✅',
      color: 'green',
      shouldShowWarning: false,
    },
    uneasy: {
      hasThreats: true,
      feeling: 'Uneasy',
      icon: '👁️',
      color: 'yellow',
      shouldShowWarning: true,
    },
    watched: {
      hasThreats: true,
      feeling: 'Watched',
      icon: '👀',
      color: 'orange',
      shouldShowWarning: true,
    },
    hunted: {
      hasThreats: true,
      feeling: 'Hunted',
      icon: '⚠️',
      color: 'red',
      shouldShowWarning: true,
    },
    imminent: {
      hasThreats: true,
      feeling: 'Imminent Danger',
      icon: '🚨',
      color: 'crimson',
      shouldShowWarning: true,
    },
  };

  return info[tension.level];
}

/**
 * Get vague description for player (no mechanics)
 */
export function getVagueWarningText(character: CharacterRecord): string | null {
  const tension = calculateTensionLevel(character);

  if (tension.level === 'peaceful') {
    return null; // No warning needed
  }

  return tension.description; // e.g., "You feel eyes on you..."
}

/**
 * Get reputation summary for player (narrative, not numbers)
 */
export function getReputationSummary(character: CharacterRecord): string[] {
  const summaries: string[] = [];

  if (!character.reputation_tags || character.reputation_tags.length === 0) {
    return ['Unknown adventurer'];
  }

  // Translate tags into player-facing descriptions
  const tags = character.reputation_tags;

  if (tags.includes('accepted_royal_heritage')) {
    summaries.push('Claimed royal bloodline (believed by some)');
  }

  if (tags.includes('caught_lying_royal_heritage')) {
    summaries.push('Accused of falsely claiming royalty');
  }

  if (tags.includes('accepted_fame')) {
    summaries.push('Recognized as a famous adventurer');
  }

  if (tags.includes('defeated_bounty_hunters')) {
    summaries.push('Survived assassination attempts');
  }

  if (tags.includes('redeemed')) {
    summaries.push('Redeemed past mistakes');
  }

  return summaries.length > 0 ? summaries : ['Ordinary traveler'];
}

/**
 * After an encounter, show player WHY it happened (educational)
 */
export function explainEncounterCause(
  threatVariant: string,
  reputationTags: string[]
): string {
  const causes: string[] = [];

  if (reputationTags.includes('accepted_royal_heritage')) {
    causes.push('your claim to royal blood');
  }

  if (reputationTags.includes('accepted_fame')) {
    causes.push('your fame');
  }

  if (reputationTags.includes('accepted_powerful_connection')) {
    causes.push('your claimed connection to powerful beings');
  }

  const causeText = causes.length > 0 ? causes.join(' and ') : 'your past choices';

  return `This ${threatVariant} attempt was triggered by ${causeText}. Your narrative claims have consequences.`;
}
