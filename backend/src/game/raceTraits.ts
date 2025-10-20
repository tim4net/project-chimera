/**
 * Race Traits System - Apply racial ability bonuses and traits to character creation
 * Implements D&D 5e SRD racial mechanics
 */

import type { AbilityScores } from '../types';
import { getRace, type Race } from '../data/races';

export interface AppliedRacialBonuses {
  modifiedScores: AbilityScores;
  traits: string[];
  proficiencies: string[];
  languages: string[];
  darkvision?: number;
  speed: number;
  size: 'Small' | 'Medium';
}

/**
 * Apply racial ability score bonuses to base scores
 * @param raceName - The name of the race
 * @param baseScores - The base ability scores (from point-buy)
 * @returns The modified scores with racial bonuses applied
 */
export function applyRacialAbilityBonuses(
  raceName: string,
  baseScores: AbilityScores
): AbilityScores {
  const race = getRace(raceName);
  if (!race) {
    throw new Error(`Invalid race: ${raceName}`);
  }

  const modifiedScores: AbilityScores = { ...baseScores };
  const bonuses = race.abilityBonuses;

  // Apply each ability bonus
  if (bonuses.STR) modifiedScores.STR += bonuses.STR;
  if (bonuses.DEX) modifiedScores.DEX += bonuses.DEX;
  if (bonuses.CON) modifiedScores.CON += bonuses.CON;
  if (bonuses.INT) modifiedScores.INT += bonuses.INT;
  if (bonuses.WIS) modifiedScores.WIS += bonuses.WIS;
  if (bonuses.CHA) modifiedScores.CHA += bonuses.CHA;

  return modifiedScores;
}

/**
 * Get all racial traits and features for a given race
 * @param raceName - The name of the race
 * @returns Complete racial benefits package
 */
export function getRacialBenefits(raceName: string): AppliedRacialBonuses {
  const race = getRace(raceName);
  if (!race) {
    throw new Error(`Invalid race: ${raceName}`);
  }

  return {
    modifiedScores: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }, // Placeholder - should be combined with base scores
    traits: race.traits.map(t => t.name),
    proficiencies: race.proficiencies || [],
    languages: race.languages,
    darkvision: race.darkvision,
    speed: race.speed,
    size: race.size
  };
}

/**
 * Get the racial speed for a given race
 * @param raceName - The name of the race
 * @returns The base movement speed in feet
 */
export function getRacialSpeed(raceName: string): number {
  const race = getRace(raceName);
  if (!race) {
    console.warn(`Unknown race "${raceName}", defaulting to 30 ft speed`);
    return 30;
  }
  return race.speed;
}

/**
 * Get all trait descriptions for a race (useful for character sheet display)
 * @param raceName - The name of the race
 * @returns Array of trait objects with names and descriptions
 */
export function getRacialTraitDescriptions(raceName: string) {
  const race = getRace(raceName);
  if (!race) {
    throw new Error(`Invalid race: ${raceName}`);
  }
  return race.traits;
}

/**
 * Check if a race has darkvision
 * @param raceName - The name of the race
 * @returns The darkvision range in feet, or undefined if no darkvision
 */
export function getDarkvisionRange(raceName: string): number | undefined {
  const race = getRace(raceName);
  return race?.darkvision;
}

/**
 * Get the size category of a race
 * @param raceName - The name of the race
 * @returns 'Small' or 'Medium'
 */
export function getRacialSize(raceName: string): 'Small' | 'Medium' {
  const race = getRace(raceName);
  if (!race) {
    console.warn(`Unknown race "${raceName}", defaulting to Medium size`);
    return 'Medium';
  }
  return race.size;
}

/**
 * Get the list of languages a race knows
 * @param raceName - The name of the race
 * @returns Array of language names
 */
export function getRacialLanguages(raceName: string): string[] {
  const race = getRace(raceName);
  if (!race) {
    return ['Common'];
  }
  return race.languages;
}

/**
 * Get racial proficiencies (skills, tools, weapons)
 * @param raceName - The name of the race
 * @returns Array of proficiency names
 */
export function getRacialProficiencies(raceName: string): string[] {
  const race = getRace(raceName);
  return race?.proficiencies || [];
}

/**
 * Calculate max HP with racial CON bonus applied
 * @param raceName - The name of the race
 * @param baseConScore - The base CON score (before racial bonus)
 * @param classHitDie - The hit die for the character's class
 * @returns Maximum HP at level 1
 */
export function calculateLevel1HP(
  raceName: string,
  baseConScore: number,
  classHitDie: number
): number {
  const race = getRace(raceName);
  if (!race) {
    throw new Error(`Invalid race: ${raceName}`);
  }

  // Apply racial CON bonus
  const finalCon = baseConScore + (race.abilityBonuses.CON || 0);
  const conMod = Math.floor((finalCon - 10) / 2);

  // Level 1 HP = max hit die + CON modifier
  return classHitDie + conMod;
}

/**
 * Calculate AC with racial DEX bonus applied
 * @param raceName - The name of the race
 * @param baseDexScore - The base DEX score (before racial bonus)
 * @param armorBonus - Any armor bonus (0 for unarmored)
 * @returns Armor Class
 */
export function calculateBaseAC(
  raceName: string,
  baseDexScore: number,
  armorBonus: number = 0
): number {
  const race = getRace(raceName);
  if (!race) {
    throw new Error(`Invalid race: ${raceName}`);
  }

  // Apply racial DEX bonus
  const finalDex = baseDexScore + (race.abilityBonuses.DEX || 0);
  const dexMod = Math.floor((finalDex - 10) / 2);

  // AC = 10 + DEX mod + armor bonus
  return 10 + dexMod + armorBonus;
}

/**
 * Get age-related information for a race
 * @param raceName - The name of the race
 * @returns Age information (maturity and max age)
 */
export function getRacialAgeInfo(raceName: string) {
  const race = getRace(raceName);
  if (!race) {
    return { maturity: 18, max: 100 }; // Default to human
  }
  return race.age;
}

/**
 * Get the typical alignment for a race
 * @param raceName - The name of the race
 * @returns Alignment description
 */
export function getTypicalAlignment(raceName: string): string {
  const race = getRace(raceName);
  if (!race) {
    return 'Neutral';
  }
  return race.alignment;
}
