const { roll } = require('./dice');

function calculateCombatPower(character) {
  // This is a placeholder for a more complex combat power calculation
  return character.level + Math.floor((character.strength - 10) / 2);
}

function resolveCombat(party, enemies) {
  const partyPower = party.reduce((total, character) => total + calculateCombatPower(character), 0);
  const enemyPower = enemies.reduce((total, enemy) => total + enemy.cr, 0);

  const partyRoll = roll(`1d20+${partyPower}`);
  const enemyRoll = roll(`1d20+${enemyPower}`);

  if (partyRoll > enemyRoll) {
    return {
      outcome: 'victory',
      xp_gain: enemies.reduce((total, enemy) => total + enemy.xp, 0),
      loot: enemies.reduce((total, enemy) => total.concat(enemy.loot), []),
    };
  } else if (partyRoll < enemyRoll) {
    return {
      outcome: 'defeat',
      hp_loss: roll('1d6'),
    };
  } else {
    return {
      outcome: 'escape',
    };
  }
}

module.exports = {
  resolveCombat,
};
