/**
 * D&D 5e SRD Level 4 Spells
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 31 spells
 */

import type { Spell } from './spellTypes';
import { LEVEL_4_SPELLS_PART_1 } from './level4SpellsPart1';
import { LEVEL_4_SPELLS_PART_2 } from './level4SpellsPart2';
import { LEVEL_4_SPELLS_PART_3 } from './level4SpellsPart3';
import { LEVEL_4_SPELLS_PART_4 } from './level4SpellsPart4';

export const LEVEL_4_SPELLS: Spell[] = [
  ...LEVEL_4_SPELLS_PART_1,
  ...LEVEL_4_SPELLS_PART_2,
  ...LEVEL_4_SPELLS_PART_3,
  ...LEVEL_4_SPELLS_PART_4
];
