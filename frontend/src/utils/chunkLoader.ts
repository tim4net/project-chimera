/**
 * Chunk loading and coordinate conversion utilities
 */

import type { MapZoneDefinition } from '../game/types';

export const TILE_SIZE = 32; // pixels
export const CHUNK_WIDTH = 100; // tiles
export const CHUNK_HEIGHT = 80; // tiles

const chunkCache = new Map<string, MapZoneDefinition>();

/**
 * Convert global tile coordinates to chunk + local coordinates
 */
export function convertToChunkCoordinates(globalX: number, globalY: number) {
  const chunkX = Math.floor(globalX / CHUNK_WIDTH);
  const chunkY = Math.floor(globalY / CHUNK_HEIGHT);
  const localX = ((globalX % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
  const localY = ((globalY % CHUNK_HEIGHT) + CHUNK_HEIGHT) % CHUNK_HEIGHT;

  return { chunkX, chunkY, localX, localY };
}

/**
 * Convert chunk + local coordinates to global tile coordinates
 */
export function convertToGlobalCoordinates(
  chunkX: number,
  chunkY: number,
  localX: number,
  localY: number
) {
  return {
    globalX: chunkX * CHUNK_WIDTH + localX,
    globalY: chunkY * CHUNK_HEIGHT + localY,
  };
}

/**
 * Generate cache key for a chunk
 */
function buildCacheKey(campaignSeed: string, chunkX: number, chunkY: number): string {
  return `${campaignSeed}:${chunkX}:${chunkY}`;
}

/**
 * Generate chunk coordinate key
 */
export function chunkCoordinateKey(chunkX: number, chunkY: number): string {
  return `${chunkX}_${chunkY}`;
}

/**
 * Fetch a single chunk (with caching)
 */
async function fetchChunk(
  campaignSeed: string,
  chunkX: number,
  chunkY: number
): Promise<MapZoneDefinition> {
  const cacheKey = buildCacheKey(campaignSeed, chunkX, chunkY);

  if (chunkCache.has(cacheKey)) {
    return chunkCache.get(cacheKey)!;
  }

  // For now, fetch from regular maps API
  // Backend should have /api/chunks endpoint, but we can use /api/maps
  const zoneId = `chunk_${chunkX}_${chunkY}`;
  const response = await fetch(`/api/maps/${campaignSeed}/${zoneId}`);

  if (!response.ok) {
    // Chunk doesn't exist yet - would need backend to generate
    // For MVP, we'll just fail gracefully
    throw new Error(`Chunk (${chunkX}, ${chunkY}) not found`);
  }

  const data = await response.json();
  chunkCache.set(cacheKey, data);
  return data;
}

/**
 * Load 3×3 grid of chunks around center position
 */
export async function loadChunkGrid(
  campaignSeed: string,
  centerChunkX: number,
  centerChunkY: number
): Promise<{
  chunks: Map<string, MapZoneDefinition>;
  bounds: { minX: number; minY: number; maxX: number; maxY: number; widthTiles: number; heightTiles: number };
}> {
  const chunks = new Map<string, MapZoneDefinition>();
  const coords: Array<{ x: number; y: number }> = [];

  // Generate 3×3 grid coordinates
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      coords.push({ x: centerChunkX + dx, y: centerChunkY + dy });
    }
  }

  // Load all chunks (in parallel for speed)
  const results = await Promise.allSettled(
    coords.map(coord => fetchChunk(campaignSeed, coord.x, coord.y))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const coord = coords[index];
      const key = chunkCoordinateKey(coord.x, coord.y);
      chunks.set(key, result.value);
    }
  });

  // Calculate bounds
  const minX = centerChunkX - 1;
  const maxX = centerChunkX + 1;
  const minY = centerChunkY - 1;
  const maxY = centerChunkY + 1;

  return {
    chunks,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      widthTiles: (maxX - minX + 1) * CHUNK_WIDTH,
      heightTiles: (maxY - minY + 1) * CHUNK_HEIGHT,
    },
  };
}

/**
 * Clear chunk cache (useful for testing)
 */
export function clearChunkCache(): void {
  chunkCache.clear();
}
