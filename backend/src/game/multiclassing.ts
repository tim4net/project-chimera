/**
 * @file D&D 5e Multiclassing Rules System
 *
 * This module implements complete multiclassing rules following D&D 5e SRD:
 * - Prerequisites (minimum ability scores)
 * - Proficiency adjustments when multiclassing
 * - Spell slot calculations for multiclass spellcasters
 * - HP and feature progression
 * - Validation of multiclass combinations
 *
 * Key concepts:
 * - Full casters (Wizard, Sorcerer, etc.): full levels count toward spell slots
 * - Half casters (Paladin, Ranger): half levels count toward spell slots
 * - Third casters (Fighter Eldritch Knight, Rogue Arcane Trickster): third levels
 * - Pact Magic (Warlock): completely separate spell slot system
 */

import type { AbilityScores, CharacterRecord } from '../types';
import type { ClassName } from '../data/classTypes';
import { CLASS_DATA } from '../data/classFeatures';

// --- TYPE DEFINITIONS ---

/** Ability score type matching game system */
export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

/** Represents a single class level */
export interface ClassLevel {
  className: ClassName;
  level: number;
}

/** Multiclass character build */
export interface MulticlassCharacter {
  classes: ClassLevel[];
  totalLevel: number;
  abilityScores: AbilityScores;
}

/** Proficiencies gained when multiclassing into a class */
export interface MulticlassProficiencies {
  armor: string[];
  weapons: string[];
  tools: string[];
  // Note: Saving throws are NOT gained when multiclassing
}

/** Spell slot progression result */
export interface SpellSlotProgression {
  slots: number[]; // Index 0-8 represents spell levels 1-9
  casterLevel: number;
  hasPactMagic: boolean;
  pactMagicSlots?: { level: number; slots: number }; // Separate warlock slots
}

// --- MULTICLASS PREREQUISITES (PHB p.163) ---

/**
 * Minimum ability scores required to multiclass into or out of each class.
 * A character must meet the prerequisite for BOTH their current class AND the new class.
 */
export const MULTICLASS_PREREQUISITES: Record<ClassName, { ability: Ability; minimum: number }> = {
  Barbarian: { ability: 'STR', minimum: 13 },
  Bard: { ability: 'CHA', minimum: 13 },
  Cleric: { ability: 'WIS', minimum: 13 },
  Druid: { ability: 'WIS', minimum: 13 },
  Fighter: { ability: 'STR', minimum: 13 }, // STR or DEX 13, using STR as primary
  Monk: { ability: 'DEX', minimum: 13 }, // DEX and WIS 13, DEX is primary
  Paladin: { ability: 'STR', minimum: 13 }, // STR and CHA 13, STR is primary
  Ranger: { ability: 'DEX', minimum: 13 }, // DEX and WIS 13, DEX is primary
  Rogue: { ability: 'DEX', minimum: 13 },
  Sorcerer: { ability: 'CHA', minimum: 13 },
  Warlock: { ability: 'CHA', minimum: 13 },
  Wizard: { ability: 'INT', minimum: 13 },
};

/**
 * Some classes require TWO ability scores for multiclassing.
 * This defines the secondary requirements.
 */
export const SECONDARY_PREREQUISITES: Partial<Record<ClassName, { ability: Ability; minimum: number }>> = {
  Monk: { ability: 'WIS', minimum: 13 },
  Paladin: { ability: 'CHA', minimum: 13 },
  Ranger: { ability: 'WIS', minimum: 13 },
};

// --- MULTICLASS PROFICIENCIES (PHB p.164) ---

/**
 * Proficiencies gained when multiclassing INTO a class.
 * These are different from (and more limited than) starting proficiencies.
 * Notably: you NEVER gain saving throw proficiencies from multiclassing.
 */
export const MULTICLASS_PROFICIENCIES: Record<ClassName, MulticlassProficiencies> = {
  Barbarian: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  Bard: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    tools: ['One musical instrument of your choice'],
  },
  Cleric: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: [],
    tools: [],
  },
  Druid: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: [],
    tools: ['Herbalism Kit'],
  },
  Fighter: {
    armor: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  Monk: {
    armor: [],
    weapons: ['Simple Weapons', 'Shortswords'],
    tools: [],
  },
  Paladin: {
    armor: ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  Ranger: {
    armor: ['Light Armor', 'Medium Armor', 'Shields'],
    weapons: ['Simple Weapons', 'Martial Weapons'],
    tools: [],
  },
  Rogue: {
    armor: ['Light Armor'],
    weapons: [],
    tools: ["Thieves' Tools"],
  },
  Sorcerer: {
    armor: [],
    weapons: [],
    tools: [],
  },
  Warlock: {
    armor: ['Light Armor'],
    weapons: ['Simple Weapons'],
    tools: [],
  },
  Wizard: {
    armor: [],
    weapons: [],
    tools: [],
  },
};

// --- SPELLCASTING PROGRESSION ---

/**
 * Classification of classes by their spellcasting progression.
 * This determines how levels contribute to multiclass spell slot calculations.
 */
export enum CasterType {
  FULL = 'FULL', // Full caster: Wizard, Sorcerer, Bard, Cleric, Druid
  HALF = 'HALF', // Half caster: Paladin, Ranger (start casting at level 2)
  THIRD = 'THIRD', // Third caster: Eldritch Knight, Arcane Trickster (not implemented yet)
  PACT = 'PACT', // Pact Magic: Warlock (separate system)
  NONE = 'NONE', // Non-caster: Barbarian, Fighter, Monk, Rogue
}

/**
 * Maps each class to its caster type for spell slot calculations.
 */
export const CLASS_CASTER_TYPE: Record<ClassName, CasterType> = {
  Wizard: CasterType.FULL,
  Sorcerer: CasterType.FULL,
  Bard: CasterType.FULL,
  Cleric: CasterType.FULL,
  Druid: CasterType.FULL,
  Paladin: CasterType.HALF,
  Ranger: CasterType.HALF,
  Warlock: CasterType.PACT,
  Barbarian: CasterType.NONE,
  Fighter: CasterType.NONE,
  Monk: CasterType.NONE,
  Rogue: CasterType.NONE,
};

/**
 * Standard spell slot progression table (PHB p.165).
 * Index represents caster level (1-20), values are slots per spell level (1st-9th).
 */
export const MULTICLASS_SPELL_SLOTS: Record<number, number[]> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

// --- PUBLIC FUNCTIONS ---

/**
 * Checks if a character meets the ability score prerequisites to multiclass.
 *
 * @param abilityScores - The character's ability scores
 * @param currentClass - The character's existing class (must meet prereq to multiclass OUT)
 * @param newClass - The class they want to multiclass INTO (must meet prereq)
 * @returns True if prerequisites are met, false otherwise
 */
export function canMulticlassInto(
  abilityScores: AbilityScores,
  currentClass: ClassName,
  newClass: ClassName,
): boolean {
  // Check current class prerequisites (must meet to leave)
  const currentPrereq = MULTICLASS_PREREQUISITES[currentClass];
  if (abilityScores[currentPrereq.ability] < currentPrereq.minimum) {
    return false;
  }

  // Check secondary prerequisite for current class if applicable
  const currentSecondary = SECONDARY_PREREQUISITES[currentClass];
  if (currentSecondary && abilityScores[currentSecondary.ability] < currentSecondary.minimum) {
    return false;
  }

  // Check new class prerequisites (must meet to enter)
  const newPrereq = MULTICLASS_PREREQUISITES[newClass];
  if (abilityScores[newPrereq.ability] < newPrereq.minimum) {
    return false;
  }

  // Check secondary prerequisite for new class if applicable
  const newSecondary = SECONDARY_PREREQUISITES[newClass];
  if (newSecondary && abilityScores[newSecondary.ability] < newSecondary.minimum) {
    return false;
  }

  return true;
}

/**
 * Gets the proficiencies gained when multiclassing into a class.
 *
 * @param className - The class being multiclassed into
 * @returns The proficiencies gained (armor, weapons, tools)
 */
export function getMulticlassProficiencies(className: ClassName): MulticlassProficiencies {
  return MULTICLASS_PROFICIENCIES[className];
}

/**
 * Calculates the effective caster level for multiclass spell slot determination.
 * This follows the rules in PHB p.164-165.
 *
 * @param classes - Array of class levels the character has
 * @returns The combined caster level (max 20)
 */
export function getEffectiveCasterLevel(classes: ClassLevel[]): number {
  let casterLevel = 0;

  for (const classLevel of classes) {
    const casterType = CLASS_CASTER_TYPE[classLevel.className];

    switch (casterType) {
      case CasterType.FULL:
        casterLevel += classLevel.level;
        break;
      case CasterType.HALF:
        // Half casters: round down (e.g., Paladin 5 / Ranger 3 = 4 caster levels)
        casterLevel += Math.floor(classLevel.level / 2);
        break;
      case CasterType.THIRD:
        // Third casters: round down (e.g., Eldritch Knight 7 = 2 caster levels)
        casterLevel += Math.floor(classLevel.level / 3);
        break;
      case CasterType.PACT:
      case CasterType.NONE:
        // Warlock and non-casters don't contribute
        break;
    }
  }

  // Cap at level 20
  return Math.min(casterLevel, 20);
}

/**
 * Calculates spell slots for a multiclass character.
 * Handles both standard spellcasting and Warlock's Pact Magic separately.
 *
 * @param classes - Array of class levels the character has
 * @returns Spell slot progression including Pact Magic if applicable
 */
export function calculateMulticlassSpellSlots(classes: ClassLevel[]): SpellSlotProgression {
  const casterLevel = getEffectiveCasterLevel(classes);
  const warlockLevels = classes.find((c) => c.className === 'Warlock');

  // Get standard spell slots from multiclass table
  const slots = casterLevel > 0 ? MULTICLASS_SPELL_SLOTS[casterLevel] : [0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Handle Warlock's Pact Magic separately
  if (warlockLevels) {
    const warlockLevel = warlockLevels.level;
    const warlockData = CLASS_DATA['Warlock'];

    // Warlock spell slots are separate and based on Warlock level only
    let pactSlotLevel: number;
    let pactSlotCount: number;

    if (warlockLevel >= 17) {
      pactSlotLevel = 5;
      pactSlotCount = 4;
    } else if (warlockLevel >= 11) {
      pactSlotLevel = 5;
      pactSlotCount = 3;
    } else if (warlockLevel >= 9) {
      pactSlotLevel = 5;
      pactSlotCount = 2;
    } else if (warlockLevel >= 7) {
      pactSlotLevel = 4;
      pactSlotCount = 2;
    } else if (warlockLevel >= 5) {
      pactSlotLevel = 3;
      pactSlotCount = 2;
    } else if (warlockLevel >= 3) {
      pactSlotLevel = 2;
      pactSlotCount = 2;
    } else {
      pactSlotLevel = 1;
      pactSlotCount = warlockLevel;
    }

    return {
      slots,
      casterLevel,
      hasPactMagic: true,
      pactMagicSlots: { level: pactSlotLevel, slots: pactSlotCount },
    };
  }

  return {
    slots,
    casterLevel,
    hasPactMagic: false,
  };
}

/**
 * Validates a complete multiclass character build.
 * Checks prerequisites for all class combinations.
 *
 * @param character - The multiclass character to validate
 * @returns Object with validation result and error messages
 */
export function validateMulticlassCharacter(character: MulticlassCharacter): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check total level doesn't exceed 20
  if (character.totalLevel > 20) {
    errors.push(`Total level ${character.totalLevel} exceeds maximum of 20`);
  }

  // Verify total level matches sum of class levels
  const calculatedTotal = character.classes.reduce((sum, c) => sum + c.level, 0);
  if (calculatedTotal !== character.totalLevel) {
    errors.push(`Class level sum (${calculatedTotal}) doesn't match total level (${character.totalLevel})`);
  }

  // Check each class meets prerequisites
  for (const classLevel of character.classes) {
    const prereq = MULTICLASS_PREREQUISITES[classLevel.className];
    if (character.abilityScores[prereq.ability] < prereq.minimum) {
      errors.push(
        `${classLevel.className} requires ${prereq.ability} ${prereq.minimum} (has ${character.abilityScores[prereq.ability]})`,
      );
    }

    // Check secondary prerequisites
    const secondary = SECONDARY_PREREQUISITES[classLevel.className];
    if (secondary && character.abilityScores[secondary.ability] < secondary.minimum) {
      errors.push(
        `${classLevel.className} requires ${secondary.ability} ${secondary.minimum} (has ${character.abilityScores[secondary.ability]})`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates combined hit points for a multiclass character.
 * First level of first class uses max hit die, all others use average.
 *
 * @param classes - Array of class levels in the order they were taken
 * @param constitution - Constitution score (not modifier)
 * @param useAverage - If true, use average HP per level (recommended)
 * @returns Total maximum HP
 */
export function calculateMulticlassHP(
  classes: ClassLevel[],
  constitution: number,
  useAverage: boolean = true,
): number {
  if (classes.length === 0) return 0;

  const constitutionModifier = Math.floor((constitution - 10) / 2);
  let totalHP = 0;
  let totalLevels = 0;

  for (const classLevel of classes) {
    const classData = CLASS_DATA[classLevel.className];
    const hitDie = classData.hitDice;

    for (let i = 0; i < classLevel.level; i++) {
      totalLevels++;

      if (totalLevels === 1) {
        // First character level ever: max hit die
        totalHP += hitDie + constitutionModifier;
      } else {
        // All subsequent levels: average = (die_max / 2) + 1
        const hpGain = useAverage ? Math.floor(hitDie / 2) + 1 : hitDie;
        totalHP += hpGain + constitutionModifier;
      }
    }
  }

  // Minimum 1 HP per level
  return Math.max(totalHP, totalLevels);
}

/**
 * Gets all proficiencies a multiclass character should have.
 * Includes starting proficiencies from first class plus multiclass proficiencies from additional classes.
 *
 * @param classes - Array of class levels in order taken
 * @returns Combined proficiency list
 */
export function getMulticlassAllProficiencies(classes: ClassLevel[]): {
  armor: string[];
  weapons: string[];
  tools: string[];
  savingThrows: string[];
} {
  if (classes.length === 0) {
    return { armor: [], weapons: [], tools: [], savingThrows: [] };
  }

  // First class: get full starting proficiencies
  const firstClass = CLASS_DATA[classes[0].className];
  const allProficiencies = {
    armor: [...firstClass.proficiencies.armor],
    weapons: [...firstClass.proficiencies.weapons],
    tools: [...firstClass.proficiencies.tools],
    savingThrows: [...firstClass.proficiencies.savingThrows],
  };

  // Additional classes: only get multiclass proficiencies
  for (let i = 1; i < classes.length; i++) {
    const multiclassProf = MULTICLASS_PROFICIENCIES[classes[i].className];
    allProficiencies.armor.push(...multiclassProf.armor);
    allProficiencies.weapons.push(...multiclassProf.weapons);
    allProficiencies.tools.push(...multiclassProf.tools);
    // Note: no saving throws from multiclassing
  }

  // Remove duplicates
  return {
    armor: [...new Set(allProficiencies.armor)],
    weapons: [...new Set(allProficiencies.weapons)],
    tools: [...new Set(allProficiencies.tools)],
    savingThrows: [...new Set(allProficiencies.savingThrows)],
  };
}

/**
 * Converts a CharacterRecord to multiclass format for analysis.
 * Note: Currently supports single-class only (class field is string).
 * Future enhancement: support multiple classes in database schema.
 *
 * @param character - Character record from database
 * @returns MulticlassCharacter format for validation
 */
export function characterToMulticlass(character: CharacterRecord): MulticlassCharacter {
  return {
    classes: [
      {
        className: character.class as ClassName,
        level: character.level,
      },
    ],
    totalLevel: character.level,
    abilityScores: character.ability_scores,
  };
}
