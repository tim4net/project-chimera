/**
 * D&D 5e Languages System
 * Implements all SRD languages with their properties
 */

export interface Language {
  name: string;
  type: 'standard' | 'exotic' | 'rare';
  script?: string;
  speakers: string[];
  description?: string;
}

/**
 * Standard Languages - commonly learned by player races
 */
export const STANDARD_LANGUAGES: Language[] = [
  {
    name: 'Common',
    type: 'standard',
    script: 'Common',
    speakers: ['Humans', 'Half-Elves', 'Half-Orcs'],
    description: 'The lingua franca of most civilized lands'
  },
  {
    name: 'Dwarvish',
    type: 'standard',
    script: 'Dwarvish',
    speakers: ['Dwarves'],
    description: 'Full of hard consonants and guttural sounds'
  },
  {
    name: 'Elvish',
    type: 'standard',
    script: 'Elvish',
    speakers: ['Elves', 'Half-Elves'],
    description: 'Fluid and melodic, with subtle intonations'
  },
  {
    name: 'Giant',
    type: 'standard',
    script: 'Dwarvish',
    speakers: ['Giants', 'Ogres'],
    description: 'Loud and booming, used by giant-kin'
  },
  {
    name: 'Gnomish',
    type: 'standard',
    script: 'Dwarvish',
    speakers: ['Gnomes'],
    description: 'Technical and precise, full of compound words'
  },
  {
    name: 'Goblin',
    type: 'standard',
    script: 'Dwarvish',
    speakers: ['Goblinoids', 'Hobgoblins', 'Bugbears'],
    description: 'Harsh and aggressive sounding'
  },
  {
    name: 'Halfling',
    type: 'standard',
    script: 'Common',
    speakers: ['Halflings'],
    description: 'Pleasant and unpretentious'
  },
  {
    name: 'Orc',
    type: 'standard',
    script: 'Dwarvish',
    speakers: ['Orcs', 'Half-Orcs'],
    description: 'Guttural and harsh with sharp sounds'
  }
];

/**
 * Exotic Languages - rare and require special training
 */
export const EXOTIC_LANGUAGES: Language[] = [
  {
    name: 'Abyssal',
    type: 'exotic',
    script: 'Infernal',
    speakers: ['Demons', 'Chaotic evil outsiders'],
    description: 'The language of demons and the Abyss'
  },
  {
    name: 'Celestial',
    type: 'exotic',
    script: 'Celestial',
    speakers: ['Angels', 'Celestials'],
    description: 'The language of the Upper Planes'
  },
  {
    name: 'Deep Speech',
    type: 'exotic',
    script: undefined,
    speakers: ['Mind flayers', 'Beholders', 'Aboleths'],
    description: 'The alien language of aberrations, lacks written form'
  },
  {
    name: 'Draconic',
    type: 'exotic',
    script: 'Draconic',
    speakers: ['Dragons', 'Dragonborn', 'Kobolds'],
    description: 'Ancient language of dragons and reptilian races'
  },
  {
    name: 'Infernal',
    type: 'exotic',
    script: 'Infernal',
    speakers: ['Devils', 'Lawful evil outsiders', 'Tieflings'],
    description: 'The language of devils and the Nine Hells'
  },
  {
    name: 'Primordial',
    type: 'exotic',
    script: 'Dwarvish',
    speakers: ['Elementals', 'Genies'],
    description: 'Language of elementals (includes Aquan, Auran, Ignan, Terran dialects)'
  },
  {
    name: 'Sylvan',
    type: 'exotic',
    script: 'Elvish',
    speakers: ['Fey creatures', 'Dryads', 'Sprites'],
    description: 'The language of the Feywild'
  },
  {
    name: 'Undercommon',
    type: 'exotic',
    script: 'Elvish',
    speakers: ['Drow', 'Duergar', 'Underdark dwellers'],
    description: 'The trade language of the Underdark'
  }
];

/**
 * Rare Languages - typically require special class features
 */
export const RARE_LANGUAGES: Language[] = [
  {
    name: 'Druidic',
    type: 'rare',
    script: 'Druidic',
    speakers: ['Druids'],
    description: 'Secret language of druids, forbidden to non-druids'
  },
  {
    name: "Thieves' Cant",
    type: 'rare',
    script: undefined,
    speakers: ['Rogues', 'Criminals'],
    description: 'Secret mix of jargon and coded messages used by rogues'
  }
];

/**
 * All languages combined
 */
export const ALL_LANGUAGES: Language[] = [
  ...STANDARD_LANGUAGES,
  ...EXOTIC_LANGUAGES,
  ...RARE_LANGUAGES
];

/**
 * Get language by name
 */
export function getLanguage(name: string): Language | undefined {
  return ALL_LANGUAGES.find(lang =>
    lang.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all languages of a specific type
 */
export function getLanguagesByType(type: 'standard' | 'exotic' | 'rare'): Language[] {
  return ALL_LANGUAGES.filter(lang => lang.type === type);
}

/**
 * Check if a language exists
 */
export function isValidLanguage(name: string): boolean {
  return getLanguage(name) !== undefined;
}

/**
 * Get languages typically known by a race
 */
export function getLanguagesByRace(race: string): Language[] {
  return ALL_LANGUAGES.filter(lang =>
    lang.speakers.some(speaker =>
      speaker.toLowerCase().includes(race.toLowerCase())
    )
  );
}

/**
 * Language learning difficulty (for potential future mechanics)
 */
export function getLanguageDifficulty(name: string): 'easy' | 'moderate' | 'hard' {
  const language = getLanguage(name);
  if (!language) return 'moderate';

  switch (language.type) {
    case 'standard':
      return 'easy';
    case 'exotic':
      return 'moderate';
    case 'rare':
      return 'hard';
    default:
      return 'moderate';
  }
}
