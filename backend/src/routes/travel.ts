/**
 * @file Travel API Routes
 *
 * REST API endpoints for travel control with WebSocket event emission hooks.
 * Phase 3B - API Routes Implementation
 */

import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseServiceClient } from '../services/supabaseClient';
import {
  generateTravelEvent,
  calculateSeverity,
  autoResolveEvent,
} from '../services/travelService';
import { broadcastToCharacter } from '../websocket';
import { ServerEvents } from '../types/websocket';
import type {
  TravelSessionStartEvent,
  TravelEventEvent,
  TravelEventResolvedEvent,
} from '../types/websocket';
import type {
  TravelSession,
  TravelEvent,
  TravelMode,
  StartTravelRequest,
  StartTravelResponse,
  TravelStatusResponse,
  TravelChoiceRequest,
  TravelChoiceResponse,
  RegionContext,
} from '../types/travel';

const router = Router();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Euclidean distance between two points
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get destination coordinates (from POI or direct coordinates)
 */
async function getDestinationCoordinates(
  destinationId: string
): Promise<{ x: number; y: number } | null> {
  // Try to parse as direct coordinates (format: "x,y")
  if (destinationId.includes(',')) {
    const [x, y] = destinationId.split(',').map(s => parseFloat(s.trim()));
    if (!isNaN(x) && !isNaN(y)) {
      return { x, y };
    }
  }

  // Try to lookup as POI
  try {
    const { data: poi, error } = await supabaseServiceClient
      .from('world_pois')
      .select('x, y')
      .eq('id', destinationId)
      .single();

    if (!error && poi) {
      return { x: poi.x, y: poi.y };
    }
  } catch (error) {
    console.error('[Travel] Failed to lookup POI:', error);
  }

  return null;
}

/**
 * Calculate estimated arrival time based on distance and travel mode
 */
function calculateEstimatedArrival(miles: number, mode: TravelMode): Date {
  // Base speed in miles per hour
  const speedMap: Record<TravelMode, number> = {
    cautious: 2,
    normal: 3,
    hasty: 4,
  };

  const speed = speedMap[mode];
  const hoursToTravel = miles / speed;
  const estimatedArrival = new Date();
  estimatedArrival.setHours(estimatedArrival.getHours() + hoursToTravel);

  return estimatedArrival;
}

/**
 * Perform a skill check using the rule engine
 *
 * Note: This is a simplified version that creates a skill check action and executes it.
 * For full integration, this should be called through the main action processing pipeline.
 */
async function performSkillCheck(
  characterId: string,
  skill: string,
  dc: number
): Promise<{ roll: number; total: number; passed: boolean }> {
  try {
    // Fetch character data
    const { data: character, error: charError } = await supabaseServiceClient
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (charError || !character) {
      throw new Error('Character not found');
    }

    // Import ruleEngine dynamically to avoid circular dependencies
    const { executeAction } = await import('../services/ruleEngine');

    // Create skill check action with required properties
    const skillCheckAction = {
      type: 'SKILL_CHECK' as const,
      actionId: uuidv4(),
      actorId: characterId,
      skill: skill as any, // Cast to SkillName - travel service validates valid skill names
      dc,
      context: 'Travel event skill check',
      timestamp: Date.now(),
    };

    // Execute through rule engine
    const result = await executeAction(skillCheckAction, character);

    // Extract roll information
    const checkRoll = result.rolls?.check;
    if (!checkRoll) {
      throw new Error('Skill check did not return roll data');
    }

    return {
      roll: checkRoll.rolls[0] || 0,
      total: checkRoll.total,
      passed: result.success,
    };
  } catch (error) {
    console.error('[Travel] Skill check failed:', error);
    // Fallback to basic random roll
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = 2;
    const total = roll + modifier;
    return { roll, total, passed: total >= dc };
  }
}

// ============================================================================
// WEBSOCKET EVENT EMITTERS
// ============================================================================

/**
 * Emit a travel event to the character's WebSocket connection
 */
function emitTravelEvent(sessionId: string, characterId: string, event: TravelEvent): void {
  console.log(`[Travel WebSocket] Emitting travel event:`, {
    sessionId,
    characterId,
    eventType: event.type,
    eventId: event.id,
  });

  const payload: TravelEventEvent = {
    eventId: event.id,
    type: event.type,
    description: event.description,
    choices: event.choices,
    timestamp: Date.now(),
  };

  broadcastToCharacter(characterId, ServerEvents.TRAVEL_EVENT, payload);
}

/**
 * Emit travel progress update to the character's WebSocket connection
 */
function emitTravelProgress(
  characterId: string,
  sessionId: string,
  progress: { milesTraveled: number; milesTotal: number; progressPercent: number; estimatedArrival?: string }
): void {
  console.log(`[Travel WebSocket] Emitting travel progress:`, {
    characterId,
    sessionId,
    progress,
  });

  const payload = {
    sessionId,
    milesTraveled: progress.milesTraveled,
    milesTotal: progress.milesTotal,
    percentage: progress.progressPercent,
    estimatedArrival: progress.estimatedArrival,
  };

  broadcastToCharacter(characterId, ServerEvents.TRAVEL_PROGRESS, payload);
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/travel/start
 * Start a new travel session
 *
 * Body: { character_id, destination_id, travel_mode? }
 * Returns: { sessionId, milesTotal, estimatedArrival, travelMode, message }
 */
router.post('/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { character_id, destination_id, travel_mode = 'normal' } = req.body as StartTravelRequest;

    // Validate required fields
    if (!character_id || !destination_id) {
      res.status(400).json({ error: 'character_id and destination_id are required' });
      return;
    }

    // Validate character exists
    const { data: character, error: charError } = await supabaseServiceClient
      .from('characters')
      .select('id, position_x, position_y, campaign_seed')
      .eq('id', character_id)
      .single();

    if (charError || !character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Get destination coordinates
    const destination = await getDestinationCoordinates(destination_id);
    if (!destination) {
      res.status(404).json({ error: 'Destination not found or invalid' });
      return;
    }

    // Calculate real distance
    const milesTotal = calculateDistance(
      character.position_x,
      character.position_y,
      destination.x,
      destination.y
    );

    // Calculate estimated arrival
    const estimatedArrival = calculateEstimatedArrival(milesTotal, travel_mode);

    // Create travel session with real destination coordinates
    const sessionId = uuidv4();
    const travelSession: Partial<TravelSession> = {
      id: sessionId,
      character_id,
      destination_id,
      destination_x: destination.x,
      destination_y: destination.y,
      miles_total: milesTotal,
      miles_traveled: 0,
      travel_mode,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Insert into database with error handling
    const { error: insertError } = await supabaseServiceClient
      .from('travel_sessions')
      .insert(travelSession);

    if (insertError) {
      console.error('[Travel] Failed to create session:', insertError);
      res.status(500).json({
        error: 'Failed to create travel session',
        details: insertError.message
      });
      return;
    }

    console.log(`[Travel] Created session ${sessionId} for character ${character_id}: ${milesTotal.toFixed(1)} miles to (${destination.x}, ${destination.y})`);

    // Emit TRAVEL_SESSION_START WebSocket event
    const sessionStartPayload: TravelSessionStartEvent = {
      sessionId,
      destination: destination_id,
      milesTotal: Math.round(milesTotal * 10) / 10,
      dangerLevel: 1, // Default danger level, can be enhanced with region lookup
      timestamp: Date.now(),
    };
    broadcastToCharacter(character_id, ServerEvents.TRAVEL_SESSION_START, sessionStartPayload);

    const response: StartTravelResponse = {
      sessionId,
      milesTotal: Math.round(milesTotal * 10) / 10, // Round to 1 decimal
      estimatedArrival: estimatedArrival.toISOString(),
      travelMode: travel_mode,
      message: `Travel session started. Distance: ${Math.round(milesTotal * 10) / 10} miles. Estimated arrival: ${estimatedArrival.toLocaleString()}`,
    };

    res.json(response);
  } catch (error) {
    console.error('[Travel] Error starting travel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/travel/status?characterId=...
 * Get the current status of active travel session for a character (query-based)
 * Used by frontend to check travel status without knowing the session ID
 *
 * Query params: characterId (required)
 * Returns: { session, events, progressPercent, currentEvent } or empty response if no active session
 */
router.get('/status', async (req: Request, res: Response, next): Promise<void> => {
  try {
    const { characterId } = req.query as { characterId?: string };

    // If characterId is provided, handle it
    if (characterId) {
      // Find active travel session for this character
      const { data: session, error: sessionError } = await supabaseServiceClient
        .from('travel_sessions')
        .select('*')
        .eq('character_id', characterId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionError) {
        console.error('[Travel] Database error fetching active session:', sessionError);
        res.status(500).json({
          error: 'Failed to fetch travel session',
          details: sessionError.message
        });
        return;
      }

      if (!session) {
        // No active session - return empty/default response
        res.json({
          session: null,
          events: [],
          progressPercent: 0,
          currentEvent: null,
        });
        return;
      }

      // Fetch all travel events for this session
      const { data: events, error: eventsError } = await supabaseServiceClient
        .from('travel_events')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (eventsError) {
        console.error('[Travel] Database error fetching events:', eventsError);
        res.status(500).json({
          error: 'Failed to fetch travel events',
          details: eventsError.message
        });
        return;
      }

      // Calculate real progress percentage
      const progressPercent = session.miles_total > 0
        ? Math.min(100, Math.floor((session.miles_traveled / session.miles_total) * 100))
        : 0;

      // Find current unresolved event requiring player response
      const currentEvent = (events || []).find(e => e.requires_response && !e.resolved);

      console.log(`[Travel] Status for character ${characterId} (session ${session.id}): ${progressPercent}% complete, ${events?.length || 0} events`);

      const response: TravelStatusResponse = {
        session: session as TravelSession,
        events: (events || []) as TravelEvent[],
        progressPercent,
        currentEvent,
      };

      res.json(response);
      return;
    }

    // If no characterId, pass to next handler (parameterized route)
    next();
  } catch (error) {
    console.error('[Travel] Error fetching status by characterId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/travel/status/:sessionId
 * Get the current status of a travel session by session ID
 *
 * Returns: { session, events, progressPercent, currentEvent }
 */
router.get('/status/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.length === 0) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    // Fetch travel session from database
    const { data: session, error: sessionError } = await supabaseServiceClient
      .from('travel_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('[Travel] Database error fetching session:', sessionError);
      res.status(404).json({
        error: 'Travel session not found',
        details: sessionError.message
      });
      return;
    }

    if (!session) {
      res.status(404).json({ error: 'Travel session not found' });
      return;
    }

    // Fetch all travel events for this session from database
    const { data: events, error: eventsError } = await supabaseServiceClient
      .from('travel_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('[Travel] Database error fetching events:', eventsError);
      res.status(500).json({
        error: 'Failed to fetch travel events',
        details: eventsError.message
      });
      return;
    }

    // Calculate real progress percentage
    const progressPercent = session.miles_total > 0
      ? Math.min(100, Math.floor((session.miles_traveled / session.miles_total) * 100))
      : 0;

    // Find current unresolved event requiring player response
    const currentEvent = (events || []).find(e => e.requires_response && !e.resolved);

    // Emit TRAVEL_EVENT WebSocket event if there's an active event
    if (currentEvent && currentEvent.requires_response) {
      emitTravelEvent(sessionId, session.character_id, currentEvent as TravelEvent);
    }

    console.log(`[Travel] Status for session ${sessionId}: ${progressPercent}% complete, ${events?.length || 0} events, current event: ${currentEvent?.type || 'none'}`);

    const response: TravelStatusResponse = {
      session: session as TravelSession,
      events: (events || []) as TravelEvent[],
      progressPercent,
      currentEvent,
    };

    res.json(response);
  } catch (error) {
    console.error('[Travel] Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/travel/choose
 * Make a choice in response to a travel event
 *
 * Body: { sessionId, choiceLabel }
 * Returns: { success, consequence, skillCheck?, nextEvent?, sessionCompleted? }
 */
router.post('/choose', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, choiceLabel } = req.body as TravelChoiceRequest;

    // Validate required fields
    if (!sessionId || !choiceLabel) {
      res.status(400).json({ error: 'sessionId and choiceLabel are required' });
      return;
    }

    // Fetch current unresolved event
    const { data: events, error: eventsError } = await supabaseServiceClient
      .from('travel_events')
      .select('*')
      .eq('session_id', sessionId)
      .eq('requires_response', true)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (eventsError || !events || events.length === 0) {
      res.status(404).json({ error: 'No active travel event found' });
      return;
    }

    const currentEvent = events[0] as TravelEvent;

    // Find matching choice
    const choices = currentEvent.choices || [];
    const selectedChoice = choices.find(c => c.label === choiceLabel);

    if (!selectedChoice) {
      res.status(400).json({ error: 'Invalid choice label' });
      return;
    }

    let consequence = selectedChoice.consequence;
    let skillCheckResult = undefined;

    // Perform skill check if choice has DC - need to get character ID first
    if (selectedChoice.dc && selectedChoice.skill) {
      // Fetch session to get character_id
      const { data: session } = await supabaseServiceClient
        .from('travel_sessions')
        .select('character_id')
        .eq('id', sessionId)
        .single();

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const checkResult = await performSkillCheck(session.character_id, selectedChoice.skill, selectedChoice.dc);
      skillCheckResult = {
        skill: selectedChoice.skill,
        dc: selectedChoice.dc,
        roll: checkResult.roll,
        total: checkResult.total,
        passed: checkResult.passed,
      };

      // Modify consequence based on skill check result
      if (checkResult.passed) {
        consequence = `Success! ${consequence}`;
      } else {
        consequence = `Failed (${checkResult.total} vs DC ${selectedChoice.dc}). ${consequence}`;
      }
    }

    // Update event as resolved
    const { error: updateError } = await supabaseServiceClient
      .from('travel_events')
      .update({
        resolved: true,
        resolution: consequence,
      })
      .eq('id', currentEvent.id);

    if (updateError) {
      console.error('[Travel] Failed to update event:', updateError);
      res.status(500).json({ error: 'Failed to update event' });
      return;
    }

    // Fetch session to check if completed and get character_id
    const { data: session } = await supabaseServiceClient
      .from('travel_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const sessionCompleted = session && session.status === 'completed';

    // Emit TRAVEL_EVENT_RESOLVED WebSocket event
    if (session) {
      const resolvedPayload: TravelEventResolvedEvent = {
        sessionId,
        eventId: currentEvent.id,
        choice: choiceLabel,
        consequence,
        timestamp: Date.now(),
      };
      broadcastToCharacter(session.character_id, ServerEvents.TRAVEL_EVENT_RESOLVED, resolvedPayload);
    }

    const response: TravelChoiceResponse = {
      success: true,
      consequence,
      skillCheck: skillCheckResult,
      sessionCompleted,
    };

    res.json(response);
  } catch (error) {
    console.error('[Travel] Error processing choice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
