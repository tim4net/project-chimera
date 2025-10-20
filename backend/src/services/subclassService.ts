/**
 * Subclass Service
 *
 * Handles subclass selection, feature granting, and progression for D&D 5e characters.
 */

import { supabaseServiceClient } from './supabaseClient';
import { SUBCLASSES, type Subclass, type SubclassFeature } from '../data/subclasses';
import type { CharacterRecord, SubclassFeatureGrant } from '../types';

/**
 * Mapping of class names to the level at which they choose their subclass
 */
const SUBCLASS_SELECTION_LEVELS: Record<string, number> = {
  Barbarian: 3,
  Bard: 3,
  Cleric: 1,
  Druid: 2,
  Fighter: 3,
  Monk: 3,
  Paladin: 3,
  Ranger: 3,
  Rogue: 3,
  Sorcerer: 1,
  Warlock: 1,
  Wizard: 2
};

/**
 * Get the level at which a class chooses their subclass
 */
export function getSubclassSelectionLevel(className: string): number {
  const level = SUBCLASS_SELECTION_LEVELS[className];
  if (!level) {
    console.warn(`[SubclassService] Unknown class "${className}", defaulting to level 3`);
    return 3;
  }
  return level;
}

/**
 * Check if a character needs to select a subclass
 */
export function needsSubclassSelection(character: CharacterRecord): boolean {
  // Already has a subclass
  if (character.subclass) {
    return false;
  }

  const selectionLevel = getSubclassSelectionLevel(character.class);
  return character.level >= selectionLevel;
}

/**
 * Get all available subclasses for a specific class
 */
export function getAvailableSubclasses(className: string): Subclass[] {
  return Object.values(SUBCLASSES).filter(subclass => subclass.class === className);
}

/**
 * Get subclass data by name
 */
export function getSubclassData(subclassName: string): Subclass | null {
  return SUBCLASSES[subclassName] || null;
}

/**
 * Assign a subclass to a character and grant initial features
 */
export async function assignSubclass(
  characterId: string,
  subclassName: string
): Promise<void> {
  console.log(`[SubclassService] Assigning subclass "${subclassName}" to character ${characterId}`);

  // Get subclass data
  const subclassData = getSubclassData(subclassName);
  if (!subclassData) {
    throw new Error(`Invalid subclass: ${subclassName}`);
  }

  // Fetch character
  const { data: character, error: fetchError } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (fetchError || !character) {
    throw new Error(`Failed to fetch character: ${fetchError?.message || 'Not found'}`);
  }

  // Validate subclass is valid for character's class
  if (subclassData.class !== character.class) {
    throw new Error(
      `Subclass "${subclassName}" (${subclassData.class}) does not match character class "${character.class}"`
    );
  }

  // Validate character is at the correct level
  const selectionLevel = getSubclassSelectionLevel(character.class);
  if (character.level < selectionLevel) {
    throw new Error(
      `Character must be level ${selectionLevel} to select a ${character.class} subclass (current level: ${character.level})`
    );
  }

  // Grant features for current level and all previous levels
  const featuresToGrant = subclassData.features.filter(
    feature => feature.level <= character.level
  );

  const grantedFeatures: SubclassFeatureGrant[] = featuresToGrant.map(feature => ({
    name: feature.name,
    level: feature.level,
    description: feature.description,
    grantedAt: new Date().toISOString()
  }));

  console.log(`[SubclassService] Granting ${grantedFeatures.length} features to character ${characterId}`);

  // Update character with subclass and features
  const { error: updateError } = await supabaseServiceClient
    .from('characters')
    .update({
      subclass: subclassName,
      subclass_features: grantedFeatures
    })
    .eq('id', characterId);

  if (updateError) {
    throw new Error(`Failed to assign subclass: ${updateError.message}`);
  }

  console.log(`[SubclassService] Successfully assigned subclass "${subclassName}" to character ${characterId}`);
}

/**
 * Grant subclass features when a character levels up
 * Returns the new features granted at this level
 */
export async function grantSubclassFeatures(
  characterId: string,
  newLevel: number
): Promise<SubclassFeature[]> {
  console.log(`[SubclassService] Checking for new subclass features at level ${newLevel} for character ${characterId}`);

  // Fetch character
  const { data: character, error: fetchError } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (fetchError || !character) {
    throw new Error(`Failed to fetch character: ${fetchError?.message || 'Not found'}`);
  }

  // No subclass assigned yet
  if (!character.subclass) {
    console.log(`[SubclassService] Character ${characterId} has no subclass yet`);
    return [];
  }

  // Get subclass data
  const subclassData = getSubclassData(character.subclass);
  if (!subclassData) {
    console.error(`[SubclassService] Invalid subclass data for "${character.subclass}"`);
    return [];
  }

  // Find features that should be granted at this level
  const newFeatures = subclassData.features.filter(feature => feature.level === newLevel);

  if (newFeatures.length === 0) {
    console.log(`[SubclassService] No new subclass features at level ${newLevel}`);
    return [];
  }

  // Get existing granted features
  const existingFeatures: SubclassFeatureGrant[] = character.subclass_features || [];

  // Add new features
  const newGrants: SubclassFeatureGrant[] = newFeatures.map(feature => ({
    name: feature.name,
    level: feature.level,
    description: feature.description,
    grantedAt: new Date().toISOString()
  }));

  const updatedFeatures = [...existingFeatures, ...newGrants];

  console.log(`[SubclassService] Granting ${newGrants.length} new features to character ${characterId}`);

  // Update character with new features
  const { error: updateError } = await supabaseServiceClient
    .from('characters')
    .update({
      subclass_features: updatedFeatures
    })
    .eq('id', characterId);

  if (updateError) {
    throw new Error(`Failed to grant subclass features: ${updateError.message}`);
  }

  console.log(`[SubclassService] Successfully granted subclass features at level ${newLevel}`);
  return newFeatures;
}
