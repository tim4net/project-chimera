import { rollDice } from './dice';
import type { Combatant, CombatResult } from '../types';

const MAX_TURNS = 100;

export const simulateCombat = (character1: Combatant, character2: Combatant): CombatResult => {
  const combatLog: string[] = [];
  const attackerState: Combatant = { ...character1, stats: { ...character1.stats } };
  const defenderState: Combatant = { ...character2, stats: { ...character2.stats } };

  let attacker = attackerState;
  let defender = defenderState;
  let turns = 0;

  while (attacker.stats.health > 0 && defender.stats.health > 0 && turns < MAX_TURNS) {
    turns += 1;

    let attackRoll: number;
    try {
      attackRoll = rollDice('1d20');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown dice error';
      combatLog.push(`Combat halted: failed to roll attack dice for ${attacker.name} (${message}).`);
      return { winner: null, combatLog, outcome: 'error' };
    }

    if (attackRoll >= defender.stats.armorClass) {
      let damageRoll: number;
      try {
        damageRoll = rollDice(attacker.stats.damage);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown dice error';
        combatLog.push(`Combat halted: failed to roll damage dice for ${attacker.name} (${message}).`);
        return { winner: null, combatLog, outcome: 'error' };
      }

      defender.stats.health -= damageRoll;
      combatLog.push(`${attacker.name} hits ${defender.name} for ${damageRoll} damage.`);
    } else {
      combatLog.push(`${attacker.name} misses ${defender.name}.`);
    }

    if (defender.stats.health <= 0) {
      break;
    }

    [attacker, defender] = [defender, attacker];
  }

  if (attacker.stats.health > 0 && defender.stats.health <= 0) {
    combatLog.push(`${attacker.name} wins!`);
    return { winner: attacker, combatLog, outcome: 'win' };
  }

  if (defender.stats.health > 0 && attacker.stats.health <= 0) {
    combatLog.push(`${defender.name} wins!`);
    return { winner: defender, combatLog, outcome: 'win' };
  }

  combatLog.push(`Stalemate reached after ${MAX_TURNS} turns.`);

  if (attacker.stats.health === defender.stats.health) {
    combatLog.push('Combat ends in a draw.');
    return { winner: null, combatLog, outcome: 'draw' };
  }

  const stalemateWinner = attacker.stats.health > defender.stats.health ? attacker : defender;
  combatLog.push(`${stalemateWinner.name} declared winner by remaining health.`);
  return { winner: stalemateWinner, combatLog, outcome: 'win' };
};

export default simulateCombat;
