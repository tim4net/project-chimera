/**
 * @file Leveling System - D&D 5e XP progression and level-up
 *
 * Handles:
 * - XP thresholds (PHB)
 * - Auto-level-up when threshold reached
 * - HP increases (hit die + CON modifier)
 * - Proficiency bonus increases
 * - Spell slot progression
 * - ASI (Ability Score Improvement) requirements
 * - Class features granted at each level
 * - Subclass features
 * - Cantrip damage scaling
 * - Spell learning progression
 * - Notifications
 */

import { supabaseServiceClient } from './supabaseClient';
import { rollDice } from '../game/dice';
import type { CharacterRecord } from '../types';
import { needsSubclassSelection, grantSubclassFeatures, getAvailableSubclasses } from './subclassService';
import type { SubclassFeature, Subclass } from '../data/subclasses';
import { getSpellSlotsForClass } from '../data/spellSlots';
import type { SpellSlotsByLevel } from '../data/spellSlots';
import { getFeaturesForLevel, type ClassFeature } from '../data/classFeatures';
import type { ClassName } from '../data/classTypes';

// ============================================================================
// XP THRESHOLDS (D&D 5e PHB)
// ============================================================================

const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

// Hit dice by class
const HIT_DICE: Record<string, string> = {
  Fighter: 'd10',
  Rogue: 'd8',
  Wizard: 'd6',
  Cleric: 'd8',
  Barbarian: 'd12',
  Ranger: 'd10',
  Paladin: 'd10',
  Bard: 'd8',
  Druid: 'd8',
  Monk: 'd8',
  Sorcerer: 'd6',
  Warlock: 'd8',
};

// ============================================================================
// LEVEL-UP DATA TYPES
// ============================================================================

/**
 * Comprehensive level-up result containing all D&D 5e progression data
 */
export interface LevelUpResult {
  leveledUp: boolean;
  newLevel?: number;
  hpGained?: number;
  proficiencyIncreased?: boolean;
  newProficiencyBonus?: number;

  // Spell progression
  newSpellSlots?: SpellSlotsByLevel;
  learnNewSpells?: number;
  learnNewCantrips?: number;
  cantripsDamageIncrease?: boolean;

  // Choices required
  requiresASI?: boolean;
  requiresSubclass?: boolean;
  availableSubclasses?: Subclass[];

  // Features granted
  newClassFeatures?: ClassFeature[];
  newSubclassFeatures?: SubclassFeature[];

  message?: string;
}

/**
 * Pending choices that must be resolved before continuing
 */
export interface PendingLevelUpChoices {
  hasPendingChoices: boolean;
  level: number;
  choices: {
    asi?: boolean;
    subclass?: boolean;
    spellsToLearn?: number;
    cantripsToLearn?: number;
  };
}

// ============================================================================
// SPELL PROGRESSION HELPERS
// ============================================================================

/**
 * Determine how many new spells a character learns at a given level
 *
 * Based on D&D 5e spellcasting progression:
 * - Full casters (Wizard, etc.): Learn 2 spells per level
 * - Prepared casters (Cleric, Druid, Paladin): Don't "learn" spells, they prepare from entire list
 * - Sorcerer/Bard: Limited spells known, learn at specific levels
 * - Warlock: Learn 1 spell per level
 */
function getNewSpellsLearnedCount(className: string, level: number): number {
  const normalizedClass = className.toLowerCase();

  // Prepared casters don't learn spells - they prepare from their class list
  if (['cleric', 'druid', 'paladin'].includes(normalizedClass)) {
    return 0;
  }

  // Wizard learns 2 spells per level
  if (normalizedClass === 'wizard') {
    return 2;
  }

  // Warlock learns spells at specific levels per PHB
  if (normalizedClass === 'warlock') {
    return level <= 10 ? 1 : (level % 2 === 1 ? 1 : 0);
  }

  // Sorcerer and Bard have limited spells known
  // They learn new spells at most levels, but not all
  if (['sorcerer', 'bard'].includes(normalizedClass)) {
    // At level 1, they get their starting spells (handled in character creation)
    // Each subsequent level typically grants 1 spell learned
    return level > 1 ? 1 : 0;
  }

  // Ranger learns spells at specific levels (half-caster)
  if (normalizedClass === 'ranger') {
    // Rangers learn spells at levels 2, 3, 5, 7, 9, 11, 13, 15, 17, 19
    const spellLearningLevels = [2, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    return spellLearningLevels.includes(level) ? 1 : 0;
  }

  // Non-casters
  return 0;
}

/**
 * Determine how many new cantrips a character learns at a given level
 */
function getNewCantripsCount(className: string, level: number): number {
  const normalizedClass = className.toLowerCase();

  // Cantrip progression varies by class
  // Most classes gain cantrips at levels 1, 4, 10

  if (['wizard', 'sorcerer', 'cleric', 'druid'].includes(normalizedClass)) {
    if (level === 4 || level === 10) return 1;
  }

  if (normalizedClass === 'bard') {
    if (level === 4 || level === 10) return 1;
  }

  if (normalizedClass === 'warlock') {
    if (level === 4 || level === 10) return 1;
  }

  return 0;
}

/**
 * Check if cantrip damage increases at this level
 * Cantrips scale at character levels 5, 11, 17
 */
function cantripsDamageIncreases(level: number): boolean {
  return [5, 11, 17].includes(level);
}

// ============================================================================
// ASI (ABILITY SCORE IMPROVEMENT) HELPERS
// ============================================================================

/**
 * Check if a level grants an Ability Score Improvement
 *
 * Standard ASI levels: 4, 8, 12, 16, 19
 * Fighter gets additional ASI at levels 6, 14
 * Rogue gets additional ASI at level 10
 */
function requiresASI(className: string, level: number): boolean {
  const standardASILevels = [4, 8, 12, 16, 19];

  if (standardASILevels.includes(level)) {
    return true;
  }

  const normalizedClass = className.toLowerCase();

  if (normalizedClass === 'fighter' && [6, 14].includes(level)) {
    return true;
  }

  if (normalizedClass === 'rogue' && level === 10) {
    return true;
  }

  return false;
}

// ============================================================================
// LEVEL-UP CHECK AND PROCESSING
// ============================================================================

/**
 * Check if character should level up and process if needed
 * Returns comprehensive level-up data including all D&D 5e features
 */
export async function checkAndProcessLevelUp(characterId: string): Promise<LevelUpResult> {

  // Get character data
  const { data: character, error } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (error || !character) {
    console.error('[LevelingSystem] Failed to fetch character');
    return { leveledUp: false };
  }

  const typedCharacter = character as CharacterRecord;
  const currentLevel = typedCharacter.level;
  const currentXP = typedCharacter.xp;

  // Check if ready to level up
  const nextLevelThreshold = XP_THRESHOLDS[currentLevel + 1];

  if (!nextLevelThreshold || currentXP < nextLevelThreshold) {
    return { leveledUp: false }; // Not ready yet
  }

  // LEVEL UP!
  const newLevel = currentLevel + 1;

  console.log(`[LevelingSystem] ${typedCharacter.name} levels up! ${currentLevel} → ${newLevel}`);

  // ========================================
  // Calculate HP increase
  // ========================================
  const hitDie = HIT_DICE[typedCharacter.class] || 'd8';
  const hitDieRoll = rollDice(`1${hitDie}`);
  const conMod = Math.floor((typedCharacter.ability_scores.CON - 10) / 2);
  const hpGain = Math.max(1, hitDieRoll.total + conMod); // Minimum 1 HP per level

  const newHPMax = typedCharacter.hp_max + hpGain;
  const newHPCurrent = typedCharacter.hp_current + hpGain; // Also heal by the amount

  // ========================================
  // Calculate new proficiency bonus
  // ========================================
  const oldProficiencyBonus = typedCharacter.proficiency_bonus;
  const newProficiencyBonus = Math.floor((newLevel - 1) / 4) + 2;
  const proficiencyIncreased = newProficiencyBonus > oldProficiencyBonus;

  // ========================================
  // Spell progression
  // ========================================
  const newSpellSlots = getSpellSlotsForClass(typedCharacter.class, newLevel);
  const learnNewSpells = getNewSpellsLearnedCount(typedCharacter.class, newLevel);
  const learnNewCantrips = getNewCantripsCount(typedCharacter.class, newLevel);
  const cantripsDamageIncrease = cantripsDamageIncreases(newLevel);

  // ========================================
  // Check for ASI requirement
  // ========================================
  const requiresASIChoice = requiresASI(typedCharacter.class, newLevel);

  // ========================================
  // Check for subclass selection
  // ========================================
  const needsSubclass = needsSubclassSelection({ ...typedCharacter, level: newLevel });

  // ========================================
  // Get class features for this level
  // ========================================
  let newClassFeatures: ClassFeature[] = [];
  try {
    newClassFeatures = getFeaturesForLevel(typedCharacter.class as ClassName, newLevel);
  } catch (err) {
    console.warn(`[LevelingSystem] Could not fetch class features for ${typedCharacter.class} level ${newLevel}:`, err);
  }

  // ========================================
  // Update character in database
  // ========================================
  const updateData: Partial<CharacterRecord> = {
    level: newLevel,
    hp_max: newHPMax,
    hp_current: newHPCurrent,
    proficiency_bonus: newProficiencyBonus,
  };

  // Update spell slots if character is a caster
  const hasSpellSlots = Object.values(newSpellSlots).some(slots => slots > 0);
  if (hasSpellSlots) {
    updateData.spell_slots = {
      level1: newSpellSlots.level1,
      level2: newSpellSlots.level2,
      level3: newSpellSlots.level3,
      level4: newSpellSlots.level4,
      level5: newSpellSlots.level5,
      level6: newSpellSlots.level6,
      level7: newSpellSlots.level7,
      level8: newSpellSlots.level8,
      level9: newSpellSlots.level9,
    };
  }

  const { data: updatedCharacter, error: updateError } = await supabaseServiceClient
    .from('characters')
    .update(updateData)
    .eq('id', characterId)
    .select()
    .single();

  if (updateError || !updatedCharacter) {
    console.error('[LevelingSystem] Failed to update character:', updateError);
    return { leveledUp: false };
  }

  const updatedTypedCharacter = updatedCharacter as CharacterRecord;

  // ========================================
  // Grant subclass features if applicable
  // ========================================
  let subclassFeatures: SubclassFeature[] = [];
  if (updatedTypedCharacter.subclass && !needsSubclass) {
    subclassFeatures = await grantSubclassFeatures(characterId, newLevel);
  }

  // ========================================
  // Build comprehensive message
  // ========================================
  let journalContent = `🎉 Level Up! You are now level ${newLevel}!\n\n`;
  journalContent += `• HP increased by ${hpGain} (${typedCharacter.hp_max} → ${newHPMax})\n`;

  if (proficiencyIncreased) {
    journalContent += `• Proficiency bonus increased to +${newProficiencyBonus}!\n`;
  }

  if (requiresASIChoice) {
    journalContent += `• ⚠️ You must choose an Ability Score Improvement or Feat!\n`;
  }

  if (newClassFeatures.length > 0) {
    journalContent += `\nNew class features:\n`;
    newClassFeatures.forEach(feature => {
      journalContent += `• ${feature.name}\n`;
    });
  }

  if (subclassFeatures.length > 0) {
    journalContent += `\nNew subclass features:\n`;
    subclassFeatures.forEach(feature => {
      journalContent += `• ${feature.name}\n`;
    });
  }

  if (hasSpellSlots) {
    journalContent += `\nSpell slots updated.\n`;
    if (learnNewSpells > 0) {
      journalContent += `• ⚠️ You can learn ${learnNewSpells} new spell${learnNewSpells > 1 ? 's' : ''}!\n`;
    }
    if (learnNewCantrips > 0) {
      journalContent += `• ⚠️ You can learn ${learnNewCantrips} new cantrip${learnNewCantrips > 1 ? 's' : ''}!\n`;
    }
    if (cantripsDamageIncrease) {
      journalContent += `• Your cantrips now deal increased damage!\n`;
    }
  }

  if (needsSubclass) {
    journalContent += `\n⚠️ You must choose your subclass before continuing!\n`;
  }

  // Create journal entry
  await supabaseServiceClient
    .from('journal_entries')
    .insert({
      character_id: characterId,
      entry_type: 'system',
      content: journalContent,
      metadata: {
        level_up: true,
        old_level: currentLevel,
        new_level: newLevel,
        hp_gained: hpGain,
        new_proficiency: newProficiencyBonus,
        proficiency_increased: proficiencyIncreased,
        requires_asi: requiresASIChoice,
        requires_subclass: needsSubclass,
        new_spells_count: learnNewSpells,
        new_cantrips_count: learnNewCantrips,
        cantrips_damage_increase: cantripsDamageIncrease,
        class_features: newClassFeatures,
        subclass_features: subclassFeatures,
      },
    });

  // Build user-facing message
  let message = `🎉 LEVEL UP! You've reached level ${newLevel}!`;
  message += ` Your maximum HP increased by ${hpGain} (now ${newHPMax})`;
  if (proficiencyIncreased) {
    message += `, and your proficiency bonus increased to +${newProficiencyBonus}`;
  }
  message += '!';

  if (requiresASIChoice) {
    message += `\n\n⚠️ You must choose an Ability Score Improvement or a Feat.`;
  }

  if (newClassFeatures.length > 0) {
    message += `\n\nYou gained new class features: ${newClassFeatures.map(f => f.name).join(', ')}`;
  }

  if (subclassFeatures.length > 0) {
    message += `\n\nYou gained new subclass features: ${subclassFeatures.map(f => f.name).join(', ')}`;
  }

  if (needsSubclass) {
    message += `\n\n⚠️ You must now choose your subclass!`;
  }

  return {
    leveledUp: true,
    newLevel,
    hpGained: hpGain,
    proficiencyIncreased,
    newProficiencyBonus,
    newSpellSlots: hasSpellSlots ? newSpellSlots : undefined,
    learnNewSpells: learnNewSpells > 0 ? learnNewSpells : undefined,
    learnNewCantrips: learnNewCantrips > 0 ? learnNewCantrips : undefined,
    cantripsDamageIncrease: cantripsDamageIncrease || undefined,
    requiresASI: requiresASIChoice,
    requiresSubclass: needsSubclass,
    availableSubclasses: needsSubclass ? getAvailableSubclasses(updatedTypedCharacter.class) : undefined,
    newClassFeatures,
    newSubclassFeatures: subclassFeatures,
    message,
  };
}

// ============================================================================
// PENDING CHOICES CHECK
// ============================================================================

/**
 * Check if a character has pending level-up choices that must be resolved
 *
 * This is useful for displaying modals or blocking gameplay until choices are made
 */
export async function checkPendingLevelUpChoices(characterId: string): Promise<PendingLevelUpChoices> {
  const { data: character, error } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (error || !character) {
    console.error('[LevelingSystem] Failed to fetch character for pending choices check');
    return { hasPendingChoices: false, level: 1, choices: {} };
  }

  const typedCharacter = character as CharacterRecord;
  const level = typedCharacter.level;
  const choices: PendingLevelUpChoices['choices'] = {};
  let hasPending = false;

  // Check for pending ASI
  // (This would need to be tracked in the database, e.g., a 'pending_asi' field)
  // For now, we'll assume ASI is handled immediately in the level-up flow

  // Check for pending subclass
  if (needsSubclassSelection(typedCharacter)) {
    choices.subclass = true;
    hasPending = true;
  }

  // Check for pending spell/cantrip choices
  // (This would also need database tracking)
  // Example: if character has unspent spell learning choices

  return {
    hasPendingChoices: hasPending,
    level,
    choices,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return XP_THRESHOLDS[currentLevel + 1] || Number.MAX_SAFE_INTEGER;
}

/**
 * Get XP progress percentage to next level
 */
export function getXPProgress(currentLevel: number, currentXP: number): number {
  const currentThreshold = XP_THRESHOLDS[currentLevel];
  const nextThreshold = XP_THRESHOLDS[currentLevel + 1];

  if (!nextThreshold) return 100; // Max level

  const xpIntoLevel = currentXP - currentThreshold;
  const xpNeededForLevel = nextThreshold - currentThreshold;

  return Math.floor((xpIntoLevel / xpNeededForLevel) * 100);
}
