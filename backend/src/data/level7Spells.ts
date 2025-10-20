/**
 * D&D 5e SRD Level 7 Spells
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 20 spells
 */

import type { Spell } from './spellTypes';
import { LEVEL_7_SPELLS_PART_1 } from './level7SpellsPart1';
import { LEVEL_7_SPELLS_PART_2 } from './level7SpellsPart2';

export const LEVEL_7_SPELLS: Spell[] = [
  ...LEVEL_7_SPELLS_PART_1,
  ...LEVEL_7_SPELLS_PART_2
];
