/**
 * @fileoverview Type definitions for the character creation wizard.
 * Comprehensive TypeScript-first type system for multi-step character creation.
 */

import type { AbilityScores } from './index';

/**
 * D&D 5e ability names
 */
export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

/**
 * D&D 5e skill names (complete list)
 */
export type SkillName =
  | 'Acrobatics'
  | 'Animal Handling'
  | 'Arcana'
  | 'Athletics'
  | 'Deception'
  | 'History'
  | 'Insight'
  | 'Intimidation'
  | 'Investigation'
  | 'Medicine'
  | 'Nature'
  | 'Perception'
  | 'Performance'
  | 'Persuasion'
  | 'Religion'
  | 'Sleight of Hand'
  | 'Stealth'
  | 'Survival';

/**
 * D&D 5e alignment options
 */
export type Alignment =
  | 'Lawful Good'
  | 'Neutral Good'
  | 'Chaotic Good'
  | 'Lawful Neutral'
  | 'True Neutral'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Neutral Evil'
  | 'Chaotic Evil';

/**
 * Available races in the game
 */
export type Race =
  | 'Aasimar'
  | 'Dragonborn'
  | 'Dwarf'
  | 'Elf'
  | 'Gnome'
  | 'Goliath'
  | 'Halfling'
  | 'Human'
  | 'Orc'
  | 'Tiefling'
  | 'Half-Elf'
  | 'Half-Orc';

/**
 * Available classes in the game
 */
export type CharacterClass =
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard';

/**
 * Available backgrounds in the game
 */
export type Background =
  | 'Acolyte'
  | 'Charlatan'
  | 'Criminal'
  | 'Entertainer'
  | 'Folk Hero'
  | 'Guild Artisan'
  | 'Hermit'
  | 'Noble'
  | 'Outlander'
  | 'Sage'
  | 'Sailor'
  | 'Soldier'
  | 'Urchin';

/**
 * Wizard step identifiers
 */
export type WizardStep =
  | 'identity'
  | 'coreAttributes'
  | 'alignment'
  | 'abilityScores'
  | 'skills'
  | 'equipment'
  | 'review';

/**
 * Step 1: Character Identity
 */
export interface IdentityData {
  name: string;
  age?: number;
  description?: string;
  avatarUrl?: string;
}

/**
 * Step 2: Core Attributes (Race, Class, Background)
 */
export interface CoreAttributesData {
  race: Race;
  class: CharacterClass;
  background: Background;
}

/**
 * Step 3: Alignment
 */
export interface AlignmentData {
  alignment: Alignment;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

/**
 * Step 4: Ability Scores
 * Base scores (8-15) before racial bonuses
 */
export interface AbilityScoresData {
  baseScores: AbilityScores;
  pointsRemaining: number;
  finalScores: AbilityScores; // After racial bonuses
}

/**
 * Step 5: Skills
 * Proficient skills selected during character creation
 */
export interface SkillsData {
  proficientSkills: SkillName[];
  backgroundSkills: SkillName[]; // Auto-assigned from background
  classSkills: SkillName[]; // Selected from class options
}

/**
 * Step 6: Equipment
 */
export interface EquipmentData {
  startingGold: number;
  selectedEquipment: string[];
  weapon?: string;
  armor?: string;
  tools?: string[];
}

/**
 * Complete data for each step
 */
export interface StepData {
  identity?: IdentityData;
  coreAttributes?: CoreAttributesData;
  alignment?: AlignmentData;
  abilityScores?: AbilityScoresData;
  skills?: SkillsData;
  equipment?: EquipmentData;
}

/**
 * Wizard state management
 */
export interface WizardState {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  stepData: StepData;
  validationErrors: Partial<Record<WizardStep, string[]>>;
  isSubmitting: boolean;
}

/**
 * Complete character draft before submission
 * All steps must be completed
 */
export interface CharacterDraft {
  // Identity
  name: string;
  age?: number;
  description?: string;
  avatarUrl?: string;

  // Core Attributes
  race: Race;
  class: CharacterClass;
  background: Background;

  // Alignment & Personality
  alignment: Alignment;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];

  // Ability Scores
  abilityScores: AbilityScores; // Final scores with racial bonuses

  // Skills
  proficientSkills: SkillName[];

  // Equipment
  startingGold: number;
  equipment: string[];
}

/**
 * Final character record (matches database schema)
 */
export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  abilityScores: AbilityScores;
  hpCurrent: number;
  hpMax: number;
  xp: number;
  positionX: number;
  positionY: number;
  campaignSeed: string | null;
  idleTask: string | null;
  idleTaskStartedAt: string | null;

  // Extended details (from character_details table or JSONB)
  description?: string | null;
  backstory?: string | null;
  personalityTraits?: string[] | null;
  ideals?: string[] | null;
  bonds?: string[] | null;
  flaws?: string[] | null;
  alignment?: string | null;
  proficiencies?: Record<string, unknown> | null;
  spells?: Record<string, unknown> | null;
  avatarUrl?: string | null;
}

/**
 * Helper type for skill proficiency mapping
 */
export interface SkillProficiency {
  skill: SkillName;
  ability: AbilityName;
  isProficient: boolean;
}

/**
 * Class skill options (how many skills a class can select)
 */
export interface ClassSkillConfig {
  class: CharacterClass;
  numSkills: number;
  availableSkills: SkillName[];
}

/**
 * Background skill assignment
 */
export interface BackgroundSkillConfig {
  background: Background;
  skills: SkillName[];
  tools?: string[];
}

/**
 * Point-buy cost table for ability scores
 */
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

/**
 * Total points available for point-buy system
 */
export const POINT_BUY_TOTAL = 27;

/**
 * Min/max ability scores for point-buy
 */
export const ABILITY_SCORE_MIN = 8;
export const ABILITY_SCORE_MAX = 15;

/**
 * Max ability score after racial bonuses
 */
export const ABILITY_SCORE_MAX_WITH_RACIAL = 20;
