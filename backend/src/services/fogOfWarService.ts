/**
 * Fog of War Service
 * Manages tile discovery and visibility for strategic world map
 */

import { supabaseServiceClient } from './supabaseClient';

// ============================================================================
// CONSTANTS
// ============================================================================

// World size limits to prevent infinite database growth
// 2000×2000 miles = 4 million tiles = reasonable for multiple Level 1-20 campaigns
export const WORLD_MIN_X = -1000;
export const WORLD_MAX_X = 1000;
export const WORLD_MIN_Y = -1000;
export const WORLD_MAX_Y = 1000;

// Security: Maximum reveal radius to prevent DoS attacks
// 50 tiles = reasonable maximum for scout/travel actions
export const MAX_REVEAL_RADIUS = 50;

// Security: Maximum path distance to prevent DoS attacks
// 500 tiles = reasonable maximum for single travel action
export const MAX_PATH_DISTANCE = 500;

// ============================================================================
// TYPES
// ============================================================================

export interface FogTile {
  x: number;
  y: number;
  state: 'unexplored' | 'explored' | 'visible';
}

export interface DiscoveredRegion {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  tiles: FogTile[];
}

export interface DiscoveryResult {
  tilesRevealed: number;
  newBounds: { minX: number; maxX: number; minY: number; maxY: number };
}

// ============================================================================
// DISCOVERY MECHANICS
// ============================================================================

/**
 * Reveal tiles in a radius around a position
 * Called by travel, scout, and POI discovery
 */
export async function revealTilesInRadius(
  campaignSeed: string,
  centerX: number,
  centerY: number,
  radius: number,
  characterId: string
): Promise<DiscoveryResult> {
  // Security: Validate radius to prevent DoS attacks
  if (radius <= 0 || radius > MAX_REVEAL_RADIUS) {
    throw new Error(`Invalid radius: ${radius}. Must be 1-${MAX_REVEAL_RADIUS}.`);
  }

  const tilesToReveal: Array<{ x: number; y: number }> = [];

  // Generate circle of tiles to reveal
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radius) {
        const tileX = centerX + dx;
        const tileY = centerY + dy;
        // Enforce world boundaries
        if (tileX >= WORLD_MIN_X && tileX <= WORLD_MAX_X &&
            tileY >= WORLD_MIN_Y && tileY <= WORLD_MAX_Y) {
          tilesToReveal.push({ x: tileX, y: tileY });
        }
      }
    }
  }

  // Batch insert discovered tiles (upsert to handle already-discovered)
  const inserts = tilesToReveal.map(tile => ({
    campaign_seed: campaignSeed,
    tile_x: tile.x,
    tile_y: tile.y,
    discovered_by_character_id: characterId,
    visibility_state: 'explored',
  }));

  const { error } = await supabaseServiceClient
    .from('world_fog')
    .upsert(inserts, {
      onConflict: 'campaign_seed,tile_x,tile_y',
      ignoreDuplicates: false, // Update discovered_at
    });

  if (error) {
    console.error('[FogOfWar] Failed to reveal tiles:', error);
    return {
      tilesRevealed: 0,
      newBounds: { minX: centerX, maxX: centerX, minY: centerY, maxY: centerY },
    };
  }

  // Update campaign bounds
  await updateCampaignBounds(campaignSeed, tilesToReveal);

  console.log(`[FogOfWar] Revealed ${tilesToReveal.length} tiles around (${centerX}, ${centerY})`);

  return {
    tilesRevealed: tilesToReveal.length,
    newBounds: {
      minX: centerX - radius,
      maxX: centerX + radius,
      minY: centerY - radius,
      maxY: centerY + radius,
    },
  };
}

/**
 * Reveal tiles along a path (for travel)
 */
export async function revealTilesAlongPath(
  campaignSeed: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  pathWidth: number, // Radius on each side of path
  characterId: string
): Promise<DiscoveryResult> {
  // Security: Validate pathWidth to prevent DoS attacks
  if (pathWidth <= 0 || pathWidth > MAX_REVEAL_RADIUS) {
    throw new Error(`Invalid pathWidth: ${pathWidth}. Must be 1-${MAX_REVEAL_RADIUS}.`);
  }

  // Security: Validate path distance to prevent DoS attacks
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > MAX_PATH_DISTANCE) {
    throw new Error(`Path too long to reveal at once. Maximum ${MAX_PATH_DISTANCE} tiles.`);
  }

  const tilesToReveal: Array<{ x: number; y: number }> = [];

  // Bresenham's line algorithm for path
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const sx = startX < endX ? 1 : -1;
  const sy = startY < endY ? 1 : -1;
  let err = absDx - absDy;

  let x = startX;
  let y = startY;

  while (true) {
    // Reveal tiles in radius around current point
    for (let px = x - pathWidth; px <= x + pathWidth; px++) {
      for (let py = y - pathWidth; py <= y + pathWidth; py++) {
        if (!tilesToReveal.some(t => t.x === px && t.y === py)) {
          tilesToReveal.push({ x: px, y: py });
        }
      }
    }

    if (x === endX && y === endY) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  // Batch insert
  const inserts = tilesToReveal.map(tile => ({
    campaign_seed: campaignSeed,
    tile_x: tile.x,
    tile_y: tile.y,
    discovered_by_character_id: characterId,
    visibility_state: 'explored',
  }));

  const { error } = await supabaseServiceClient
    .from('world_fog')
    .upsert(inserts, { onConflict: 'campaign_seed,tile_x,tile_y' });

  if (error) {
    console.error('[FogOfWar] Failed to reveal path:', error);
  }

  await updateCampaignBounds(campaignSeed, tilesToReveal);

  console.log(`[FogOfWar] Revealed ${tilesToReveal.length} tiles along path from (${startX},${startY}) to (${endX},${endY})`);

  return {
    tilesRevealed: tilesToReveal.length,
    newBounds: {
      minX: Math.min(startX, endX) - pathWidth,
      maxX: Math.max(startX, endX) + pathWidth,
      minY: Math.min(startY, endY) - pathWidth,
      maxY: Math.max(startY, endY) + pathWidth,
    },
  };
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get discovered tiles for a campaign
 * Optionally filtered by viewport bounds for performance with large datasets
 *
 * @param campaignSeed - Campaign identifier
 * @param viewport - Optional viewport bounds to limit query (prevents server crashes with 10,000+ tiles)
 */
export async function getDiscoveredTiles(
  campaignSeed: string,
  viewport?: { minX: number; maxX: number; minY: number; maxY: number }
): Promise<DiscoveredRegion> {
  const { data: bounds } = await supabaseServiceClient
    .from('campaign_bounds')
    .select('*')
    .eq('campaign_seed', campaignSeed)
    .single();

  if (!bounds) {
    // No tiles discovered yet
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      tiles: [],
    };
  }

  // Build query with optional viewport filtering
  let query = supabaseServiceClient
    .from('world_fog')
    .select('tile_x, tile_y, visibility_state')
    .eq('campaign_seed', campaignSeed);

  if (viewport) {
    // Apply viewport bounds for performance
    query = query
      .gte('tile_x', viewport.minX)
      .lte('tile_x', viewport.maxX)
      .gte('tile_y', viewport.minY)
      .lte('tile_y', viewport.maxY);

    console.log(
      `[FogOfWar] Fetching tiles in viewport: ` +
      `x[${viewport.minX}, ${viewport.maxX}] y[${viewport.minY}, ${viewport.maxY}]`
    );
  }

  const { data: fogData, error } = await query;

  if (error) {
    console.error('[FogOfWar] Failed to fetch tiles:', error);
    return {
      minX: bounds.min_x,
      maxX: bounds.max_x,
      minY: bounds.min_y,
      maxY: bounds.max_y,
      tiles: [],
    };
  }

  const tiles: FogTile[] = (fogData || []).map(tile => ({
    x: tile.tile_x,
    y: tile.tile_y,
    state: tile.visibility_state === 'visible' ? 'visible' : 'explored',
  }));

  console.log(
    `[FogOfWar] Fetched ${tiles.length} tiles ` +
    `(campaign bounds: ${bounds.total_tiles_discovered ?? 0} total)`
  );

  return {
    minX: bounds.min_x,
    maxX: bounds.max_x,
    minY: bounds.min_y,
    maxY: bounds.max_y,
    tiles,
  };
}

/**
 * Check if a tile is discovered
 */
export async function isTileDiscovered(
  campaignSeed: string,
  x: number,
  y: number
): Promise<boolean> {
  const { data } = await supabaseServiceClient
    .from('world_fog')
    .select('tile_x')
    .eq('campaign_seed', campaignSeed)
    .eq('tile_x', x)
    .eq('tile_y', y)
    .single();

  return !!data;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Update campaign bounds after revealing tiles (atomic via RPC)
 */
async function updateCampaignBounds(
  campaignSeed: string,
  tiles: Array<{ x: number; y: number }>
): Promise<void> {
  if (tiles.length === 0) return;

  // Convert tiles array to JSONB for PostgreSQL function
  const tilesJson = JSON.stringify(tiles);

  // Use atomic RPC function to prevent race conditions
  const { error } = await supabaseServiceClient
    .rpc('update_campaign_bounds_atomic', {
      p_campaign_seed: campaignSeed,
      p_new_tiles: tilesJson,
    });

  if (error) {
    console.error('[FogOfWar] Failed to update campaign bounds:', error);
  }
}

/**
 * Initialize starting area visibility (called during character creation)
 */
export async function initializeStartingArea(
  campaignSeed: string,
  spawnX: number,
  spawnY: number,
  characterId: string
): Promise<void> {
  // Reveal 20-tile radius around spawn (starting village is known)
  await revealTilesInRadius(campaignSeed, spawnX, spawnY, 20, characterId);
  console.log(`[FogOfWar] Initialized starting area at (${spawnX}, ${spawnY})`);
}
