/**
 * @file Travel Worker
 *
 * Background worker that runs every minute to:
 * - Increment miles_traveled for active travel sessions
 * - Check if sessions have arrived at destination
 * - Roll for random encounters
 * - Generate and emit travel events via WebSocket
 * - Emit TRAVEL_PROGRESS updates
 */

import { supabaseServiceClient } from '../services/supabaseClient';
import { broadcastToCharacter } from '../websocket';
import { ServerEvents } from '../types/websocket';
import type { TravelProgressEvent } from '../types/websocket';
import type { TravelSession, TravelMode } from '../types/travel';
import { revealTilesInRadius } from '../services/fogOfWarService';
import {
  generateTravelEvent,
  calculateSeverity,
  autoResolveEvent,
} from '../services/travelService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TICK_INTERVAL_MS = 60000; // 1 real-time minute
const GAME_MINUTES_PER_TICK = 10; // 1 real-time minute = 10 in-game minutes

// Travel speeds in miles per in-game hour
const TRAVEL_SPEED_MPH: Record<TravelMode, number> = {
  cautious: 2,  // 2 mph in-game
  normal: 3,    // 3 mph in-game
  hasty: 4,     // 4 mph in-game
};

// Calculate miles per tick: speed_mph * (game_minutes_per_tick / 60 minutes_per_hour)
const MILES_PER_TICK: Record<TravelMode, number> = {
  cautious: 2 * (GAME_MINUTES_PER_TICK / 60), // 0.333 miles per tick
  normal: 3 * (GAME_MINUTES_PER_TICK / 60),   // 0.5 miles per tick
  hasty: 4 * (GAME_MINUTES_PER_TICK / 60),    // 0.667 miles per tick
};

// Encounter chances per tick (based on 10 game minutes)
const ENCOUNTER_CHANCE: Record<TravelMode, number> = {
  cautious: 0.01,  // 1% per 10 game minutes
  normal: 0.015,   // 1.5% per 10 game minutes
  hasty: 0.025,    // 2.5% per 10 game minutes
};

let workerInterval: NodeJS.Timeout | null = null;
let isRunning = false;

// ============================================================================
// WORKER FUNCTIONS
// ============================================================================

/**
 * Process a single travel session tick
 */
async function processTravelSessionTick(session: TravelSession): Promise<void> {
  const { id, character_id, miles_traveled, miles_total, travel_mode, destination_x, destination_y } = session;

  try {
    // Calculate miles to add this tick
    const milesThisTick = MILES_PER_TICK[travel_mode];
    const newMilesTraveled = Math.min(miles_traveled + milesThisTick, miles_total);
    const progressPercent = Math.min(100, Math.floor((newMilesTraveled / miles_total) * 100));

    // Check if session is complete
    const isComplete = newMilesTraveled >= miles_total;

    // Update session in database
    const updateData: Partial<TravelSession> = {
      miles_traveled: newMilesTraveled,
      updated_at: new Date().toISOString(),
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseServiceClient
      .from('travel_sessions')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error(`[TravelWorker] Failed to update session ${id}:`, updateError);
      return;
    }

    // Calculate estimated arrival
    const remainingMiles = miles_total - newMilesTraveled;
    const milesPerHour = MILES_PER_TICK[travel_mode] * 60;
    const hoursRemaining = remainingMiles / milesPerHour;
    const estimatedArrival = new Date();
    estimatedArrival.setHours(estimatedArrival.getHours() + hoursRemaining);

    // Emit TRAVEL_PROGRESS WebSocket event
    const progressPayload: TravelProgressEvent = {
      sessionId: id,
      milesTraveled: newMilesTraveled,
      milesTotal: miles_total,
      percentage: progressPercent,
      estimatedArrival: isComplete ? undefined : estimatedArrival.toISOString(),
    };
    broadcastToCharacter(character_id, ServerEvents.TRAVEL_PROGRESS, progressPayload);

    console.log(
      `[TravelWorker] Session ${id}: ${progressPercent}% complete ` +
      `(${newMilesTraveled.toFixed(2)}/${miles_total.toFixed(2)} miles)${isComplete ? ' - ARRIVED' : ''}`
    );

    // Calculate intermediate position along the path
    const { data: character } = await supabaseServiceClient
      .from('characters')
      .select('position_x, position_y, campaign_seed, game_time_minutes')
      .eq('id', character_id)
      .single();

    if (!character) {
      console.error(`[TravelWorker] Character ${character_id} not found`);
      return;
    }

    const currentX = character.position_x || 0;
    const currentY = character.position_y || 0;

    // Calculate direction to destination
    const dx = destination_x - currentX;
    const dy = destination_y - currentY;
    const distanceRemaining = Math.sqrt(dx * dx + dy * dy);

    // Calculate how far to move this tick (in tiles/miles)
    const moveDistance = Math.min(MILES_PER_TICK[travel_mode], distanceRemaining);

    // Calculate new position
    let newX = currentX;
    let newY = currentY;

    if (distanceRemaining > 0.01) {
      // Normalize direction and move
      const dirX = dx / distanceRemaining;
      const dirY = dy / distanceRemaining;
      newX = currentX + dirX * moveDistance;
      newY = currentY + dirY * moveDistance;
    } else {
      // Already at destination
      newX = destination_x;
      newY = destination_y;
    }

    // Update character position and advance game time
    const updatePayload: any = {
      position_x: newX,
      position_y: newY,
    };

    // Update game_time_minutes to track in-game time progression
    if (character.game_time_minutes !== undefined && character.game_time_minutes !== null) {
      updatePayload.game_time_minutes = (character.game_time_minutes || 0) + GAME_MINUTES_PER_TICK;
    } else {
      // Initialize game time if not set
      updatePayload.game_time_minutes = GAME_MINUTES_PER_TICK;
    }

    const { error: positionError } = await supabaseServiceClient
      .from('characters')
      .update(updatePayload)
      .eq('id', character_id);

    if (positionError) {
      console.error(`[TravelWorker] Failed to update character position:`, positionError);
      return;
    }

    const newGameTime = updatePayload.game_time_minutes;
    const gameHours = Math.floor(newGameTime / 60);
    const gameMinutes = newGameTime % 60;
    console.log(`[TravelWorker] Moved character to (${newX.toFixed(2)}, ${newY.toFixed(2)}) - Game time: ${gameHours}h ${gameMinutes}m`);

    // Discover tiles around current position
    try {
      await revealTilesInRadius(character.campaign_seed, Math.round(newX), Math.round(newY), 5, character_id);
      console.log(`[TravelWorker] Revealed tiles around character position for character ${character_id}`);
    } catch (error) {
      console.error(`[TravelWorker] Failed to discover tiles:`, error);
    }

    // If complete, mark session as done
    if (isComplete) {
      console.log(`[TravelWorker] Character ${character_id} arrived at destination (${destination_x}, ${destination_y})`);
      return;
    }

    // Roll for encounters (only if not complete)
    await rollForEncounter(session);
  } catch (error) {
    console.error(`[TravelWorker] Error processing session ${id}:`, error);
  }
}

/**
 * Roll for random encounter during travel
 */
async function rollForEncounter(session: TravelSession): Promise<void> {
  const { id, character_id, travel_mode } = session;

  // Check if there's already an unresolved event
  const { data: existingEvents } = await supabaseServiceClient
    .from('travel_events')
    .select('id')
    .eq('session_id', id)
    .eq('requires_response', true)
    .eq('resolved', false)
    .limit(1);

  if (existingEvents && existingEvents.length > 0) {
    // Don't generate new events if there's an unresolved one
    return;
  }

  // Roll for encounter
  const encounterRoll = Math.random();
  const encounterThreshold = ENCOUNTER_CHANCE[travel_mode];

  if (encounterRoll > encounterThreshold) {
    // No encounter this tick
    return;
  }

  console.log(`[TravelWorker] Encounter triggered for session ${id} (roll: ${encounterRoll.toFixed(3)} <= ${encounterThreshold})`);

  // Fetch character data for context
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('position_x, position_y, campaign_seed')
    .eq('id', character_id)
    .single();

  if (!character) {
    console.error(`[TravelWorker] Character ${character_id} not found`);
    return;
  }

  // Generate travel event using travelService
  try {
    // Fetch the session to pass to generateTravelEvent
    const { data: sessionData } = await supabaseServiceClient
      .from('travel_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!sessionData) {
      console.error(`[TravelWorker] Session ${id} not found`);
      return;
    }

    const regionContext = {
      biome: 'wilderness', // TODO: Get from world map
      danger_level: travel_mode === 'hasty' ? 3 : travel_mode === 'normal' ? 2 : 1,
      x: character.position_x,
      y: character.position_y,
    };

    const event = generateTravelEvent(
      sessionData as TravelSession,
      regionContext
    );

    // Insert event into database
    const { error: insertError } = await supabaseServiceClient
      .from('travel_events')
      .insert(event);

    if (insertError) {
      console.error(`[TravelWorker] Failed to insert event:`, insertError);
      return;
    }

    // Auto-resolve if not requiring response
    if (!event.requires_response) {
      const narration = autoResolveEvent(event);
      console.log(`[TravelWorker] Auto-resolved event ${event.id}: ${event.type} - ${narration}`);
    } else {
      console.log(
        `[TravelWorker] Generated event ${event.id} for session ${id}: ` +
        `${event.type} (${event.severity})`
      );

      // Emit event via WebSocket immediately
      const payload = {
        eventId: event.id,
        type: event.type,
        description: event.description,
        choices: event.choices,
        timestamp: Date.now(),
      };
      broadcastToCharacter(character_id, ServerEvents.TRAVEL_EVENT, payload);
    }
  } catch (error) {
    console.error(`[TravelWorker] Failed to generate travel event for session ${id}:`, error);
  }
}

/**
 * Main worker tick - processes all active travel sessions
 */
async function tick(): Promise<void> {
  try {
    // Fetch all active travel sessions
    const { data: sessions, error } = await supabaseServiceClient
      .from('travel_sessions')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('[TravelWorker] Failed to fetch active sessions:', error);
      return;
    }

    if (!sessions || sessions.length === 0) {
      // No active sessions - silent
      return;
    }

    console.log(`[TravelWorker] Processing ${sessions.length} active travel session(s)`);

    // Process each session
    for (const session of sessions) {
      await processTravelSessionTick(session as TravelSession);
    }
  } catch (error) {
    console.error('[TravelWorker] Error in tick:', error);
  }
}

// ============================================================================
// WORKER CONTROL
// ============================================================================

/**
 * Start the travel worker
 */
export function startTravelWorker(): void {
  if (isRunning) {
    console.log('[TravelWorker] Already running');
    return;
  }

  console.log(`[TravelWorker] Starting worker (tick interval: ${TICK_INTERVAL_MS}ms)`);

  // Run initial tick
  tick();

  // Schedule recurring ticks
  workerInterval = setInterval(() => {
    tick();
  }, TICK_INTERVAL_MS);

  isRunning = true;
}

/**
 * Stop the travel worker
 */
export function stopTravelWorker(): void {
  if (!isRunning) {
    console.log('[TravelWorker] Not running');
    return;
  }

  console.log('[TravelWorker] Stopping worker');

  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }

  isRunning = false;
}

/**
 * Check if worker is running
 */
export function isTravelWorkerRunning(): boolean {
  return isRunning;
}
