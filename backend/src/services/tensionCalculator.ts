/**
 * @file Tension Calculator - Converts threat mechanics into narrative atmosphere
 *
 * This module translates mechanical threat percentages into vague, immersive
 * narrative hints that create tension without revealing the exact numbers.
 *
 * CRITICAL: Never expose threat percentages to players!
 */

import type { CharacterRecord } from '../types';

// ============================================================================
// TENSION LEVELS
// ============================================================================

export type TensionLevel =
  | 'peaceful'      // 0-10% threat
  | 'uneasy'        // 11-25% threat
  | 'watched'       // 26-40% threat
  | 'hunted'        // 41-60% threat
  | 'imminent';     // 61-100% threat

export interface TensionContext {
  level: TensionLevel;
  description: string; // Narrative description for player
  atmosphereHint: string; // Hint for LLM to create atmosphere
}

// ============================================================================
// CALCULATE TENSION
// ============================================================================

/**
 * Calculate overall tension level based on all active threats
 */
export function calculateTensionLevel(character: CharacterRecord): TensionContext {
  if (!character.active_threats || Object.keys(character.active_threats).length === 0) {
    return {
      level: 'peaceful',
      description: 'You feel safe and at ease.',
      atmosphereHint: 'The atmosphere is calm and peaceful. No immediate threats.',
    };
  }

  // Find highest threat percentage
  let maxThreat = 0;
  let dominantThreatType = '';

  for (const [threatType, threatData] of Object.entries(character.active_threats)) {
    if (threatData.chance > maxThreat) {
      maxThreat = threatData.chance;
      dominantThreatType = threatType;
    }
  }

  // Convert to tension level
  let level: TensionLevel;
  let description: string;
  let atmosphereHint: string;

  if (maxThreat <= 10) {
    level = 'peaceful';
    description = 'You feel relatively safe for now.';
    atmosphereHint = 'A sense of calm, but faint unease lingers at the edge of awareness.';
  } else if (maxThreat <= 25) {
    level = 'uneasy';
    description = 'You have a nagging feeling something isn\'t quite right.';
    atmosphereHint = 'Subtle tension. The character might notice strangers, whispers, or odd coincidences. Don\'t be obvious.';
  } else if (maxThreat <= 40) {
    level = 'watched';
    description = 'You feel eyes on you, though you can\'t quite place them.';
    atmosphereHint = 'Clear sense of being watched. Shadowy figures, eavesdroppers, people asking questions. Create paranoid atmosphere.';
  } else if (maxThreat <= 60) {
    level = 'hunted';
    description = 'Paranoia grips you. They\'re close. You know it.';
    atmosphereHint = 'High tension. Near misses, close calls, evidence someone is actively hunting them. Make it palpable.';
  } else {
    level = 'imminent';
    description = 'Danger is imminent. Every shadow could be your last.';
    atmosphereHint = 'Extreme tension. Encounters feel inevitable. Describe near-captures, assassins barely avoided, time running out.';
  }

  return { level, description, atmosphereHint };
}

// ============================================================================
// THREAT-SPECIFIC NARRATIVE HINTS
// ============================================================================

/**
 * Get narrative context for specific threat types
 * (Hidden from player, used by LLM)
 */
export function getThreatNarrativeHints(
  threatType: string,
  tensionLevel: TensionLevel
): string {
  const hints: Record<string, Record<TensionLevel, string>> = {
    royal_target: {
      peaceful: 'Your royal secret is yours alone for now.',
      uneasy: 'Occasionally, you notice people whispering when you pass.',
      watched: 'Strangers seem to take unusual interest in you. Coincidence?',
      hunted: 'You\'ve spotted the same cloaked figures in multiple towns. They\'re tracking you.',
      imminent: 'Every innkeeper asks too many questions. Every guard stares too long. They know.',
    },
    celebrity_target: {
      peaceful: 'A few locals recognize you, but nothing concerning.',
      uneasy: 'People point and whisper as you pass.',
      watched: 'Crowds gather when you appear. It\'s becoming hard to move freely.',
      hunted: 'Obsessive fans follow you everywhere. Some seem... unstable.',
      imminent: 'A mob of admirers surrounds the inn. You\'re trapped by your own fame.',
    },
    dragon_enemy: {
      peaceful: 'The dragon hasn\'t noticed your claim... yet.',
      uneasy: 'You hear rumors of dragon cultists in the region.',
      watched: 'Draconic symbols appear where you\'ve been. A warning? A curse?',
      hunted: 'Dragonborn warriors are asking about you by name. The dragon knows.',
      imminent: 'The sky darkens. Massive wings block out the sun. It\'s coming for you.',
    },
    supernatural_attention: {
      peaceful: 'The curse feels distant, almost forgotten.',
      uneasy: 'Small misfortunes plague you. Coincidence or something more?',
      watched: 'Spirits whisper your name in the darkness.',
      hunted: 'The curse manifests physically. Objects move. Shadows writhe.',
      imminent: 'Reality warps around you. The supernatural is closing in.',
    },
    challenger_attention: {
      peaceful: 'Your boasts haven\'t attracted much attention yet.',
      uneasy: 'You overhear warriors discussing your claimed prowess with skepticism.',
      watched: 'A renowned fighter has taken interest. They\'re asking about you.',
      hunted: 'Challengers seek you out. Your reputation precedes you - for better or worse.',
      imminent: 'The local champion waits at the town gate. You must face them.',
    },
  };

  return hints[threatType]?.[tensionLevel] || 'Something feels off...';
}

// ============================================================================
// POST-ENCOUNTER EXPLANATIONS
// ============================================================================

/**
 * After an encounter, explain to player WHY it happened (without showing math)
 */
export function getPostEncounterExplanation(
  threatType: string,
  variant: string,
  originClaim: string
): string {
  const explanations: Record<string, string> = {
    kidnapping: `This kidnapping attempt is a direct consequence of claiming ${originClaim}.
      Your royal blood makes you valuable - alive or dead. As long as your identity is known,
      such threats will persist. You can reduce the danger by eliminating your enemies or
      going into hiding.`,

    assassination: `The assassins seek you because of your claim to ${originClaim}.
      Someone powerful sees you as a threat. Until you resolve this politically or
      eliminate the threat at its source, the danger remains.`,

    blackmail: `Your secret about ${originClaim} has been discovered by those who would
      exploit it. Pay them, eliminate them, or call their bluff - but know that others
      may also learn your secret.`,

    messenger: `This encounter (though tense) is actually POSITIVE. Your claim to ${originClaim}
      has attracted allies, not just enemies. Opportunities arise alongside dangers.`,

    rival_claimant: `Your claim to ${originClaim} has drawn out a rival. They dispute your
      right and seek to prove themselves the true heir. This conflict must be resolved.`,
  };

  return explanations[variant] || `This encounter stems from your earlier claim about ${originClaim}.`;
}
