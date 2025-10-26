/**
 * @file abilityScoreService.ts
 * @description D&D 5e ability score calculations and racial bonuses
 */

import type { AbilityScores } from '../types/wizard';

/**
 * Calculate ability modifier from ability score using D&D 5e formula
 * Formula: (score - 10) / 2 (rounded down)
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Apply racial bonuses to ability scores based on D&D 5e rules
 * @param scores - Base ability scores
 * @param race - Character race
 * @returns Ability scores with racial bonuses applied
 */
export function applyRacialBonuses(
  scores: AbilityScores,
  race: string
): AbilityScores {
  const result = { ...scores };

  switch (race) {
    case 'Dwarf':
      result.constitution += 2;
      break;
    case 'Elf':
      result.dexterity += 2;
      break;
    case 'Halfling':
      result.dexterity += 2;
      break;
    case 'Human':
      result.strength += 1;
      result.dexterity += 1;
      result.constitution += 1;
      result.intelligence += 1;
      result.wisdom += 1;
      result.charisma += 1;
      break;
    case 'Dragonborn':
      result.strength += 2;
      result.charisma += 1;
      break;
    case 'Gnome':
      result.intelligence += 2;
      break;
    case 'Half-Elf':
      result.charisma += 2;
      // +1 to two other abilities (default to STR and DEX for simplicity)
      result.strength += 1;
      result.dexterity += 1;
      break;
    case 'Half-Orc':
      result.strength += 2;
      result.constitution += 1;
      break;
    default:
      // Invalid race - return unchanged scores
      break;
  }

  return result;
}

/**
 * Calculate hit points based on hit die, CON modifier, and level
 * Formula: (hitDie + conModifier) + (level - 1) * (average(hitDie) + conModifier)
 * Minimum 1 HP per level
 */
export function calculateHitPoints(
  hitDie: number,
  conModifier: number,
  level: number = 1
): number {
  // Level 1 HP: max hit die + CON mod (minimum 1)
  const level1HP = Math.max(1, hitDie + conModifier);

  if (level === 1) {
    return level1HP;
  }

  // Additional levels: average hit die + CON mod per level (minimum 1 per level)
  const averageHitDie = Math.ceil(hitDie / 2) + 1; // Average of dice (d6=4, d8=5, d10=6, d12=7)
  const hpPerLevel = Math.max(1, averageHitDie + conModifier);
  const additionalHP = (level - 1) * hpPerLevel;

  return level1HP + additionalHP;
}

/**
 * Calculate armor class
 * Formula: baseAC + DEX modifier
 */
export function calculateArmorClass(
  baseAC: number,
  dexModifier: number
): number {
  return baseAC + dexModifier;
}

/**
 * Calculate proficiency bonus based on character level
 * Levels 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
 */
export function calculateProficiencyBonus(level: number = 1): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6; // Levels 17-20
}
