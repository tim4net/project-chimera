import { rollDice } from './dice';
import type { Combatant, CombatResult } from '../types';

export const simulateCombat = (character1: Combatant, character2: Combatant): CombatResult => {
  const combatLog: string[] = [];
  const attackerState = { ...character1, stats: { ...character1.stats } };
  const defenderState = { ...character2, stats: { ...character2.stats } };

  let attacker = attackerState;
  let defender = defenderState;

  while (attacker.stats.health > 0 && defender.stats.health > 0) {
    const attackRoll = rollDice('1d20');
    const damageRoll = rollDice(attacker.stats.damage);

    if (attackRoll >= defender.stats.armorClass) {
      defender.stats.health -= damageRoll;
      combatLog.push(`${attacker.name} hits ${defender.name} for ${damageRoll} damage.`);
    } else {
      combatLog.push(`${attacker.name} misses ${defender.name}.`);
    }

    [attacker, defender] = [defender, attacker];
  }

  const winner = attacker.stats.health > 0 ? attacker : defender;
  combatLog.push(`${winner.name} wins!`);

  return { winner, combatLog };
};

export default simulateCombat;
