/**
 * D&D 5e SRD Level 5 Spells - Part 3
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_5_SPELLS_PART_3: Spell[] = [
  {
    "name": "Insect Plague",
    "level": 5,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "300 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A few grains of sugar, some kernels of grain, and a smear of fat."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range. The sphere spreads around corners. The sphere remains for the duration, and its area is lightly obscured. The sphere's area is difficult terrain.\n\nWhen the area appears, each creature in it must make a constitution saving throw. A creature takes 4d10 piercing damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there.",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d10 for each slot level above 5th.",
    "damageType": "Piercing",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  },
  {
    "name": "Legend Lore",
    "level": 5,
    "school": "Divination",
    "castingTime": "10 minutes",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Incense worth at least 250 gp, which the spell consumes, and four ivory strips worth at least 50 gp each."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "Name or describe a person, place, or object. The spell brings to your mind a brief summary of the significant lore about the thing you named. The lore might consist of current tales, forgotten stories, or even secret lore that has never been widely known. If the thing you named isn't of legendary importance, you gain no information. The more information you already have about the thing, the more precise and detailed the information you receive is.\n\nThe information you learn is accurate but might be couched in figurative language. For example, if you have a mysterious magic axe on hand the spell might yield this information: \"Woe to the evildoer whose hand touches the axe, for even the haft slices the hand of the evil ones. Only a true Child of Stone, lover and beloved of Moradin, may awaken the true powers of the axe, and only with the sacred word *Rudnogg* on the lips.\"",
    "classes": [
      "Bard",
      "Cleric",
      "Wizard"
]
  },
  {
    "name": "Mass Cure Wounds",
    "level": 5,
    "school": "Conjuration",
    "castingTime": "1 action",
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
    "description": "A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th."
  },
  {
    "name": "Mislead",
    "level": 5,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": false,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You become invisible at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends if you attack or cast a spell.\n\nYou can use your action to move your illusory double up to twice your speed and make it gesture, speak, and behave in whatever way you choose.\n\nYou can see through its eyes and hear through its ears as if you were located where it is. On each of your turns as a bonus action, you can switch from using its senses to using your own, or back again. While you are using its senses, you are blinded and deafened in regard to your own surroundings.",
    "classes": [
      "Bard",
      "Wizard"
]
  },
  {
    "name": "Modify Memory",
    "level": 5,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You attempt to reshape another creature's memories. One creature that you can see must make a wisdom saving throw. If you are fighting the creature, it has advantage on the saving throw. On a failed save, the target becomes charmed by you for the duration. The charmed target is incapacitated and unaware of its surroundings, though it can still hear you. If it takes any damage or is targeted by another spell, this spell ends, and none of the target's memories are modified.\n\nWhile this charm lasts, you can affect the target's memory of an event that it experienced within the last 24 hours and that lasted no more than 10 minutes. You can permanently eliminate all memory of the event, allow the target to recall the event with perfect clarity and exacting detail, change its memory of the details of the event, or create a memory of some other event.\n\nYou must speak to the target to describe how its memories are affected, and it must be able to understand your language for the modified memories to take root. Its mind fills in any gaps in the details of your description. If the spell ends before you have finished describing the modified memories, the creature's memory isn't altered. Otherwise, the modified memories take hold when the spell ends.\n\nA modified memory doesn't necessarily affect how a creature behaves, particularly if the memory contradicts the creature's natural inclinations, alignment, or beliefs. An illogical modified memory, such as implanting a memory of how much the creature enjoyed dousing itself in acid, is dismissed, perhaps as a bad dream. The GM might deem a modified memory too nonsensical to affect a creature in a significant manner.\n\nA remove curse or greater restoration spell cast on the target restores the creature's true memory.",
    "classes": [
      "Bard",
      "Wizard"
],
    "higherLevels": "If you cast this spell using a spell slot of 6th level or higher, you can alter the target's memories of an event that took place up to 7 days ago (6th level), 30 days ago (7th level), 1 year ago (8th level), or any time in the creature's past (9th level).",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Passwall",
    "level": 5,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of sesame seeds."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "A passage appears at a point of your choice that you can see on a wooden, plaster, or stone surface (such as a wall, a ceiling, or a floor) within range, and lasts for the duration. You choose the opening's dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it.\n\nWhen the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Planar Binding",
    "level": 5,
    "school": "Abjuration",
    "castingTime": "1 hour",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A jewel worth at least 1,000 gp, which the spell consumes."
    },
    "duration": "24 hours",
    "concentration": false,
    "ritual": false,
    "description": "With this spell, you attempt to bind a celestial, an elemental, a fey, or a fiend to your service. The creature must be within range for the entire casting of the spell. (Typically, the creature is first summoned into the center of an inverted magic circle in order to keep it trapped while this spell is cast.) At the completion of the casting, the target must make a charisma saving throw. On a failed save, it is bound to serve you for the duration. If the creature was summoned or created by another spell, that spell's duration is extended to match the duration of this spell.\n\nA bound creature must follow your instructions to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. The creature obeys the letter of your instructions, but if the creature is hostile to you, it strives to twist your words to achieve its own objectives. If the creature carries out your instructions completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane of existence, it returns to the place where you bound it and remains there until the spell ends.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of a higher level, the duration increases to 10 days with a 6th-level slot, to 30 days with a 7th-level slot, to 180 days with an 8th-level slot, and to a year and a day with a 9th-level spell slot.",
    "savingThrow": {
      "abilityScore": "CHA",
      "successEffect": "none"
    }
  },
  {
    "name": "Raise Dead",
    "level": 5,
    "school": "Necromancy",
    "castingTime": "1 hour",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A diamond worth at least 500gp, which the spell consumes."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature's soul is both willing and at liberty to rejoin the body, the creature returns to life with 1 hit point.\n\nThis spell also neutralizes any poisons and cures nonmagical diseases that affected the creature at the time it died. This spell doesn't, however, remove magical diseases, curses, or similar effects; if these aren't first removed prior to casting the spell, they take effect when the creature returns to life. The spell can't return an undead creature to life.\n\nThis spell closes all mortal wounds, but it doesn't restore missing body parts. If the creature is lacking body parts or organs integral for its survival--its head, for instance--the spell automatically fails.\n\nComing back from the dead is an ordeal. The target takes a -4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a long rest, the penalty is reduced by 1 until it disappears.",
    "classes": [
      "Bard",
      "Cleric",
      "Paladin"
]
  },
  {
    "name": "Reincarnate",
    "level": 5,
    "school": "Transmutation",
    "castingTime": "1 hour",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Rare oils and unguents worth at least 1,000 gp, which the spell consumes."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You touch a dead humanoid or a piece of a dead humanoid. Provided that the creature has been dead no longer than 10 days, the spell forms a new adult body for it and then calls the soul to enter that body. If the target's soul isn't free or willing to do so, the spell fails.\n\nThe magic fashions a new body for the creature to inhabit, which likely causes the creature's race to change. The GM rolls a d 100 and consults the following table to determine what form the creature takes when restored to life, or the GM chooses a form.\n\n| d100 | Race |\n\n|---|---|\n\n| 01-04 | Dragonborn |\n\n| 05-13 | Dwarf, hill |\n\n| 14-21 | Dwarf, mountain |\n\n| 22-25 | Elf, dark |\n\n| 26-34 | Elf, high |\n\n| 35-42 | Elf, wood |\n\n| 43-46 | Gnome, forest |\n\n| 47-52 | Gnome, rock |\n\n| 53-56 | Half-elf |\n\n| 57-60 | Half-orc |\n\n| 61-68 | Halfling, lightfoot |\n\n| 69-76 | Halfling, stout |\n\n| 77-96 | Human |\n\n| 97-00 | Tiefling |\n\nThe reincarnated creature recalls its former life and experiences. It retains the capabilities it had in its original form, except it exchanges its original race for the new one and changes its racial traits accordingly.",
    "classes": [
      "Druid"
]
  },
  {
    "name": "Scrying",
    "level": 5,
    "school": "Divination",
    "castingTime": "10 minutes",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A focus worth at least 1,000 gp, such as a crystal ball, a silver mirror, or a font filled with holy water."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You can see and hear a particular creature you choose that is on the same plane of existence as you. The target must make a wisdom saving throw, which is modified by how well you know the target and the sort of physical connection you have to it. If a target knows you're casting this spell, it can fail the saving throw voluntarily if it wants to be observed.\n\n| Knowledge | Save Modifier |\n\n|---|---|\n\n| Secondhand (you have heard of the target) | +5 |\n\n| Firsthand (you have met the target) | +0 |\n\n| Familiar (you know the target well) | -5 |\n\n\n\n| Connection | Save Modifier |\n\n|---|---|\n\n| Likeness or picture | -2 |\n\n| Possession or garment | -4 |\n\n| Body part, lock of hair, bit of nail, or the like | -10 |\n\nOn a successful save, the target isn't affected, and you can't use this spell against it again for 24 hours.\n\nOn a failed save, the spell creates an invisible sensor within 10 feet of the target. You can see and hear through the sensor as if you were there. The sensor moves with the target, remaining within 10 feet of it for the duration. A creature that can see invisible objects sees the sensor as a luminous orb about the size of your fist.\n\nInstead of targeting a creature, you can choose a location you have seen before as the target of this spell. When you do, the sensor appears at that location and doesn't move.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Warlock",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  }
];
