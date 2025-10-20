/**
 * D&D 5e Spellcasting Mechanics
 *
 * This module handles spell save DC calculations, spell attack bonuses,
 * and other spellcasting-related game mechanics.
 */

import type { Spell } from '../data/spells';
import { getSpellSlotsForClass, getMaxSpellLevel } from '../data/spellSlots';

/**
 * Character ability scores interface
 */
export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

/**
 * Calculate ability modifier from ability score
 * Formula: (score - 10) / 2, rounded down
 */
export function calculateAbilityModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Get the spellcasting ability for a class
 * Returns the ability score name (lowercase)
 */
export function getSpellcastingAbility(className: string): keyof AbilityScores {
  const normalizedClass = className.toLowerCase();

  switch (normalizedClass) {
    case 'wizard':
    case 'eldritch knight':
    case 'arcane trickster':
      return 'intelligence';

    case 'cleric':
    case 'druid':
    case 'ranger':
      return 'wisdom';

    case 'bard':
    case 'paladin':
    case 'sorcerer':
    case 'warlock':
      return 'charisma';

    default:
      return 'intelligence'; // Default fallback
  }
}

/**
 * Calculate Spell Save DC
 * Formula: 8 + proficiency bonus + spellcasting ability modifier
 */
export function calculateSpellSaveDC(
  proficiencyBonus: number,
  spellcastingAbilityModifier: number
): number {
  return 8 + proficiencyBonus + spellcastingAbilityModifier;
}

/**
 * Calculate Spell Attack Bonus
 * Formula: proficiency bonus + spellcasting ability modifier
 */
export function calculateSpellAttackBonus(
  proficiencyBonus: number,
  spellcastingAbilityModifier: number
): number {
  return proficiencyBonus + spellcastingAbilityModifier;
}

/**
 * Get proficiency bonus based on character level
 */
export function getProficiencyBonus(characterLevel: number): number {
  if (characterLevel >= 17) return 6;
  if (characterLevel >= 13) return 5;
  if (characterLevel >= 9) return 4;
  if (characterLevel >= 5) return 3;
  return 2;
}

/**
 * Character spellcasting stats
 */
export interface SpellcastingStats {
  spellcastingAbility: keyof AbilityScores;
  spellcastingModifier: number;
  spellSaveDC: number;
  spellAttackBonus: number;
  proficiencyBonus: number;
  maxSpellLevel: number;
}

/**
 * Calculate all spellcasting stats for a character
 */
export function calculateSpellcastingStats(
  className: string,
  characterLevel: number,
  abilityScores: AbilityScores
): SpellcastingStats {
  const spellcastingAbility = getSpellcastingAbility(className);
  const abilityScore = abilityScores[spellcastingAbility];
  const spellcastingModifier = calculateAbilityModifier(abilityScore);
  const proficiencyBonus = getProficiencyBonus(characterLevel);

  return {
    spellcastingAbility,
    spellcastingModifier,
    spellSaveDC: calculateSpellSaveDC(proficiencyBonus, spellcastingModifier),
    spellAttackBonus: calculateSpellAttackBonus(proficiencyBonus, spellcastingModifier),
    proficiencyBonus,
    maxSpellLevel: getMaxSpellLevel(className, characterLevel),
  };
}

/**
 * Check if a character can cast a spell
 */
export function canCastSpell(
  spell: Spell,
  characterClass: string,
  characterLevel: number,
  currentSpellSlots: Record<string, number>
): { canCast: boolean; reason?: string } {
  // Check if the class can cast this spell
  if (!spell.classes.includes(characterClass)) {
    return { canCast: false, reason: 'Class cannot cast this spell' };
  }

  // Cantrips can always be cast
  if (spell.level === 0) {
    return { canCast: true };
  }

  // Check if character level is high enough
  const maxSpellLevel = getMaxSpellLevel(characterClass, characterLevel);
  if (spell.level > maxSpellLevel) {
    return { canCast: false, reason: 'Character level too low' };
  }

  // Check if there are available spell slots
  const slotKey = `level${spell.level}`;
  const availableSlots = currentSpellSlots[slotKey] || 0;

  if (availableSlots <= 0) {
    return { canCast: false, reason: 'No spell slots available' };
  }

  return { canCast: true };
}

/**
 * Roll a saving throw
 * Returns true if the save succeeds
 */
export function rollSavingThrow(
  targetAbilityModifier: number,
  spellSaveDC: number
): { success: boolean; roll: number; total: number } {
  const roll = Math.floor(Math.random() * 20) + 1; // 1d20
  const total = roll + targetAbilityModifier;
  const success = total >= spellSaveDC;

  return { success, roll, total };
}

/**
 * Roll a spell attack
 * Returns true if the attack hits
 */
export function rollSpellAttack(
  spellAttackBonus: number,
  targetAC: number
): { hit: boolean; roll: number; total: number } {
  const roll = Math.floor(Math.random() * 20) + 1; // 1d20

  // Critical hit
  if (roll === 20) {
    return { hit: true, roll, total: roll + spellAttackBonus };
  }

  // Critical miss
  if (roll === 1) {
    return { hit: false, roll, total: roll + spellAttackBonus };
  }

  const total = roll + spellAttackBonus;
  const hit = total >= targetAC;

  return { hit, roll, total };
}

/**
 * Parse damage dice notation (e.g., "2d6", "1d8+3")
 * Returns the rolled damage
 */
export function rollDamage(diceNotation: string): number {
  // Parse notation like "2d6+3" or "1d8"
  const match = diceNotation.match(/(\d+)d(\d+)([+-]\d+)?/);

  if (!match) {
    return 0;
  }

  const numDice = parseInt(match[1], 10);
  const dieSize = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  let total = modifier;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * dieSize) + 1;
  }

  return Math.max(0, total);
}

/**
 * Handle concentration checks
 * When a concentrating caster takes damage, they must make a Constitution saving throw
 * DC = 10 or half the damage taken, whichever is higher
 */
export function rollConcentrationCheck(
  constitutionModifier: number,
  damageTaken: number
): { success: boolean; roll: number; total: number; dc: number } {
  const dc = Math.max(10, Math.floor(damageTaken / 2));
  const roll = Math.floor(Math.random() * 20) + 1; // 1d20
  const total = roll + constitutionModifier;
  const success = total >= dc;

  return { success, roll, total, dc };
}

/**
 * Check if a spell requires concentration
 * and if the caster is already concentrating on another spell
 */
export function checkConcentrationConflict(
  newSpell: Spell,
  currentConcentrationSpell: Spell | null
): { canCast: boolean; warning?: string } {
  if (!newSpell.concentration) {
    return { canCast: true };
  }

  if (currentConcentrationSpell) {
    return {
      canCast: true,
      warning: `Casting this spell will end concentration on ${currentConcentrationSpell.name}`,
    };
  }

  return { canCast: true };
}

/**
 * Calculate spell damage at higher levels
 * Used for spells that scale with spell slot level
 */
export function calculateUpcastDamage(
  baseDamage: string,
  spellLevel: number,
  castAtLevel: number,
  dicePerLevel: number = 1
): string {
  const levelDifference = castAtLevel - spellLevel;
  if (levelDifference <= 0) {
    return baseDamage;
  }

  // Parse base damage
  const match = baseDamage.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) {
    return baseDamage;
  }

  const baseDice = parseInt(match[1], 10);
  const dieSize = match[2];
  const modifier = match[3] || '';

  const newDiceCount = baseDice + (levelDifference * dicePerLevel);
  return `${newDiceCount}d${dieSize}${modifier}`;
}

/**
 * Get the number of known spells for a class at a level
 * Some classes (like Wizards) prepare spells, others know a fixed number
 */
export function getKnownSpellsCount(className: string, characterLevel: number): number | 'prepared' {
  const normalizedClass = className.toLowerCase();

  // Classes that prepare spells from their full list
  if (['cleric', 'druid', 'paladin'].includes(normalizedClass)) {
    return 'prepared'; // Number equals level + spellcasting modifier
  }

  // Wizard uses spellbook
  if (normalizedClass === 'wizard') {
    return 6 + (characterLevel - 1) * 2; // 6 at level 1, +2 per level
  }

  // Bard
  if (normalizedClass === 'bard') {
    const spellsByLevel = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15, 15, 15];
    return spellsByLevel[characterLevel] || 4;
  }

  // Sorcerer
  if (normalizedClass === 'sorcerer') {
    const spellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
    return spellsByLevel[characterLevel] || 2;
  }

  // Warlock
  if (normalizedClass === 'warlock') {
    const spellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
    return spellsByLevel[characterLevel] || 2;
  }

  // Ranger
  if (normalizedClass === 'ranger') {
    const spellsByLevel = [0, 0, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 11];
    return spellsByLevel[characterLevel] || 0;
  }

  return 0;
}
