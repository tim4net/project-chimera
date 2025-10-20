/**
 * Complete D&D 5e SRD Racial Traits and Abilities
 * Data imported from https://www.dnd5eapi.co/api/races
 *
 * Non-SRD races (Aasimar, Goliath, Orc) use reasonable approximations
 * based on standard 5e homebrew and Volo's Guide mechanics.
 */

import type { AbilityScores } from '../types';

export interface RacialTrait {
  name: string;
  description: string;
}

export interface Race {
  name: string;
  size: 'Small' | 'Medium';
  speed: number;
  abilityBonuses: Partial<AbilityScores>;
  age: {
    maturity: number;
    max: number;
  };
  alignment: string;
  languages: string[];
  traits: RacialTrait[];
  proficiencies?: string[];
  darkvision?: number;
  subraces?: string[];
}

export const RACES: Record<string, Race> = {
  Dwarf: {
    name: 'Dwarf',
    size: 'Medium',
    speed: 25,
    abilityBonuses: { CON: 2 },
    age: {
      maturity: 50,
      max: 350
    },
    alignment: 'Lawful Good',
    languages: ['Common', 'Dwarvish'],
    darkvision: 60,
    proficiencies: [
      'Battleaxe',
      'Handaxe',
      'Light Hammer',
      'Warhammer',
      'Smith\'s Tools or Brewer\'s Supplies or Mason\'s Tools'
    ],
    traits: [
      {
        name: 'Darkvision',
        description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Dwarven Resilience',
        description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.'
      },
      {
        name: 'Dwarven Combat Training',
        description: 'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.'
      },
      {
        name: 'Tool Proficiency',
        description: 'You gain proficiency with the artisan\'s tools of your choice: smith\'s tools, brewer\'s supplies, or mason\'s tools.'
      },
      {
        name: 'Stonecunning',
        description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.'
      }
    ],
    subraces: ['Hill Dwarf']
  },

  Elf: {
    name: 'Elf',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { DEX: 2 },
    age: {
      maturity: 100,
      max: 750
    },
    alignment: 'Chaotic Good',
    languages: ['Common', 'Elvish'],
    darkvision: 60,
    proficiencies: ['Perception'],
    traits: [
      {
        name: 'Darkvision',
        description: 'Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.'
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
      },
      {
        name: 'Trance',
        description: 'Elves don\'t need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. While meditating, you can dream after a fashion; such dreams are actually mental exercises that have become reflexive through years of practice. After resting in this way, you gain the same benefit that a human does from 8 hours of sleep.'
      }
    ],
    subraces: ['High Elf']
  },

  Halfling: {
    name: 'Halfling',
    size: 'Small',
    speed: 25,
    abilityBonuses: { DEX: 2 },
    age: {
      maturity: 20,
      max: 150
    },
    alignment: 'Lawful Good',
    languages: ['Common', 'Halfling'],
    traits: [
      {
        name: 'Lucky',
        description: 'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.'
      },
      {
        name: 'Brave',
        description: 'You have advantage on saving throws against being frightened.'
      },
      {
        name: 'Halfling Nimbleness',
        description: 'You can move through the space of any creature that is of a size larger than yours.'
      }
    ],
    subraces: ['Lightfoot Halfling']
  },

  Human: {
    name: 'Human',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    age: {
      maturity: 18,
      max: 100
    },
    alignment: 'Neutral',
    languages: ['Common', 'One additional language of your choice'],
    traits: [
      {
        name: 'Versatile',
        description: 'Humans are the most adaptable and ambitious people among the common races. Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.'
      }
    ]
  },

  Dragonborn: {
    name: 'Dragonborn',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { STR: 2, CHA: 1 },
    age: {
      maturity: 15,
      max: 80
    },
    alignment: 'Neutral',
    languages: ['Common', 'Draconic'],
    traits: [
      {
        name: 'Draconic Ancestry',
        description: 'You have draconic ancestry. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type.'
      },
      {
        name: 'Breath Weapon',
        description: 'You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw, the type of which is determined by your draconic ancestry. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can\'t use it again until you complete a short or long rest.'
      },
      {
        name: 'Damage Resistance',
        description: 'You have resistance to the damage type associated with your draconic ancestry.'
      }
    ]
  },

  Gnome: {
    name: 'Gnome',
    size: 'Small',
    speed: 25,
    abilityBonuses: { INT: 2 },
    age: {
      maturity: 40,
      max: 450
    },
    alignment: 'Neutral Good',
    languages: ['Common', 'Gnomish'],
    darkvision: 60,
    traits: [
      {
        name: 'Darkvision',
        description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Gnome Cunning',
        description: 'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.'
      }
    ],
    subraces: ['Rock Gnome']
  },

  'Half-Elf': {
    name: 'Half-Elf',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { CHA: 2 }, // Plus two +1s of choice
    age: {
      maturity: 20,
      max: 180
    },
    alignment: 'Chaotic Neutral',
    languages: ['Common', 'Elvish', 'One additional language of your choice'],
    darkvision: 60,
    proficiencies: ['Two skills of your choice'],
    traits: [
      {
        name: 'Darkvision',
        description: 'Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
      },
      {
        name: 'Skill Versatility',
        description: 'You gain proficiency in two skills of your choice.'
      }
    ]
  },

  'Half-Orc': {
    name: 'Half-Orc',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { STR: 2, CON: 1 },
    age: {
      maturity: 14,
      max: 75
    },
    alignment: 'Chaotic Neutral',
    languages: ['Common', 'Orc'],
    darkvision: 60,
    proficiencies: ['Intimidation'],
    traits: [
      {
        name: 'Darkvision',
        description: 'Thanks to your orc blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Menacing',
        description: 'You gain proficiency in the Intimidation skill.'
      },
      {
        name: 'Relentless Endurance',
        description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can\'t use this feature again until you finish a long rest.'
      },
      {
        name: 'Savage Attacks',
        description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage of the critical hit.'
      }
    ]
  },

  Tiefling: {
    name: 'Tiefling',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { INT: 1, CHA: 2 },
    age: {
      maturity: 18,
      max: 110
    },
    alignment: 'Chaotic Neutral',
    languages: ['Common', 'Infernal'],
    darkvision: 60,
    traits: [
      {
        name: 'Darkvision',
        description: 'Thanks to your infernal heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Hellish Resistance',
        description: 'You have resistance to fire damage.'
      },
      {
        name: 'Infernal Legacy',
        description: 'You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells.'
      }
    ]
  },

  // NON-SRD RACES - Reasonable approximations

  Aasimar: {
    name: 'Aasimar',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { CHA: 2, WIS: 1 },
    age: {
      maturity: 18,
      max: 160
    },
    alignment: 'Neutral Good',
    languages: ['Common', 'Celestial'],
    darkvision: 60,
    traits: [
      {
        name: 'Darkvision',
        description: 'Blessed with a radiant soul, your vision can easily cut through darkness. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Celestial Resistance',
        description: 'You have resistance to necrotic damage and radiant damage.'
      },
      {
        name: 'Healing Hands',
        description: 'As an action, you can touch a creature and cause it to regain hit points equal to your level. Once you use this trait, you can\'t use it again until you finish a long rest.'
      },
      {
        name: 'Light Bearer',
        description: 'You know the light cantrip. Charisma is your spellcasting ability for it.'
      }
    ]
  },

  Goliath: {
    name: 'Goliath',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { STR: 2, CON: 1 },
    age: {
      maturity: 18,
      max: 90
    },
    alignment: 'Lawful Neutral',
    languages: ['Common', 'Giant'],
    traits: [
      {
        name: 'Natural Athlete',
        description: 'You have proficiency in the Athletics skill.'
      },
      {
        name: 'Stone\'s Endurance',
        description: 'You can focus yourself to occasionally shrug off injury. When you take damage, you can use your reaction to roll a d12. Add your Constitution modifier to the number rolled, and reduce the damage by that total. After you use this trait, you can\'t use it again until you finish a short or long rest.'
      },
      {
        name: 'Powerful Build',
        description: 'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.'
      },
      {
        name: 'Mountain Born',
        description: 'You\'re acclimated to high altitude, including elevations above 20,000 feet. You\'re also naturally adapted to cold climates.'
      }
    ],
    proficiencies: ['Athletics']
  },

  Orc: {
    name: 'Orc',
    size: 'Medium',
    speed: 30,
    abilityBonuses: { STR: 2, CON: 1 },
    age: {
      maturity: 12,
      max: 60
    },
    alignment: 'Chaotic Neutral',
    languages: ['Common', 'Orc'],
    darkvision: 60,
    proficiencies: ['Intimidation'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
      },
      {
        name: 'Aggressive',
        description: 'As a bonus action, you can move up to your speed toward an enemy of your choice that you can see or hear. You must end this move closer to the enemy than you started.'
      },
      {
        name: 'Menacing',
        description: 'You gain proficiency in the Intimidation skill.'
      },
      {
        name: 'Powerful Build',
        description: 'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.'
      }
    ]
  }
};

/**
 * Get race data by name
 */
export function getRace(raceName: string): Race | undefined {
  return RACES[raceName];
}

/**
 * Get list of all available race names
 */
export function getAllRaceNames(): string[] {
  return Object.keys(RACES);
}

/**
 * Validate if a race name exists
 */
export function isValidRace(raceName: string): boolean {
  return raceName in RACES;
}
