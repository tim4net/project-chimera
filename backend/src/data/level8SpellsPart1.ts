/**
 * D&D 5e SRD Level 8 Spells - Part 1
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 12 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_8_SPELLS_PART_1: Spell[] = [
  {
    "name": "Animal Shapes",
    "level": 8,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 24 hours",
    "concentration": true,
    "ritual": false,
    "description": "Your magic turns others into beasts. Choose any number of willing creatures that you can see within range. You transform each target into the form of a Large or smaller beast with a challenge rating of 4 or lower. On subsequent turns, you can use your action to transform affected creatures into new forms.\n\nThe transformation lasts for the duration for each target, or until the target drops to 0 hit points or dies. You can choose a different form for each target. A target's game statistics are replaced by the statistics of the chosen beast, though the target retains its alignment and Intelligence, Wisdom, and Charisma scores. The target assumes the hit points of its new form, and when it reverts to its normal form, it returns to the number of hit points it had before it transformed. If it reverts as a result of dropping to 0 hit points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 hit points, it isn't knocked unconscious. The creature is limited in the actions it can perform by the nature of its new form, and it can't speak or cast spells.\n\nThe target's gear melds into the new form. The target can't activate, wield, or otherwise benefit from any of its equipment.",
    "classes": [
      "Druid"
]
  },
  {
    "name": "Antimagic Field",
    "level": 8,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of powdered iron or iron filings."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can't be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you.\n\nSpells and other magical effects, except those created by an artifact or a deity, are suppressed in the sphere and can't protrude into it. A slot expended to cast a suppressed spell is consumed. While an effect is suppressed, it doesn't function, but the time it spends suppressed counts against its duration.\n\n***Targeted Effects.*** Spells and other magical effects, such as magic missile and charm person, that target a creature or an object in the sphere have no effect on that target.\n\n***Areas of Magic.*** The area of another spell or magical effect, such as fireball, can't extend into the sphere. If the sphere overlaps an area of magic, the part of the area that is covered by the sphere is suppressed. For example, the flames created by a wall of fire are suppressed within the sphere, creating a gap in the wall if the overlap is large enough.\n\n***Spells.*** Any active spell or other magical effect on a creature or an object in the sphere is suppressed while the creature or object is in it.\n\n***Magic Items.*** The properties and powers of magic items are suppressed in the sphere. For example, a +1 longsword in the sphere functions as a nonmagical longsword.\n\nA magic weapon's properties and powers are suppressed if it is used against a target in the sphere or wielded by an attacker in the sphere. If a magic weapon or a piece of magic ammunition fully leaves the sphere (for example, if you fire a magic arrow or throw a magic spear at a target outside the sphere), the magic of the item ceases to be suppressed as soon as it exits.\n\n***Magical Travel.*** Teleportation and planar travel fail to work in the sphere, whether the sphere is the destination or the departure point for such magical travel. A portal to another location, world, or plane of existence, as well as an opening to an extradimensional space such as that created by the rope trick spell, temporarily closes while in the sphere.\n\n***Creatures and Objects.*** A creature or object summoned or created by magic temporarily winks out of existence in the sphere. Such a creature instantly reappears once the space the creature occupied is no longer within the sphere.\n\n***Dispel Magic.*** Spells and magical effects such as dispel magic have no effect on the sphere. Likewise, the spheres created by different antimagic field spells don't nullify each other.",
    "classes": [
      "Cleric",
      "Wizard"
]
  },
  {
    "name": "Antipathy/Sympathy",
    "level": 8,
    "school": "Enchantment",
    "castingTime": "1 hour",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Either a lump of alum soaked in vinegar for the antipathy effect or a drop of honey for the sympathy effect."
    },
    "duration": "10 days",
    "concentration": false,
    "ritual": false,
    "description": "This spell attracts or repels creatures of your choice. You target something within range, either a Huge or smaller object or creature or an area that is no larger than a 200-foot cube. Then specify a kind of intelligent creature, such as red dragons, goblins, or vampires. You invest the target with an aura that either attracts or repels the specified creatures for the duration. Choose antipathy or sympathy as the aura's effect.\n\n***Antipathy.*** The enchantment causes creatures of the kind you designated to feel an intense urge to leave the area and avoid the target. When such a creature can see the target or comes within 60 feet of it, the creature must succeed on a wisdom saving throw or become frightened. The creature remains frightened while it can see the target or is within 60 feet of it. While frightened by the target, the creature must use its movement to move to the nearest safe spot from which it can't see the target. If the creature moves more than 60 feet from the target and can't see it, the creature is no longer frightened, but the creature becomes frightened again if it regains sight of the target or moves within 60 feet of it.\n\n***Sympathy.*** The enchantment causes the specified creatures to feel an intense urge to approach the target while within 60 feet of it or able to see it. When such a creature can see the target or comes within 60 feet of it, the creature must succeed on a wisdom saving throw or use its movement on each of its turns to enter the area or move within reach of the target. When the creature has done so, it can't willingly move away from the target.\n\nIf the target damages or otherwise harms an affected creature, the affected creature can make a wisdom saving throw to end the effect, as described below.\n\n***Ending the Effect.*** If an affected creature ends its turn while not within 60 feet of the target or able to see it, the creature makes a wisdom saving throw. On a successful save, the creature is no longer affected by the target and recognizes the feeling of repugnance or attraction as magical. In addition, a creature affected by the spell is allowed another wisdom saving throw every 24 hours while the spell persists.\n\nA creature that successfully saves against this effect is immune to it for 1 minute, after which time it can be affected again.",
    "classes": [
      "Druid",
      "Wizard"
]
  },
  {
    "name": "Clone",
    "level": 8,
    "school": "Necromancy",
    "castingTime": "1 hour",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A diamond worth at least 1,000 gp and at least 1 cubic inch of flesh of the creature that is to be cloned, which the spell consumes, and a vessel worth at least 2,000 gp that has a sealable lid and is large enough to hold a Medium creature, such as a huge urn, coffin, mud-filled cyst in the ground, or crystal container filled with salt water."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "This spell grows an inert duplicate of a living creature as a safeguard against death. This clone forms inside a sealed vessel and grows to full size and maturity after 120 days; you can also choose to have the clone be a younger version of the same creature. It remains inert and endures indefinitely, as long as its vessel remains undisturbed.\n\nAt any time after the clone matures, if the original creature dies, its soul transfers to the clone, provided that the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original's equipment. The original creature's physical remains, if they still exist, become inert and can't thereafter be restored to life, since the creature's soul is elsewhere.",
    "classes": [
      "Wizard"
]
  },
  {
    "name": "Control Weather",
    "level": 8,
    "school": "Transmutation",
    "castingTime": "10 minutes",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Burning incense and bits of earth and wood mixed in water."
    },
    "duration": "Up to 8 hours",
    "concentration": true,
    "ritual": false,
    "description": "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell. Moving to a place where you don't have a clear path to the sky ends the spell early.\n\nWhen you cast the spell, you change the current weather conditions, which are determined by the GM based on the climate and season. You can change precipitation, temperature, and wind. It takes 1d4 x 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal.\n\nWhen you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction.\n\n##### Precipitation\n\n| Stage | Condition |\n\n|---|---|\n\n| 1 | Clear |\n\n| 2 | Light clouds |\n\n| 3 | Overcast or ground fog |\n\n| 4 | Rain, hail, or snow |\n\n| 5 | Torrential rain, driving hail, or blizzard |\n\n##### Temperature\n\n| Stage | Condition |\n\n|---|---|\n\n| 1 | Unbearable heat |\n\n| 2 | Hot |\n\n| 3 | Warm |\n\n| 4 | Cool |\n\n| 5 | Cold |\n\n| 6 | Arctic cold |\n\n##### Wind\n\n| Stage | Condition |\n\n|---|---|\n\n| 1 | Calm |\n\n| 2 | Moderate wind |\n\n| 3 | Strong wind |\n\n| 4 | Gale |\n\n| 5 | Storm |",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
]
  },
  {
    "name": "Demiplane",
    "level": 8,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": false,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You create a shadowy door on a flat solid surface that you can see within range. The door is large enough to allow Medium creatures to pass through unhindered. When opened, the door leads to a demiplane that appears to be an empty room 30 feet in each dimension, made of wood or stone. When the spell ends, the door disappears, and any creatures or objects inside the demiplane remain trapped there, as the door also disappears from the other side.\n\nEach time you cast this spell, you can create a new demiplane, or have the shadowy door connect to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can have the shadowy door connect to its demiplane instead.",
    "classes": [
      "Warlock",
      "Wizard"
]
  },
  {
    "name": "Dominate Monster",
    "level": 8,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You attempt to beguile a creature that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.\n\nWhile the creature is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as \"Attack that creature,\" \"Run over there,\" or \"Fetch that object.\" If the creature completes the order and doesn't receive further direction from you, it defends and preserves itself to the best of its ability.\n\nYou can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a reaction, but this requires you to use your own reaction as well.\n\nEach time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell with a 9th-level spell slot, the duration is concentration, up to 8 hours.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Earthquake",
    "level": 8,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "500 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of dirt, a piece of rock, and a lump of clay."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You create a seismic disturbance at a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point and shakes creatures and structures in contact with the ground in that area.\n\nThe ground in the area becomes difficult terrain. Each creature on the ground that is concentrating must make a constitution saving throw. On a failed save, the creature's concentration is broken.\n\nWhen you cast this spell and at the end of each turn you spend concentrating on it, each creature on the ground in the area must make a dexterity saving throw. On a failed save, the creature is knocked prone.\n\nThis spell can have additional effects depending on the terrain in the area, as determined by the GM.\n\nFissures. Fissures open throughout the spell's area at the start of your next turn after you cast the spell. A total of 1d6 such fissures open in locations chosen by the GM. Each is 1d10 x 10 feet deep, 10 feet wide, and extends from one edge of the spell's area to the opposite side. A creature standing on a spot where a fissure opens must succeed on a dexterity saving throw or fall in. A creature that successfully saves moves with the fissure's edge as it opens.\n\nA fissure that opens beneath a structure causes it to automatically collapse (see below).\n\nStructures. The tremor deals 50 bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the start of each of your turns until the spell ends. If a structure drops to 0 hit points, it collapses and potentially damages nearby creatures. A creature within half the distance of a structure's height must make a dexterity saving throw. On a failed save, the creature takes 5d6 bludgeoning damage, is knocked prone, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. The GM can adjust the DC higher or lower, depending on the nature of the rubble. On a successful save, the creature takes half as much damage and doesn't fall prone or become buried.",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer"
]
  },
  {
    "name": "Feeblemind",
    "level": 8,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "150 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A handful of clay, crystal, glass, or mineral spheres."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality. The target takes 4d6 psychic damage and must make an intelligence saving throw.\n\nOn a failed save, the creature's Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way. The creature can, however, identify its friends, follow them, and even protect them.\n\nAt the end of every 30 days, the creature can repeat its saving throw against this spell. If it succeeds on its saving throw, the spell ends.\n\nThe spell can also be ended by greater restoration, heal, or wish.",
    "classes": [
      "Bard",
      "Druid",
      "Warlock",
      "Wizard"
],
    "damageType": "Psychic",
    "savingThrow": {
      "abilityScore": "INT",
      "successEffect": "none"
    }
  },
  {
    "name": "Glibness",
    "level": 8,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful.",
    "classes": [
      "Bard",
      "Warlock"
]
  },
  {
    "name": "Holy Aura",
    "level": 8,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A tiny reliquary worth at least 1,000gp containing a sacred relic, such as a scrap of cloth from a saint's robe or a piece of parchment from a religious text."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell shed dim light in a 5-foot radius and have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them until the spell ends. In addition, when a fiend or an undead hits an affected creature with a melee attack, the aura flashes with brilliant light. The attacker must succeed on a constitution saving throw or be blinded until the spell ends.",
    "classes": [
      "Cleric"
]
  },
  {
    "name": "Incendiary Cloud",
    "level": 8,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "150 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "A swirling cloud of smoke shot through with white-hot embers appears in a 20-foot-radius sphere centered on a point within range. The cloud spreads around corners and is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it.\n\nWhen the cloud appears, each creature in it must make a dexterity saving throw. A creature takes 10d8 fire damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there.\n\nThe cloud moves 10 feet directly away from you in a direction that you choose at the start of each of your turns.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "damageType": "Fire",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  }
];
