/**
 * Complete D&D 5e SRD Class Features
 * Imported from https://www.dnd5eapi.co/
 *
 * Contains all class features for levels 1-20 for all 12 classes.
 */

export * from './classTypes';
import { BARBARIAN_DATA } from './classes/barbarian';
import { BARD_DATA } from './classes/bard';
import { CLERIC_DATA } from './classes/cleric';
import { DRUID_DATA } from './classes/druid';
import { FIGHTER_DATA } from './classes/fighter';
import { MONK_DATA } from './classes/monk';
import { PALADIN_DATA } from './classes/paladin';
import { RANGER_DATA } from './classes/ranger';
import { ROGUE_DATA } from './classes/rogue';
import { SORCERER_DATA } from './classes/sorcerer';
import { WARLOCK_DATA } from './classes/warlock';
import { WIZARD_DATA } from './classes/wizard';
import { ClassName, ClassData, ClassFeature } from './classTypes';

// All class data indexed by class name
export const CLASS_DATA: Record<ClassName, ClassData> = {
  Barbarian: BARBARIAN_DATA,
  Bard: BARD_DATA,
  Cleric: CLERIC_DATA,
  Druid: DRUID_DATA,
  Fighter: FIGHTER_DATA,
  Monk: MONK_DATA,
  Paladin: PALADIN_DATA,
  Ranger: RANGER_DATA,
  Rogue: ROGUE_DATA,
  Sorcerer: SORCERER_DATA,
  Warlock: WARLOCK_DATA,
  Wizard: WIZARD_DATA
};

/**
 * Get class data by name
 */
export function getClassData(className: ClassName): ClassData {
  return CLASS_DATA[className];
}

/**
 * Get features for a specific class and level
 */
export function getFeaturesForLevel(className: ClassName, level: number): ClassFeature[] {
  return CLASS_DATA[className].features.filter(f => f.level === level);
}

/**
 * Get all features up to a specific level
 */
export function getFeaturesUpToLevel(className: ClassName, level: number): ClassFeature[] {
  return CLASS_DATA[className].features.filter(f => f.level <= level);
}

/**
 * Get spell slots for a class at a specific level
 */
export function getSpellSlots(className: ClassName, level: number): number[] | null {
  const classData = CLASS_DATA[className];
  if (!classData.spellcasting) return null;
  return classData.spellcasting.slotsPerLevel[level] || null;
}
