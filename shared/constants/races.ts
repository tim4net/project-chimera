/**
 * D&D 5e Race Data Constants
 *
 * Defines all playable races with their mechanical properties,
 * ability score bonuses, traits, and lore descriptions.
 */

export interface Race {
  name: string;
  description: string;
  abilityBonuses: {
    [key in 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA']?: number;
  };
  speed: number;
  languages: string[];
  traits: string[];
  hitDie?: number; // Optional, most races don't modify hit die
}

export const RACES: Race[] = [
  {
    name: 'Aasimar',
    description: 'Aasimar bear within their souls the light of the heavens. They are descended from humans with a touch of the power of Mount Celestia, the divine realm of many lawful good deities.',
    abilityBonuses: {
      CHA: 2
    },
    speed: 30,
    languages: ['Common', 'Celestial'],
    traits: [
      'Darkvision (60 ft)',
      'Celestial Resistance (resistance to necrotic and radiant damage)',
      'Healing Hands (heal HP equal to your level as an action, 1/long rest)',
      'Light Bearer (know the Light cantrip)'
    ]
  },
  {
    name: 'Dragonborn',
    description: 'Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or the dragons themselves, dragonborn originally hatched from dragon eggs as a unique race, combining the best attributes of dragons and humanoids.',
    abilityBonuses: {
      STR: 2,
      CHA: 1
    },
    speed: 30,
    languages: ['Common', 'Draconic'],
    traits: [
      'Draconic Ancestry (choose dragon type)',
      'Breath Weapon (exhale destructive energy, 2d6 damage at level 1, CON save DC 8 + CON mod + proficiency)',
      'Damage Resistance (resistance to damage type of your draconic ancestry)'
    ]
  },
  {
    name: 'Dwarf',
    description: 'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. Though they stand well under 5 feet tall, dwarves are so broad and compact that they can weigh as much as a human standing nearly two feet taller.',
    abilityBonuses: {
      CON: 2
    },
    speed: 25,
    languages: ['Common', 'Dwarvish'],
    traits: [
      'Darkvision (60 ft)',
      'Dwarven Resilience (advantage on saving throws against poison, resistance to poison damage)',
      'Dwarven Combat Training (proficiency with battleaxe, handaxe, light hammer, warhammer)',
      'Stonecunning (double proficiency bonus on History checks related to stonework)',
      'Tool Proficiency (proficiency with artisan tools of your choice)'
    ]
  },
  {
    name: 'Elf',
    description: 'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it. They live in places of ethereal beauty, in the midst of ancient forests or in silvery spires glittering with faerie light.',
    abilityBonuses: {
      DEX: 2
    },
    speed: 30,
    languages: ['Common', 'Elvish'],
    traits: [
      'Darkvision (60 ft)',
      'Keen Senses (proficiency in Perception)',
      'Fey Ancestry (advantage on saving throws against being charmed, magic cannot put you to sleep)',
      'Trance (4 hours of meditation counts as 8 hours of sleep)'
    ]
  },
  {
    name: 'Gnome',
    description: 'A gnome\'s energy and enthusiasm for living shines through every inch of his or her tiny body. Gnomes average slightly over 3 feet tall and weigh 40 to 45 pounds. Their tan or brown faces are usually adorned with broad smiles, beneath their prodigious noses.',
    abilityBonuses: {
      INT: 2
    },
    speed: 25,
    languages: ['Common', 'Gnomish'],
    traits: [
      'Darkvision (60 ft)',
      'Gnome Cunning (advantage on INT, WIS, and CHA saving throws against magic)'
    ]
  },
  {
    name: 'Goliath',
    description: 'At the highest mountain peaks dwell the reclusive goliaths, wandering a bleak realm of rock, wind, and cold. Their bodies look as if they are carved from mountain stone and give them great physical power. Their spirits take after the wandering wind, making them nomads who wander from peak to peak.',
    abilityBonuses: {
      STR: 2,
      CON: 1
    },
    speed: 30,
    languages: ['Common', 'Giant'],
    traits: [
      'Natural Athlete (proficiency in Athletics)',
      'Stone\'s Endurance (reduce damage by 1d12 + CON mod as a reaction, 1/short rest)',
      'Powerful Build (count as one size larger when determining carrying capacity)',
      'Mountain Born (acclimated to high altitude and cold climate)'
    ]
  },
  {
    name: 'Halfling',
    description: 'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense. Standing about 3 feet tall, they appear relatively harmless and so have managed to survive for centuries in the shadow of empires.',
    abilityBonuses: {
      DEX: 2
    },
    speed: 25,
    languages: ['Common', 'Halfling'],
    traits: [
      'Lucky (reroll 1s on attack rolls, ability checks, and saving throws)',
      'Brave (advantage on saving throws against being frightened)',
      'Halfling Nimbleness (can move through the space of any creature larger than you)'
    ]
  },
  {
    name: 'Human',
    description: 'Humans are the most adaptable and ambitious people among the common races. They have widely varying tastes, morals, and customs in the many different lands where they have settled. When they settle, though, they stay: they build cities to last for the ages.',
    abilityBonuses: {
      STR: 1,
      DEX: 1,
      CON: 1,
      INT: 1,
      WIS: 1,
      CHA: 1
    },
    speed: 30,
    languages: ['Common', 'One extra language of your choice'],
    traits: [
      'Versatile (bonus to all ability scores)',
      'Extra Language (choose one additional language)'
    ]
  },
  {
    name: 'Orc',
    description: 'Orcs are savage raiders and pillagers with stooped postures, low foreheads, and piggish faces with prominent lower canines that resemble tusks. However, some orcs rise above their savage kin, finding honor and purpose beyond mere destruction.',
    abilityBonuses: {
      STR: 2,
      CON: 1
    },
    speed: 30,
    languages: ['Common', 'Orc'],
    traits: [
      'Darkvision (60 ft)',
      'Aggressive (use bonus action to move up to your speed toward an enemy)',
      'Menacing (proficiency in Intimidation)',
      'Powerful Build (count as one size larger when determining carrying capacity)'
    ]
  },
  {
    name: 'Tiefling',
    description: 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling. Tieflings are derived from human bloodlines, and in the broadest possible sense, they still look human. However, their infernal heritage has left a clear imprint on their appearance.',
    abilityBonuses: {
      CHA: 2,
      INT: 1
    },
    speed: 30,
    languages: ['Common', 'Infernal'],
    traits: [
      'Darkvision (60 ft)',
      'Hellish Resistance (resistance to fire damage)',
      'Infernal Legacy (know Thaumaturgy cantrip, cast Hellish Rebuke at level 3, cast Darkness at level 5, all 1/long rest, CHA-based)'
    ]
  }
];

/**
 * Helper function to get a race by name
 */
export function getRaceByName(name: string): Race | undefined {
  return RACES.find(race => race.name.toLowerCase() === name.toLowerCase());
}

/**
 * Helper function to get all race names
 */
export function getAllRaceNames(): string[] {
  return RACES.map(race => race.name);
}
