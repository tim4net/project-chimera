// D&D 5e Point-Buy Rules
const POINT_BUY_COST = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};
const MAX_POINTS = 27;

function validatePointBuy(scores) {
  let totalPoints = 0;
  for (const score of Object.values(scores)) {
    if (score < 8 || score > 15) {
      return false; // Scores must be between 8 and 15
    }
    totalPoints += POINT_BUY_COST[score];
  }
  return totalPoints <= MAX_POINTS;
}

module.exports = {
  validatePointBuy,
};
