/**
 * D&D 5e SRD Level 5 Spells
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 37 spells
 */

import type { Spell } from './spellTypes';
import { LEVEL_5_SPELLS_PART_1 } from './level5SpellsPart1';
import { LEVEL_5_SPELLS_PART_2 } from './level5SpellsPart2';
import { LEVEL_5_SPELLS_PART_3 } from './level5SpellsPart3';
import { LEVEL_5_SPELLS_PART_4 } from './level5SpellsPart4';

export const LEVEL_5_SPELLS: Spell[] = [
  ...LEVEL_5_SPELLS_PART_1,
  ...LEVEL_5_SPELLS_PART_2,
  ...LEVEL_5_SPELLS_PART_3,
  ...LEVEL_5_SPELLS_PART_4
];
