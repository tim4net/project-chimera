const { rollDice } = require('./dice');

const simulateCombat = (character1, character2) => {
  const combatLog = [];
  let attacker = character1;
  let defender = character2;

  while (character1.stats.health > 0 && character2.stats.health > 0) {
    const attackRoll = rollDice('1d20');
    const damageRoll = rollDice(attacker.stats.damage);

    if (attackRoll >= defender.stats.armorClass) {
      defender.stats.health -= damageRoll;
      combatLog.push(
        `${attacker.name} hits ${defender.name} for ${damageRoll} damage.`
      );
    } else {
      combatLog.push(`${attacker.name} misses ${defender.name}.`);
    }

    // Swap attacker and defender
    [attacker, defender] = [defender, attacker];
  }

  const winner = character1.stats.health > 0 ? character1 : character2;
  combatLog.push(`${winner.name} wins!`);

  return { winner, combatLog };
};

module.exports = { simulateCombat };
