/**
 * D&D 5e SRD Level 8 Spells
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 16 spells
 */

import type { Spell } from './spellTypes';
import { LEVEL_8_SPELLS_PART_1 } from './level8SpellsPart1';
import { LEVEL_8_SPELLS_PART_2 } from './level8SpellsPart2';

export const LEVEL_8_SPELLS: Spell[] = [
  ...LEVEL_8_SPELLS_PART_1,
  ...LEVEL_8_SPELLS_PART_2
];
