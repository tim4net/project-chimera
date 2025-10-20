/**
 * D&D 5e SRD Level 5 Spells - Part 1
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_5_SPELLS_PART_1: Spell[] = [
  {
    "name": "Animate Objects",
    "level": 5,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried. Medium targets count as two objects, Large targets count as four objects, Huge targets count as eight objects. You can't animate any object larger than Huge. Each target animates and becomes a creature under your control until the spell ends or until reduced to 0 hit points.\n\nAs a bonus action, you can mentally command any creature you made with this spell if the creature is within 500 feet of you (if you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.\n\n##### Animated Object Statistics\n\n| Size | HP | AC | Attack | Str | Dex |\n\n|---|---|---|---|---|---|\n\n| Tiny | 20 | 18 | +8 to hit, 1d4 + 4 damage | 4 | 18 |\n\n| Small | 25 | 16 | +6 to hit, 1d8 + 2 damage | 6 | 14 |\n\n| Medium | 40 | 13 | +5 to hit, 2d6 + 1 damage | 10 | 12 |\n\n| Large | 50 | 10 | +6 to hit, 2d10 + 2 damage | 14 | 10 |\n\n| Huge | 80 | 10 | +8 to hit, 2d12 + 4 damage | 18 | 6 |\n\nAn animated object is a construct with AC, hit points, attacks, Strength, and Dexterity determined by its size. Its Constitution is 10 and its Intelligence and Wisdom are 3, and its Charisma is 1. Its speed is 30 feet; if the object lacks legs or other appendages it can use for locomotion, it instead has a flying speed of 30 feet and can hover. If the object is securely attached to a surface or a larger object, such as a chain bolted to a wall, its speed is 0. It has blindsight with a radius of 30 feet and is blind beyond that distance. When the animated object drops to 0 hit points, it reverts to its original object form, and any remaining damage carries over to its original object form.\n\nIf you command an object to attack, it can make a single melee attack against a creature within 5 feet of it. It makes a slam attack with an attack bonus and bludgeoning damage determined by its size. The GM might rule that a specific object inflicts slashing or piercing damage based on its form.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "If you cast this spell using a spell slot of 6th level or higher, you can animate two additional objects for each slot level above 5th."
  },
  {
    "name": "Antilife Shell",
    "level": 5,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "A shimmering barrier extends out from you in a 10-foot radius and moves with you, remaining centered on you and hedging out creatures other than undead and constructs. The barrier lasts for the duration.\n\nThe barrier prevents an affected creature from passing or reaching through. An affected creature can cast spells or make attacks with ranged or reach weapons through the barrier.\n\nIf you move so that an affected creature is forced to pass through the barrier, the spell ends.",
    "classes": [
      "Druid"
]
  },
  {
    "name": "Arcane Hand",
    "level": 5,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "An eggshell and a snakeskin glove."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You create a Large hand of shimmering, translucent force in an unoccupied space that you can see within range. The hand lasts for the spell's duration, and it moves at your command, mimicking the movements of your own hand.\n\nThe hand is an object that has AC 20 and hit points equal to your hit point maximum. If it drops to 0 hit points, the spell ends. It has a Strength of 26 (+8) and a Dexterity of 10 (+0). The hand doesn't fill its space.\n\nWhen you cast the spell and as a bonus action on your subsequent turns, you can move the hand up to 60 feet and then cause one of the following effects with it.\n\n***Clenched Fist.*** The hand strikes one creature or object within 5 feet of it. Make a melee spell attack for the hand using your game statistics. On a hit, the target takes 4d8 force damage.\n\n***Forceful Hand.*** The hand attempts to push a creature within 5 feet of it in a direction you choose. Make a check with the hand's Strength contested by the Strength (Athletics) check of the target. If the target is Medium or smaller, you have advantage on the check. If you succeed, the hand pushes the target up to 5 feet plus a number of feet equal to five times your spellcasting ability modifier. The hand moves with the target to remain within 5 feet of it.\n\n***Grasping Hand.*** The hand attempts to grapple a Huge or smaller creature within 5 feet of it. You use the hand's Strength score to resolve the grapple. If the target is Medium or smaller, you have advantage on the check. While the hand is grappling the target, you can use a bonus action to have the hand crush it. When you do so, the target takes bludgeoning damage equal to 2d6 + your spellcasting ability modifier.\n\n***Interposing Hand.*** The hand interposes itself between you and a creature you choose until you give the hand a different command. The hand moves to stay between you and the target, providing you with half cover against the target. The target can't move through the hand's space if its Strength score is less than or equal to the hand's Strength score. If its Strength score is higher than the hand's Strength score, the target can move toward you through the hand's space, but that space is difficult terrain for the target.",
    "classes": [
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the damage from the clenched fist option increases by 2d8 and the damage from the grasping hand increases by 2d6 for each slot level above 5th."
  },
  {
    "name": "Awaken",
    "level": 5,
    "school": "Transmutation",
    "castingTime": "8 hours",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "An agate worth at least 1,000 gp, which the spell consumes."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller beast or plant. The target must have either no Intelligence score or an Intelligence of 3 or less. The target gains an Intelligence of 10. The target also gains the ability to speak one language you know. If the target is a plant, it gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human's. Your GM chooses statistics appropriate for the awakened plant, such as the statistics for the awakened shrub or the awakened tree.\n\nThe awakened beast or plant is charmed by you for 30 days or until you or your companions do anything harmful to it. When the charmed condition ends, the awakened creature chooses whether to remain friendly to you, based on how you treated it while it was charmed.",
    "classes": [
      "Bard",
      "Druid"
]
  },
  {
    "name": "Cloudkill",
    "level": 5,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range. The fog spreads around corners. It lasts for the duration or until strong wind disperses the fog, ending the spell. Its area is heavily obscured.\n\nWhen a creature enters the spell's area for the first time on a turn or starts its turn there, that creature must make a constitution saving throw. The creature takes 5d8 poison damage on a failed save, or half as much damage on a successful one. Creatures are affected even if they hold their breath or don't need to breathe.\n\nThe fog moves 10 feet away from you at the start of each of your turns, rolling along the surface of the ground. The vapors, being heavier than air, sink to the lowest level of the land, even pouring down openings.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.",
    "damageType": "Poison",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  },
  {
    "name": "Commune",
    "level": 5,
    "school": "Divination",
    "castingTime": "1 minute",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Incense and a vial of holy or unholy water."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": true,
    "description": "You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question.\n\nDivine beings aren't necessarily omniscient, so you might receive \"unclear\" as an answer if a question pertains to information that lies beyond the deity's knowledge. In a case where a one-word answer could be misleading or contrary to the deity's interests, the GM might offer a short phrase as an answer instead.\n\nIf you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer. The GM makes this roll in secret.",
    "classes": [
      "Cleric"
]
  },
  {
    "name": "Commune With Nature",
    "level": 5,
    "school": "Divination",
    "castingTime": "1 minute",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": true,
    "description": "You briefly become one with nature and gain knowledge of the surrounding territory. In the outdoors, the spell gives you knowledge of the land within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn't function where nature has been replaced by construction, such as in dungeons and towns.\n\nYou instantly gain knowledge of up to three facts of your choice about any of the following subjects as they relate to the area:\n\n- terrain and bodies of water\n\n- prevalent plants, minerals, animals, or peoples\n\n- powerful celestials, fey, fiends, elementals, or undead\n\n- influence from other planes of existence\n\n- buildings\n\nFor example, you could determine the location of powerful undead in the area, the location of major sources of safe drinking water, and the location of any nearby towns.",
    "classes": [
      "Druid",
      "Ranger"
]
  },
  {
    "name": "Cone of Cold",
    "level": 5,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small crystal or glass cone."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one.\n\nA creature killed by this spell becomes a frozen statue until it thaws.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.",
    "damageType": "Cold",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  },
  {
    "name": "Conjure Elemental",
    "level": 5,
    "school": "Conjuration",
    "castingTime": "1 minute",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Burning incense for air, soft clay for earth, sulfur and phosphorus for fire, or water and sand for water."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within range. An elemental of challenge rating 5 or lower appropriate to the area you chose appears in an unoccupied space within 10 feet of it. For example, a fire elemental emerges from a bonfire, and an earth elemental rises up from the ground. The elemental disappears when it drops to 0 hit points or when the spell ends.\n\nThe elemental is friendly to you and your companions for the duration. Roll initiative for the elemental, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you). If you don't issue any commands to the elemental, it defends itself from hostile creatures but otherwise takes no actions.\n\nIf your concentration is broken, the elemental doesn't disappear. Instead, you lose control of the elemental, it becomes hostile toward you and your companions, and it might attack. An uncontrolled elemental can't be dismissed by you, and it disappears 1 hour after you summoned it.\n\nThe GM has the elemental's statistics.",
    "classes": [
      "Druid",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the challenge rating increases by 1 for each slot level above 5th."
  },
  {
    "name": "Contact Other Plane",
    "level": 5,
    "school": "Divination",
    "castingTime": "1 minute",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": true,
    "description": "You mentally contact a demigod, the spirit of a long-dead sage, or some other mysterious entity from another plane. Contacting this extraplanar intelligence can strain or even break your mind. When you cast this spell, make a DC 15 intelligence saving throw. On a failure, you take 6d6 psychic damage and are insane until you finish a long rest. While insane, you can't take actions, can't understand what other creatures say, can't read, and speak only in gibberish. A greater restoration spell cast on you ends this effect.\n\nOn a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The GM answers each question with one word, such as \"yes,\" \"no,\" \"maybe,\" \"never,\" \"irrelevant,\" or \"unclear\" (if the entity doesn't know the answer to the question). If a one-word answer would be misleading, the GM might instead offer a short phrase as an answer.",
    "classes": [
      "Warlock",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "INT",
      "successEffect": "none"
    }
  }
];
