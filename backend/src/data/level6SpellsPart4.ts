/**
 * D&D 5e SRD Level 6 Spells - Part 4
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 1 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_6_SPELLS_PART_4: Spell[] = [
  {
    "name": "Word of Recall",
    "level": 6,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "5 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect.\n\nYou must designate a sanctuary by casting this spell within a location, such as a temple, dedicated to or strongly linked to your deity. If you attempt to cast the spell in this manner in an area that isn't dedicated to your deity, the spell has no effect.",
    "classes": [
      "Cleric"
]
  }
];
