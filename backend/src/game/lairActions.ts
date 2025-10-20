/**
 * @file D&D 5e Lair Actions System
 *
 * Implements lair actions for legendary creatures in their lairs.
 * Lair actions occur on initiative count 20 (losing initiative ties).
 *
 * Key Rules:
 * - Lair actions trigger on initiative count 20
 * - Only one lair action per round
 * - Lair actions are available only when creature is in its lair
 * - Some lair actions have saving throws or other effects
 */

import { LairAction, Monster } from '../data/monsters';
import { ALL_MONSTERS } from '../data/monsters';

export interface LairActionState {
  available: boolean; // Whether lair actions are enabled for this encounter
  lastUsedInitiative: number; // Initiative count when last lair action occurred
  currentInitiative: number; // Current initiative count in combat
  hasTriggeredThisRound: boolean; // Whether a lair action has occurred this round
}

export interface LairActionTarget {
  name: string;
  id?: string;
  armorClass?: number;
  savingThrows?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
}

export interface LairActionEnvironment {
  terrain?: string;
  conditions?: string[];
  temperature?: string;
  lighting?: string;
}

export interface LairActionResult {
  success: boolean;
  action: LairAction;
  targets: LairActionTarget[];
  effects: string[];
  damage?: {
    target: string;
    amount: number;
    type: string;
  }[];
  message: string;
}

/**
 * Creates a new lair action state.
 * @param available - Whether lair actions are enabled (creature must be in its lair)
 * @returns A new lair action state
 */
export function createLairActionState(available = true): LairActionState {
  return {
    available,
    lastUsedInitiative: -1,
    currentInitiative: 0,
    hasTriggeredThisRound: false,
  };
}

/**
 * Determines if a lair action should trigger on the current initiative count.
 * Lair actions occur on initiative count 20 (losing ties).
 * @param initiative - Current initiative count
 * @returns True if lair action should trigger
 */
export function shouldTriggerLairAction(initiative: number): boolean {
  return initiative === 20;
}

/**
 * Checks if a lair action can be taken in the current state.
 * @param state - The current lair action state
 * @param currentInitiative - The current initiative count
 * @returns True if a lair action can be taken
 */
export function canTakeLairAction(
  state: LairActionState,
  currentInitiative: number
): boolean {
  return (
    state.available &&
    shouldTriggerLairAction(currentInitiative) &&
    !state.hasTriggeredThisRound
  );
}

/**
 * Marks that a lair action has been taken this round.
 * @param state - The lair action state to update
 * @param initiative - The initiative count when the action was taken
 */
export function takeLairAction(state: LairActionState, initiative: number): void {
  state.hasTriggeredThisRound = true;
  state.lastUsedInitiative = initiative;
  state.currentInitiative = initiative;
}

/**
 * Resets lair action state for a new round of combat.
 * Called when initiative cycles back to the top.
 * @param state - The lair action state to reset
 */
export function resetLairActionForNewRound(state: LairActionState): void {
  state.hasTriggeredThisRound = false;
}

/**
 * Gets all lair actions for a specific monster by name.
 * @param monsterName - The name of the monster (case-insensitive)
 * @returns Array of lair actions, or empty array if none found
 */
export function getLairActionsForMonster(monsterName: string): LairAction[] {
  // Find monster by name (case-insensitive search)
  const monster = Object.values(ALL_MONSTERS).find(
    m => m.name.toLowerCase() === monsterName.toLowerCase()
  );

  if (!monster || !monster.lairActions) {
    return [];
  }

  return monster.lairActions;
}

/**
 * Gets lair actions by monster index.
 * @param monsterIndex - The monster's index key (e.g., "ancient-red-dragon")
 * @returns Array of lair actions, or empty array if none found
 */
export function getLairActionsByIndex(monsterIndex: string): LairAction[] {
  const monster = ALL_MONSTERS[monsterIndex];

  if (!monster || !monster.lairActions) {
    return [];
  }

  return monster.lairActions;
}

/**
 * Selects a random lair action from an array of available actions.
 * @param actions - Array of available lair actions
 * @returns A randomly selected lair action, or null if array is empty
 */
export function selectRandomLairAction(actions: LairAction[]): LairAction | null {
  if (actions.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * actions.length);
  return actions[randomIndex];
}

/**
 * Resolves a lair action's effects.
 * This is a simplified implementation - specific lair actions may need custom logic.
 * @param action - The lair action being resolved
 * @param targets - Potential targets in the area
 * @param environment - Environmental context
 * @returns The result of the lair action
 */
export function resolveLairAction(
  action: LairAction,
  targets: LairActionTarget[],
  environment: LairActionEnvironment = {}
): LairActionResult {
  const effects: string[] = [];
  const affectedTargets: LairActionTarget[] = [];
  const damageResults: { target: string; amount: number; type: string }[] = [];

  // Parse action description for common patterns
  const description = action.description.toLowerCase();

  // Check for saving throw requirements
  const saveDCMatch = action.description.match(/DC (\d+)/i);
  const saveDC = saveDCMatch ? parseInt(saveDCMatch[1], 10) : null;

  // Check for damage (handles both "1d8 fire damage" and "21 (6d6) fire damage" formats)
  const damageMatch = action.description.match(/(\d+d\d+(?:\s*[+\-]\s*\d+)?)\s*\)?\s*(\w+)\s+damage/i);

  // Check for area effects
  const hasAreaEffect = description.includes('each creature') ||
                        description.includes('all creatures') ||
                        description.includes('within');

  // Determine affected targets
  if (hasAreaEffect && targets.length > 0) {
    affectedTargets.push(...targets);
  } else if (targets.length > 0) {
    // Single target - pick first one
    affectedTargets.push(targets[0]);
  }

  // Build effects description
  effects.push(`Lair Action: ${action.name}`);

  if (affectedTargets.length > 0) {
    effects.push(`Affects ${affectedTargets.length} target(s)`);
  }

  if (saveDC) {
    effects.push(`Requires DC ${saveDC} saving throw`);
  }

  if (damageMatch) {
    const [, diceNotation, damageType] = damageMatch;
    effects.push(`Deals ${diceNotation} ${damageType} damage`);
  }

  // Construct result message
  let message = `${action.name}: ${action.description}`;

  if (affectedTargets.length > 0) {
    const targetNames = affectedTargets.map(t => t.name).join(', ');
    message += `\nTargets: ${targetNames}`;
  }

  return {
    success: true,
    action,
    targets: affectedTargets,
    effects,
    damage: damageResults.length > 0 ? damageResults : undefined,
    message,
  };
}

/**
 * Checks if a monster has lair actions available.
 * @param monster - The monster to check
 * @returns True if the monster has lair actions defined
 */
export function hasLairActions(monster: Monster): boolean {
  return Boolean(monster.lairActions && monster.lairActions.length > 0);
}

/**
 * Gets all monsters that have lair actions.
 * Useful for encounter building and DM reference.
 * @returns Array of monsters with lair actions
 */
export function getMonstersWithLairActions(): Monster[] {
  return Object.values(ALL_MONSTERS).filter(hasLairActions);
}

/**
 * Gets a formatted description of all lair actions for a monster.
 * Useful for displaying in UI or combat log.
 * @param monsterName - The name of the monster
 * @returns Formatted string describing all lair actions
 */
export function formatLairActionsDescription(monsterName: string): string {
  const actions = getLairActionsForMonster(monsterName);

  if (actions.length === 0) {
    return `${monsterName} has no lair actions.`;
  }

  const descriptions = actions.map((action, index) => {
    return `${index + 1}. ${action.name}: ${action.description}`;
  });

  return `${monsterName} Lair Actions (Initiative Count 20):\n${descriptions.join('\n')}`;
}

/**
 * Automatically selects and resolves a lair action for a monster.
 * Convenience function that combines selection and resolution.
 * @param monsterName - The name of the monster
 * @param state - The current lair action state
 * @param targets - Potential targets for the action
 * @param environment - Environmental context
 * @returns The result of the lair action, or null if no action taken
 */
export function autoResolveLairAction(
  monsterName: string,
  state: LairActionState,
  targets: LairActionTarget[],
  environment?: LairActionEnvironment
): LairActionResult | null {
  // Check if lair actions are available
  if (!state.available) {
    return null;
  }

  // Get available lair actions
  const actions = getLairActionsForMonster(monsterName);

  if (actions.length === 0) {
    return null;
  }

  // Select random action
  const selectedAction = selectRandomLairAction(actions);

  if (!selectedAction) {
    return null;
  }

  // Mark lair action as taken
  takeLairAction(state, 20);

  // Resolve the action
  return resolveLairAction(selectedAction, targets, environment);
}
