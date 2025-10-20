/**
 * D&D 5e SRD Spells Database
 * Imported from https://www.dnd5eapi.co/api/spells
 *
 * Total: 319 spells
 * - Cantrips: 24 spells
 * - Level 1: 49 spells
 * - Level 2: 54 spells
 * - Level 3: 42 spells
 * - Level 4: 31 spells
 * - Level 5: 37 spells
 * - Level 6: 31 spells
 * - Level 7: 20 spells
 * - Level 8: 16 spells
 * - Level 9: 15 spells
 */

export * from './spellTypes';
export { CANTRIPS } from './cantrips';
export { LEVEL_1_SPELLS } from './level1Spells';
export { LEVEL_2_SPELLS } from './level2Spells';
export { LEVEL_3_SPELLS } from './level3Spells';
export { LEVEL_4_SPELLS } from './level4Spells';
export { LEVEL_5_SPELLS } from './level5Spells';
export { LEVEL_6_SPELLS } from './level6Spells';
export { LEVEL_7_SPELLS } from './level7Spells';
export { LEVEL_8_SPELLS } from './level8Spells';
export { LEVEL_9_SPELLS } from './level9Spells';

import { CANTRIPS } from './cantrips';
import { LEVEL_1_SPELLS } from './level1Spells';
import { LEVEL_2_SPELLS } from './level2Spells';
import { LEVEL_3_SPELLS } from './level3Spells';
import { LEVEL_4_SPELLS } from './level4Spells';
import { LEVEL_5_SPELLS } from './level5Spells';
import { LEVEL_6_SPELLS } from './level6Spells';
import { LEVEL_7_SPELLS } from './level7Spells';
import { LEVEL_8_SPELLS } from './level8Spells';
import { LEVEL_9_SPELLS } from './level9Spells';
import type { Spell } from './spellTypes';

/**
 * All spells organized by level
 */
export const SPELLS_BY_LEVEL: Record<number, Spell[]> = {
  0: CANTRIPS,
  1: LEVEL_1_SPELLS,
  2: LEVEL_2_SPELLS,
  3: LEVEL_3_SPELLS,
  4: LEVEL_4_SPELLS,
  5: LEVEL_5_SPELLS,
  6: LEVEL_6_SPELLS,
  7: LEVEL_7_SPELLS,
  8: LEVEL_8_SPELLS,
  9: LEVEL_9_SPELLS,
};

/**
 * All spells in a flat array
 */
export const ALL_SPELLS: Spell[] = [
  ...CANTRIPS,
  ...LEVEL_1_SPELLS,
  ...LEVEL_2_SPELLS,
  ...LEVEL_3_SPELLS,
  ...LEVEL_4_SPELLS,
  ...LEVEL_5_SPELLS,
  ...LEVEL_6_SPELLS,
  ...LEVEL_7_SPELLS,
  ...LEVEL_8_SPELLS,
  ...LEVEL_9_SPELLS,
];

/**
 * Get spells available to a specific class
 */
export function getSpellsForClass(className: string, maxLevel: number = 9): Spell[] {
  return ALL_SPELLS.filter(
    spell => spell.level <= maxLevel && spell.classes.includes(className)
  );
}

/**
 * Get a spell by name
 */
export function getSpellByName(name: string): Spell | undefined {
  return ALL_SPELLS.find(spell => spell.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get spells by school of magic
 */
export function getSpellsBySchool(school: string): Spell[] {
  return ALL_SPELLS.filter(spell => spell.school === school);
}

/**
 * Get ritual spells
 */
export function getRitualSpells(): Spell[] {
  return ALL_SPELLS.filter(spell => spell.ritual);
}

/**
 * Get concentration spells
 */
export function getConcentrationSpells(): Spell[] {
  return ALL_SPELLS.filter(spell => spell.concentration);
}
