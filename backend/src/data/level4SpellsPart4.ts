/**
 * D&D 5e SRD Level 4 Spells - Part 4
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 1 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_4_SPELLS_PART_4: Spell[] = [
  {
    "name": "Wall of Fire",
    "level": 4,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small piece of phosphorus."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration.\n\nWhen the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 5d8 fire damage, or half as much damage on a successful save.\n\nOne side of the wall, selected by you when you cast this spell, deals 5d8 fire damage to each creature that ends its turn within 10 feet o f that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage.\n\nThe other side of the wall deals no damage.",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th.",
    "damageType": "Fire",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  }
];
