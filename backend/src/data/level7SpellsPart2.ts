/**
 * D&D 5e SRD Level 7 Spells - Part 2
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_7_SPELLS_PART_2: Spell[] = [
  {
    "name": "Plane Shift",
    "level": 7,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A forked, metal rod worth at least 250 gp, attuned to a particular plane of existence."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells, and you appear in or near that destination. If you are trying to reach the City of Brass, for example, you might arrive in its Street of Steel, before its Gate of Ashes, or looking at the city from across the Sea of Fire, at the GM's discretion.\n\nAlternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle.\n\nYou can use this spell to banish an unwilling creature to another plane. Choose a creature within your reach and make a melee spell attack against it. On a hit, the creature must make a charisma saving throw. If the creature fails this save, it is transported to a random location on the plane of existence you specify. A creature so transported must find its own way back to your current plane of existence.",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "CHA",
      "successEffect": "none"
    },
    "attackType": "melee"
  },
  {
    "name": "Prismatic Spray",
    "level": 7,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "Eight multicolored rays of light flash from your hand. Each ray is a different color and has a different power and purpose. Each creature in a 60-foot cone must make a dexterity saving throw. For each target, roll a d8 to determine which color ray affects it.\n\n***1. Red.*** The target takes 10d6 fire damage on a failed save, or half as much damage on a successful one.\n\n***2. Orange.*** The target takes 10d6 acid damage on a failed save, or half as much damage on a successful one.\n\n***3. Yellow.*** The target takes 10d6 lightning damage on a failed save, or half as much damage on a successful one.\n\n***4. Green.*** The target takes 10d6 poison damage on a failed save, or half as much damage on a successful one.\n\n***5. Blue.*** The target takes 10d6 cold damage on a failed save, or half as much damage on a successful one.\n\n***6. Indigo.*** On a failed save, the target is restrained. It must then make a constitution saving throw at the end of each of its turns. If it successfully saves three times, the spell ends. If it fails its save three times, it permanently turns to stone and is subjected to the petrified condition. The successes and failures don't need to be consecutive; keep track of both until the target collects three of a kind.\n\n***7. Violet.*** On a failed save, the target is blinded. It must then make a wisdom saving throw at the start of your next turn. A successful save ends the blindness. If it fails that save, the creature is transported to another plane of existence of the GM's choosing and is no longer blinded. (Typically, a creature that is on a plane that isn't its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes.)\n\n***8. Special.*** The target is struck by two rays. Roll twice more, rerolling any 8.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Project Image",
    "level": 7,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "500 miles",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small replica of you made from materials worth at least 5 gp."
    },
    "duration": "Up to 24 hours",
    "concentration": true,
    "ritual": false,
    "description": "You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you but is intangible. If the illusion takes any damage, it disappears, and the spell ends.\n\nYou can use your action to move this illusion up to twice your speed, and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly.\n\nYou can see through its eyes and hear through its ears as if you were in its space. On your turn as a bonus action, you can switch from using its senses to using your own, or back again. While you are using its senses, you are blinded and deafened in regard to your own surroundings.\n\nPhysical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature.",
    "classes": [
      "Bard",
      "Wizard"
]
  },
  {
    "name": "Regenerate",
    "level": 7,
    "school": "Transmutation",
    "castingTime": "1 minute",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A prayer wheel and holy water."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You touch a creature and stimulate its natural healing ability. The target regains 4d8 + 15 hit points. For the duration of the spell, the target regains 1 hit point at the start of each of its turns (10 hit points each minute).\n\nThe target's severed body members (fingers, legs, tails, and so on), if any, are restored after 2 minutes. If you have the severed part and hold it to the stump, the spell instantaneously causes the limb to knit to the stump.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
]
  },
  {
    "name": "Resurrection",
    "level": 7,
    "school": "Necromancy",
    "castingTime": "1 hour",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A diamond worth at least 1,000gp, which the spell consumes."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You touch a dead creature that has been dead for no more than a century, that didn't die of old age, and that isn't undead. If its soul is free and willing, the target returns to life with all its hit points.\n\nThis spell neutralizes any poisons and cures normal diseases afflicting the creature when it died. It doesn't, however, remove magical diseases, curses, and the like; if such effects aren't removed prior to casting the spell, they afflict the target on its return to life.\n\nThis spell closes all mortal wounds and restores any missing body parts.\n\nComing back from the dead is an ordeal. The target takes a -4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a long rest, the penalty is reduced by 1 until it disappears.\n\nCasting this spell to restore life to a creature that has been dead for one year or longer taxes you greatly. Until you finish a long rest, you can't cast spells again, and you have disadvantage on all attack rolls, ability checks, and saving throws.",
    "classes": [
      "Bard",
      "Cleric"
]
  },
  {
    "name": "Reverse Gravity",
    "level": 7,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "100 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A lodestone and iron filings."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "This spell reverses gravity in a 50-foot-radius, 100-foot high cylinder centered on a point within range. All creatures and objects that aren't somehow anchored to the ground in the area fall upward and reach the top of the area when you cast this spell. A creature can make a dexterity saving throw to grab onto a fixed object it can reach, thus avoiding the fall.\n\nIf some solid object (such as a ceiling) is encountered in this fall, falling objects and creatures strike it just as they would during a normal downward fall. If an object or creature reaches the top of the area without striking anything, it remains there, oscillating slightly, for the duration.\n\nAt the end of the duration, affected objects and creatures fall back down.",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Sequester",
    "level": 7,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A powder composed of diamond, emerald, ruby, and sapphire dust worth at least 5,000 gp, which the spell consumes."
    },
    "duration": "Until dispelled",
    "concentration": false,
    "ritual": false,
    "description": "By means of this spell, a willing creature or an object can be hidden away, safe from detection for the duration. When you cast the spell and touch the target, it becomes invisible and can't be targeted by divination spells or perceived through scrying sensors created by divination spells.\n\nIf the target is a creature, it falls into a state of suspended animation. Time ceases to flow for it, and it doesn't grow older.\n\nYou can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include \"after 1,000 years\" or \"when the tarrasque awakens.\" This spell also ends if the target takes any damage.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Simulacrum",
    "level": 7,
    "school": "Illusion",
    "castingTime": "12 hours",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Snow or ice in quantities sufficient to made a life-size copy of the duplicated creature; some hair, fingernail clippings, or other piece of that creature's body placed inside the snow or ice; and powdered ruby worth 1,500 gp, sprinkled over the duplicate and consumed by the spell."
    },
    "duration": "Until dispelled",
    "concentration": false,
    "ritual": false,
    "description": "You shape an illusory duplicate of one beast or humanoid that is within range for the entire casting time of the spell. The duplicate is a creature, partially real and formed from ice or snow, and it can take actions and otherwise be affected as a normal creature. It appears to be the same as the original, but it has half the creature's hit point maximum and is formed without any equipment. Otherwise, the illusion uses all the statistics of the creature it duplicates.\n\nThe simulacrum is friendly to you and creatures you designate. It obeys your spoken commands, moving and acting in accordance with your wishes and acting on your turn in combat. The simulacrum lacks the ability to learn or become more powerful, so it never increases its level or other abilities, nor can it regain expended spell slots.\n\nIf the simulacrum is damaged, you can repair it in an alchemical laboratory, using rare herbs and minerals worth 100 gp per hit point it regains. The simulacrum lasts until it drops to 0 hit points, at which point it reverts to snow and melts instantly.\n\nIf you cast this spell again, any currently active duplicates you created with this spell are instantly destroyed.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Symbol",
    "level": 7,
    "school": "Abjuration",
    "castingTime": "1 minute",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Mercury, phosphorus, and powdered diamond and opal with a total value of at least 1,000 gp, which the spell consumes."
    },
    "duration": "Until dispelled",
    "concentration": false,
    "ritual": false,
    "description": "When you cast this spell, you inscribe a harmful glyph either on a surface (such as a section of floor, a wall, or a table) or within an object that can be closed to conceal the glyph (such as a book, a scroll, or a treasure chest). If you choose a surface, the glyph can cover an area of the surface no larger than 10 feet in diameter. If you choose an object, that object must remain in its place; if the object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.\n\nThe glyph is nearly invisible, requiring an Intelligence (Investigation) check against your spell save DC to find it.\n\nYou decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, the most typical triggers include touching or stepping on the glyph, removing another object covering it, approaching within a certain distance of it, or manipulating the object that holds it. For glyphs inscribed within an object, the most common triggers are opening the object, approaching within a certain distance of it, or seeing or reading the glyph.\n\nYou can further refine the trigger so the spell is activated only under certain circumstances or according to a creature's physical characteristics (such as height or weight), or physical kind (for example, the ward could be set to affect hags or shapechangers). You can also specify creatures that don't trigger the glyph, such as those who say a certain password.\n\nWhen you inscribe the glyph, choose one of the options below for its effect. Once triggered, the glyph glows, filling a 60-foot-radius sphere with dim light for 10 minutes, after which time the spell ends. Each creature in the sphere when the glyph activates is targeted by its effect, as is a creature that enters the sphere for the first time on a turn or ends its turn there.\n\n***Death.*** Each target must make a constitution saving throw, taking 10d 10 necrotic damage on a failed save, or half as much damage on a successful save.\n\n***Discord.*** Each target must make a constitution saving throw. On a failed save, a target bickers and argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has disadvantage on attack rolls and ability checks.\n\n***Fear.*** Each target must make a wisdom saving throw and becomes frightened for 1 minute on a failed save. While frightened, the target drops whatever it is holding and must move at least 30 feet away from the glyph on each of its turns, if able.\n\n***Hopelessness.*** Each target must make a charisma saving throw. On a failed save, the target is overwhelmed with despair for 1 minute. During this time, it can't attack or target any creature with harmful abilities, spells, or other magical effects.\n\n***Insanity.*** Each target must make an intelligence saving throw. On a failed save, the target is driven insane for 1 minute. An insane creature can't take actions, can't understand what other creatures say, can't read, and speaks only in gibberish. The GM controls its movement, which is erratic.\n\n***Pain.*** Each target must make a constitution saving throw and becomes incapacitated with excruciating pain for 1 minute on a failed save.\n\n***Sleep.*** Each target must make a wisdom saving throw and falls unconscious for 10 minutes on a failed save. A creature awakens if it takes damage or if someone uses an action to shake or slap it awake.\n\n***Stunning.*** Each target must make a wisdom saving throw and becomes stunned for 1 minute on a failed save.",
    "classes": [
      "Bard",
      "Cleric",
      "Wizard"
]
  },
  {
    "name": "Teleport",
    "level": 7,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "10 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be able to fit entirely inside a 10-foot cube, and it can't be held or carried by an unwilling creature.\n\nThe destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The GM rolls d100 and consults the table.\n\n| Familiarity | Mishap | Similar Area | Off Target | On Target |\n\n|---|---|---|---|---|\n\n| Permanent circle | -- | -- | -- | 01-100 |\n\n| Associated object | -- | -- | -- | 01-100 |\n\n| Very familiar | 01-05 | 06-13 | 14-24 | 25-100 |\n\n| Seen casually | 01-33 | 34-43 | 44-53 | 54-100 |\n\n| Viewed once | 01-43 | 44-53 | 54-73 | 74-100 |\n\n| Description | 01-43 | 44-53 | 54-73 | 74-100 |\n\n| False destination | 01-50 | 51-100 | -- | -- |\n\n***Familiarity.*** \"Permanent circle\" means a permanent teleportation circle whose sigil sequence you know.\n\n\"Associated object\" means that you possess an object taken from the desired destination within the last six months, such as a book from a wizard's library, bed linen from a royal suite, or a chunk of marble from a lich's secret tomb.\n\n\"Very familiar\" is a place you have been very often, a place you have carefully studied, or a place you can see when you cast the spell.\n\n\"Seen casually\" is someplace you have seen more than once but with which you aren't very familiar.\n\n\"Viewed once\" is a place you have seen once, possibly using magic.\n\n\"Description\" is a place whose location and appearance you know through someone else's description, perhaps from a map.\n\n\"False destination\" is a place that doesn't exist. Perhaps you tried to scry an enemy's sanctum but instead viewed an illusion, or you are attempting to teleport to a familiar location that no longer exists.\n\n***On Target.*** You and your group (or the target object) appear where you want to.\n\n***Off Target.*** You and your group (or the target object) appear a random distance away from the destination in a random direction. Distance off target is 1d10 x 1d10 percent of the distance that was to be traveled. For example, if you tried to travel 120 miles, landed off target, and rolled a 5 and 3 on the two d10s, then you would be off target by 15 percent, or 18 miles. The GM determines the direction off target randomly by rolling a d8 and designating 1 as north, 2 as northeast, 3 as east, and so on around the points of the compass.  If you were teleporting to a coastal city and wound up 18 miles out at sea, you could be in trouble.\n\n***Similar Area.*** You and your group (or the target object) wind up in a different area that's visually or thematically similar to the target area. If you are heading for your home laboratory, for example, you might wind up in another wizard's laboratory or in an alchemical supply shop that has many of the same tools and implements as your laboratory. Generally, you appear in the closest similar place, but since the spell has no range limit, you could conceivably wind up anywhere on the plane.\n\n***Mishap.*** The spell's unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 force damage, and the GM rerolls on the table to see where you wind up (multiple mishaps can occur, dealing damage each time).",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
]
  }
];
