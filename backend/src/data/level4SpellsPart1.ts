/**
 * D&D 5e SRD Level 4 Spells - Part 1
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_4_SPELLS_PART_1: Spell[] = [
  {
    "name": "Arcane Eye",
    "level": 4,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of bat fur."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You create an invisible, magical eye within range that hovers in the air for the duration.\n\nYou mentally receive visual information from the eye, which has normal vision and darkvision out to 30 feet. The eye can look in every direction.\n\nAs an action, you can move the eye up to 30 feet in any direction. There is no limit to how far away from you the eye can move, but it can't enter another plane of existence. A solid barrier blocks the eye's movement, but the eye can pass through an opening as small as 1 inch in diameter.",
    "classes": [
      "Cleric",
      "Wizard"
]
  },
  {
    "name": "Banishment",
    "level": 4,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "An item distasteful to the target."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You attempt to send one creature that you can see within range to another plane of existence. The target must succeed on a charisma saving throw or be banished.\n\nIf the target is native to the plane of existence you're on, you banish the target to a harmless demiplane. While there, the target is incapacitated. The target remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.\n\nIf the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane. If the spell ends before 1 minute has passed, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. Otherwise, the target doesn't return.",
    "classes": [
      "Cleric",
      "Paladin",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th.",
    "savingThrow": {
      "abilityScore": "CHA",
      "successEffect": "none"
    }
  },
  {
    "name": "Black Tentacles",
    "level": 4,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A piece of tentacle from a giant octopus or a giant squid"
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in the area into difficult terrain.\n\nWhen a creature enters the affected area for the first time on a turn or starts its turn there, the creature must succeed on a Dexterity saving throw or take 3d6 bludgeoning damage and be restrained by the tentacles until the spell ends. A creature that starts its turn in the area and is already restrained by the tentacles takes 3d6 bludgeoning damage.\n\nA creature restrained by the tentacles can use its action to make a Strength or Dexterity check (its choice) against your spell save DC. On a success, it frees itself.",
    "classes": [
      "Wizard"
],
    "damageType": "Bludgeoning",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Blight",
    "level": 4,
    "school": "Necromancy",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it. The target must make a constitution saving throw. The target takes 8d8 necrotic damage on a failed save, or half as much damage on a successful one. The spell has no effect on undead or constructs.\n\nIf you target a plant creature or a magical plant, it makes the saving throw with disadvantage, and the spell deals maximum damage to it.\n\nIf you target a nonmagical plant that isn't a creature, such as a tree or shrub, it doesn't make a saving throw; it simply withers and dies.",
    "classes": [
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level of higher, the damage increases by 1d8 for each slot level above 4th.",
    "damageType": "Necrotic",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  },
  {
    "name": "Compulsion",
    "level": 4,
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
    "description": "Creatures of your choice that you can see within range and that can hear you must make a wisdom saving throw. A target automatically succeeds on this saving throw if it can't be charmed. On a failed save, a target is affected by this spell. Until the spell ends, you can use a bonus action on each of your turns to designate a direction that is horizontal to you. Each affected target must use as much of its movement as possible to move in that direction on its next turn. It can take any action before it moves. After moving in this way, it can make another Wisdom save to try to end the effect.\n\nA target isn't compelled to move into an obviously deadly hazard, such as a fire or a pit, but it will provoke opportunity attacks to move in the designated direction.",
    "classes": [
      "Bard"
],
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Confusion",
    "level": 4,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Three walnut shells."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "This spell assaults and twists creatures' minds, spawning delusions and provoking uncontrolled action. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it.\n\nAn affected target can't take reactions and must roll a d10 at the start of each of its turns to determine its behavior for that turn.\n\n| d10 | Behavior |\n\n|---|---|\n\n| 1 | The creature uses all its movement to move in a random direction. To determine the direction, roll a d8 and assign a direction to each die face. The creature doesn't take an action this turn. |\n\n| 2-6 | The creature doesn't move or take actions this turn. |\n\n| 7-8 | The creature uses its action to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the creature does nothing this turn. |\n\n| 9-10 | The creature can act and move normally. |\n\nAt the end of each of its turns, an affected target can make a Wisdom saving throw. If it succeeds, this effect ends for that target.",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 5th level or higher, the radius of the sphere increases by 5 feet for each slot level above 4th.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Conjure Minor Elementals",
    "level": 4,
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
    "description": "You summon elementals that appear in unoccupied spaces that you can see within range. You choose one the following options for what appears:\n\n- One elemental of challenge rating 2 or lower\n\n- Two elementals of challenge rating 1 or lower\n\n- Four elementals of challenge rating 1/2 or lower\n\n- Eight elementals of challenge rating 1/4 or lower.\n\nAn elemental summoned by this spell disappears when it drops to 0 hit points or when the spell ends.\n\nThe summoned creatures are friendly to you and your companions. Roll initiative for the summoned creatures as a group, which has its own turns. They obey any verbal commands that you issue to them (no action required by you). If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions.\n\nThe GM has the creatures' statistics.",
    "classes": [
      "Druid",
      "Wizard"
],
    "higherLevels": "When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot."
  },
  {
    "name": "Conjure Woodland Beings",
    "level": 4,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "One holly berry per creature summoned."
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You summon fey creatures that appear in unoccupied spaces that you can see within range. Choose one of the following options for what appears:\n\n- One fey creature of challenge rating 2 or lower\n\n- Two fey creatures of challenge rating 1 or lower\n\n- Four fey creatures of challenge rating 1/2 or lower\n\n- Eight fey creatures of challenge rating 1/4 or lower\n\nA summoned creature disappears when it drops to 0 hit points or when the spell ends.\n\nThe summoned creatures are friendly to you and your companions. Roll initiative for the summoned creatures as a group, which have their own turns. They obey any verbal commands that you issue to them (no action required by you). If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions.\n\nThe GM has the creatures' statistics.",
    "classes": [
      "Druid",
      "Ranger"
],
    "higherLevels": "When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot."
  },
  {
    "name": "Control Water",
    "level": 4,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "300 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A drop of water and a pinch of dust."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "Until the spell ends, you control any freestanding water inside an area you choose that is a cube up to 100 feet on a side. You can choose from any of the following effects when you cast this spell. As an action on your turn, you can repeat the same effect or choose a different one.\n\n***Flood.*** You cause the water level of all standing water in the area to rise by as much as 20 feet. If the area includes a shore, the flooding water spills over onto dry land.\n\nIf you choose an area in a large body of water, you instead create a 20-foot tall wave that travels from one side of the area to the other and then crashes down. Any Huge or smaller vehicles in the wave's path are carried with it to the other side. Any Huge or smaller vehicles struck by the wave have a 25 percent chance of capsizing.\n\nThe water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats on the start of your next turn while the flood effect lasts.\n\n***Part Water.*** You cause water in the area to move apart and create a trench. The trench extends across the spell's area, and the separated water forms a wall to either side. The trench remains until the spell ends or you choose a different effect. The water then slowly fills in the trench over the course of the next round until the normal water level is restored.\n\n***Redirect Flow.*** You cause flowing water in the area to move in a direction you choose, even if the water has to flow over obstacles, up walls, or in other unlikely directions. The water in the area moves as you direct it, but once it moves beyond the spell's area, it resumes its flow based on the terrain conditions. The water continues to move in the direction you chose until the spell ends or you choose a different effect.\n\n***Whirlpool.*** This effect requires a body of water at least 50 feet square and 25 feet deep. You cause a whirlpool to form in the center of the area. The whirlpool forms a vortex that is 5 feet wide at the base, up to 50 feet wide at the top, and 25 feet tall. Any creature or object in the water and within 25 feet of the vortex is pulled 10 feet toward it. A creature can swim away from the vortex by making a Strength (Athletics) check against your spell save DC.\n\nWhen a creature enters the vortex for the first time on a turn or starts its turn there, it must make a strength saving throw. On a failed save, the creature takes 2d8 bludgeoning damage and is caught in the vortex until the spell ends. On a successful save, the creature takes half damage, and isn't caught in the vortex. A creature caught in the vortex can use its action to try to swim away from the vortex as described above, but has disadvantage on the Strength (Athletics) check to do so.\n\nThe first time each turn that an object enters the vortex, the object takes 2d8 bludgeoning damage; this damage occurs each round it remains in the vortex.",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
],
    "damageType": "Bludgeoning",
    "savingThrow": {
      "abilityScore": "STR",
      "successEffect": "none"
    }
  },
  {
    "name": "Death Ward",
    "level": 4,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": false,
    "description": "You touch a creature and grant it a measure of protection from death.\n\nThe first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends.\n\nIf the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.",
    "classes": [
      "Cleric",
      "Paladin"
]
  }
];
