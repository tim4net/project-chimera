/**
 * D&D 5e SRD Monster Database - Core Interfaces and Types
 *
 * Type definitions for the monster database
 */

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface MonsterAttack {
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  description: string;
}

export interface SpecialAbility {
  name: string;
  description: string;
}

export interface LegendaryAction {
  name: string;
  description: string;
  cost?: number; // legendary action points (defaults to 1)
}

export interface LairAction {
  name: string;
  description: string;
}

export interface Monster {
  index: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armorClass: number;
  hitPoints: number;
  hitDice: string;
  speed: Record<string, string>;
  abilityScores: AbilityScores;
  challengeRating: number;
  proficiencyBonus: number;
  xp: number;
  attacks: MonsterAttack[];
  specialAbilities: SpecialAbility[];
  senses: Record<string, string>;
  languages: string;
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  legendaryActions?: LegendaryAction[];
  lairActions?: LairAction[];
  regionalEffects?: string[];
}
