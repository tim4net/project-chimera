/**
 * Strategic Map API
 * Provides fullscreen world map data with fog of war
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { supabaseServiceClient } from '../services/supabaseClient';
import { getDiscoveredTiles, initializeStartingArea } from '../services/fogOfWarService';
import { generateTile } from '../game/map';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/strategic-map/:campaignSeed?minX=&maxX=&minY=&maxY=
 * Returns entire discovered region with fog of war state
 * Optional viewport parameters for performance with large datasets
 */
router.get('/:campaignSeed', requireAuth, async (req: Request, res: Response) => {
  try {
    const { campaignSeed } = req.params;
    const authenticatedReq = req as AuthenticatedRequest;

    // Verify user has a character in this campaign
    const { data: character } = await supabaseServiceClient
      .from('characters')
      .select('id, position_x, position_y')
      .eq('user_id', authenticatedReq.user.id)
      .eq('campaign_seed', campaignSeed)
      .single();

    if (!character) {
      res.status(404).json({ error: 'Character not found in this campaign' });
      return;
    }

    // Parse optional viewport bounds from query parameters
    let viewport: { minX: number; maxX: number; minY: number; maxY: number } | undefined;
    if (req.query.minX && req.query.maxX && req.query.minY && req.query.maxY) {
      const minX = parseInt(req.query.minX as string);
      const maxX = parseInt(req.query.maxX as string);
      const minY = parseInt(req.query.minY as string);
      const maxY = parseInt(req.query.maxY as string);

      // Validate viewport parameters
      if (!isNaN(minX) && !isNaN(maxX) && !isNaN(minY) && !isNaN(maxY) &&
          minX <= maxX && minY <= maxY) {
        viewport = { minX, maxX, minY, maxY };
        console.log('[StrategicMap] Using viewport bounds:', viewport);
      } else {
        console.warn('[StrategicMap] Invalid viewport parameters, fetching all tiles');
      }
    }

    // Get discovered fog tiles (optionally filtered by viewport)
    const fogData = await getDiscoveredTiles(campaignSeed, viewport);

    // Generate tile data for all discovered tiles
    const tiles = fogData.tiles.map(fogTile => {
      const tileData = generateTile(fogTile.x, fogTile.y, campaignSeed);
      return {
        ...tileData,
        fogState: fogTile.state,
      };
    });

    res.json({
      campaignSeed,
      playerPosition: {
        x: character.position_x || 0,
        y: character.position_y || 0,
      },
      bounds: {
        minX: fogData.minX,
        maxX: fogData.maxX,
        minY: fogData.minY,
        maxY: fogData.maxY,
        width: fogData.maxX - fogData.minX + 1,
        height: fogData.maxY - fogData.minY + 1,
      },
      tiles,
      tilesDiscovered: fogData.tiles.length,
    });
  } catch (error) {
    console.error('[StrategicMap] Error fetching map:', error);
    res.status(500).json({ error: 'Failed to load strategic map' });
  }
});

/**
 * POST /api/strategic-map/initialize
 * Initialize starting area fog of war for new character
 */
router.post('/initialize', requireAuth, async (req: Request, res: Response) => {
  try {
    const { characterId, spawnX, spawnY } = req.body;
    const authenticatedReq = req as AuthenticatedRequest;

    // Verify ownership
    const { data: character } = await supabaseServiceClient
      .from('characters')
      .select('id, campaign_seed')
      .eq('id', characterId)
      .eq('user_id', authenticatedReq.user.id)
      .single();

    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    await initializeStartingArea(
      character.campaign_seed,
      spawnX || 0,
      spawnY || 0,
      characterId
    );

    res.json({ success: true, message: 'Starting area initialized' });
  } catch (error) {
    console.error('[StrategicMap] Error initializing:', error);
    res.status(500).json({ error: 'Failed to initialize starting area' });
  }
});

export default router;
