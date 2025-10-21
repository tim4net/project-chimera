import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { supabaseServiceClient } from '../services/supabaseClient';
import { landmarkService } from '../services/landmarkService';
import { LocationService } from '../services/locationService';
import { generateTile } from '../game/map';

const router = Router();
const locationService = new LocationService();

router.get('/campaigns/:seed/npcs', requireAuth, async (req: Request, res: Response) => {
  const { seed } = req.params;

  try {
    const { data, error } = await supabaseServiceClient
      .from('world_npcs')
      .select('id, name, role, personality, state, current_location_type, current_location_id, current_position')
      .eq('campaign_seed', seed);

    if (error) {
      console.error('[Verification] Failed to fetch NPCs:', error);
      res.status(500).json({ error: 'Failed to fetch NPC records' });
      return;
    }

    const payload = (data ?? []).map(npc => ({
      id: npc.id,
      name: npc.name,
      role: npc.role,
      personality: npc.personality,
      state: npc.state,
      current_location: {
        type: npc.current_location_type,
        id: npc.current_location_id,
        position: npc.current_position,
      },
    }));

    res.status(200).json({ npcs: payload });
  } catch (error) {
    console.error('[Verification] Unexpected error while listing NPCs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/campaigns/:seed/landmarks', requireAuth, async (req: Request, res: Response) => {
  const { seed } = req.params;

  try {
    const { data, error } = await supabaseServiceClient
      .from('world_landmarks')
      .select('id, name, type, position, nearest_settlement_name')
      .eq('campaign_seed', seed);

    if (error) {
      console.error('[Verification] Failed to fetch landmarks:', error);
      res.status(500).json({ error: 'Failed to fetch landmark records' });
      return;
    }

    const payload = (data ?? []).map(landmark => ({
      id: landmark.id,
      name: landmark.name,
      type: landmark.type,
      position: landmark.position,
      nearest_settlement: landmark.nearest_settlement_name,
    }));

    res.status(200).json({ landmarks: payload });
  } catch (error) {
    console.error('[Verification] Unexpected error while listing landmarks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/characters/:id/npcs', requireAuth, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { id: characterId } = req.params;

  try {
    const { data: character, error: characterError } = await supabaseServiceClient
      .from('characters')
      .select('id')
      .eq('id', characterId)
      .eq('user_id', authenticatedReq.user.id)
      .single();

    if (characterError || !character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    const { data: reputationRows, error: reputationError } = await supabaseServiceClient
      .from('character_npc_reputation')
      .select('npc_id, reputation_score, quests_given, quests_completed, last_interaction_at')
      .eq('character_id', characterId);

    if (reputationError) {
      console.error('[Verification] Failed to fetch NPC reputations:', reputationError);
      res.status(500).json({ error: 'Failed to fetch NPC reputation records' });
      return;
    }

    const reputations = reputationRows ?? [];

    if (reputations.length === 0) {
      res.status(200).json({ interactions: [] });
      return;
    }

    const npcIds = reputations.map(entry => entry.npc_id);
    const { data: npcRows, error: npcError } = await supabaseServiceClient
      .from('world_npcs')
      .select('id, name')
      .in('id', npcIds);

    if (npcError) {
      console.error('[Verification] Failed to fetch NPC names:', npcError);
      res.status(500).json({ error: 'Failed to resolve NPC details' });
      return;
    }

    const npcNameLookup = new Map<string, string>(
      (npcRows ?? []).map(npc => [npc.id, npc.name])
    );

    const interactions = reputations.map(entry => ({
      npc_id: entry.npc_id,
      npc_name: npcNameLookup.get(entry.npc_id) ?? null,
      reputation_score: entry.reputation_score,
      quests_given: entry.quests_given,
      quests_completed: entry.quests_completed,
      last_interaction_at: entry.last_interaction_at,
    }));

    res.status(200).json({ interactions });
  } catch (error) {
    console.error('[Verification] Unexpected error while listing character NPC interactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/characters/:id/location', requireAuth, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const { id: characterId } = req.params;

  try {
    const { data: character, error: characterError } = await supabaseServiceClient
      .from('characters')
      .select('id, campaign_seed, position, position_x, position_y')
      .eq('id', characterId)
      .eq('user_id', authenticatedReq.user.id)
      .single();

    if (characterError || !character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    const position = {
      x: (character.position?.x ?? character.position_x ?? 0) as number,
      y: (character.position?.y ?? character.position_y ?? 0) as number,
    };

    const context = await locationService.buildLocationContext(
      character.campaign_seed,
      position,
      { persist: false }
    );

    const tile = generateTile(position.x, position.y, character.campaign_seed);

    const nearestSettlement = context.nearestSettlement
      ? {
          name: context.nearestSettlement.name,
          distance: context.nearestSettlement.distance,
        }
      : null;

    const nearestRoad = context.nearestRoad
      ? {
          name: buildRoadName(context.nearestRoad.fromSettlementName, context.nearestRoad.toSettlementName),
          distance: context.nearestRoad.distance,
        }
      : null;

    const locationType = determineLocationType(nearestSettlement, nearestRoad);

    res.status(200).json({
      position,
      biome: tile.biome,
      nearest_settlement: nearestSettlement,
      nearest_road: nearestRoad,
      location_type: locationType,
    });
  } catch (error) {
    console.error('[Verification] Unexpected error while fetching character location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/campaigns/:seed/map', requireAuth, async (req: Request, res: Response) => {
  const { seed } = req.params;
  const x = Number(req.query.x);
  const y = Number(req.query.y);
  const radius = req.query.radius !== undefined ? Number(req.query.radius) : 10;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    res.status(400).json({ error: 'Invalid coordinates provided' });
    return;
  }

  if (!Number.isFinite(radius) || radius <= 0) {
    res.status(400).json({ error: 'Radius must be a positive number' });
    return;
  }

  try {
    const position = { x, y };
    const tile = generateTile(x, y, seed);
    const context = await locationService.buildLocationContext(
      seed,
      position,
      { radius, persist: false }
    );

    const nearbyLandmarks = await landmarkService.getNearbyLandmarks(seed, position, radius);

    const roads = context.roadsWithinRadius.map(road => ({
      id: road.id,
      from: road.fromSettlementName,
      to: road.toSettlementName,
      length: road.length,
      averageTraversalCost: road.averageTraversalCost,
    }));

    res.status(200).json({
      position,
      radius,
      biome: tile.biome,
      terrain: {
        elevation: tile.elevation,
        traversable: tile.traversable,
        explored: tile.explored,
      },
      nearby_landmarks: nearbyLandmarks,
      roads,
    });
  } catch (error) {
    console.error('[Verification] Unexpected error while fetching map context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function buildRoadName(from: string | null, to: string | null): string | null {
  if (!from && !to) {
    return null;
  }

  if (from && to) {
    return `${from} – ${to} Road`;
  }

  const name = from ?? to;
  return name ? `${name} Road` : null;
}

function determineLocationType(
  nearestSettlement: { distance: number } | null,
  nearestRoad: { distance: number } | null
): 'in_town' | 'on_road' | 'wilderness' {
  if (nearestSettlement && nearestSettlement.distance <= 0.5) {
    return 'in_town';
  }

  if (nearestRoad && nearestRoad.distance <= 0.5) {
    return 'on_road';
  }

  return 'wilderness';
}

export default router;
