// Test utilities for character creation wizard
// Simplified draft interface for Step 1 testing

export interface Step1Draft {
  name: string;
  race: string;
  class: string;
  background: string;
}

// Extended draft interface for all steps
export interface CharacterDraft {
  name: string;
  race?: { id: string; name: string; racialBonuses?: Record<string, number> };
  class?: { id: string; name: string; hitDie?: number; skillLimit?: number };
  background?: { id: string; name: string; skills?: string[] };
  abilityScores?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills?: string[];
}

export const validRaces = [
  'Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'
];

export const validClasses = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
];

export const validBackgrounds = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Sage', 'Soldier', 'Urchin'
];

export const validSkills = [
  'acrobatics', 'animal-handling', 'arcana', 'athletics',
  'deception', 'history', 'insight', 'intimidation',
  'investigation', 'medicine', 'nature', 'perception',
  'performance', 'persuasion', 'religion', 'sleight-of-hand',
  'stealth', 'survival'
];

export const generateValidCharacter = (): CharacterDraft => {
  return {
    name: 'Test Character',
    race: { id: 'human', name: 'Human', racialBonuses: {} },
    class: { id: 'fighter', name: 'Fighter', hitDie: 10, skillLimit: 2 },
    background: { id: 'soldier', name: 'Soldier', skills: [] },
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    skills: []
  };
};

export const generateEmptyCharacter = (): Step1Draft => {
  return {
    name: '',
    race: '',
    class: '',
    background: ''
  };
};
