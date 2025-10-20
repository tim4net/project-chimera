/**
 * Map types for persistence and API contracts.
 * Note: DB record uses snake_case to match PostgreSQL; API uses camelCase.
 */

export type ZoneType = 'dungeon' | 'forest' | 'plains' | 'town';

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface MapMetadata {
  rooms?: unknown[];
  doors?: unknown[];
  pois?: unknown[];
  [key: string]: unknown;
}

export interface MapTile {
  x: number;
  y: number;
  biome: string;
  elevation?: number;
  traversable?: boolean;
  explored?: boolean;
}

/**
 * Raw DB record shape as stored in Postgres (snake_case).
 */
export interface MapDBRecord {
  id: string;
  campaign_seed: string;
  zone_id: string;
  zone_type: ZoneType;
  width: number;
  height: number;
  tiles: MapTile[][];
  spawn_point: SpawnPoint;
  seed: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type NewMapDBRecord = Omit<MapDBRecord, 'id' | 'created_at' | 'updated_at'>;

/**
 * API shape (camelCase) returned to clients.
 */
export interface MapZoneDefinition {
  id: string;
  campaignSeed: string;
  zoneId: string;
  zoneType: ZoneType;
  width: number;
  height: number;
  tiles: MapTile[][];
  spawnPoint: SpawnPoint;
  seed: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Minimal list item for campaign listing (no tiles to reduce payload).
 */
export interface MapListItem {
  id: string;
  campaignSeed: string;
  zoneId: string;
  zoneType: ZoneType;
  width: number;
  height: number;
  spawnPoint: SpawnPoint;
  seed: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /api/maps request supports both snake_case and camelCase keys.
 */
export interface MapCreateRequest {
  campaignSeed?: string;
  campaign_seed?: string;
  zoneId?: string;
  zone_id?: string;
  zoneType?: ZoneType;
  zone_type?: ZoneType;
  width: number;
  height: number;
  tiles: MapTile[][];
  spawnPoint?: SpawnPoint;
  spawn_point?: SpawnPoint;
  seed?: number | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * PUT /api/maps/:id request to update exploration state, POIs, etc.
 */
export interface MapUpdateRequest {
  tiles?: MapTile[][];
  spawnPoint?: SpawnPoint;
  spawn_point?: SpawnPoint;
  metadata?: Record<string, unknown> | null;
  seed?: number | null;
}

/**
 * Options for map generation.
 */
export interface MapGenerateOptions {
  width?: number;
  height?: number;
  tiles?: MapTile[][];
  seed?: number;
  spawnPoint?: SpawnPoint;
  metadata?: Record<string, unknown>;
}
