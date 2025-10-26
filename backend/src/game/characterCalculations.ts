/**
 * Character Calculations - D&D 5e Mechanics
 *
 * Comprehensive calculations for character creation and progression.
 * All formulas follow D&D 5e Player's Handbook rules.
 */

import type { AbilityScores } from '../types';
import { getRace } from '../data/races';

export interface AbilityModifiers {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface SpellSlots {
  [level: string]: number;
}

/**
 * Calculate ability modifiers from ability scores
 * Formula: (score - 10) / 2, rounded down
 */
export function calculateAbilityModifiers(abilityScores: AbilityScores): AbilityModifiers {
  return {
    STR: Math.floor((abilityScores.STR - 10) / 2),
    DEX: Math.floor((abilityScores.DEX - 10) / 2),
    CON: Math.floor((abilityScores.CON - 10) / 2),
    INT: Math.floor((abilityScores.INT - 10) / 2),
    WIS: Math.floor((abilityScores.WIS - 10) / 2),
    CHA: Math.floor((abilityScores.CHA - 10) / 2)
  };
}

/**
 * Apply racial ability score bonuses to base scores
 */
export function applyRacialBonuses(race: string, baseScores: AbilityScores): AbilityScores {
  const raceData = getRace(race);
  if (!raceData) {
    throw new Error(`Invalid race: ${race}`);
  }

  const modifiedScores: AbilityScores = { ...baseScores };
  const bonuses = raceData.abilityBonuses;

  if (bonuses.STR) modifiedScores.STR += bonuses.STR;
  if (bonuses.DEX) modifiedScores.DEX += bonuses.DEX;
  if (bonuses.CON) modifiedScores.CON += bonuses.CON;
  if (bonuses.INT) modifiedScores.INT += bonuses.INT;
  if (bonuses.WIS) modifiedScores.WIS += bonuses.WIS;
  if (bonuses.CHA) modifiedScores.CHA += bonuses.CHA;

  return modifiedScores;
}

/**
 * Calculate maximum HP at level 1
 * Formula: Hit Die + CON modifier
 */
export function calculateHP(race: string, classHitDie: number, conScore: number): number {
  const raceData = getRace(race);
  if (!raceData) {
    throw new Error(`Invalid race: ${race}`);
  }

  // Apply racial CON bonus
  const finalCon = conScore + (raceData.abilityBonuses.CON || 0);
  const conMod = Math.floor((finalCon - 10) / 2);

  // Level 1 HP = max hit die + CON modifier (minimum 1 HP)
  return Math.max(1, classHitDie + conMod);
}

/**
 * Calculate Armor Class (unarmored)
 * Formula: 10 + DEX modifier + armor bonus
 */
export function calculateAC(race: string, dexScore: number, armorBonus: number = 0): number {
  const raceData = getRace(race);
  if (!raceData) {
    throw new Error(`Invalid race: ${race}`);
  }

  // Apply racial DEX bonus
  const finalDex = dexScore + (raceData.abilityBonuses.DEX || 0);
  const dexMod = Math.floor((finalDex - 10) / 2);

  // AC = 10 + DEX mod + armor bonus
  return 10 + dexMod + armorBonus;
}

/**
 * Get starting gold by class
 * Based on PHB starting wealth averages
 */
export function getStartingGold(characterClass: string): number {
  const goldByClass: Record<string, number> = {
    Barbarian: 50,   // 2d4 × 10
    Bard: 125,       // 5d4 × 10
    Cleric: 125,     // 5d4 × 10
    Druid: 50,       // 2d4 × 10
    Fighter: 125,    // 5d4 × 10
    Monk: 13,        // 5d4 (no multiplier)
    Paladin: 125,    // 5d4 × 10
    Ranger: 125,     // 5d4 × 10
    Rogue: 100,      // 4d4 × 10
    Sorcerer: 75,    // 3d4 × 10
    Warlock: 100,    // 4d4 × 10
    Wizard: 100      // 4d4 × 10
  };

  return goldByClass[characterClass] ?? 100;
}

/**
 * Get spell slots for a character at a given level
 * Returns empty object for non-spellcasters
 */
export function getSpellSlots(characterClass: string, level: number): SpellSlots {
  // Full casters (Bard, Cleric, Druid, Sorcerer, Wizard)
  const fullCasterSlots: Record<number, SpellSlots> = {
    1: { '1': 2 },
    2: { '1': 3 },
    3: { '1': 4, '2': 2 },
    4: { '1': 4, '2': 3 },
    5: { '1': 4, '2': 3, '3': 2 },
    6: { '1': 4, '2': 3, '3': 3 },
    7: { '1': 4, '2': 3, '3': 3, '4': 1 },
    8: { '1': 4, '2': 3, '3': 3, '4': 2 },
    9: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
    10: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 },
    11: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1 },
    12: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1 },
    13: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1 },
    14: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1 },
    15: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1 },
    16: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1 },
    17: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2, '6': 1, '7': 1, '8': 1, '9': 1 },
    18: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 1, '7': 1, '8': 1, '9': 1 },
    19: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 1, '8': 1, '9': 1 },
    20: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 3, '6': 2, '7': 2, '8': 1, '9': 1 }
  };

  // Warlock uses unique Pact Magic system
  const warlockSlots: Record<number, SpellSlots> = {
    1: { '1': 1 },
    2: { '1': 2 },
    3: { '2': 2 },
    4: { '2': 2 },
    5: { '3': 2 },
    6: { '3': 2 },
    7: { '4': 2 },
    8: { '4': 2 },
    9: { '5': 2 },
    10: { '5': 2 },
    11: { '5': 3 },
    12: { '5': 3 },
    13: { '5': 3 },
    14: { '5': 3 },
    15: { '5': 3 },
    16: { '5': 3 },
    17: { '5': 4 },
    18: { '5': 4 },
    19: { '5': 4 },
    20: { '5': 4 }
  };

  // Half-casters (Paladin, Ranger) - get spells at level 2
  const halfCasterSlots: Record<number, SpellSlots> = {
    1: {},
    2: { '1': 2 },
    3: { '1': 3 },
    4: { '1': 3 },
    5: { '1': 4, '2': 2 },
    6: { '1': 4, '2': 2 },
    7: { '1': 4, '2': 3 },
    8: { '1': 4, '2': 3 },
    9: { '1': 4, '2': 3, '3': 2 },
    10: { '1': 4, '2': 3, '3': 2 },
    11: { '1': 4, '2': 3, '3': 3 },
    12: { '1': 4, '2': 3, '3': 3 },
    13: { '1': 4, '2': 3, '3': 3, '4': 1 },
    14: { '1': 4, '2': 3, '3': 3, '4': 1 },
    15: { '1': 4, '2': 3, '3': 3, '4': 2 },
    16: { '1': 4, '2': 3, '3': 3, '4': 2 },
    17: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
    18: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 1 },
    19: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 },
    20: { '1': 4, '2': 3, '3': 3, '4': 3, '5': 2 }
  };

  const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
  const halfCasters = ['Paladin', 'Ranger'];

  if (characterClass === 'Warlock') {
    return warlockSlots[level] ?? {};
  } else if (fullCasters.includes(characterClass)) {
    return fullCasterSlots[level] ?? {};
  } else if (halfCasters.includes(characterClass)) {
    return halfCasterSlots[level] ?? {};
  }

  // Non-spellcasters return empty object
  return {};
}

/**
 * Calculate proficiency bonus by character level
 * Formula: +2 at levels 1-4, +3 at 5-8, +4 at 9-12, +5 at 13-16, +6 at 17-20
 */
export function calculateProficiencyBonus(level: number): number {
  if (level < 1) return 2;
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

/**
 * Get hit die size for a class
 */
export function getClassHitDie(characterClass: string): number {
  const hitDiceMap: Record<string, number> = {
    Barbarian: 12,
    Fighter: 10,
    Paladin: 10,
    Ranger: 10,
    Bard: 8,
    Cleric: 8,
    Druid: 8,
    Monk: 8,
    Rogue: 8,
    Warlock: 8,
    Sorcerer: 6,
    Wizard: 6
  };

  return hitDiceMap[characterClass] ?? 8;
}

/**
 * Calculate all character stats at once
 * Returns a comprehensive stats object
 */
export function calculateCharacterStats(
  race: string,
  characterClass: string,
  baseAbilityScores: AbilityScores,
  level: number = 1
): {
  finalScores: AbilityScores;
  modifiers: AbilityModifiers;
  hp: number;
  ac: number;
  proficiencyBonus: number;
  spellSlots: SpellSlots;
  hitDie: number;
} {
  const finalScores = applyRacialBonuses(race, baseAbilityScores);
  const modifiers = calculateAbilityModifiers(finalScores);
  const hitDie = getClassHitDie(characterClass);
  const hp = calculateHP(race, hitDie, baseAbilityScores.CON);
  const ac = calculateAC(race, baseAbilityScores.DEX);
  const proficiencyBonus = calculateProficiencyBonus(level);
  const spellSlots = getSpellSlots(characterClass, level);

  return {
    finalScores,
    modifiers,
    hp,
    ac,
    proficiencyBonus,
    spellSlots,
    hitDie
  };
}
