/**
 * ChunkManager - Handles infinite expandable world via chunk-based generation
 */

import { loadMap, saveMap } from './mapService';
import type { MapZoneDefinition, ZoneType, SpawnPoint, MapTile } from '../types/map';

const CHUNK_WIDTH = 100;
const CHUNK_HEIGHT = 80;

/**
 * Generate deterministic seed for a chunk
 */
export function generateChunkSeed(campaignSeed: string, chunkX: number, chunkY: number): number {
  const str = `${campaignSeed}:${chunkX}:${chunkY}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Determine chunk type based on coordinates
 */
export function getChunkType(chunkX: number, chunkY: number): ZoneType {
  // Center is always town/village
  if (chunkX === 0 && chunkY === 0) return 'town';

  // Adjacent to village (distance 1)
  const distance = Math.abs(chunkX) + Math.abs(chunkY);
  if (distance === 1) return 'plains';

  // Nearby (distance 2-3)
  if (distance <= 3) return 'forest';

  // Far areas
  return 'plains'; // Could add 'mountains', 'desert', etc.
}

/**
 * Convert chunk coordinates to zone_id
 */
export function coordsToChunkId(chunkX: number, chunkY: number): string {
  return `chunk_${chunkX}_${chunkY}`;
}

/**
 * Parse zone_id to chunk coordinates
 */
export function chunkIdToCoords(zoneId: string): { x: number; y: number } | null {
  const match = zoneId.match(/^chunk_(-?\d+)_(-?\d+)$/);
  if (!match) return null;
  return { x: parseInt(match[1], 10), y: parseInt(match[2], 10) };
}

/**
 * Generate a chunk using appropriate generator
 */
function generateChunkData(
  chunkType: ZoneType,
  seed: number,
  chunkX: number,
  chunkY: number
): { tiles: MapTile[][]; spawnPoint: SpawnPoint; metadata: any } {
  // For now, create simple biome data
  // In real implementation, would use HybridWorldGenerator, BiomeGenerator, etc.

  const tiles: MapTile[][] = [];
  for (let y = 0; y < CHUNK_HEIGHT; y++) {
    const row: MapTile[] = [];
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      // Simple deterministic pattern based on position + seed
      const value = (x + y + seed) % 100;
      const biome = chunkType;
      const traversable = value > 30; // 70% traversable

      row.push({
        x,
        y,
        biome,
        traversable,
        elevation: 0,
        explored: false,
      });
    }
    tiles.push(row);
  }

  const spawnPoint: SpawnPoint = {
    x: Math.floor(CHUNK_WIDTH / 2),
    y: Math.floor(CHUNK_HEIGHT / 2),
  };

  return {
    tiles,
    spawnPoint,
    metadata: {
      chunkType,
      chunkCoords: { x: chunkX, y: chunkY },
      generated: new Date().toISOString(),
    },
  };
}

/**
 * Get or create a chunk
 */
export async function getOrCreateChunk(
  campaignSeed: string,
  chunkX: number,
  chunkY: number
): Promise<MapZoneDefinition> {
  const zoneId = coordsToChunkId(chunkX, chunkY);

  // Try to load existing
  const existing = await loadMap(campaignSeed, zoneId);
  if (existing) {
    return existing;
  }

  // Generate new chunk
  const chunkType = getChunkType(chunkX, chunkY);
  const seed = generateChunkSeed(campaignSeed, chunkX, chunkY);
  const chunkData = generateChunkData(chunkType, seed, chunkX, chunkY);

  // Save to database
  const saved = await saveMap({
    campaignSeed,
    zoneId,
    zoneType: chunkType,
    width: CHUNK_WIDTH,
    height: CHUNK_HEIGHT,
    tiles: chunkData.tiles,
    spawnPoint: chunkData.spawnPoint,
    seed,
    metadata: chunkData.metadata,
  });

  return saved;
}

/**
 * Load 3×3 grid of chunks around a center point
 */
export async function loadActiveChunks(
  campaignSeed: string,
  centerChunkX: number,
  centerChunkY: number
): Promise<MapZoneDefinition[]> {
  const chunks: MapZoneDefinition[] = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      try {
        const chunk = await getOrCreateChunk(
          campaignSeed,
          centerChunkX + dx,
          centerChunkY + dy
        );
        chunks.push(chunk);
      } catch (error) {
        console.error(`Failed to load chunk (${centerChunkX + dx}, ${centerChunkY + dy}):`, error);
      }
    }
  }

  return chunks;
}
