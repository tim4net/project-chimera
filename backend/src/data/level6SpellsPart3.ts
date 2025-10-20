/**
 * D&D 5e SRD Level 6 Spells - Part 3
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_6_SPELLS_PART_3: Spell[] = [
  {
    "name": "Mass Suggestion",
    "level": 6,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": true,
      "materialComponents": "A snake's tongue and either a bit of honeycomb or a drop of sweet oil."
    },
    "duration": "24 hours",
    "concentration": false,
    "ritual": false,
    "description": "You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can't be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. Asking the creature to stab itself, throw itself onto a spear, immolate itself, or do some other obviously harmful act automatically negates the effect of the spell.\n\nEach target must make a wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity can be completed in a shorter time, the spell ends when the subject finishes what it was asked to do.\n\nYou can also specify conditions that will trigger a special activity during the duration. For example, you might suggest that a group of soldiers give all their money to the first beggar they meet. If the condition isn't met before the spell ends, the activity isn't performed.\n\nIf you or any of your companions damage a creature affected by this spell, the spell ends for that creature.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a 7th-level spell slot, the duration is 10 days. When you use an 8th-level spell slot, the duration is 30 days. When you use a 9th-level spell slot, the duration is a year and a day.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Move Earth",
    "level": 6,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "An iron blade and a small bag containing a mixture of soils--clay, loam, and sand."
    },
    "duration": "Up to 2 hours",
    "concentration": true,
    "ritual": false,
    "description": "Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area's elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can't exceed half the area's largest dimension. So, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square's elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete.\n\nAt the end of every 10 minutes you spend concentrating on the spell, you can choose a new area of terrain to affect.\n\nBecause the terrain's transformation occurs slowly, creatures in the area can't usually be trapped or injured by the ground's movement.\n\nThis spell can't manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse.\n\nSimilarly, this spell doesn't directly affect plant growth. The moved earth carries any plants along with it.",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
]
  },
  {
    "name": "Planar Ally",
    "level": 6,
    "school": "Conjuration",
    "castingTime": "10 minutes",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You beseech an otherworldly entity for aid. The being must be known to you: a god, a primordial, a demon prince, or some other being of cosmic power. That entity sends a celestial, an elemental, or a fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature's name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (GM's choice).\n\nWhen the creature appears, it is under no compulsion to behave in any particular way. You can ask the creature to perform a service in exchange for payment, but it isn't obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services.\n\nPayment can take a variety of forms. A celestial might require a sizable donation of gold or magic items to an allied temple, while a fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you.\n\nAs a rule of thumb, a task that can be measured in minutes requires a payment worth 100 gp per minute. A task measured in hours requires 1,000 gp per hour. And a task measured in days (up to 10 days) requires 10,000 gp per day. The GM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature's ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal.\n\nAfter the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you, if appropriate to the task and if possible. If you are unable to agree on a price for the creature's service, the creature immediately returns to its home plane.\n\nA creature enlisted to join your group counts as a member of it, receiving a full share of experience points awarded.",
    "classes": [
      "Cleric"
]
  },
  {
    "name": "Programmed Illusion",
    "level": 6,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of fleece and jade dust worth at least 25 gp."
    },
    "duration": "Until dispelled",
    "concentration": false,
    "ritual": false,
    "description": "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific condition occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes.\n\nWhen the condition you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes. After this time, the illusion can be activated again.\n\nThe triggering condition can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door, or you could set the illusion to trigger only when a creature says the correct word or phrase.\n\nPhysical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature.",
    "classes": [
      "Bard",
      "Wizard"
]
  },
  {
    "name": "Sunbeam",
    "level": 6,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A magnifying glass."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line. Each creature in the line must make a constitution saving throw. On a failed save, a creature takes 6d8 radiant damage and is blinded until your next turn. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes have disadvantage on this saving throw.\n\nYou can create a new line of radiance as your action on any turn until the spell ends.\n\nFor the duration, a mote of brilliant radiance shines in your hand. It sheds bright light in a 30-foot radius and dim light for an additional 30 feet. This light is sunlight.",
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
  },
  {
    "name": "Transport via Plants",
    "level": 6,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "10 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 round",
    "concentration": false,
    "ritual": false,
    "description": "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement.",
    "classes": [
      "Druid"
]
  },
  {
    "name": "True Seeing",
    "level": 6,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "An ointment for the eyes that costs 25gp; is made from mushroom powder, saffron, and fat; and is consumed by the spell."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "This spell gives the willing creature you touch the ability to see things as they actually are. For the duration, the creature has truesight, notices secret doors hidden by magic, and can see into the Ethereal Plane, all out to a range of 120 feet.",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Warlock",
      "Wizard"
]
  },
  {
    "name": "Wall of Ice",
    "level": 6,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small piece of quartz."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration.\n\nIf the wall cuts through a creature's space when it appears, the creature within its area is pushed to one side of the wall and must make a dexterity saving throw. On a failed save, the creature takes 10d6 cold damage, or half as much damage on a successful save.\n\nThe wall is an object that can be damaged and thus breached. It has AC 12 and 30 hit points per 10-foot section, and it is vulnerable to fire damage. Reducing a 10-foot section of wall to 0 hit points destroys it and leaves behind a sheet of frigid air in the space the wall occupied. A creature moving through the sheet of frigid air for the first time on a turn must make a constitution saving throw. That creature takes 5d6 cold damage on a failed save, or half as much damage on a successful one.",
    "classes": [
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th level or higher, the damage the wall deals when it appears increases by 2d6, and the damage from passing through the sheet of frigid air increases by 1d6, for each slot level above 6th.",
    "damageType": "Cold",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Wall of Thorns",
    "level": 6,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A handful of thorns."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight.\n\nWhen the wall appears, each creature within its area must make a dexterity saving throw. On a failed save, a creature takes 7d8 piercing damage, or half as much damage on a successful save.\n\nA creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters the wall on a turn or ends its turn there, the creature must make a dexterity saving throw. It takes 7d8 slashing damage on a failed save, or half as much damage on a successful one.",
    "classes": [
      "Druid"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th level or higher, both types of damage increase by 1d8 for each slot level above 6th.",
    "damageType": "Piercing",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Wind Walk",
    "level": 6,
    "school": "Transmutation",
    "castingTime": "1 minute",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Fire and holy water."
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": false,
    "description": "You and up to ten willing creatures you can see within range assume a gaseous form for the duration, appearing as wisps of cloud. While in this cloud form, a creature has a flying speed of 300 feet and has resistance to damage from nonmagical weapons. The only actions a creature can take in this form are the Dash action or to revert to its normal form. Reverting takes 1 minute, during which time a creature is incapacitated and can't move. Until the spell ends, a creature can revert to cloud form, which also requires the 1-minute transformation.\n\nIf a creature is in cloud form and flying when the effect ends, the creature descends 60 feet per round for 1 minute until it lands, which it does safely. If it can't land after 1 minute, the creature falls the remaining distance.",
    "classes": [
      "Druid"
]
  }
];
