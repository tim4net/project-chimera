/**
 * Character Creation Service
 *
 * Handles all character creation logic including validation,
 * calculation, and defaults. Extracted from route layer for
 * better separation of concerns and testability.
 */

import type { AbilityScores, CharacterRecord, NewCharacterRecord, TutorialState } from '../types';
import { validatePointBuy } from '../game/rules';
import { getStartingEquipment, getStartingGold as getEquipmentStartingGold } from '../game/equipment';
import {
  getRacialSpeed,
  getRacialLanguages,
  getRacialProficiencies,
  getDarkvisionRange
} from '../game/raceTraits';
import {
  calculateCharacterStats as calcCharStats,
  applyRacialBonuses,
  getStartingGold as getCalculationsStartingGold,
  getClassHitDie
} from '../game/characterCalculations';
import { getSubclassSelectionLevel } from './subclassService';

// Global campaign seed - all players share this world
const GLOBAL_CAMPAIGN_SEED = 'nuaibria-shared-world-v1';

// Spellcaster class detection
const SPELLCASTING_CLASSES = ['Bard', 'Wizard', 'Cleric', 'Sorcerer', 'Warlock', 'Druid'];
const HALF_CASTERS = ['Paladin', 'Ranger']; // Get spells at level 2

export interface CharacterCreationData {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  abilityScores: AbilityScores;
  skills?: Record<string, unknown> | null;
  backstory?: Record<string, unknown> | null;
  portraitUrl?: string | null;
}

export interface CharacterDefaults {
  speed: number;
  campaignSeed: string;
  startingPosition: { x: number; y: number };
  startingEquipment: Array<{ name: string; quantity?: number }>;
  startingGold: number;
  racialLanguages: string[];
  racialProficiencies: string[];
  darkvisionRange?: number;
  tutorialState?: TutorialState;
  startingLevel: number;
}

export interface CharacterStats {
  finalScores: AbilityScores;
  modifiers: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  hp: number;
  ac: number;
  proficiencyBonus: number;
  spellSlots: Record<string, number>;
  hitDie: number;
}

/**
 * Validate character creation data
 * Throws descriptive errors if validation fails
 */
export function validateCharacterData(data: CharacterCreationData): void {
  // Check required fields
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Character name is required');
  }

  if (!data.race || data.race.trim().length === 0) {
    throw new Error('Race is required');
  }

  if (!data.class || data.class.trim().length === 0) {
    throw new Error('Class is required');
  }

  if (!data.background || data.background.trim().length === 0) {
    throw new Error('Background is required');
  }

  if (!data.alignment || data.alignment.trim().length === 0) {
    throw new Error('Alignment is required');
  }

  // Validate ability scores
  if (!data.abilityScores) {
    throw new Error('Ability scores are required');
  }

  const scores = data.abilityScores;
  const requiredAbilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  for (const ability of requiredAbilities) {
    if (typeof scores[ability as keyof AbilityScores] !== 'number') {
      throw new Error(`Ability score ${ability} must be a number`);
    }
  }

  // Validate point-buy before racial bonuses
  if (!validatePointBuy(scores)) {
    throw new Error('Invalid ability scores for point-buy system (must use 27 points, scores between 8-15)');
  }

  // Validate name length
  if (data.name.length > 100) {
    throw new Error('Character name must be 100 characters or less');
  }

  // Validate class name format
  const validClasses = [
    'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
    'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
    'Warlock', 'Wizard'
  ];

  if (!validClasses.includes(data.class)) {
    throw new Error(`Invalid class: ${data.class}. Must be one of: ${validClasses.join(', ')}`);
  }
}

/**
 * Generate character defaults (non-calculated values)
 */
export function generateCharacterDefaults(
  race: string,
  characterClass: string
): CharacterDefaults {
  const speed = getRacialSpeed(race);
  const campaignSeed = GLOBAL_CAMPAIGN_SEED;
  const startingPosition = { x: 500, y: 500 }; // Default position
  const startingEquipment = getStartingEquipment(characterClass);
  const startingGold = getEquipmentStartingGold(characterClass);
  const racialLanguages = getRacialLanguages(race);
  const racialProficiencies = getRacialProficiencies(race);
  const darkvisionRange = getDarkvisionRange(race);

  // Determine tutorial state
  const subclassLevel = getSubclassSelectionLevel(characterClass);
  let tutorialState: TutorialState | undefined = undefined;

  // Special case: if class needs subclass at level 1, mark it
  if (subclassLevel === 1) {
    tutorialState = 'needs_subclass';
  }

  const startingLevel = 1;

  return {
    speed,
    campaignSeed,
    startingPosition,
    startingEquipment,
    startingGold,
    racialLanguages,
    racialProficiencies,
    darkvisionRange,
    tutorialState,
    startingLevel
  };
}

/**
 * Calculate all character stats
 */
export function calculateStats(
  race: string,
  characterClass: string,
  baseAbilityScores: AbilityScores,
  level: number = 1
): CharacterStats {
  const stats = calcCharStats(race, characterClass, baseAbilityScores, level);

  return {
    finalScores: stats.finalScores,
    modifiers: stats.modifiers,
    hp: stats.hp,
    ac: stats.ac,
    proficiencyBonus: stats.proficiencyBonus,
    spellSlots: stats.spellSlots,
    hitDie: stats.hitDie
  };
}

/**
 * Create a complete character record ready for database insertion
 */
export function createCharacterRecord(
  data: CharacterCreationData,
  userId: string,
  startingPosition?: { x: number; y: number }
): NewCharacterRecord {
  // Validate first
  validateCharacterData(data);

  // Calculate stats
  const stats = calculateStats(
    data.race,
    data.class,
    data.abilityScores,
    1
  );

  // Generate defaults
  const defaults = generateCharacterDefaults(data.race, data.class);

  // Use provided starting position or default
  const position = startingPosition || defaults.startingPosition;

  // Map alignment to database format
  const alignmentMap: Record<string, string> = {
    'Lawful Good': 'LG',
    'Neutral Good': 'NG',
    'Chaotic Good': 'CG',
    'Lawful Neutral': 'LN',
    'True Neutral': 'N',
    'Neutral': 'N',
    'Chaotic Neutral': 'CN',
    'Lawful Evil': 'LE',
    'Neutral Evil': 'NE',
    'Chaotic Evil': 'CE'
  };
  const alignmentCode = alignmentMap[data.alignment] ?? data.alignment;

  // Check if character is a spellcaster
  const isSpellcaster = SPELLCASTING_CLASSES.includes(data.class);

  // Build character payload
  const characterPayload: NewCharacterRecord = {
    user_id: userId,
    name: data.name,
    race: data.race,
    class: data.class,
    background: data.background,
    alignment: alignmentCode,
    level: defaults.startingLevel,
    xp: 0,
    gold: defaults.startingGold,
    ability_scores: stats.finalScores,
    hp_max: stats.hp,
    hp_current: stats.hp,
    temporary_hp: 0,
    armor_class: stats.ac,
    speed: defaults.speed,
    hit_dice: { [stats.hitDie]: defaults.startingLevel },
    position_x: position.x,
    position_y: position.y,
    campaign_seed: defaults.campaignSeed,
    game_time_minutes: 0,
    world_date_day: 1,
    world_date_month: 1,
    world_date_year: 0,
    spell_slots: stats.spellSlots,
    backstory: data.backstory ? JSON.stringify(data.backstory) : null,
    skills: data.skills ? JSON.stringify(data.skills) : null,
    portrait_url: data.portraitUrl ?? null,
    proficiency_bonus: stats.proficiencyBonus,
    tutorial_state: defaults.tutorialState
  };

  return characterPayload;
}

/**
 * Get metadata about the character creation (for logging/display)
 */
export function getCharacterMetadata(
  race: string,
  characterClass: string,
  baseScores: AbilityScores,
  finalScores: AbilityScores
): {
  racialLanguages: string[];
  racialProficiencies: string[];
  darkvisionRange?: number;
  baseScores: AbilityScores;
  finalScores: AbilityScores;
  appliedBonuses: Partial<AbilityScores>;
} {
  const racialLanguages = getRacialLanguages(race);
  const racialProficiencies = getRacialProficiencies(race);
  const darkvisionRange = getDarkvisionRange(race);

  // Calculate applied bonuses
  const appliedBonuses: Partial<AbilityScores> = {
    STR: finalScores.STR - baseScores.STR,
    DEX: finalScores.DEX - baseScores.DEX,
    CON: finalScores.CON - baseScores.CON,
    INT: finalScores.INT - baseScores.INT,
    WIS: finalScores.WIS - baseScores.WIS,
    CHA: finalScores.CHA - baseScores.CHA
  };

  return {
    racialLanguages,
    racialProficiencies,
    darkvisionRange,
    baseScores,
    finalScores,
    appliedBonuses
  };
}
