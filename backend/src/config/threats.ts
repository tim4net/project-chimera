/**
 * @file Threat Configuration - Defines consequences for social claims
 *
 * This module contains the threat tables that determine what happens
 * when players make bold narrative claims that are believed by NPCs.
 */

import type { ThreatData } from '../types';
import type { SocialClaimType } from '../types/actions';

// ============================================================================
// THREAT CONFIGURATIONS
// ============================================================================

export const THREAT_CONFIGS: Record<string, Omit<ThreatData, 'created_at'>> = {
  // "I'm the king's son" threats
  royal_target: {
    chance: 25,
    severity: 'high',
    types: ['kidnapping', 'assassination', 'blackmail', 'messenger', 'rival_claimant'],
    escalation_rate: 5, // +5% per week
  },

  // "I'm famous" threats
  celebrity_target: {
    chance: 15,
    severity: 'medium',
    types: ['stalker', 'challenger', 'imposter', 'fan_mob', 'paparazzi'],
    escalation_rate: 3,
  },

  // "Dragon owes me a favor" threats
  dragon_enemy: {
    chance: 10,
    severity: 'very_high',
    types: ['dragon_cultist', 'dragon_spawn', 'vengeance_curse', 'dragon_summons'],
    escalation_rate: 2,
  },

  // "I'm cursed" threats
  supernatural_attention: {
    chance: 20,
    severity: 'low',
    types: ['curse_manifestation', 'exorcist_encounter', 'spirit_visitation', 'clerical_intervention'],
    escalation_rate: 4,
  },

  // "I'm incredibly strong" threats
  challenger_attention: {
    chance: 12,
    severity: 'medium',
    types: ['duel_challenge', 'strength_contest', 'jealous_rival', 'impossible_task'],
    escalation_rate: 2,
  },
};

// ============================================================================
// THREAT MAPPING
// ============================================================================

/**
 * Maps claim types to their corresponding threat configurations
 */
export function getThreatTypeForClaim(claimType: SocialClaimType): string | null {
  const mapping: Record<SocialClaimType, string> = {
    royal_heritage: 'royal_target',
    fame: 'celebrity_target',
    powerful_connection: 'dragon_enemy',
    supernatural: 'supernatural_attention',
    physical_prowess: 'challenger_attention',
    expertise: 'challenger_attention',
  };

  return mapping[claimType] || null;
}

/**
 * Get threat configuration for a specific threat type
 */
export function getThreatConfig(threatType: string): ThreatData {
  const config = THREAT_CONFIGS[threatType];

  if (!config) {
    console.warn(`[ThreatConfig] Unknown threat type: ${threatType}, using default`);
    return {
      chance: 10,
      severity: 'medium',
      types: ['generic_encounter'],
      created_at: new Date().toISOString(),
      escalation_rate: 2,
    };
  }

  return {
    ...config,
    created_at: new Date().toISOString(),
  };
}

// ============================================================================
// LOCATION MODIFIERS
// ============================================================================

export function getLocationThreatModifier(location: string): number {
  const modifiers: Record<string, number> = {
    // Safe locations
    remote_wilderness: -15,
    secret_hideout: -20,
    friendly_fortress: -25,
    hidden_valley: -18,

    // Neutral locations
    small_village: 0,
    roadside_inn: 5,
    forest_camp: -5,

    // Dangerous locations
    capital_city: 50,
    royal_castle: 75,
    enemy_territory: 60,
    major_trade_hub: 35,

    // Default
    current_location: 0,
  };

  return modifiers[location] || 0;
}

// ============================================================================
// THREAT VARIANT DESCRIPTIONS (For LLM Prompts)
// ============================================================================

export const THREAT_VARIANT_PROMPTS: Record<string, string> = {
  // Royal threats
  kidnapping: 'Bounty hunters or rival factions attempt to capture the character for ransom or leverage. Create a tense kidnapping scenario with options to fight, flee, or negotiate.',
  assassination: 'Professional killers strike from the shadows. Create an assassination attempt with stealth, poison, or ambush. The character must survive.',
  blackmail: 'Someone knows the secret and demands payment or favors to keep silent. Create a blackmail scenario with moral choices.',
  messenger: 'A loyal subject or ally finds the character, bringing urgent news or requests for help. This is a POSITIVE encounter that opens new quest lines.',
  rival_claimant: 'Another person claiming the same heritage appears, challenging the character\'s legitimacy. Could lead to duel, political intrigue, or alliance.',

  // Celebrity threats
  stalker: 'An obsessed fan follows the character, creating uncomfortable or dangerous situations.',
  challenger: 'Someone challenges the character to prove their fame through a contest or duel.',
  imposter: 'Someone else is pretending to be the famous character, damaging their reputation.',
  fan_mob: 'Overwhelming crowd of admirers makes it difficult to move or act freely.',
  paparazzi: 'Information brokers follow the character, selling gossip and secrets.',

  // Dragon threats
  dragon_cultist: 'Cultists who worship the dragon seek revenge for the character\'s claimed connection.',
  dragon_spawn: 'Wyrmlings or dragonborn enforcers appear to test or punish the character.',
  vengeance_curse: 'The dragon\'s magic reaches out, manifesting curses or obstacles.',
  dragon_summons: 'The dragon itself sends a message demanding the character prove their claim... or face consequences.',

  // Supernatural threats
  curse_manifestation: 'The claimed curse becomes real or worsens. Bad luck, mishaps, or supernatural occurrences.',
  exorcist_encounter: 'A traveling cleric or exorcist offers to remove the curse... for a price or favor.',
  spirit_visitation: 'Spirits or supernatural entities are drawn to the character.',
  clerical_intervention: 'A religious organization takes interest in the supernatural claim.',

  // Challenger threats
  duel_challenge: 'A renowned warrior/expert challenges the character to prove their claimed skill.',
  strength_contest: 'Local strongman or athlete challenges the character to a test of ability.',
  jealous_rival: 'Someone jealous of the claimed prowess attempts to sabotage or embarrass the character.',
  impossible_task: 'An NPC gives the character an extremely difficult task based on their boast, expecting success.',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate actual threat chance given base threat and modifiers
 */
export function calculateThreatChance(
  baseThreat: number,
  location: string,
  action: 'rest' | 'travel' | 'public',
  daysSinceClaim: number
): number {
  let actualThreat = baseThreat;

  // Location modifier
  actualThreat += getLocationThreatModifier(location);

  // Action modifier
  if (action === 'rest') actualThreat += 10; // Vulnerable while sleeping
  if (action === 'public') actualThreat += 100; // Public reveal = guaranteed

  // Time escalation (threats grow over time)
  const weeksElapsed = Math.floor(daysSinceClaim / 7);
  actualThreat += weeksElapsed * 5; // +5% per week

  // Clamp to 0-100
  return Math.max(0, Math.min(100, actualThreat));
}
