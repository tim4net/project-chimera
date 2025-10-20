/**
 * D&D 5e SRD Level 4 Spells - Part 2
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_4_SPELLS_PART_2: Spell[] = [
  {
    "name": "Dimension Door",
    "level": 4,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "500 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as \"200 feet straight downward\" or \"upward to the northwest at a 45-degree angle, 300 feet.\"\n\nYou can bring along objects as long as their weight doesn't exceed what you can carry. You can also bring one willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be within 5 feet of you when you cast this spell.\n\nIf you would arrive in a place already occupied by an object or a creature, you and any creature traveling with you each take 4d6 force damage, and the spell fails to teleport you.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "damageType": "Force"
  },
  {
    "name": "Divination",
    "level": 4,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Incense and a sacrificial offering appropriate to your religion, together worth at least 25gp, which the spell consumes."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": true,
    "description": "Your magic and an offering put you in contact with a god or a god's servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply. The reply might be a short phrase, a cryptic rhyme, or an omen.\n\nThe spell doesn't take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion.\n\nIf you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The GM makes this roll in secret.",
    "classes": [
      "Druid"
]
  },
  {
    "name": "Dominate Beast",
    "level": 4,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You attempt to beguile a creature that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.\n\nWhile the creature is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as \"Attack that creature,\" \"Run over there,\" or \"Fetch that object.\" If the creature completes the order and doesn't receive further direction from you, it defends and preserves itself to the best of its ability.\n\nYou can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a reaction, but this requires you to use your own reaction as well. Each time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends.",
    "classes": [
      "Druid",
      "Sorcerer"
],
    "higherLevels": "When you cast this spell with a 9th level spell slot, the duration is concentration, up to 8 hours.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Fabricate",
    "level": 4,
    "school": "Transmutation",
    "castingTime": "10 minutes",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, and clothes from flax or wool.\n\nChoose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot cube, or eight connected 5-foot cubes), given a sufficient quantity of raw material. If you are working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a single 5-foot cube). The quality of objects made by the spell is commensurate with the quality of the raw materials.\n\nCreatures or magic items can't be created or transmuted by this spell. You also can't use it to create items that ordinarily require a high degree of craftsmanship, such as jewelry, weapons, glass, or armor, unless you have proficiency with the type of artisan's tools used to craft such objects.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Faithful Hound",
    "level": 4,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A tiny silver whistle, a piece of bone, and a thread"
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": false,
    "description": "You conjure a phantom watchdog in an unoccupied space that you can see within range, where it remains for the duration, until you dismiss it as an action, or until you move more than 100 feet away from it.\n\nThe hound is invisible to all creatures except you and can't be harmed. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound sees invisible creatures and can see into the Ethereal Plane. It ignores illusions.\n\nAt the start of each of your turns, the hound attempts to bite one creature within 5 feet of it that is hostile to you. The hound's attack bonus is equal to your spellcasting ability modifier + your proficiency bonus. On a hit, it deals 4d8 piercing damage.",
    "classes": [
      "Wizard"
],
    "damageType": "Piercing",
    "attackType": "melee"
  },
  {
    "name": "Fire Shield",
    "level": 4,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A little phosphorus or a firefly."
    },
    "duration": "10 minutes",
    "concentration": false,
    "ritual": false,
    "description": "Thin and vaporous flame surround your body for the duration of the spell, radiating a bright light bright light in a 10-foot radius and dim light for an additional 10 feet. You can end the spell using an action to make it disappear.\n\nThe flames are around you a heat shield or cold, your choice. The heat shield gives you cold damage resistance and the cold resistance to fire damage.\n\nIn addition, whenever a creature within 5 feet of you hits you with a melee attack, flames spring from the shield. The attacker then suffers 2d8 points of fire damage or cold, depending on the model.",
    "classes": [
      "Wizard"
],
    "damageType": "Fire"
  },
  {
    "name": "Freedom of Movement",
    "level": 4,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A leather strap, bound around the arm or a similar appendage."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You touch a willing creature. For the duration, the target's movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target's speed nor cause the target to be paralyzed or restrained.\n\nThe target can also spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature that has it grappled. Finally, being underwater imposes no penalties on the target's movement or attacks.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Ranger"
]
  },
  {
    "name": "Giant Insect",
    "level": 4,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You transform up to ten centipedes, three spiders, five wasps, or one scorpion within range into giant versions of their natural forms for the duration. A centipede becomes a giant centipede, a spider becomes a giant spider, a wasp becomes a giant wasp, and a scorpion becomes a giant scorpion.\n\nEach creature obeys your verbal commands, and in combat, they act on your turn each round. The GM has the statistics for these creatures and resolves their actions and movement.\n\nA creature remains in its giant size for the duration, until it drops to 0 hit points, or until you use an action to dismiss the effect on it.\n\nThe GM might allow you to choose different targets. For example, if you transform a bee, its giant version might have the same statistics as a giant wasp.",
    "classes": [
      "Druid"
]
  },
  {
    "name": "Greater Invisibility",
    "level": 4,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
]
  },
  {
    "name": "Guardian of Faith",
    "level": 4,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": false,
    "description": "A Large spectral guardian appears and hovers for the duration in an unoccupied space of your choice that you can see within range. The guardian occupies that space and is indistinct except for a gleaming sword and shield emblazoned with the symbol of your deity.\n\nAny creature hostile to you that moves to a space within 10 feet of the guardian for the first time on a turn must succeed on a dexterity saving throw. The creature takes 20 radiant damage on a failed save, or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage.",
    "classes": [
      "Cleric"
],
    "damageType": "Radiant",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  }
];
