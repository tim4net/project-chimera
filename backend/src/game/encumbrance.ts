/**
 * @file D&D 5e Carrying Capacity and Encumbrance System
 *
 * Implements the carrying capacity rules from the D&D 5e Player's Handbook:
 * - Carrying Capacity: STR score × 15 pounds
 * - Push/Drag/Lift: STR score × 30 pounds
 * - Encumbered: Carrying > 5 × STR (speed -10 ft)
 * - Heavily Encumbered: Carrying > 10 × STR (speed -20 ft, disadvantage on ability checks)
 */

import type { CharacterRecord, EquipmentItem } from '../types';
import type { Weapon } from '../data/weapons';
import type { Armor } from '../data/armor';
import type { AdventuringGear } from '../data/gear';
import { weapons } from '../data/weapons';
import { armor } from '../data/armor';
import { gear } from '../data/gear';

// --- TYPE DEFINITIONS ---

export type EncumbranceLevel = 'normal' | 'encumbered' | 'heavily_encumbered';

export interface EncumbrancePenalties {
  speedPenalty: number; // Amount to subtract from speed in feet
  disadvantageOn: string[]; // List of check types with disadvantage
}

export interface EncumbranceStatus {
  currentWeight: number;
  carryingCapacity: number;
  pushDragLift: number;
  encumbranceLevel: EncumbranceLevel;
  penalties: EncumbrancePenalties;
  remainingCapacity: number;
}

// Interface for items with weight property
interface ItemWithWeight {
  weight: number;
  cost: number;
}

// --- PUBLIC API ---

/**
 * Calculates carrying capacity based on Strength score.
 * @param strScore - The character's Strength ability score
 * @returns The carrying capacity in pounds (STR × 15)
 */
export function calculateCarryingCapacity(strScore: number): number {
  if (strScore < 1) {
    throw new Error('Strength score must be at least 1');
  }
  return strScore * 15;
}

/**
 * Calculates the maximum weight a character can push, drag, or lift.
 * @param strScore - The character's Strength ability score
 * @returns The push/drag/lift capacity in pounds (STR × 30)
 */
export function calculatePushDragLift(strScore: number): number {
  if (strScore < 1) {
    throw new Error('Strength score must be at least 1');
  }
  return strScore * 30;
}

/**
 * Looks up an item's weight from the equipment database.
 * @param itemName - The name of the item
 * @returns The weight in pounds, or 0 if not found
 * @internal
 */
function _getItemWeight(itemName: string): number {
  // Normalize item name for lookup (lowercase, remove special characters)
  const normalizedName = itemName.toLowerCase().replace(/['\s]/g, '_');

  // Check weapons
  if (weapons[normalizedName]) {
    return (weapons[normalizedName] as Weapon).weight;
  }

  // Check armor
  if (armor[normalizedName]) {
    return (armor[normalizedName] as Armor).weight;
  }

  // Check gear
  if (gear[normalizedName]) {
    return (gear[normalizedName] as AdventuringGear).weight;
  }

  // Item not found in database - return 0 and log warning
  console.warn(`Weight not found for item: ${itemName} (normalized: ${normalizedName})`);
  return 0;
}

/**
 * Calculates the total weight of a list of equipment items.
 * @param items - Array of equipment items with names and quantities
 * @returns The total weight in pounds
 */
export function calculateTotalWeight(items: EquipmentItem[]): number {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const itemWeight = _getItemWeight(item.name);
    const quantity = item.quantity ?? 1;
    return total + (itemWeight * quantity);
  }, 0);
}

/**
 * Determines the character's encumbrance level based on carried weight.
 * @param carriedWeight - Current weight being carried in pounds
 * @param capacity - Maximum carrying capacity in pounds
 * @returns The encumbrance level
 */
export function getEncumbranceLevel(
  carriedWeight: number,
  capacity: number
): EncumbranceLevel {
  // Normal: 0 to 5×STR
  // Encumbered: (5×STR) to (10×STR)
  // Heavily Encumbered: (10×STR) to (15×STR = capacity)

  // Calculate thresholds
  const encumberedThreshold = capacity / 3; // 5×STR (since capacity = 15×STR)
  const heavilyEncumberedThreshold = (capacity * 2) / 3; // 10×STR

  if (carriedWeight <= encumberedThreshold) {
    return 'normal';
  } else if (carriedWeight <= heavilyEncumberedThreshold) {
    return 'encumbered';
  } else {
    return 'heavily_encumbered';
  }
}

/**
 * Determines if a character can carry an additional item.
 * @param character - The character attempting to carry the item
 * @param item - The item to be added
 * @returns True if the character can carry the item, false otherwise
 */
export function canCarry(character: CharacterRecord, item: EquipmentItem): boolean {
  const currentWeight = calculateTotalWeight(character.equipment ?? []);
  const itemWeight = _getItemWeight(item.name) * (item.quantity ?? 1);
  const capacity = calculateCarryingCapacity(character.ability_scores.STR);

  return (currentWeight + itemWeight) <= capacity;
}

/**
 * Gets the mechanical penalties for a given encumbrance level.
 * @param level - The encumbrance level
 * @returns An object describing speed penalties and disadvantage conditions
 */
export function getEncumbrancePenalties(level: EncumbranceLevel): EncumbrancePenalties {
  switch (level) {
    case 'normal':
      return {
        speedPenalty: 0,
        disadvantageOn: []
      };

    case 'encumbered':
      return {
        speedPenalty: 10,
        disadvantageOn: []
      };

    case 'heavily_encumbered':
      return {
        speedPenalty: 20,
        disadvantageOn: ['STR checks', 'DEX checks', 'CON checks', 'attack rolls using STR or DEX']
      };

    default:
      return {
        speedPenalty: 0,
        disadvantageOn: []
      };
  }
}

/**
 * Gets a complete encumbrance status report for a character.
 * @param character - The character to analyze
 * @returns A comprehensive encumbrance status object
 */
export function getEncumbranceStatus(character: CharacterRecord): EncumbranceStatus {
  const currentWeight = calculateTotalWeight(character.equipment ?? []);
  const capacity = calculateCarryingCapacity(character.ability_scores.STR);
  const level = getEncumbranceLevel(currentWeight, capacity);
  const penalties = getEncumbrancePenalties(level);

  return {
    currentWeight,
    carryingCapacity: capacity,
    pushDragLift: calculatePushDragLift(character.ability_scores.STR),
    encumbranceLevel: level,
    penalties,
    remainingCapacity: capacity - currentWeight
  };
}

/**
 * Calculates the effective speed of a character after applying encumbrance penalties.
 * @param baseSpeed - The character's base speed in feet
 * @param encumbranceLevel - The character's encumbrance level
 * @returns The effective speed after penalties (minimum 5 feet)
 */
export function calculateEffectiveSpeed(
  baseSpeed: number,
  encumbranceLevel: EncumbranceLevel
): number {
  const penalties = getEncumbrancePenalties(encumbranceLevel);
  const effectiveSpeed = baseSpeed - penalties.speedPenalty;

  // Minimum speed of 5 feet (can't go below 5 unless immobilized)
  return Math.max(5, effectiveSpeed);
}
