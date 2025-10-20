/**
 * D&D 5e SRD Level 1 Spells
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 49 spells
 */

import type { Spell } from './spellTypes';

export const LEVEL_1_SPELLS: Spell[] = [
  {
    "name": "Alarm",
    "level": 1,
    "school": "Abjuration",
    "castingTime": "1 minute",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A tiny bell and a piece of fine silver wire."
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": true,
    "description": "You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is mental or audible.\n\nA mental alarm alerts you with a ping in your mind if you are within 1 mile of the warded area. This ping awakens you if you are sleeping.\n\nAn audible alarm produces the sound of a hand bell for 10 seconds within 60 feet.",
    "classes": [
      "Ranger",
      "Wizard"
    ]
  },
  {
    "name": "Animal Friendship",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A morsel of food."
    },
    "duration": "24 hours",
    "concentration": false,
    "ritual": false,
    "description": "This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must see and hear you. If the beast's Intelligence is 4 or higher, the spell fails. Otherwise, the beast must succeed on a wisdom saving throw or be charmed by you for the spell's duration. If you or one of your companions harms the target, the spells ends.",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ],
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Bane",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A drop of blood."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Up to three creatures of your choice that you can see within range must make charisma saving throws. Whenever a target that fails this saving throw makes an attack roll or a saving throw before the spell ends, the target must roll a d4 and subtract the number rolled from the attack roll or saving throw.",
    "classes": [
      "Bard",
      "Cleric"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.",
    "savingThrow": {
      "abilityScore": "CHA",
      "successEffect": "none"
    }
  },
  {
    "name": "Bless",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A sprinkling of holy water."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st."
  },
  {
    "name": "Burning Hands",
    "level": 1,
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
    "description": "As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one.\n\nThe fire ignites any flammable objects in the area that aren't being worn or carried.",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.",
    "damageType": "Fire",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "half"
    }
  },
  {
    "name": "Charm Person",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You attempt to charm a humanoid you can see within range. It must make a wisdom saving throw, and does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it. The charmed creature regards you as a friendly acquaintance. When the spell ends, the creature knows it was charmed by you.",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Color Spray",
    "level": 1,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of powder or sand that is colored red, yellow, and blue."
    },
    "duration": "1 round",
    "concentration": false,
    "ritual": false,
    "description": "A dazzling array of flashing, colored light springs from your hand. Roll 6d10; the total is how many hit points of creatures this spell can effect. Creatures in a 15-foot cone originating from you are affected in ascending order of their current hit points (ignoring unconscious creatures and creatures that can't see).\n\nStarting with the creature that has the lowest current hit points, each creature affected by this spell is blinded until the spell ends. Subtract each creature's hit points from the total before moving on to the creature with the next lowest hit points. A creature's hit points must be equal to or less than the remaining total for that creature to be affected.",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d10 for each slot level above 1st."
  },
  {
    "name": "Command",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 round",
    "concentration": false,
    "ritual": false,
    "description": "You speak a one-word command to a creature you can see within range. The target must succeed on a wisdom saving throw or follow the command on its next turn. The spell has no effect if the target is undead, if it doesn't understand your language, or if your command is directly harmful to it.\n\nSome typical commands and their effects follow. You might issue a command other than one described here. If you do so, the GM determines how the target behaves. If the target can't follow your command, the spell ends.\n\n***Approach.*** The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you.\n\n***Drop.*** The target drops whatever it is holding and then ends its turn.\n\n***Flee.*** The target spends its turn moving away from you by the fastest available means.\n\n***Grovel.*** The target falls prone and then ends its turn.\n\n***Halt.*** The target doesn't move and takes no actions. A flying creature stays aloft, provided that it is able to do so. If it must move to stay aloft, it flies the minimum distance needed to remain in the air.",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them.",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Comprehend Languages",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of soot and salt."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": true,
    "description": "For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text.\n\nThis spell doesn't decode secret messages in a text or a glyph, such as an arcane sigil, that isn't part of a written language.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Create or Destroy Water",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A drop of water if creating water, or a few grains of sand if destroying it."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "You either create or destroy water.\n\n***Create Water.*** You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot cube within range.\n\n***Destroy Water.*** You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot cube within range.",
    "classes": [
      "Cleric",
      "Druid"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you create or destroy 10 additional gallons of water, or the size of the cube increases by 5 feet, for each slot level above 1st."
  },
  {
    "name": "Cure Wounds",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st."
  },
  {
    "name": "Detect Evil and Good",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "For the duration, you know if there is an aberration, celestial, elemental, fey, fiend, or undead within 30 feet of you, as well as where the creature is located. Similarly, you know if there is a place or object within 30 feet of you that has been magically consecrated or desecrated.\n\nThe spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.",
    "classes": [
      "Cleric",
      "Paladin"
    ]
  },
  {
    "name": "Detect Magic",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": true,
    "description": "For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.\n\nThe spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Detect Poison and Disease",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A yew leaf."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": true,
    "description": "For the duration, you can sense the presence and location of poisons, poisonous creatures, and diseases within 30 feet of you. You also identify the kind of poison, poisonous creature, or disease in each case.\n\nThe spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.",
    "classes": [
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ]
  },
  {
    "name": "Disguise Self",
    "level": 1,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You make yourself--including your clothing, armor, weapons, and other belongings on your person--look different until the spell ends or until you use your action to dismiss it. You can seem 1 foot shorter or taller and can appear thin, fat, or in between. You can't change your body type, so you must adopt a form that has the same basic arrangement of limbs. Otherwise, the extent of the illusion is up to you.\n\nThe changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing or would feel your head and hair. If you use this spell to appear thinner than you are, the hand of someone who reaches out to touch you would bump into you while it was seemingly still in midair.\n\nTo discern that you are disguised, a creature can use its action to inspect your appearance and must succeed on an Intelligence (Investigation) check against your spell save DC.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Divine Favor",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 bonus action",
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
    "description": "Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.",
    "classes": [
      "Paladin"
    ],
    "damageType": "Radiant"
  },
  {
    "name": "Entangle",
    "level": 1,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Grasping weeds and vines sprout from the ground in a 20-foot square starting form a point within range. For the duration, these plants turn the ground in the area into difficult terrain.\n\nA creature in the area when you cast the spell must succeed on a strength saving throw or be restrained by the entangling plants until the spell ends. A creature restrained by the plants can use its action to make a Strength check against your spell save DC. On a success, it frees itself.\n\nWhen the spell ends, the conjured plants wilt away.",
    "classes": [
      "Druid"
    ],
    "savingThrow": {
      "abilityScore": "STR",
      "successEffect": "none"
    }
  },
  {
    "name": "Expeditious Retreat",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 bonus action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "This spell allows you to move at an incredible pace. When you cast this spell, and then as a bonus action on each of your turns until the spell ends, you can take the Dash action.",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Faerie Fire",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius.\n\nAny attack roll against an affected creature or object has advantage if the attacker can see it, and the affected creature or object can't benefit from being invisible.",
    "classes": [
      "Druid"
    ],
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "False Life",
    "level": 1,
    "school": "Necromancy",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small amount of alcohol or distilled spirits."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 temporary hit points for the duration.",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you gain 5 additional temporary hit points for each slot level above 1st."
  },
  {
    "name": "Feather Fall",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 reaction",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": true,
      "materialComponents": "A small feather or a piece of down."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If the creature lands before the spell ends, it takes no falling damage and can land on its feet, and the spell ends for that creature.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Find Familiar",
    "level": 1,
    "school": "Conjuration",
    "castingTime": "1 hour",
    "range": "10 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "10gp worth of charcoal, incense, and herbs that must be consumed by fire in a brass brazier."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": true,
    "description": "You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog (toad), hawk, lizard, octopus, owl, poisonous snake, fish (quipper), rat, raven, sea horse, spider, or weasel. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form, though it is a celestial, fey, or fiend (your choice) instead of a beast.\n\nYour familiar acts independently of you, but it always obeys your commands. In combat, it rolls its own initiative and acts on its own turn. A familiar can't attack, but it can take other actions as normal.\n\nWhen the familiar drops to 0 hit points, it disappears, leaving behind no physical form. It reappears after you cast this spell again.\n\nWhile your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as an action, you can see through your familiar's eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses that the familiar has. During this time, you are deaf and blind with regard to your own senses.\n\nAs an action, you can temporarily dismiss your familiar. It disappears into a pocket dimension where it awaits your summons. Alternatively, you can dismiss it forever. As an action while it is temporarily dismissed, you can cause it to reappear in any unoccupied space within 30 feet of you.\n\nYou can't have more than one familiar at a time. If you cast this spell while you already have a familiar, you instead cause it to adopt a new form. Choose one of the forms from the above list. Your familiar transforms into the chosen creature.\n\nFinally, when you cast a spell with a range of touch, your familiar can deliver the spell as if it had cast the spell. Your familiar must be within 100 feet of you, and it must use its reaction to deliver the spell when you cast it. If the spell requires an attack roll, you use your action modifier for the roll.",
    "classes": [
      "Wizard"
    ]
  },
  {
    "name": "Floating Disk",
    "level": 1,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A drop of mercury."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": true,
    "description": "This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration, and can hold up to 500 pounds. If more weight is placed on it, the spell ends, and everything on the disk falls to the ground.\n\nThe disk is immobile while you are within 20 feet of it. If you move more than 20 feet away from it, the disk follows you so that it remains within 20 feet of you. If can move across uneven terrain, up or down stairs, slopes and the like, but it can't cross an elevation change of 10 feet or more. For example, the disk can't move across a 10-foot-deep pit, nor could it leave such a pit if it was created at the bottom.\n\nIf you move more than 100 feet away from the disk (typically because it can't move around an obstacle to follow you), the spell ends.",
    "classes": [
      "Wizard"
    ]
  },
  {
    "name": "Fog Cloud",
    "level": 1,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it.",
    "classes": [
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the radius of the fog increases by 20 feet for each slot level above 1st."
  },
  {
    "name": "Goodberry",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A sprig of mistletoe."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "Up to ten berries appear in your hand and are infused with magic for the duration. A creature can use its action to eat one berry. Eating a berry restores 1 hit point, and the berry provides enough nourishment to sustain a creature for a day.\n\nThe berries lose their potency if they have not been consumed within 24 hours of the casting of this spell.",
    "classes": [
      "Druid",
      "Ranger"
    ]
  },
  {
    "name": "Grease",
    "level": 1,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of pork rind or butter."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "Slick grease covers the ground in a 10-foot square centered on a point within range and turns it into difficult terrain for the duration.\n\nWhen the grease appears, each creature standing in its area must succeed on a dexterity saving throw or fall prone. A creature that enters the area or ends its turn there must also succeed on a dexterity saving throw or fall prone.",
    "classes": [
      "Wizard"
    ],
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Guiding Bolt",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 round",
    "concentration": false,
    "ritual": false,
    "description": "A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then.",
    "classes": [
      "Cleric"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.",
    "damageType": "Radiant",
    "attackType": "ranged"
  },
  {
    "name": "Healing Word",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 bonus action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st."
  },
  {
    "name": "Hellish Rebuke",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 reaction",
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
    "description": "You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames. The creature must make a dexterity saving throw. It takes 2d10 fire damage on a failed save, or half as much damage on a successful one.",
    "classes": [
      "Warlock"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.",
    "damageType": "Fire",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "half"
    }
  },
  {
    "name": "Heroism",
    "level": 1,
    "school": "Enchantment",
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
    "description": "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being frightened and gains temporary hit points equal to your spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining temporary hit points from this spell.",
    "classes": [
      "Bard",
      "Paladin"
    ]
  },
  {
    "name": "Hideous Laughter",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Tiny tarts and a feather that is waved in the air."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits of laughter if this spell affects it. The target must succeed on a wisdom saving throw or fall prone, becoming incapacitated and unable to stand up for the duration. A creature with an Intelligence score of 4 or less isn't affected.\n\nAt the end of each of its turns, and each time it takes damage, the target can make another wisdom saving throw. The target had advantage on the saving throw if it's triggered by damage. On a success, the spell ends.",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  },
  {
    "name": "Hunter's Mark",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 bonus action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 hour",
    "concentration": true,
    "ritual": false,
    "description": "You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.",
    "classes": [
      "Ranger"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your concentration on the spell for up to 24 hours."
  },
  {
    "name": "Identify",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 minute",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pearl worth at least 100gp and an owl feather."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": true,
    "description": "You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them, whether it requires attunement to use, and how many charges it has, if any. You learn whether any spells are affecting the item and what they are. If the item was created by a spell, you learn which spell created it.\n\nIf you instead touch a creature throughout the casting, you learn what spells, if any, are currently affecting it.",
    "classes": [
      "Bard",
      "Wizard"
    ]
  },
  {
    "name": "Illusory Script",
    "level": 1,
    "school": "Illusion",
    "castingTime": "1 minute",
    "range": "Touch",
    "components": {
      "verbal": false,
      "somatic": true,
      "material": true,
      "materialComponents": "A lead-based ink worth at least 10gp, which this spell consumes."
    },
    "duration": "10 days",
    "concentration": false,
    "ritual": true,
    "description": "You write on parchment, paper, or some other suitable writing material and imbue it with a potent illusion that lasts for the duration.\n\nTo you and any creatures you designate when you cast the spell, the writing appears normal, written in your hand, and conveys whatever meaning you intended when you wrote the text. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible. Alternatively, you can cause the writing to appear to be an entirely different message, written in a different hand and language, though the language must be one you know.\n\nShould the spell be dispelled, the original script and the illusion both disappear.\n\nA creature with truesight can read the hidden message.",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Inflict Wounds",
    "level": 1,
    "school": "Necromancy",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage.",
    "classes": [
      "Cleric"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.",
    "damageType": "Necrotic",
    "attackType": "melee"
  },
  {
    "name": "Jump",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A grasshopper's hind leg."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "You touch a creature. The creature's jump distance is tripled until the spell ends.",
    "classes": [
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Longstrider",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of dirt."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You touch a creature. The target's speed increases by 10 feet until the spell ends.",
    "classes": [
      "Bard",
      "Druid",
      "Ranger",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each spell slot above 1st."
  },
  {
    "name": "Mage Armor",
    "level": 1,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A piece of cured leather."
    },
    "duration": "8 hours",
    "concentration": false,
    "ritual": false,
    "description": "You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.",
    "classes": [
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Magic Missile",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 action",
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
    "description": "You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.",
    "damageType": "Force"
  },
  {
    "name": "Protection from Evil and Good",
    "level": 1,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Holy water or powdered silver and iron, which the spell consumes."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "Until the spell ends, one willing creature you touch is protected against certain types of creatures: aberrations, celestials, elementals, fey, fiends, and undead.\n\nThe protection grants several benefits. Creatures of those types have disadvantage on attack rolls against the target. The target also can't be charmed, frightened, or possessed by them. If the target is already charmed, frightened, or possessed by such a creature, the target has advantage on any new saving throw against the relevant effect.",
    "classes": [
      "Cleric",
      "Paladin",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Purify Food and Drink",
    "level": 1,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "10 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": true,
    "description": "All nonmagical food and drink within a 5-foot radius sphere centered on a point of your choice within range is purified and rendered free of poison and disease.",
    "classes": [
      "Cleric",
      "Druid",
      "Paladin"
    ]
  },
  {
    "name": "Sanctuary",
    "level": 1,
    "school": "Abjuration",
    "castingTime": "1 bonus action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small silver mirror."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from area effects, such as the explosion of a fireball.\n\nIf the warded creature makes an attack or casts a spell that affects an enemy creature, this spell ends.",
    "classes": [
      "Cleric"
    ]
  },
  {
    "name": "Shield",
    "level": 1,
    "school": "Abjuration",
    "castingTime": "1 reaction",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 round",
    "concentration": false,
    "ritual": false,
    "description": "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.",
    "classes": [
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Shield of Faith",
    "level": 1,
    "school": "Abjuration",
    "castingTime": "1 bonus action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A small parchment with a bit of holy text written on it."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.",
    "classes": [
      "Cleric",
      "Paladin"
    ]
  },
  {
    "name": "Silent Image",
    "level": 1,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of fleece."
    },
    "duration": "Up to 10 minutes",
    "concentration": true,
    "ritual": false,
    "description": "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn't accompanied by sound, smell, or other sensory effects.\n\nYou can use your action to cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking.\n\nPhysical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Sleep",
    "level": 1,
    "school": "Enchantment",
    "castingTime": "1 action",
    "range": "90 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A pinch of fine sand, rose petals, or a cricket."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (ignoring unconscious creatures).\n\nStarting with the creature that has the lowest current hit points, each creature affected by this spell falls unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper awake. Subtract each creature's hit points from the total before moving on to the creature with the next lowest hit points. A creature's hit points must be equal to or less than the remaining total for that creature to be affected.\n\nUndead and creatures immune to being charmed aren't affected by this spell.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st."
  },
  {
    "name": "Speak with Animals",
    "level": 1,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "Self",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "10 minutes",
    "concentration": false,
    "ritual": true,
    "description": "You gain the ability to comprehend and verbally communicate with beasts for the duration. The knowledge and awareness of many beasts is limited by their intelligence, but at a minimum, beasts can give you information about nearby locations and monsters, including whatever they can perceive or have perceived within the past day. You might be able to persuade a beast to perform a small favor for you, at the GM's discretion.",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ]
  },
  {
    "name": "Thunderwave",
    "level": 1,
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
    "description": "A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn't pushed.\n\nIn addition, unsecured objects that are completely within the area of effect are automatically pushed 10 feet away from you by the spell's effect, and the spell emits a thunderous boom audible out to 300 feet.",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "higherLevels": "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.",
    "damageType": "Thunder",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "half"
    }
  },
  {
    "name": "Unseen Servant",
    "level": 1,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A piece of string and a bit of wood."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": true,
    "description": "This spell creates an invisible, mindless, shapeless force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 hit point, and a Strength of 2, and it can't attack. If it drops to 0 hit points, the spell ends.\n\nOnce on each of your turns as a bonus action, you can mentally command the servant to move up to 15 feet and interact with an object. The servant can perform simple tasks that a human servant could do, such as fetching things, cleaning, mending, folding clothes, lighting fires, serving food, and pouring wine. Once you give the command, the servant performs the task to the best of its ability until it completes the task, then waits for your next command.\n\nIf you command the servant to perform a task that would move it more than 60 feet away from you, the spell ends.",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ]
  }
];
