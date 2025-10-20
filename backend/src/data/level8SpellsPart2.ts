/**
 * D&D 5e SRD Level 8 Spells - Part 2
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 4 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_8_SPELLS_PART_2: Spell[] = [
  {
    "name": "Maze",
    "level": 8,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze.\n\nThe target can use its action to attempt to escape. When it does so, it makes a DC 20 Intelligence check. If it succeeds, it escapes, and the spell ends (a minotaur or goristro demon automatically succeeds).\n\nWhen the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Mind Blank",
    "level": 8,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "24 hours",
    "concentration": false,
    "ritual": false,
    "description": "Until the spell ends, one willing creature you touch is immune to psychic damage, any effect that would sense its emotions or read its thoughts, divination spells, and the charmed condition. The spell even foils wish spells and spells or effects of similar power used to affect the target's mind or to gain information about the target.",
    "classes": [
      "Bard",
      "Wizard"
]
  },
  {
    "name": "Power Word Stun",
    "level": 8,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned. Otherwise, the spell has no effect.\n\nThe stunned target must make a constitution saving throw at the end of each of its turns. On a successful save, this stunning effect ends.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
]
  },
  {
    "name": "Sunburst",
    "level": 8,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "150 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Fire and a piece of sunstone."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a constitution saving throw. On a failed save, a creature takes 12d6 radiant damage and is blinded for 1 minute. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes have disadvantage on this saving throw.\n\nA creature blinded by this spell makes another constitution saving throw at the end of each of its turns. On a successful save, it is no longer blinded.\n\nThis spell dispels any darkness in its area that was created by a spell.",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
],
    "damageType": "Radiant",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  }
];
