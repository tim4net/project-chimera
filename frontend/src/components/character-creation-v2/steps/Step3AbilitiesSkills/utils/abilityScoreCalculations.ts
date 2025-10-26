/**
 * D&D 5e Point-Buy System Calculations
 * Standard point-buy with 27 points, scores range 8-15
 */

export type AbilityScore = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface RacialBonuses {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

/**
 * D&D 5e point-buy costs
 * Score | Cost
 *   8   |  0
 *   9   |  1
 *  10   |  2
 *  11   |  3
 *  12   |  4
 *  13   |  5
 *  14   |  7
 *  15   |  9
 */
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const TOTAL_POINTS = 27;
export const MIN_SCORE = 8;
export const MAX_SCORE = 15;

/**
 * Get the point cost for a single ability score
 */
export function getScoreCost(score: number): number {
  if (score < MIN_SCORE || score > MAX_SCORE) {
    throw new Error(`Score ${score} out of range (${MIN_SCORE}-${MAX_SCORE})`);
  }
  return POINT_BUY_COSTS[score];
}

/**
 * Calculate total points spent across all abilities
 */
export function calculateTotalPointsSpent(scores: AbilityScores): number {
  return Object.values(scores).reduce((total, score) => total + getScoreCost(score), 0);
}

/**
 * Calculate points remaining in budget
 */
export function calculatePointsRemaining(scores: AbilityScores): number {
  return TOTAL_POINTS - calculateTotalPointsSpent(scores);
}

/**
 * Calculate ability modifier: (score - 10) / 2, rounded down
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Apply racial bonuses to base scores (cap at 20)
 */
export function applyRacialBonuses(
  baseScores: AbilityScores,
  racialBonuses: RacialBonuses = {}
): AbilityScores {
  const result: AbilityScores = { ...baseScores };

  (Object.keys(racialBonuses) as AbilityScore[]).forEach((ability) => {
    const bonus = racialBonuses[ability] || 0;
    result[ability] = Math.min(20, result[ability] + bonus);
  });

  return result;
}

/**
 * Format modifier with sign (+2, -1, +0)
 */
export function formatModifier(modifier: number): string {
  if (modifier >= 0) {
    return `+${modifier}`;
  }
  return `${modifier}`;
}
