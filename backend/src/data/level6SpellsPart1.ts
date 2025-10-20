/**
 * D&D 5e SRD Level 6 Spells - Part 1
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_6_SPELLS_PART_1: Spell[] = [
  {
    "name": "Blade Barrier",
    "level": 6,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration. You can make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides three-quarters cover to creatures behind it, and its space is difficult terrain.\n\nWhen a creature enters the wall's area for the first time on a turn or starts its turn there, the creature must make a dexterity saving throw. On a failed save, the creature takes 6d10 slashing damage. On a successful save, the creature takes half as much damage.",
    "classes": [
      "Cleric"
],
    "damageType": "Slashing",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Chain Lightning",
    "level": 6,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "150 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of fur; a piece of amber, glass, or a crystal rod; and three silver pins."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts.\n\nA target must make a dexterity saving throw. The target takes 10d8 lightning damage on a failed save, or half as much damage on a successful one.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from the first target to another target for each slot level above 6th.",
    "damageType": "Lightning",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Circle of Death",
    "level": 6,
    "school": "Necromancy",
    "castingTime": "1 action",
    "range": "150 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "The powder of a crushed black pearl worth at least 500 gp."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A sphere of negative energy ripples out in a 60-foot radius sphere from a point within range. Each creature in that area must make a constitution saving throw. A target takes 8d6 necrotic damage on a failed save, or half as much damage on a successful one.",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th level or higher, the damage increases by 2d6 for each slot level above 6th.",
    "damageType": "Necrotic",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  },
  {
    "name": "Conjure Fey",
    "level": 6,
    "school": "Conjuration",
    "castingTime": "1 minute",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You summon a fey creature of challenge rating 6 or lower, or a fey spirit that takes the form of a beast of challenge rating 6 or lower. It appears in an unoccupied space that you can see within range. The fey creature disappears when it drops to 0 hit points or when the spell ends.\n\nThe fey creature is friendly to you and your companions for the duration. Roll initiative for the creature, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you), as long as they don't violate its alignment. If you don't issue any commands to the fey creature, it defends itself from hostile creatures but otherwise takes no actions.\n\nIf your concentration is broken, the fey creature doesn't disappear. Instead, you lose control of the fey creature, it becomes hostile toward you and your companions, and it might attack. An uncontrolled fey creature can't be dismissed by you, and it disappears 1 hour after you summoned it.\n\nThe GM has the fey creature's statistics.",
    "classes": [
      "Druid",
      "Warlock"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th level or higher, the challenge rating increases by 1 for each slot level above 6th."
  },
  {
    "name": "Contingency",
    "level": 6,
    "school": "Evocation",
    "castingTime": "10 minutes",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A statuette of yourself carved from ivory and decorated with gems worth at least 1,500 gp."
    },
    "duration": "10 days",
    "concentration": false,
    "ritual": false,
    "description": "Choose a spell of 5th level or lower that you can cast, that has a casting time of 1 action, and that can target you. You cast that spell--called the contingent spell--as part of casting contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain circumstance occurs. You describe that circumstance when you cast the two spells. For example, a contingency cast with water breathing might stipulate that water breathing comes into effect when you are engulfed in water or a similar liquid.\n\nThe contingent spell takes effect immediately after the circumstance is met for the first time, whether or not you want it to. and then contingency ends.\n\nThe contingent spell takes effect only on you, even if it can normally target others. You can use only one contingency spell at a time. If you cast this spell again, the effect of another contingency spell on you ends. Also, contingency ends on you if its material component is ever not on your person.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Create Undead",
    "level": 6,
    "school": "Necromancy",
    "castingTime": "1 minute",
    "range": "10 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "One clay pot filled with grave dirt, one clay pot filled with brackish water, and one 150 gp black onyx stone for each corpse."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You can cast this spell only at night. Choose up to three corpses of Medium or Small humanoids within range. Each corpse becomes a ghoul under your control. (The GM has game statistics for these creatures.)\n\nAs a bonus action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.\n\nThe creature is under your control for 24 hours, after which it stops obeying any command you have given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell, rather than animating new ones.",
    "classes": [
      "Cleric",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a 7th-level spell slot, you can animate or reassert control over four ghouls. When you cast this spell using an 8th-level spell slot, you can animate or reassert control over five ghouls or two ghasts or wights. When you cast this spell using a 9th-level spell slot, you can animate or reassert control over six ghouls, three ghasts or wights, or two mummies."
  },
  {
    "name": "Disintegrate",
    "level": 6,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A lodestone and a pinch of dust."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force.\n\nA creature targeted by this spell must make a dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. If this damage reduces the target to 0 hit points, it is disintegrated.\n\nA disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust. The creature can be restored to life only by means of a true resurrection or a wish spell.\n\nThis spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If the target is a Huge or larger object or creation of force, this spell disintegrates a 10-foot-cube portion of it. A magic item is unaffected by this spell.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th.",
    "damageType": "Force",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Eyebite",
    "level": 6,
    "school": "Necromancy",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "For the spell's duration, your eyes become an inky void imbued with dread power. One creature of your choice within 60 feet of you that you can see must succeed on a wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can use your action to target another creature but can't target a creature again if it has succeeded on a saving throw against this casting of eyebite.\n\n***Asleep.*** The target falls unconscious. It wakes up if it takes any damage or if another creature uses its action to shake the sleeper awake.\n\n***Panicked.*** The target is frightened of you. On each of its turns, the frightened creature must take the Dash action and move away from you by the safest and shortest available route, unless there is nowhere to move. If the target moves to a place at least 60 feet away from you where it can no longer see you, this effect ends.\n\n***Sickened.*** The target has disadvantage on attack rolls and ability checks. At the end of each of its turns, it can make another wisdom saving throw. If it succeeds, the effect ends.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Find the Path",
    "level": 6,
    "school": "Divination",
    "castingTime": "1 minute",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A set of divinatory tools--such as bones, ivory sticks, cards, teeth, or carved runes--worth 100gp and an object from the location you wish to find."
    },
    "duration": "Up to 24 hours",
    "concentration": true,
    "ritual": false,
    "description": "This spell allows you to find the shortest, most direct physical route to a specific fixed location that you are familiar with on the same plane of existence. If you name a destination on another plane of existence, a destination that moves (such as a mobile fortress), or a destination that isn't specific (such as \"a green dragon's lair\"), the spell fails.\n\nFor the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. While you are traveling there, whenever you are presented with a choice of paths along the way, you automatically determine which path is the shortest and most direct route (but not necessarily the safest route) to the destination.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
]
  },
  {
    "name": "Flesh to Stone",
    "level": 6,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of lime, water, and earth."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You attempt to turn one creature that you can see within range into stone. If the target's body is made of flesh, the creature must make a constitution saving throw. On a failed save, it is restrained as its flesh begins to harden. On a successful save, the creature isn't affected.\n\nA creature restrained by this spell must make another constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and subjected to the petrified condition for the duration. The successes and failures don't need to be consecutive; keep track of both until the target collects three of a kind.\n\nIf the creature is physically broken while petrified, it suffers from similar deformities if it reverts to its original state.\n\nIf you maintain your concentration on this spell for the entire possible duration, the creature is turned to stone until the effect is removed.",
    "classes": [
      "Warlock",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  }
];
