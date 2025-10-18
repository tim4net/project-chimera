import type { AbilityScores } from '../types';

const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

const MAX_POINTS = 27;

export const validatePointBuy = (scores: AbilityScores): boolean => {
  let totalPoints = 0;
  const values = Object.values(scores);

  for (const score of values) {
    if (score < 8 || score > 15) {
      return false;
    }

    totalPoints += POINT_BUY_COST[score] ?? Number.POSITIVE_INFINITY;
  }

  return totalPoints <= MAX_POINTS;
};

export default validatePointBuy;
