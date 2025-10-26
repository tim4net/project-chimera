/**
 * @fileoverview Ability score validation with D&D 5e point-buy system.
 * Handles point-buy calculations, racial bonuses, and ability modifiers.
 */

import type { AbilityScores } from '../types/index';
import type { AbilityName, Race } from '../types/wizard';
import { POINT_BUY_COSTS, POINT_BUY_TOTAL, ABILITY_SCORE_MIN, ABILITY_SCORE_MAX } from '../types/wizard';
import { getRacialBonuses } from '../data/racialBonuses';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Point-buy calculation result
 */
export interface PointBuyResult {
  totalPoints: number;
  pointsRemaining: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Calculate the point cost for a given ability score
 * @param score - Ability score value (8-15)
 * @returns Point cost (0-9)
 */
export function getPointCost(score: number): number {
  if (score < ABILITY_SCORE_MIN || score > ABILITY_SCORE_MAX) {
    throw new Error(`Score ${score} is outside valid range (${ABILITY_SCORE_MIN}-${ABILITY_SCORE_MAX})`);
  }
  return POINT_BUY_COSTS[score];
}

/**
 * Calculate total points spent on ability scores
 * @param scores - Ability scores object
 * @returns Total points spent
 */
export function calculatePointsSpent(scores: AbilityScores): number {
  const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  return abilities.reduce((total, ability) => {
    const score = scores[ability];
    if (score < ABILITY_SCORE_MIN || score > ABILITY_SCORE_MAX) {
      throw new Error(`Invalid score for ${ability}: ${score}`);
    }
    return total + getPointCost(score);
  }, 0);
}

/**
 * Validate point-buy allocation
 * @param scores - Ability scores object
 * @returns Validation result with errors
 */
export function validatePointBuy(scores: AbilityScores): PointBuyResult {
  const errors: string[] = [];
  const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  // Validate individual scores
  abilities.forEach((ability) => {
    const score = scores[ability];
    if (typeof score !== 'number') {
      errors.push(`${ability} must be a number`);
      return;
    }
    if (!Number.isInteger(score)) {
      errors.push(`${ability} must be a whole number`);
      return;
    }
    if (score < ABILITY_SCORE_MIN) {
      errors.push(`${ability} cannot be less than ${ABILITY_SCORE_MIN}`);
    }
    if (score > ABILITY_SCORE_MAX) {
      errors.push(`${ability} cannot be greater than ${ABILITY_SCORE_MAX}`);
    }
  });

  // If individual scores are invalid, don't calculate total
  if (errors.length > 0) {
    return {
      totalPoints: 0,
      pointsRemaining: POINT_BUY_TOTAL,
      isValid: false,
      errors,
    };
  }

  // Calculate total points
  let totalPoints: number;
  try {
    totalPoints = calculatePointsSpent(scores);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Failed to calculate points');
    return {
      totalPoints: 0,
      pointsRemaining: POINT_BUY_TOTAL,
      isValid: false,
      errors,
    };
  }

  const pointsRemaining = POINT_BUY_TOTAL - totalPoints;

  // Validate total points
  if (totalPoints > POINT_BUY_TOTAL) {
    errors.push(`Too many points spent: ${totalPoints}/${POINT_BUY_TOTAL} (${totalPoints - POINT_BUY_TOTAL} over)`);
  } else if (totalPoints < POINT_BUY_TOTAL) {
    errors.push(`Not all points spent: ${totalPoints}/${POINT_BUY_TOTAL} (${POINT_BUY_TOTAL - totalPoints} remaining)`);
  }

  return {
    totalPoints,
    pointsRemaining,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate the point-buy score that can be purchased with a given cost
 * @param cost - Point cost
 * @returns Ability score value
 */
export function getScoreFromCost(cost: number): number | null {
  const entry = Object.entries(POINT_BUY_COSTS).find(([_, c]) => c === cost);
  return entry ? parseInt(entry[0], 10) : null;
}

/**
 * Apply racial bonuses to base ability scores
 * @param baseScores - Base ability scores (before racial bonuses)
 * @param race - Character race
 * @returns Final ability scores with racial bonuses applied
 */
export function applyRacialBonuses(baseScores: AbilityScores, race: Race): AbilityScores {
  const bonuses = getRacialBonuses(race);
  const finalScores: AbilityScores = { ...baseScores };

  const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  abilities.forEach((ability) => {
    const bonus = bonuses[ability] || 0;
    finalScores[ability] = baseScores[ability] + bonus;
  });

  return finalScores;
}

/**
 * Validate racial bonuses application
 * @param baseScores - Base ability scores
 * @param finalScores - Final ability scores (with racial bonuses)
 * @param race - Character race
 * @returns Validation result
 */
export function validateRacialBonuses(
  baseScores: AbilityScores,
  finalScores: AbilityScores,
  race: Race
): ValidationResult {
  const errors: string[] = [];
  const expectedFinalScores = applyRacialBonuses(baseScores, race);

  const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  abilities.forEach((ability) => {
    if (finalScores[ability] !== expectedFinalScores[ability]) {
      errors.push(
        `${ability} mismatch: expected ${expectedFinalScores[ability]}, got ${finalScores[ability]}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate ability modifier from ability score
 * @param score - Ability score (1-30)
 * @returns Ability modifier (-5 to +10)
 */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate all ability modifiers from ability scores
 * @param scores - Ability scores object
 * @returns Object with ability modifiers
 */
export function calculateAllModifiers(scores: AbilityScores): Record<AbilityName, number> {
  return {
    STR: calculateAbilityModifier(scores.STR),
    DEX: calculateAbilityModifier(scores.DEX),
    CON: calculateAbilityModifier(scores.CON),
    INT: calculateAbilityModifier(scores.INT),
    WIS: calculateAbilityModifier(scores.WIS),
    CHA: calculateAbilityModifier(scores.CHA),
  };
}

/**
 * Validate that ability scores are within acceptable range after racial bonuses
 * @param scores - Final ability scores (with racial bonuses)
 * @returns Validation result
 */
export function validateFinalScores(scores: AbilityScores): ValidationResult {
  const errors: string[] = [];
  const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  abilities.forEach((ability) => {
    const score = scores[ability];
    if (typeof score !== 'number' || !Number.isInteger(score)) {
      errors.push(`${ability} must be a whole number`);
      return;
    }
    // After racial bonuses, scores typically range from 8 to 20
    // But we'll be permissive and allow up to 20
    if (score < 1) {
      errors.push(`${ability} cannot be less than 1`);
    }
    if (score > 20) {
      errors.push(`${ability} cannot exceed 20 (after racial bonuses)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a score adjustment is valid within point-buy constraints
 * @param currentScore - Current ability score
 * @param newScore - New ability score
 * @param currentTotalPoints - Current total points spent
 * @returns Whether the adjustment is valid
 */
export function isScoreAdjustmentValid(
  currentScore: number,
  newScore: number,
  currentTotalPoints: number
): boolean {
  // Check if new score is in valid range
  if (newScore < ABILITY_SCORE_MIN || newScore > ABILITY_SCORE_MAX) {
    return false;
  }

  // Calculate point difference
  const currentCost = getPointCost(currentScore);
  const newCost = getPointCost(newScore);
  const pointDifference = newCost - currentCost;

  // Check if we have enough points
  const newTotalPoints = currentTotalPoints + pointDifference;
  return newTotalPoints >= 0 && newTotalPoints <= POINT_BUY_TOTAL;
}

/**
 * Get the maximum score that can be set for an ability given current point usage
 * @param currentScore - Current ability score
 * @param currentTotalPoints - Current total points spent
 * @returns Maximum score that can be set
 */
export function getMaxScoreForPoints(currentScore: number, currentTotalPoints: number): number {
  const currentCost = getPointCost(currentScore);
  const pointsAvailable = POINT_BUY_TOTAL - currentTotalPoints + currentCost;

  for (let score = ABILITY_SCORE_MAX; score >= ABILITY_SCORE_MIN; score--) {
    const cost = getPointCost(score);
    if (cost <= pointsAvailable) {
      return score;
    }
  }

  return ABILITY_SCORE_MIN;
}

/**
 * Get the minimum score that must be set for an ability to not exceed point limit
 * @param currentScore - Current ability score
 * @param currentTotalPoints - Current total points spent
 * @returns Minimum score that must be set
 */
export function getMinScoreForPoints(currentScore: number, currentTotalPoints: number): number {
  const currentCost = getPointCost(currentScore);
  const pointsAvailable = POINT_BUY_TOTAL - currentTotalPoints + currentCost;

  // If we're already over budget, we need to reduce
  if (pointsAvailable < 0) {
    return ABILITY_SCORE_MIN;
  }

  return ABILITY_SCORE_MIN;
}
