/**
 * @file D&D 5e Crafting and Downtime Activities System
 *
 * Implements crafting rules and downtime activities from the D&D 5e Player's Handbook:
 * - Crafting: Create items with time investment and material costs
 * - Downtime Activities: Practicing profession, recuperating, researching, training
 *
 * Crafting Rules:
 * - Crafting Time: (Item Cost in GP / 5) days
 * - Crafting Cost: Half the item's market price
 * - Tool Proficiency: Required for most items
 * - Daily Progress: 5 gp worth of work per day
 */

import type { CharacterRecord, EquipmentItem } from '../types';
import type { Weapon } from '../data/weapons';
import type { Armor } from '../data/armor';
import type { AdventuringGear } from '../data/gear';
import type { Tool } from '../data/tools';
import { weapons } from '../data/weapons';
import { armor } from '../data/armor';
import { gear } from '../data/gear';
import { ARTISAN_TOOLS } from '../data/tools';

// --- TYPE DEFINITIONS ---

export type DowntimeActivityType =
  | 'crafting'
  | 'practicing_profession'
  | 'recuperating'
  | 'researching'
  | 'training';

export interface CraftingRequirements {
  itemCost: number; // Market price in GP
  craftingCost: number; // Material cost (half of market price)
  craftingTime: number; // Time in days
  requiredTool: string | null; // Tool proficiency required
  canCraft: boolean;
  reason?: string; // Explanation if character cannot craft
}

export interface DowntimeResult {
  activity: DowntimeActivityType;
  daysSpent: number;
  outcome: 'success' | 'partial' | 'failure';
  rewards?: {
    gold?: number;
    item?: EquipmentItem;
    knowledge?: string;
    training?: string;
  };
  description: string;
}

export interface CraftingProgress {
  itemName: string;
  totalCost: number;
  totalDays: number;
  daysCompleted: number;
  progressPercentage: number;
  isComplete: boolean;
}

// --- HELPER FUNCTIONS ---

/**
 * Looks up an item's cost from the equipment database.
 * @param itemName - The name of the item
 * @returns The cost in gold pieces, or null if not found
 * @internal
 */
function _getItemCost(itemName: string): number | null {
  const normalizedName = itemName.toLowerCase().replace(/['\s]/g, '_');

  // Check weapons
  if (weapons[normalizedName]) {
    return (weapons[normalizedName] as Weapon).cost;
  }

  // Check armor
  if (armor[normalizedName]) {
    return (armor[normalizedName] as Armor).cost;
  }

  // Check gear
  if (gear[normalizedName]) {
    return (gear[normalizedName] as AdventuringGear).cost;
  }

  return null;
}

/**
 * Determines which tool is required to craft a specific item.
 * @param itemName - The name of the item to craft
 * @returns The required tool name, or null if no tool is required
 * @internal
 */
function _getRequiredTool(itemName: string): string | null {
  const normalizedName = itemName.toLowerCase().replace(/['\s]/g, '_');

  // Weapons typically require Smith's Tools
  if (weapons[normalizedName]) {
    return "Smith's Tools";
  }

  // Armor typically requires Smith's Tools or Leatherworker's Tools
  if (armor[normalizedName]) {
    const armorItem = armor[normalizedName] as Armor;
    if (armorItem.armorType === 'Light' || armorItem.name.toLowerCase().includes('leather')) {
      return "Leatherworker's Tools";
    }
    return "Smith's Tools";
  }

  // Gear items depend on category
  if (gear[normalizedName]) {
    const gearItem = gear[normalizedName] as AdventuringGear;

    // Check gear category to determine tool
    if (gearItem.gearCategory.includes('Alchemical') || gearItem.name.toLowerCase().includes('potion')) {
      return "Alchemist's Supplies";
    }
    if (gearItem.name.toLowerCase().includes('rope') || gearItem.name.toLowerCase().includes('cloth')) {
      return "Weaver's Tools";
    }
    if (gearItem.name.toLowerCase().includes('wood') || gearItem.name.toLowerCase().includes('barrel')) {
      return "Carpenter's Tools";
    }
    // Most other gear can be crafted without special tools
    return null;
  }

  return null;
}

/**
 * Checks if a character has proficiency with a specific tool.
 * @param character - The character to check
 * @param toolName - The name of the tool
 * @returns True if the character has proficiency, false otherwise
 * @internal
 */
function _hasToolProficiency(character: CharacterRecord, toolName: string): boolean {
  if (!toolName || !character.skills) {
    return false;
  }

  // Parse the skills JSON string to check for tool proficiency
  try {
    const skills = typeof character.skills === 'string'
      ? JSON.parse(character.skills)
      : character.skills;

    // Check if skills object has a tools array or proficiencies array
    if (skills.tools && Array.isArray(skills.tools)) {
      return skills.tools.some((tool: string) =>
        tool.toLowerCase() === toolName.toLowerCase()
      );
    }

    if (skills.proficiencies && Array.isArray(skills.proficiencies)) {
      return skills.proficiencies.some((prof: string) =>
        prof.toLowerCase().includes(toolName.toLowerCase())
      );
    }
  } catch (error) {
    console.error('Error parsing character skills:', error);
  }

  return false;
}

// --- PUBLIC API ---

/**
 * Calculates the time required to craft an item (in days).
 * @param itemCost - The market price of the item in gold pieces
 * @returns The number of days required to craft the item
 */
export function calculateCraftingTime(itemCost: number): number {
  if (itemCost <= 0) {
    return 1; // Minimum 1 day for any item
  }

  // D&D 5e rule: Progress at 5 gp per day
  const days = itemCost / 5;
  return Math.ceil(days);
}

/**
 * Calculates the material cost to craft an item.
 * @param itemCost - The market price of the item in gold pieces
 * @returns The material cost (half of market price)
 */
export function calculateCraftingCost(itemCost: number): number {
  return itemCost / 2;
}

/**
 * Determines if a character can craft a specific item.
 * @param character - The character attempting to craft
 * @param item - The item to craft (name only, or with quantity)
 * @returns An object with crafting requirements and feasibility
 */
export function canCraftItem(
  character: CharacterRecord,
  item: EquipmentItem
): CraftingRequirements {
  const itemCost = _getItemCost(item.name);

  // Item not found in database
  if (itemCost === null) {
    return {
      itemCost: 0,
      craftingCost: 0,
      craftingTime: 0,
      requiredTool: null,
      canCraft: false,
      reason: `Item "${item.name}" not found in equipment database`
    };
  }

  const craftingCost = calculateCraftingCost(itemCost);
  const craftingTime = calculateCraftingTime(itemCost);
  const requiredTool = _getRequiredTool(item.name);

  // Check if character has enough gold for materials
  if (character.gold < craftingCost) {
    return {
      itemCost,
      craftingCost,
      craftingTime,
      requiredTool,
      canCraft: false,
      reason: `Insufficient gold. Need ${craftingCost} gp for materials, but only have ${character.gold} gp`
    };
  }

  // Check if character has required tool proficiency
  if (requiredTool && !_hasToolProficiency(character, requiredTool)) {
    return {
      itemCost,
      craftingCost,
      craftingTime,
      requiredTool,
      canCraft: false,
      reason: `Missing tool proficiency: ${requiredTool}`
    };
  }

  // All requirements met
  return {
    itemCost,
    craftingCost,
    craftingTime,
    requiredTool,
    canCraft: true
  };
}

/**
 * Performs a downtime activity for a specified number of days.
 * @param character - The character performing the activity
 * @param activity - The type of downtime activity
 * @param days - Number of days to spend on the activity
 * @param context - Additional context (e.g., item name for crafting)
 * @returns The result of the downtime activity
 */
export function performDowntimeActivity(
  character: CharacterRecord,
  activity: DowntimeActivityType,
  days: number,
  context?: { itemName?: string; researchTopic?: string; languageOrTool?: string }
): DowntimeResult {
  switch (activity) {
    case 'crafting': {
      if (!context?.itemName) {
        return {
          activity,
          daysSpent: days,
          outcome: 'failure',
          description: 'No item specified for crafting'
        };
      }

      const craftingReqs = canCraftItem(character, { name: context.itemName });

      if (!craftingReqs.canCraft) {
        return {
          activity,
          daysSpent: 0,
          outcome: 'failure',
          description: craftingReqs.reason ?? 'Cannot craft this item'
        };
      }

      if (days < craftingReqs.craftingTime) {
        return {
          activity,
          daysSpent: days,
          outcome: 'partial',
          description: `Made progress on crafting ${context.itemName}. ${days}/${craftingReqs.craftingTime} days completed.`
        };
      }

      return {
        activity,
        daysSpent: craftingReqs.craftingTime,
        outcome: 'success',
        rewards: {
          item: { name: context.itemName, quantity: 1 }
        },
        description: `Successfully crafted ${context.itemName} after ${craftingReqs.craftingTime} days of work.`
      };
    }

    case 'practicing_profession': {
      // Earn 1 gp per day with tool proficiency or relevant skill
      const goldEarned = days * 1;

      return {
        activity,
        daysSpent: days,
        outcome: 'success',
        rewards: {
          gold: goldEarned
        },
        description: `Practiced your profession for ${days} days and earned ${goldEarned} gp.`
      };
    }

    case 'recuperating': {
      // Recover from diseases, poison, or other ailments
      // Typically requires CON saves, but simplified here
      return {
        activity,
        daysSpent: days,
        outcome: 'success',
        description: `Spent ${days} days recuperating. You recover from one disease or poison affecting you.`
      };
    }

    case 'researching': {
      if (!context?.researchTopic) {
        return {
          activity,
          daysSpent: days,
          outcome: 'failure',
          description: 'No research topic specified'
        };
      }

      // Research typically costs 1 gp per day and takes variable time
      const researchCost = days * 1;

      if (character.gold < researchCost) {
        return {
          activity,
          daysSpent: 0,
          outcome: 'failure',
          description: `Insufficient gold for research. Need ${researchCost} gp.`
        };
      }

      return {
        activity,
        daysSpent: days,
        outcome: 'success',
        rewards: {
          knowledge: context.researchTopic
        },
        description: `Researched "${context.researchTopic}" for ${days} days. You uncovered valuable information.`
      };
    }

    case 'training': {
      if (!context?.languageOrTool) {
        return {
          activity,
          daysSpent: days,
          outcome: 'failure',
          description: 'No language or tool specified for training'
        };
      }

      // Training requires 250 days and 1 gp per day (250 gp total)
      const requiredDays = 250;
      const requiredGold = requiredDays * 1;

      if (character.gold < requiredGold) {
        return {
          activity,
          daysSpent: 0,
          outcome: 'failure',
          description: `Insufficient gold for training. Need ${requiredGold} gp.`
        };
      }

      if (days < requiredDays) {
        return {
          activity,
          daysSpent: days,
          outcome: 'partial',
          description: `Training in progress for ${context.languageOrTool}. ${days}/${requiredDays} days completed.`
        };
      }

      return {
        activity,
        daysSpent: requiredDays,
        outcome: 'success',
        rewards: {
          training: context.languageOrTool
        },
        description: `Completed training in ${context.languageOrTool} after ${requiredDays} days.`
      };
    }

    default:
      return {
        activity,
        daysSpent: 0,
        outcome: 'failure',
        description: 'Unknown downtime activity'
      };
  }
}

/**
 * Gets the progress status of an ongoing crafting project.
 * @param itemName - The name of the item being crafted
 * @param daysCompleted - Number of days already spent crafting
 * @returns A crafting progress object
 */
export function getCraftingProgress(
  itemName: string,
  daysCompleted: number
): CraftingProgress {
  const itemCost = _getItemCost(itemName);

  if (itemCost === null) {
    return {
      itemName,
      totalCost: 0,
      totalDays: 0,
      daysCompleted: 0,
      progressPercentage: 0,
      isComplete: false
    };
  }

  const totalDays = calculateCraftingTime(itemCost);
  const progressPercentage = Math.min(100, (daysCompleted / totalDays) * 100);
  const isComplete = daysCompleted >= totalDays;

  return {
    itemName,
    totalCost: itemCost,
    totalDays,
    daysCompleted,
    progressPercentage,
    isComplete
  };
}
