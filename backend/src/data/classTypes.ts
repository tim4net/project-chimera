/**
 * D&D 5e Class Type Definitions
 */

export interface ClassFeature {
  level: number;
  name: string;
  description: string;
  type?: 'passive' | 'active' | 'choice';
}

export interface ClassData {
  name: string;
  hitDice: number;
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    savingThrows: string[];
  };
  features: ClassFeature[];
  spellcasting?: {
    ability: string;
    slotsPerLevel: Record<number, number[]>;
  };
  subclasses?: string[];
}

export type ClassName =
  | 'Barbarian' | 'Bard' | 'Cleric' | 'Druid'
  | 'Fighter' | 'Monk' | 'Paladin' | 'Ranger'
  | 'Rogue' | 'Sorcerer' | 'Warlock' | 'Wizard';
