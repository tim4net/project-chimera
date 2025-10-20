/**
 * D&D 5e SRD Level 4 Spells - Part 3
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_4_SPELLS_PART_3: Spell[] = [
  {
    "name": "Hallucinatory Terrain",
    "level": 4,
    "school": "Illusion",
    "castingTime": "10 minutes",
    "range": "300 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A stone, a twig, and a bit of green plant."
    },
    "duration": "24 hours",
    "concentration": false,
    "ritual": false,
    "description": "You make natural terrain in a 150-foot cube in range look, sound, and smell like some other sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren't changed in appearance.\n\nThe tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to see through the illusion. If the difference isn't obvious by touch, a creature carefully examining the illusion can attempt an Intelligence (Investigation) check against your spell save DC to disbelieve it. A creature who discerns the illusion for what it is, sees it as a vague image superimposed on the terrain.",
    "classes": [
      "Bard",
      "Druid",
      "Warlock",
      "Wizard"
]
  },
  {
    "name": "Ice Storm",
    "level": 4,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "300 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of dust and a few drops of water."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range. Each creature in the cylinder must make a dexterity saving throw. A creature takes 2d8 bludgeoning damage and 4d6 cold damage on a failed save, or half as much damage on a successful one.\n\nHailstones turn the storm's area of effect into difficult terrain until the end of your next turn.",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level or higher, the bludgeoning damage increases by 1d8 for each slot level above 4th.",
    "damageType": "Bludgeoning",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Locate Creature",
    "level": 4,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of fur from a bloodhound."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "Describe or name a creature that is familiar to you. You sense the direction to the creature's location, as long as that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement.\n\nThe spell can locate a specific creature known to you, or the nearest creature of a specific kind (such as a human or a unicorn), so long as you have seen such a creature up close--within 30 feet--at least once. If the creature you described or named is in a different form, such as being under the effects of a polymorph spell, this spell doesn't locate the creature.\n\nThis spell can't locate a creature if running water at least 10 feet wide blocks a direct path between you and the creature.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Wizard"
]
  },
  {
    "name": "Phantasmal Killer",
    "level": 4,
    "school": "Illusion",
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
    "description": "You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature. The target must make a wisdom saving throw. On a failed save, the target becomes frightened for the duration. At the start of each of the target's turns before the spell ends, the target must succeed on a wisdom saving throw or take 4d10 psychic damage. On a successful save, the spell ends.",
    "classes": [
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th.",
    "damageType": "Psychic",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Polymorph",
    "level": 4,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A caterpillar cocoon."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a wisdom saving throw to avoid the effect. A shapechanger automatically succeeds on this saving throw.\n\nThe transformation lasts for the duration, or until the target drops to 0 hit points or dies. The new form can be any beast whose challenge rating is equal to or less than the target's (or the target's level, if it doesn't have a challenge rating). The target's game statistics, including mental ability scores, are replaced by the statistics of the chosen beast. It retains its alignment and personality.\n\nThe target assumes the hit points of its new form. When it reverts to its normal form, the creature returns to the number of hit points it had before it transformed. If it reverts as a result of dropping to 0 hit points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 hit points, it isn't knocked unconscious.\n\nThe creature is limited in the actions it can perform by the nature of its new form, and it can't speak, cast spells, or take any other action that requires hands or speech.\n\nThe target's gear melds into the new form. The creature can't activate, use, wield, or otherwise benefit from any of its equipment.",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Private Sanctum",
    "level": 4,
    "school": "Abjuration",
    "castingTime": "10 minutes",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A thin sheet of lead, a piece of opaque glass, a wad of cotton or cloth, and powdered chrysolite."
    },
    "duration": "24 hours",
    "concentration": false,
    "ritual": false,
    "description": "You make an area within range magically secure. The area is a cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration or until you use an action to dismiss it.\n\nWhen you cast the spell, you decide what sort of security the spell provides, choosing any or all of the following properties:\n\n- Sound can't pass through the barrier at the edge of the warded area.\n\n- The barrier of the warded area appears dark and foggy, preventing vision (including darkvision) through it.\n\n- Sensors created by divination spells can't appear inside the protected area or pass through the barrier at its perimeter.\n\n- Creatures in the area can't be targeted by divination spells.\n\n- Nothing can teleport into or out of the warded area.\n\n- Planar travel is blocked within the warded area.\n\nCasting this spell on the same spot every day for a year makes this effect permanent.",
    "classes": [
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level or higher, you can increase the size of the cube by 100 feet for each slot level beyond 4th. Thus you could protect a cube that can be up to 200 feet on one side by using a spell slot of 5th level."
  },
  {
    "name": "Resilient Sphere",
    "level": 4,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A hemispherical piece of clear crystal and a matching hemispherical piece of gum arabic."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "A sphere of shimmering force encloses a creature or object of Large size or smaller within range. An unwilling creature must make a dexterity saving throw. On a failed save, the creature is enclosed for the duration.\n\nNothing--not physical objects, energy, or other spell effects--can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can't be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it.\n\nThe sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can use its action to push against the sphere's walls and thus roll the sphere at up to half the creature's speed. Similarly, the globe can be picked up and moved by other creatures.\n\nA disintegrate spell targeting the globe destroys it without harming anything inside it.",
    "classes": [
      "Wizard"
],
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Secret Chest",
    "level": 4,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "An exquisite chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth at least 5,000 gp, and a Tiny replica made from the same materials worth at least 50 gp."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You hide a chest, and all its contents, on the Ethereal Plane. You must touch the chest and the miniature replica that serves as a material component for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet).\n\nWhile the chest remains on the Ethereal Plane, you can use an action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by using an action and touching both the chest and the replica.\n\nAfter 60 days, there is a cumulative 5 percent chance per day that the spell's effect ends. This effect ends if you cast this spell again, if the smaller replica chest is destroyed, or if you choose to end the spell as an action. If the spell ends and the larger chest is on the Ethereal Plane, it is irretrievably lost.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Stone Shape",
    "level": 4,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Soft clay, to be crudely worked into the desired shape for the stone object."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape that suits your purpose. So, for example, you could shape a large rock into a weapon, idol, or coffer, or make a small passage through a wall, as long as the wall is less than 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn't possible.",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
]
  },
  {
    "name": "Stoneskin",
    "level": 4,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Diamond dust worth 100 gp, which the spell consumes."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.",
    "classes": [
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
]
  }
];
