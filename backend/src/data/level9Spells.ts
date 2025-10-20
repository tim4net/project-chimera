/**
 * D&D 5e SRD Level 9 Spells
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 15 spells
 */

import type { Spell } from './spellTypes';
import { LEVEL_9_SPELLS_PART_1 } from './level9SpellsPart1';
import { LEVEL_9_SPELLS_PART_2 } from './level9SpellsPart2';

export const LEVEL_9_SPELLS: Spell[] = [
  ...LEVEL_9_SPELLS_PART_1,
  ...LEVEL_9_SPELLS_PART_2
];
