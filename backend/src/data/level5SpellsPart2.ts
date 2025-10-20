/**
 * D&D 5e SRD Level 5 Spells - Part 2
 * Imported from https://www.dnd5eapi.co/api/spells
 * Contains 10 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_5_SPELLS_PART_2: Spell[] = [
  {
    "name": "Contagion",
    "level": 5,
    "school": "Necromancy",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "7 days",
    "concentration": false,
    "ritual": false,
    "description": "Your touch inflicts disease. Make a melee spell attack against a creature within your reach. On a hit, you afflict the creature with a disease of your choice from any of the ones described below.\n\nAt the end of each of the target's turns, it must make a constitution saving throw. After failing three of these saving throws, the disease's effects last for the duration, and the creature stops making these saves. After succeeding on three of these saving throws, the creature recovers from the disease, and the spell ends.\n\nSince this spell induces a natural disease in its target, any effect that removes a disease or otherwise ameliorates a disease's effects apply to it.\n\n***Blinding Sickness.*** Pain grips the creature's mind, and its eyes turn milky white. The creature has disadvantage on wisdom checks and wisdom saving throws and is blinded.\n\n***Filth Fever.*** A raging fever sweeps through the creature's body. The creature has disadvantage on strength checks, strength saving throws, and attack rolls that use Strength.\n\n***Flesh Rot.*** The creature's flesh decays. The creature has disadvantage on Charisma checks and vulnerability to all damage.\n\n***Mindfire.*** The creature's mind becomes feverish. The creature has disadvantage on intelligence checks and intelligence saving throws, and the creature behaves as if under the effects of the confusion spell during combat.\n\n***Seizure.*** The creature is overcome with shaking. The creature has disadvantage on dexterity checks, dexterity saving throws, and attack rolls that use Dexterity.\n\n***Slimy Doom.*** The creature begins to bleed uncontrollably. The creature has disadvantage on constitution checks and constitution saving throws. In addition, whenever the creature takes damage, it is stunned until the end of its next turn.",
    "classes": [
      "Cleric",
      "Druid"
],
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    },
    "attackType": "melee"
  },
  {
    "name": "Creation",
    "level": 5,
    "school": "Illusion",
    "castingTime": "1 minute",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A tiny piece of matter of the same type of the item you plan to create."
    },
    "duration": "Special",
    "concentration": false,
    "ritual": false,
    "description": "You pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter within range: soft goods, rope, wood, or something similar. You can also use this spell to create mineral objects such as stone, crystal, or metal. The object created must be no larger than a 5-foot cube, and the object must be of a form and material that you have seen before.\n\nThe duration depends on the object's material. If the object is composed of multiple materials, use the shortest duration.\n\n| Material | Duration |\n\n|---|---|\n\n| Vegetable matter | 1 day |\n\n| Stone or crystal | 12 hours |\n\n| Precious metals | 1 hour |\n\n| Gems | 10 minutes |\n\n| Adamantine or mithral | 1 minute |\n\nUsing any material created by this spell as another spell's material component causes that spell to fail.",
    "classes": [
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the cube increases by 5 feet for each slot level above 5th."
  },
  {
    "name": "Dispel Evil and Good",
    "level": 5,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Holy water or powdered silver and iron."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Shimmering energy surrounds and protects you from fey, undead, and creatures originating from beyond the Material Plane. For the duration, celestials, elementals, fey, fiends, and undead have disadvantage on attack rolls against you.\n\nYou can end the spell early by using either of the following special functions.\n\n***Break Enchantment.*** As your action, you touch a creature you can reach that is charmed, frightened, or possessed by a celestial, an elemental, a fey, a fiend, or an undead. The creature you touch is no longer charmed, frightened, or possessed by such creatures.\n\n***Dismissal.*** As your action, make a melee spell attack against a celestial, an elemental, a fey, a fiend, or an undead you can reach. On a hit, you attempt to drive the creature back to its home plane. The creature must succeed on a charisma saving throw or be sent back to its home plane (if it isn't there already). If they aren't on their home plane, undead are sent to the Shadowfell, and fey are sent to the Feywild.",
    "classes": [
      "Cleric",
      "Paladin"
],
    "savingThrow": {
      "abilityScore": "CHA",
      "successEffect": "none"
    }
  },
  {
    "name": "Dominate Person",
    "level": 5,
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
    "description": "You attempt to beguile a humanoid that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.\n\nWhile the target is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as \"Attack that creature,\" \"Run over there,\" or \"Fetch that object.\" If the creature completes the order and doesn't receive further direction from you, it defends and preserves itself to the best of its ability.\n\nYou can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time you can also cause the creature to use a reaction, but this requires you to use your own reaction as well.\n\nEach time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a 6th-level spell slot, the duration is concentration, up to 10 minutes. When you use a 7th-level spell slot, the duration is concentration, up to 1 hour. When you use a spell slot of 8th level or higher, the duration is concentration, up to 8 hours.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Dream",
    "level": 5,
    "school": "Illusion",
    "castingTime": "1 minute",
    "range": "Special",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A handful of sand, a dab of ink, and a writing quill plucked from a sleeping bird."
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": false,
    "description": "This spell shapes a creature's dreams. Choose a creature known to you as the target of this spell. The target must be on the same plane of existence as you. Creatures that don't sleep, such as elves, can't be contacted by this spell. You, or a willing creature you touch, enters a trance state, acting as a messenger.\n\nWhile in the trance, the messenger is aware of his or her surroundings, but can't take actions or move.\n\nIf the target is asleep, the messenger appears in the target's dreams and can converse with the target as long as it remains asleep, through the duration of the spell. The messenger can also shape the environment of the dream, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the effect of the spell early. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it, and can either end the trance (and the spell) or wait for the target to fall asleep, at which point the messenger appears in the target's dreams.\n\nYou can make the messenger appear monstrous and terrifying to the target. If you do, the messenger can deliver a message of no more than ten words and then the target must make a wisdom saving throw. On a failed save, echoes of the phantasmal monstrosity spawn a nightmare that lasts the duration of the target's sleep and prevents the target from gaining any benefit from that rest. In addition, when the target wakes up, it takes 3d6 psychic damage.\n\nIf you have a body part, lock of hair, clipping from a nail, or similar portion of the target's body, the target makes its saving throw with disadvantage.",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
],
    "damageType": "Psychic",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Flame Strike",
    "level": 5,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Pinch of sulfur."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A vertical column of divine fire roars down from the heavens in a location you specify. Each creature in a 10-foot-radius, 40-foot-high cylinder centered on a point within range must make a dexterity saving throw. A creature takes 4d6 fire damage and 4d6 radiant damage on a failed save, or half as much damage on a successful one.",
    "classes": [
      "Cleric"
],
    "higherLevels": "When you cast this spell using a spell slot of 6th level or higher, the fire damage or the radiant damage (your choice) increases by 1d6 for each slot level above 5th.",
    "damageType": "Fire",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Geas",
    "level": 5,
    "school": "Enchantment",
    "castingTime": "1 minute",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "30 days",
    "concentration": false,
    "ritual": false,
    "description": "You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide. If the creature can understand you, it must succeed on a wisdom saving throw or become charmed by you for the duration. While the creature is charmed by you, it takes 5d10 psychic damage each time it acts in a manner directly counter to your instructions, but no more than once each day. A creature that can't understand you is unaffected by the spell.\n\nYou can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends.\n\nYou can end the spell early by using an action to dismiss it. A remove curse, greater restoration, or wish spell also ends it.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a spell slot of 7th or 8th level, the duration is 1 year. When you cast this spell using a spell slot of 9th level, the spell lasts until it is ended by one of the spells mentioned above.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Greater Restoration",
    "level": 5,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Diamond dust worth at least 100gp, which the spell consumes."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's exhaustion level by one, or end one of the following effects on the target:\n\n- One effect that charmed or petrified the target\n\n- One curse, including the target's attunement to a cursed magic item\n\n- Any reduction to one of the target's ability scores\n\n- One effect reducing the target's hit point maximum",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
]
  },
  {
    "name": "Hallow",
    "level": 5,
    "school": "Evocation",
    "castingTime": "24 hours",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Herbs, oils, and incense worth at least 1,000 gp, which the spell consumes."
    },
    "duration": "Until dispelled",
    "concentration": false,
    "ritual": false,
    "description": "You touch a point and infuse an area around it with holy (or unholy) power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect a hallow spell. The affected area is subject to the following effects.\n\nFirst, celestials, elementals, fey, fiends, and undead can't enter the area, nor can such creatures charm, frighten, or possess creatures within it. Any creature charmed, frightened, or possessed by such a creature is no longer charmed, frightened, or possessed upon entering the area. You can exclude one or more of those types of creatures from this effect.\n\nSecond, you can bind an extra effect to the area. Choose the effect from the following list, or choose an effect offered by the GM. Some of these effects apply to creatures in the area; you can designate whether the effect applies to all creatures, creatures that follow a specific deity or leader, or creatures of a specific sort, such as ores or trolls. When a creature that would be affected enters the spell's area for the first time on a turn or starts its turn there, it can make a charisma saving throw. On a success, the creature ignores the extra effect until it leaves the area.\n\n***Courage.*** Affected creatures can't be frightened while in the area.\n\n***Darkness.*** Darkness fills the area. Normal light, as well as magical light created by spells of a lower level than the slot you used to cast this spell, can't illuminate the area.\n\n***Daylight.*** Bright light fills the area. Magical darkness created by spells of a lower level than the slot you used to cast this spell can't extinguish the light.\n\n***Energy Protection.*** Affected creatures in the area have resistance to one damage type of your choice, except for bludgeoning, piercing, or slashing.\n\n***Energy Vulnerability.*** Affected creatures in the area have vulnerability to one damage type of your choice, except for bludgeoning, piercing, or slashing.\n\n***Everlasting Rest.*** Dead bodies interred in the area can't be turned into undead.\n\n***Extradimensional Interference.*** Affected creatures can't move or travel using teleportation or by extradimensional or interplanar means.\n\n***Fear.*** Affected creatures are frightened while in the area.\n\n***Silence.*** No sound can emanate from within the area, and no sound can reach into it.\n\n***Tongues.*** Affected creatures can communicate with any other creature in the area, even if they don't share a common language.",
    "classes": [
      "Cleric"
],
    "savingThrow": {
      "abilityScore": "CHA",
      "successEffect": "none"
    }
  },
  {
    "name": "Hold Monster",
    "level": 5,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small piece of iron."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Choose a creature you can see and reach. The target must make a saving throw of Wisdom or be paralyzed for the duration of the spell. This spell has no effect against the undead. At the end of each round, the target can make a new saving throw of Wisdom. If successful, the spell ends for the creature.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
],
    "higherLevels": "When you cast this spell using a level 6 or higher location, you can target an additional creature for each level of location beyond the fifth. The creatures must be within 30 feet o f each other when you target them.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  }
];
