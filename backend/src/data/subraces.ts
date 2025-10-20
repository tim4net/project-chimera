/**
 * D&D 5e Subrace Data
 * Imported from https://www.dnd5eapi.co/api/2014/subraces
 *
 * Note: The 5e SRD only includes 4 subraces (High Elf, Hill Dwarf, Lightfoot Halfling, Rock Gnome).
 * Additional subraces are added based on standard 5e Player's Handbook mechanics.
 */

import type { AbilityScores } from '../types';

export interface SubraceTrait {
  name: string;
  description: string;
}

export interface Subrace {
  name: string;
  race: string;
  description: string;
  abilityBonuses: Partial<AbilityScores>;
  traits: SubraceTrait[];
  proficiencies?: string[];
  languages?: string[];
  spellcasting?: {
    cantrips?: string[];
    ability?: string;
  };
}

/**
 * All available subraces organized by parent race
 */
export const SUBRACES: Record<string, Subrace> = {
  // DWARF SUBRACES
  'Hill Dwarf': {
    name: 'Hill Dwarf',
    race: 'Dwarf',
    description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.',
    abilityBonuses: { WIS: 1 },
    traits: [
      {
        name: 'Dwarven Toughness',
        description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.'
      }
    ]
  },

  'Mountain Dwarf': {
    name: 'Mountain Dwarf',
    race: 'Dwarf',
    description: 'As a mountain dwarf, you\'re strong and hardy, accustomed to a difficult life in rugged terrain.',
    abilityBonuses: { STR: 2 },
    traits: [
      {
        name: 'Dwarven Armor Training',
        description: 'You have proficiency with light and medium armor.'
      }
    ],
    proficiencies: ['Light Armor', 'Medium Armor']
  },

  // ELF SUBRACES
  'High Elf': {
    name: 'High Elf',
    race: 'Elf',
    description: 'As a high elf, you have a keen mind and a mastery of at least the basics of magic. In many fantasy gaming worlds, there are two kinds of high elves. One type is haughty and reclusive, believing themselves to be superior to non-elves and even other elves. The other type is more common and more friendly, and often encountered among humans and other races.',
    abilityBonuses: { INT: 1 },
    traits: [
      {
        name: 'Elf Weapon Training',
        description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.'
      },
      {
        name: 'High Elf Cantrip',
        description: 'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.'
      },
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.'
      }
    ],
    proficiencies: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'],
    languages: ['One additional language of your choice'],
    spellcasting: {
      cantrips: ['One wizard cantrip of your choice'],
      ability: 'INT'
    }
  },

  'Wood Elf': {
    name: 'Wood Elf',
    race: 'Elf',
    description: 'As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.',
    abilityBonuses: { WIS: 1 },
    traits: [
      {
        name: 'Elf Weapon Training',
        description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.'
      },
      {
        name: 'Fleet of Foot',
        description: 'Your base walking speed increases to 35 feet.'
      },
      {
        name: 'Mask of the Wild',
        description: 'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.'
      }
    ],
    proficiencies: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow']
  },

  'Dark Elf (Drow)': {
    name: 'Dark Elf (Drow)',
    race: 'Elf',
    description: 'Descended from an earlier subrace of dark-skinned elves, the drow were banished from the surface world for following the goddess Lolth down the path to evil and corruption.',
    abilityBonuses: { CHA: 1 },
    traits: [
      {
        name: 'Superior Darkvision',
        description: 'Your darkvision has a radius of 120 feet.'
      },
      {
        name: 'Sunlight Sensitivity',
        description: 'You have disadvantage on attack rolls and Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight.'
      },
      {
        name: 'Drow Magic',
        description: 'You know the dancing lights cantrip. When you reach 3rd level, you can cast faerie fire once per long rest. When you reach 5th level, you can cast darkness once per long rest. Charisma is your spellcasting ability for these spells.'
      },
      {
        name: 'Drow Weapon Training',
        description: 'You have proficiency with rapiers, shortswords, and hand crossbows.'
      }
    ],
    proficiencies: ['Rapier', 'Shortsword', 'Hand Crossbow'],
    spellcasting: {
      cantrips: ['Dancing Lights'],
      ability: 'CHA'
    }
  },

  // HALFLING SUBRACES
  'Lightfoot Halfling': {
    name: 'Lightfoot Halfling',
    race: 'Halfling',
    description: 'As a lightfoot halfling, you can easily hide from notice, even using other people as cover. You\'re inclined to be affable and get along well with others. Lightfoots are more prone to wanderlust than other halflings, and often dwell alongside other races or take up a nomadic life.',
    abilityBonuses: { CHA: 1 },
    traits: [
      {
        name: 'Naturally Stealthy',
        description: 'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.'
      }
    ]
  },

  'Stout Halfling': {
    name: 'Stout Halfling',
    race: 'Halfling',
    description: 'As a stout halfling, you\'re hardier than average and have some resistance to poison. Some say that stouts have dwarven blood.',
    abilityBonuses: { CON: 1 },
    traits: [
      {
        name: 'Stout Resilience',
        description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.'
      }
    ]
  },

  // GNOME SUBRACES
  'Forest Gnome': {
    name: 'Forest Gnome',
    race: 'Gnome',
    description: 'As a forest gnome, you have a natural knack for illusion and inherent quickness and stealth.',
    abilityBonuses: { DEX: 1 },
    traits: [
      {
        name: 'Natural Illusionist',
        description: 'You know the minor illusion cantrip. Intelligence is your spellcasting ability for it.'
      },
      {
        name: 'Speak with Small Beasts',
        description: 'Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts.'
      }
    ],
    spellcasting: {
      cantrips: ['Minor Illusion'],
      ability: 'INT'
    }
  },

  'Rock Gnome': {
    name: 'Rock Gnome',
    race: 'Gnome',
    description: 'As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.',
    abilityBonuses: { CON: 1 },
    traits: [
      {
        name: 'Artificer\'s Lore',
        description: 'Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply.'
      },
      {
        name: 'Tinker',
        description: 'You have proficiency with artisan\'s tools (tinker\'s tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp). The device ceases to function after 24 hours unless you spend 1 hour repairing it. You can have up to three such devices active at a time. Options: Clockwork Toy, Fire Starter, Music Box.'
      }
    ],
    proficiencies: ['Tinker\'s Tools']
  },

  // DRAGONBORN ANCESTRY (treated as subraces)
  'Black Dragonborn': {
    name: 'Black Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from black dragons, giving you an acidic breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Black Dragon',
        description: 'Breath Weapon: 5 by 30 ft. line (Dex. save). Damage Type: Acid. Resistance: Acid.'
      }
    ]
  },

  'Blue Dragonborn': {
    name: 'Blue Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from blue dragons, giving you a lightning breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Blue Dragon',
        description: 'Breath Weapon: 5 by 30 ft. line (Dex. save). Damage Type: Lightning. Resistance: Lightning.'
      }
    ]
  },

  'Brass Dragonborn': {
    name: 'Brass Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from brass dragons, giving you a fiery breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Brass Dragon',
        description: 'Breath Weapon: 5 by 30 ft. line (Dex. save). Damage Type: Fire. Resistance: Fire.'
      }
    ]
  },

  'Bronze Dragonborn': {
    name: 'Bronze Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from bronze dragons, giving you a lightning breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Bronze Dragon',
        description: 'Breath Weapon: 5 by 30 ft. line (Dex. save). Damage Type: Lightning. Resistance: Lightning.'
      }
    ]
  },

  'Copper Dragonborn': {
    name: 'Copper Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from copper dragons, giving you an acidic breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Copper Dragon',
        description: 'Breath Weapon: 5 by 30 ft. line (Dex. save). Damage Type: Acid. Resistance: Acid.'
      }
    ]
  },

  'Gold Dragonborn': {
    name: 'Gold Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from gold dragons, giving you a fiery breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Gold Dragon',
        description: 'Breath Weapon: 15 ft. cone (Dex. save). Damage Type: Fire. Resistance: Fire.'
      }
    ]
  },

  'Green Dragonborn': {
    name: 'Green Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from green dragons, giving you a poisonous breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Green Dragon',
        description: 'Breath Weapon: 15 ft. cone (Con. save). Damage Type: Poison. Resistance: Poison.'
      }
    ]
  },

  'Red Dragonborn': {
    name: 'Red Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from red dragons, giving you a fiery breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Red Dragon',
        description: 'Breath Weapon: 15 ft. cone (Dex. save). Damage Type: Fire. Resistance: Fire.'
      }
    ]
  },

  'Silver Dragonborn': {
    name: 'Silver Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from silver dragons, giving you a cold breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: Silver Dragon',
        description: 'Breath Weapon: 15 ft. cone (Con. save). Damage Type: Cold. Resistance: Cold.'
      }
    ]
  },

  'White Dragonborn': {
    name: 'White Dragonborn',
    race: 'Dragonborn',
    description: 'Your draconic ancestry is from white dragons, giving you a cold breath weapon.',
    abilityBonuses: {},
    traits: [
      {
        name: 'Draconic Ancestry: White Dragon',
        description: 'Breath Weapon: 15 ft. cone (Con. save). Damage Type: Cold. Resistance: Cold.'
      }
    ]
  },

  // HUMAN VARIANT (treated as subrace)
  'Variant Human': {
    name: 'Variant Human',
    race: 'Human',
    description: 'If your campaign uses the optional feat rules, your Dungeon Master might allow you to use this variant human, replacing the human\'s Ability Score Increase trait.',
    abilityBonuses: {}, // Two different ability scores increase by 1 (player choice)
    traits: [
      {
        name: 'Skills',
        description: 'You gain proficiency in one skill of your choice.'
      },
      {
        name: 'Feat',
        description: 'You gain one feat of your choice.'
      }
    ],
    proficiencies: ['One skill of your choice']
  }
};

/**
 * Get subrace data by name
 */
export function getSubrace(subraceName: string): Subrace | undefined {
  return SUBRACES[subraceName];
}

/**
 * Get all subraces for a specific race
 */
export function getSubracesByRace(raceName: string): Subrace[] {
  return Object.values(SUBRACES).filter(subrace => subrace.race === raceName);
}

/**
 * Get list of all available subrace names
 */
export function getAllSubraceNames(): string[] {
  return Object.keys(SUBRACES);
}

/**
 * Validate if a subrace name exists
 */
export function isValidSubrace(subraceName: string): boolean {
  return subraceName in SUBRACES;
}

/**
 * Check if a subrace is valid for a given race
 */
export function isValidSubraceForRace(subraceName: string, raceName: string): boolean {
  const subrace = SUBRACES[subraceName];
  return subrace !== undefined && subrace.race === raceName;
}
