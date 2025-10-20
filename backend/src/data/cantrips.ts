/**
 * D&D 5e SRD Cantrips
 * Imported from https://www.dnd5eapi.co/api/spells
 * Total: 24 spells
 */

import type { Spell } from './spellTypes';

export const CANTRIPS: Spell[] = [
  {
    "name": "Acid Splash",
    "level": 0,
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
    "description": "You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a dexterity saving throw or take 1d6 acid damage.\n\nThis spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "damageType": "Acid",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Chill Touch",
    "level": 0,
    "school": "Necromancy",
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
    "description": "You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave. On a hit, the target takes 1d8 necrotic damage, and it can't regain hit points until the start of your next turn. Until then, the hand clings to the target.\n\nIf you hit an undead target, it also has disadvantage on attack rolls against you until the end of your next turn.\n\nThis spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "damageType": "Necrotic",
    "attackType": "ranged"
  },
  {
    "name": "Dancing Lights",
    "level": 0,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of phosphorus or wychwood, or a glowworm."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size. Whichever form you choose, each light sheds dim light in a 10-foot radius.\n\nAs a bonus action on your turn, you can move the lights up to 60 feet to a new spot within range. A light must be within 20 feet of another light created by this spell, and a light winks out if it exceeds the spell's range.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Druidcraft",
    "level": 0,
    "school": "Transmutation",
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
    "description": "Whispering to the spirits of nature, you create one of the following effects within 'range':\n\n- You create a tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. The effect might manifest as a golden orb for clear skies, a cloud for rain, falling snowflakes for snow, and so on. This effect persists for 1 round.\n\n- You instantly make a flower bloom, a seed pod open, or a leaf bud bloom.\n\n- You create an instantaneous, harmless sensory effect, such as falling leaves, a puff of wind, the sound of a small animal, or the faint order of skunk. The effect must fit in a 5-foot cube.\n\n- You instantly light or snuff out a candle, a torch, or a small campfire.",
    "classes": [
      "Druid"
    ]
  },
  {
    "name": "Eldritch Blast",
    "level": 0,
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
    "description": "A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage. The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam.",
    "classes": [
      "Warlock"
    ],
    "damageType": "Force",
    "attackType": "ranged"
  },
  {
    "name": "Fire Bolt",
    "level": 0,
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
    "description": "You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried.\n\nThis spell's damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "damageType": "Fire",
    "attackType": "ranged"
  },
  {
    "name": "Guidance",
    "level": 0,
    "school": "Divination",
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
    "description": "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.",
    "classes": [
      "Cleric",
      "Druid"
    ]
  },
  {
    "name": "Light",
    "level": 0,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": true,
      "materialComponents": "A firefly or phosphorescent moss."
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action.\n\nIf you target an object held or worn by a hostile creature, that creature must succeed on a dexterity saving throw to avoid the spell.",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Wizard"
    ],
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Mage Hand",
    "level": 0,
    "school": "Conjuration",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.\n\nYou can use your action to control the hand. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it.\n\nThe hand can't attack, activate magic items, or carry more than 10 pounds.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Mending",
    "level": 0,
    "school": "Transmutation",
    "castingTime": "1 minute",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Two lodestones."
    },
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "description": "This spell repairs a single break or tear in an object you touch, such as a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no longer than 1 foot in any dimension, you mend it, leaving no trace of the former damage.\n\nThis spell can physically repair a magic item or construct, but the spell can't restore magic to such an object.",
    "classes": [
      "Cleric",
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Message",
    "level": 0,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "120 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A short piece of copper wire."
    },
    "duration": "1 round",
    "concentration": false,
    "ritual": false,
    "description": "You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.\n\nYou can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence, 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood blocks the spell. The spell doesn't have to follow a straight line and can travel freely around corners or through openings.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ]
  },
  {
    "name": "Minor Illusion",
    "level": 0,
    "school": "Illusion",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": false,
      "somatic": true,
      "material": true,
      "materialComponents": "A bit of fleece."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again.\n\nIf you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else's voice, a lion's roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends.\n\nIf you create an image of an object--such as a chair, muddy footprints, or a small chest--it must be no larger than a 5-foot cube. The image can't create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, because things can pass through it.\n\nIf a creature uses its action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Poison Spray",
    "level": 0,
    "school": "Conjuration",
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
    "ritual": false,
    "description": "You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a constitution saving throw or take 1d12 poison damage.\n\nThis spell's damage increases by 1d12 when you reach 5th level (2d12), 11th level (3d12), and 17th level (4d12).",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard",
      "Druid"
    ],
    "damageType": "Poison",
    "savingThrow": {
      "abilityScore": "CON",
      "successEffect": "none"
    }
  },
  {
    "name": "Prestidigitation",
    "level": 0,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "10 feet",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 hour",
    "concentration": false,
    "ritual": false,
    "description": "This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within 'range':\n\nYou create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor.\n\nYou instantaneously light or snuff out a candle, a torch, or a small campfire.\n\nYou instantaneously clean or soil an object no larger than 1 cubic foot.\n\nYou chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour.\n\nYou make a color, a small mark, or a symbol appear on an object or a surface for 1 hour.\n\nYou create a nonmagical trinket or an illusory image that can fit in your hand and that lasts until the end of your next turn.\n\nIf you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Produce Flame",
    "level": 0,
    "school": "Conjuration",
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
    "ritual": false,
    "description": "A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. The spell ends if you dismiss it as an action or if you cast it again.\n\nYou can also attack with the flame, although doing so ends the spell. When you cast this spell, or as an action on a later turn, you can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 fire damage.\n\nThis spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
    "classes": [
      "Druid"
    ],
    "damageType": "Fire",
    "attackType": "ranged"
  },
  {
    "name": "Ray of Frost",
    "level": 0,
    "school": "Evocation",
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
    "description": "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "damageType": "Cold",
    "attackType": "ranged"
  },
  {
    "name": "Resistance",
    "level": 0,
    "school": "Abjuration",
    "castingTime": "1 action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "A miniature cloak."
    },
    "duration": "Up to 1 minute",
    "concentration": true,
    "ritual": false,
    "description": "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after making the saving throw. The spell then ends.",
    "classes": [
      "Cleric",
      "Druid"
    ]
  },
  {
    "name": "Sacred Flame",
    "level": 0,
    "school": "Evocation",
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
    "description": "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
    "classes": [
      "Cleric"
    ],
    "damageType": "Radiant",
    "savingThrow": {
      "abilityScore": "DEX",
      "successEffect": "none"
    }
  },
  {
    "name": "Shillelagh",
    "level": 0,
    "school": "Transmutation",
    "castingTime": "1 bonus action",
    "range": "Touch",
    "components": {
      "verbal": true,
      "somatic": true,
      "material": true,
      "materialComponents": "Mistletoe, a shamrock leaf, and a club or quarterstaff."
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "The wood of a club or a quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. The weapon also becomes magical, if it isn't already. The spell ends if you cast it again or if you let go of the weapon.",
    "classes": [
      "Druid"
    ]
  },
  {
    "name": "Shocking Grasp",
    "level": 0,
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
    "description": "Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 lightning damage, and it can't take reactions until the start of its next turn.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "damageType": "Lightning",
    "attackType": "melee"
  },
  {
    "name": "Spare the Dying",
    "level": 0,
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
    "description": "You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.",
    "classes": [
      "Cleric"
    ]
  },
  {
    "name": "Thaumaturgy",
    "level": 0,
    "school": "Transmutation",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": true,
      "somatic": false,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "1 minute",
    "concentration": false,
    "ritual": false,
    "description": "You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects within range.\n\n- Your voice booms up to three times as loud as normal for 1 minute.\n\n- You cause flames to flicker, brighten, dim, or change color for 1 minute.\n\n- You cause harmless tremors in the ground for 1 minute.\n\n- You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers.\n\n- You instantaneously cause an unlocked door or window to fly open or slam shut.\n\n- You alter the appearance of your eyes for 1 minute.\n\nIf you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time, and you can dismiss such an effect as an action.",
    "classes": [
      "Cleric"
    ]
  },
  {
    "name": "True Strike",
    "level": 0,
    "school": "Divination",
    "castingTime": "1 action",
    "range": "30 feet",
    "components": {
      "verbal": false,
      "somatic": true,
      "material": false,
      "materialComponents": undefined
    },
    "duration": "Up to 1 round",
    "concentration": true,
    "ritual": false,
    "description": "You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target's defenses. On your next turn, you gain advantage on your first attack roll against the target, provided that this spell hasn't ended.",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ]
  },
  {
    "name": "Vicious Mockery",
    "level": 0,
    "school": "Enchantment",
    "castingTime": "1 action",
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
    "description": "You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.\n\nThis spell's damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4).",
    "classes": [
      "Bard"
    ],
    "damageType": "Psychic",
    "savingThrow": {
      "abilityScore": "WIS",
      "successEffect": "none"
    }
  }
];
