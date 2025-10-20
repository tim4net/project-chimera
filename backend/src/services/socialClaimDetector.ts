/**
 * @file Social Claim Detector - Identifies bold narrative claims
 *
 * Detects when players make claims that should have consequences:
 * - "I'm the king's son" → Royal heritage
 * - "I'm famous" → Celebrity status
 * - "Dragon owes me" → Powerful connections
 * - "I'm cursed" → Supernatural afflictions
 */

import type { SocialClaimAction, SocialClaimType } from '../types/actions';
import { v4 as uuidv4 } from 'uuid';

interface ClaimPattern {
  pattern: RegExp;
  claimType: SocialClaimType;
  threatType: string;
  difficulty: number; // DC for Persuasion check
  description: string;
}

// ============================================================================
// CLAIM PATTERN DEFINITIONS
// ============================================================================

const CLAIM_PATTERNS: ClaimPattern[] = [
  // Royal heritage claims
  {
    pattern: /\b(I'm|I am) (the )?(king's|queen's|prince|princess|duke's|duchess's|royal|noble) (son|daughter|heir|blood)\b/i,
    claimType: 'royal_heritage',
    threatType: 'royal_target',
    difficulty: 18,
    description: 'Claims royal bloodline',
  },
  {
    pattern: /\b(I'm|I am) (of |from )?(royal|noble) (blood|birth|lineage|descent)\b/i,
    claimType: 'royal_heritage',
    threatType: 'royal_target',
    difficulty: 18,
    description: 'Claims royal bloodline',
  },

  // Fame claims
  {
    pattern: /\b(I'm|I am) (very |incredibly |extremely )?(famous|renowned|legendary|well-known|celebrated)\b/i,
    claimType: 'fame',
    threatType: 'celebrity_target',
    difficulty: 15,
    description: 'Claims widespread fame',
  },
  {
    pattern: /\b(everyone|all|people) (knows|has heard of|recognizes) me\b/i,
    claimType: 'fame',
    threatType: 'celebrity_target',
    difficulty: 15,
    description: 'Claims recognition',
  },

  // Powerful connections
  {
    pattern: /\b(dragon|ancient one|deity|god|goddess|demon lord) (owes me|is my (friend|ally)|knows me|trusts me)\b/i,
    claimType: 'powerful_connection',
    threatType: 'dragon_enemy',
    difficulty: 20,
    description: 'Claims powerful ally/connection',
  },
  {
    pattern: /\b(I|I'm) (friends with|allied with|connected to) (the )?(dragon|demon|deity|god)\b/i,
    claimType: 'powerful_connection',
    threatType: 'dragon_enemy',
    difficulty: 20,
    description: 'Claims powerful ally',
  },

  // Supernatural claims
  {
    pattern: /\b(I'm|I am) cursed|hexed|doomed|damned\b/i,
    claimType: 'supernatural',
    threatType: 'supernatural_attention',
    difficulty: 12,
    description: 'Claims supernatural affliction',
  },
  {
    pattern: /\b(I'm|I am) blessed (by|with)\b/i,
    claimType: 'supernatural',
    threatType: 'supernatural_attention',
    difficulty: 14,
    description: 'Claims divine blessing',
  },

  // Physical prowess claims
  {
    pattern: /\b(I'm|I am) (incredibly|extremely|very|unbelievably) (strong|powerful|mighty|tough)\b/i,
    claimType: 'physical_prowess',
    threatType: 'challenger_attention',
    difficulty: 12,
    description: 'Claims exceptional strength',
  },

  // Expertise claims
  {
    pattern: /\b(I'm|I am) (a |an )?(master|expert|legendary) (swordsman|warrior|mage|thief|assassin)\b/i,
    claimType: 'expertise',
    threatType: 'challenger_attention',
    difficulty: 14,
    description: 'Claims mastery of skill',
  },
];

// ============================================================================
// DETECTION FUNCTION
// ============================================================================

/**
 * Detect if message contains a bold social claim
 * Returns SocialClaimAction if detected, null otherwise
 */
export function detectSocialClaim(
  message: string,
  characterId: string
): SocialClaimAction | null {

  for (const pattern of CLAIM_PATTERNS) {
    const match = message.match(pattern.pattern);

    if (match) {
      console.log(`[SocialClaimDetector] Detected ${pattern.claimType}: "${message}"`);

      return {
        type: 'SOCIAL_CLAIM',
        actionId: uuidv4(),
        actorId: characterId,
        timestamp: Date.now(),
        claimType: pattern.claimType,
        claimText: message,
        threatType: pattern.threatType,
        difficulty: pattern.difficulty,
      };
    }
  }

  return null;
}

/**
 * Check if a claim is "bold" enough to warrant consequences
 * This helps filter out casual statements vs serious claims
 */
export function isBoldClaim(claimType: SocialClaimType): boolean {
  const boldClaims: SocialClaimType[] = [
    'royal_heritage',
    'powerful_connection',
    'fame',
  ];

  return boldClaims.includes(claimType);
}

/**
 * Get expected consequences for a claim type
 */
export function getClaimConsequences(claimType: SocialClaimType): {
  rewards: string[];
  risks: string[];
} {
  const consequences: Record<SocialClaimType, { rewards: string[]; risks: string[] }> = {
    royal_heritage: {
      rewards: ['Noble quests', 'Respect from commoners', 'Access to court', 'Political allies'],
      risks: ['Kidnapping (25%)', 'Assassination (20%)', 'Political intrigue', 'Cannot hide identity'],
    },
    fame: {
      rewards: ['Free drinks', 'Fan encounters', 'Story opportunities'],
      risks: ['Stalkers (15%)', 'Challengers', 'Imposters', 'Higher expectations'],
    },
    powerful_connection: {
      rewards: ['Massive respect', 'Epic quests', 'Legendary reputation'],
      risks: ['Called bluff (forced to prove it)', 'Dragon encounters (10%)', 'Cult attention'],
    },
    supernatural: {
      rewards: ['Cleric attention', 'Curse-removal quests', 'Supernatural storylines'],
      risks: ['Curse manifestations (20%)', 'Exorcists', 'Paranormal encounters'],
    },
    physical_prowess: {
      rewards: ['Respect from warriors', 'Strength challenges'],
      risks: ['Humiliation if stats don\'t match', 'Challenger duels', 'Impossible quests'],
    },
    expertise: {
      rewards: ['Recognition', 'Mentor opportunities', 'Specialized quests'],
      risks: ['Tests of skill', 'Reputation loss if fail', 'Jealous rivals'],
    },
  };

  return consequences[claimType] || { rewards: [], risks: [] };
}
