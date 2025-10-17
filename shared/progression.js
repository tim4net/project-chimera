const { roll } = require('./dice');

const xp_thresholds = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
  120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

function canLevelUp(character) {
  return character.xp >= xp_thresholds[character.level];
}

function levelUp(character) {
  if (!canLevelUp(character)) {
    return character;
  }

  const newLevel = character.level + 1;
  const newHp = character.hp_max + roll(`1d${character.hit_die}`) + Math.floor((character.constitution - 10) / 2);

  return {
    ...character,
    level: newLevel,
    hp_max: newHp,
    hp_current: newHp,
  };
}

module.exports = {
  canLevelUp,
  levelUp,
};
