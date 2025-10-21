/**
 * Idle Task Service
 * Handles background tasks that complete while player is AFK
 */

import type { CharacterRecord } from '../types';
import { supabaseServiceClient } from './supabaseClient';
import { getModel } from './gemini';
import { generatePOI } from '../game/map';
import { discoverPOI } from './poiDiscoveryService';
import { revealTilesInRadius, revealTilesAlongPath } from './fogOfWarService';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

export type IdleTaskType = 'travel' | 'scout' | 'rest' | 'craft' | 'train';

export interface IdleTask {
  type: IdleTaskType;
  startedAt: Date;
  duration: number; // minutes
  destination?: { x: number; y: number }; // for travel
  parameters?: Record<string, any>; // task-specific params
}

export interface IdleTaskResult {
  success: boolean;
  narrative: string;
  xpGained: number;
  stateChanges: {
    position?: { x: number; y: number };
    hp?: number;
    xp?: number;
    gold?: number;
  };
  encountersTriggered: string[];
  itemsFound: string[];
  journalEntry?: string;
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

const TASK_DEFINITIONS: Record<IdleTaskType, {
  minDuration: number;
  maxDuration: number;
  description: string;
}> = {
  travel: {
    minDuration: 5, // 5 minutes minimum
    maxDuration: 60,
    description: 'Travel to a destination on the map',
  },
  scout: {
    minDuration: 10,
    maxDuration: 30,
    description: 'Explore the area around your current position',
  },
  rest: {
    minDuration: 5,
    maxDuration: 120,
    description: 'Rest to recover HP and spell slots',
  },
  craft: {
    minDuration: 15,
    maxDuration: 180,
    description: 'Craft items or potions (requires materials)',
  },
  train: {
    minDuration: 30,
    maxDuration: 240,
    description: 'Practice skills or abilities',
  },
};

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Start an idle task for a character
 */
export async function startIdleTask(
  characterId: string,
  taskType: IdleTaskType,
  parameters?: Record<string, any>
): Promise<{ success: boolean; message: string; estimatedCompletion: Date }> {
  // Validate task type
  if (!TASK_DEFINITIONS[taskType]) {
    return {
      success: false,
      message: `Invalid task type: ${taskType}`,
      estimatedCompletion: new Date()
    };
  }

  // Check if character already has an active task
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('idle_task, idle_task_started_at')
    .eq('id', characterId)
    .single();

  if (character?.idle_task) {
    return {
      success: false,
      message: `You're already ${character.idle_task}. Complete or cancel it first.`,
      estimatedCompletion: new Date()
    };
  }

  // Calculate duration based on task type and parameters
  const duration = calculateTaskDuration(taskType, parameters);
  const estimatedCompletion = new Date(Date.now() + duration * 60 * 1000);

  // Store task data
  const taskData = {
    type: taskType,
    startedAt: new Date(),
    duration,
    parameters,
  };

  const { error } = await supabaseServiceClient
    .from('characters')
    .update({
      idle_task: JSON.stringify(taskData),
      idle_task_started_at: new Date().toISOString(),
    })
    .eq('id', characterId);

  if (error) {
    return {
      success: false,
      message: error.message,
      estimatedCompletion: new Date()
    };
  }

  return {
    success: true,
    message: `Started ${taskType} task. It will complete in ${duration} minutes.`,
    estimatedCompletion,
  };
}

/**
 * Calculate task duration based on type and parameters
 */
function calculateTaskDuration(
  taskType: IdleTaskType,
  parameters?: Record<string, any>
): number {
  const def = TASK_DEFINITIONS[taskType];

  if (taskType === 'travel' && parameters?.destination) {
    // Calculate based on distance (1 minute per 10 tiles)
    const distance = parameters.distance || 10;
    return Math.min(Math.max(distance / 10, def.minDuration), def.maxDuration);
  }

  // Default to minimum duration
  return def.minDuration;
}

/**
 * Check if an idle task is complete
 */
export async function checkIdleTaskStatus(
  characterId: string
): Promise<{
  hasTask: boolean;
  isComplete: boolean;
  task?: IdleTask;
  remainingMinutes?: number;
}> {
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('idle_task, idle_task_started_at')
    .eq('id', characterId)
    .single();

  if (!character?.idle_task || !character.idle_task_started_at) {
    return { hasTask: false, isComplete: false };
  }

  let task: IdleTask;
  try {
    task = JSON.parse(character.idle_task);
  } catch {
    // Invalid JSON - clear the task
    await supabaseServiceClient
      .from('characters')
      .update({ idle_task: null, idle_task_started_at: null })
      .eq('id', characterId);
    return { hasTask: false, isComplete: false };
  }

  const startedAt = new Date(character.idle_task_started_at);
  const elapsedMinutes = (Date.now() - startedAt.getTime()) / (60 * 1000);
  const isComplete = elapsedMinutes >= task.duration;
  const remainingMinutes = Math.max(0, task.duration - elapsedMinutes);

  return {
    hasTask: true,
    isComplete,
    task,
    remainingMinutes,
  };
}

/**
 * Resolve a completed idle task and generate outcome
 */
export async function resolveIdleTask(
  characterId: string
): Promise<IdleTaskResult | { error: string }> {
  // Atomically fetch and parse task data
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (!character?.idle_task || !character.idle_task_started_at) {
    return { error: 'No active idle task' };
  }

  let task: IdleTask;
  try {
    task = JSON.parse(character.idle_task);
  } catch {
    return { error: 'Invalid task data' };
  }

  // Check if complete
  const startedAt = new Date(character.idle_task_started_at);
  const elapsedMinutes = (Date.now() - startedAt.getTime()) / (60 * 1000);

  if (elapsedMinutes < task.duration) {
    const remaining = Math.ceil(task.duration - elapsedMinutes);
    return { error: `Task not complete yet. ${remaining} minutes remaining.` };
  }

  // Generate outcome FIRST (before clearing task to prevent data loss on failure)
  const result = await generateTaskOutcome(task, character as CharacterRecord);

  // Now atomically clear the task to prevent race condition
  const { data: cleared, error: clearError } = await supabaseServiceClient
    .from('characters')
    .update({
      idle_task: null,
      idle_task_started_at: null,
    })
    .eq('id', characterId)
    .eq('idle_task', character.idle_task) // Only clear if task hasn't changed
    .select('id');

  if (clearError || !cleared || cleared.length === 0) {
    return { error: 'Task already claimed or was modified' };
  }

  // Apply state changes (map to correct DB columns)
  const updates: Record<string, any> = {};

  if (result.stateChanges.position) {
    updates.position_x = result.stateChanges.position.x;
    updates.position_y = result.stateChanges.position.y;
    updates.position = result.stateChanges.position; // Update both formats
  }

  if (typeof result.stateChanges.hp === 'number') {
    updates.hp_current = Math.max(0, result.stateChanges.hp);
  }

  if (typeof result.stateChanges.xp === 'number') {
    const currentXP = (character as any).xp || 0;
    updates.xp = currentXP + result.stateChanges.xp;
  }

  if (typeof result.stateChanges.gold === 'number') {
    const currentGold = (character as any).gold || 0;
    updates.gold = currentGold + result.stateChanges.gold;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabaseServiceClient
      .from('characters')
      .update(updates)
      .eq('id', characterId);

    if (updateError) {
      console.error('[IdleTaskService] Failed to apply state changes:', updateError);
    }
  }

  // Create journal entry if significant
  if (result.journalEntry) {
    await supabaseServiceClient
      .from('journal_entries')
      .insert({
        character_id: characterId,
        entry_type: 'idle_task',
        content: result.journalEntry,
        metadata: {
          taskType: task.type,
          completedAt: new Date().toISOString(),
        },
      });
  }

  // Reveal fog of war based on task type
  await revealFogForTask(task, character as CharacterRecord, result);

  return result;
}

// ============================================================================
// TASK OUTCOME GENERATION
// ============================================================================

/**
 * Generate outcome for a completed idle task using AI
 */
async function generateTaskOutcome(
  task: IdleTask,
  character: CharacterRecord
): Promise<IdleTaskResult> {
  try {
    const model = await getModel('flash');

    const prompt = buildTaskOutcomePrompt(task, character);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as IdleTaskResult;

    console.log('[IdleTaskService] Task outcome generated:', {
      type: task.type,
      success: parsed.success,
      xpGained: parsed.xpGained,
    });

    return parsed;
  } catch (error) {
    console.error('[IdleTaskService] Error generating outcome:', error);
    // Fallback to basic outcome
    return generateFallbackOutcome(task, character);
  }
}

/**
 * Build prompt for task outcome generation
 */
function buildTaskOutcomePrompt(task: IdleTask, character: CharacterRecord): string {
  return `You are The Chronicler, AI DM for a D&D 5e game. A character completed an idle task while away.

CHARACTER:
- Name: ${character.name}
- Race: ${character.race}, Class: ${character.class}, Level: ${character.level}
- Position: (${(character as any).position_x || 0}, ${(character as any).position_y || 0})
- HP: ${character.hp_current}/${character.hp_max}

TASK COMPLETED:
- Type: ${task.type}
- Duration: ${task.duration} minutes
${task.destination ? `- Destination: (${task.destination.x}, ${task.destination.y})` : ''}

Generate the outcome as a JSON object with this structure:
{
  "success": true/false,
  "narrative": "2-3 sentences describing what happened during the task",
  "xpGained": 0-50 (small amount for idle tasks),
  "stateChanges": {
    "position": {"x": number, "y": number} (if travel task),
    "hp": number (if rest task recovered HP),
    "xp": number (if xpGained > 0),
    "gold": number (if found treasure)
  },
  "encountersTriggered": [] (usually empty for idle tasks),
  "itemsFound": [] (rare - maybe 10% chance),
  "journalEntry": "string or null" (only for significant events)
}

GUIDELINES:
- Travel: Usually succeeds, moves to destination, small XP
- Scout: Might discover POIs, small encounters, minor loot
- Rest: Recovers HP (1d8 + CON per hour), no XP
- Most idle tasks are low-stakes and succeed
- Keep narrative brief and positive
- Rarely trigger combat (idle phase is safe)`;
}

/**
 * Fallback outcome if AI generation fails
 */
function generateFallbackOutcome(
  task: IdleTask,
  character: CharacterRecord
): IdleTaskResult {
  const baseOutcome: IdleTaskResult = {
    success: true,
    narrative: `You complete your ${task.type} task.`,
    xpGained: 10,
    stateChanges: {},
    encountersTriggered: [],
    itemsFound: [],
  };

  // Apply task-specific changes
  if (task.type === 'travel' && task.parameters?.destination) {
    baseOutcome.stateChanges.position = task.parameters.destination;
    baseOutcome.narrative = 'You arrive at your destination safely.';
  }

  if (task.type === 'rest') {
    const hpMissing = character.hp_max! - character.hp_current!;
    const maxRecovery = Math.floor(character.hp_max! * 0.5);
    const hpRecovered = Math.min(maxRecovery, hpMissing);
    baseOutcome.stateChanges.hp = character.hp_current! + hpRecovered;
    baseOutcome.narrative = `You rest and recover ${hpRecovered} HP.`;
    baseOutcome.xpGained = 0;
  }

  if (task.type === 'scout') {
    baseOutcome.narrative = 'You explore the surrounding area and find nothing unusual.';
  }

  return baseOutcome;
}

/**
 * Check for POI at destination and auto-discover
 */
async function checkForPOIDiscovery(
  characterId: string,
  destination: { x: number; y: number },
  campaignSeed: string
): Promise<string | null> {
  // Check if there's a POI at destination
  const poi = generatePOI(destination.x, destination.y, campaignSeed);

  if (!poi) {
    return null; // No POI here
  }

  // Auto-discover the POI
  const result = await discoverPOI(characterId, uuidv4(), poi.type, poi.name, poi.biome);

  if (result.success && result.content) {
    return `You've discovered ${poi.name}! ${result.content.description}`;
  }

  return null;
}

/**
 * Reveal fog of war based on completed task
 */
async function revealFogForTask(
  task: IdleTask,
  character: CharacterRecord,
  result: IdleTaskResult
): Promise<void> {
  const campaignSeed = character.campaign_seed;
  const startX = (character as any).position_x || 0;
  const startY = (character as any).position_y || 0;

  try {
    if (task.type === 'travel' && result.stateChanges.position) {
      // Reveal path from start to destination (3 tile width)
      await revealTilesAlongPath(
        campaignSeed,
        startX,
        startY,
        result.stateChanges.position.x,
        result.stateChanges.position.y,
        3, // 3 tiles on each side of path
        character.id
      );
    } else if (task.type === 'scout') {
      // Reveal large radius around current position
      await revealTilesInRadius(
        campaignSeed,
        startX,
        startY,
        15, // Scout reveals 15-tile radius
        character.id
      );
    } else if (task.type === 'rest' || task.type === 'craft' || task.type === 'train') {
      // These tasks don't reveal new areas (staying in place)
      // Just mark current position as visible
      await revealTilesInRadius(
        campaignSeed,
        startX,
        startY,
        2, // Small radius for local awareness
        character.id
      );
    }
  } catch (error) {
    console.error('[IdleTaskService] Failed to reveal fog:', error);
    // Don't fail the task if fog update fails
  }
}

