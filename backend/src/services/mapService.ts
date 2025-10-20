/**
 * Map service: DB access, validation, normalization, and error mapping.
 */

import { supabaseServiceClient } from './supabaseClient';
import type {
  MapDBRecord,
  NewMapDBRecord,
  MapZoneDefinition,
  MapCreateRequest,
  MapUpdateRequest,
  MapListItem,
  MapGenerateOptions,
  SpawnPoint,
  ZoneType
} from '../types/map';
import type { MapTile } from '../types';

class MapServiceError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends MapServiceError {
  constructor(message: string) {
    super(message, 400, 'validation_error');
  }
}

/**
 * Allowed zone types and basic bounds to avoid pathological payload sizes.
 */
const ALLOWED_ZONE_TYPES: ReadonlySet<ZoneType> = new Set(['dungeon', 'forest', 'plains', 'town'] as const);
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const MAX_TILES = 1024 * 1024; // 1,048,576 cells upper bound

type NormalizedCreate = {
  campaignSeed: string;
  zoneId: string;
  zoneType: ZoneType;
  width: number;
  height: number;
  tiles: MapTile[][];
  spawnPoint: SpawnPoint;
  seed: number | null;
  metadata: Record<string, unknown> | null;
};

type NormalizedUpdate = {
  tiles?: MapTile[][];
  spawnPoint?: SpawnPoint;
  metadata?: Record<string, unknown> | null;
  seed?: number | null;
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const validateZoneId = (zoneId: string) => {
  // Alphanumeric, dash, underscore, slash allowed; adjust as needed
  if (!/^[A-Za-z0-9_\-\/:]+$/.test(zoneId)) {
    throw new ValidationError('zoneId must be alphanumeric with "-", "_", "/", ":" allowed');
  }
};

const validateSpawnPoint = (sp: SpawnPoint, width: number, height: number) => {
  if (typeof sp?.x !== 'number' || typeof sp?.y !== 'number') {
    throw new ValidationError('spawnPoint must be an object with numeric x and y');
  }
  if (sp.x < 0 || sp.y < 0 || sp.x >= width || sp.y >= height) {
    throw new ValidationError('spawnPoint must be within map bounds');
  }
};

const validateTiles = (tiles: MapTile[][], width: number, height: number) => {
  if (!Array.isArray(tiles)) {
    throw new ValidationError('tiles must be a 2D array');
  }
  if (tiles.length !== height) {
    throw new ValidationError(`tiles row count ${tiles.length} does not match height ${height}`);
  }
  for (let y = 0; y < tiles.length; y++) {
    const row = tiles[y];
    if (!Array.isArray(row)) {
      throw new ValidationError(`tiles row ${y} is not an array`);
    }
    if (row.length !== width) {
      throw new ValidationError(`tiles[${y}] column count ${row.length} does not match width ${width}`);
    }
    // Fast sanity check of 1-2 cells in each row to avoid O(n) deep validation
    if (row.length > 0) {
      const samples = [row[0], row[Math.floor(row.length / 2)]].filter(Boolean) as MapTile[];
      for (const t of samples) {
        if (!isPlainObject(t)) {
          throw new ValidationError('tiles entries must be objects');
        }
        if (typeof (t as any).x !== 'number' || typeof (t as any).y !== 'number') {
          throw new ValidationError('each tile should include numeric x and y');
        }
      }
    }
  }
};

const normalizeCreate = (body: MapCreateRequest): NormalizedCreate => {
  const campaignSeed = (body.campaignSeed ?? body.campaign_seed)?.trim();
  const zoneId = (body.zoneId ?? body.zone_id)?.trim();
  const zoneType = (body.zoneType ?? body.zone_type) as ZoneType | undefined;

  if (!campaignSeed) throw new ValidationError('campaignSeed is required');
  if (!zoneId) throw new ValidationError('zoneId is required');
  if (!zoneType) throw new ValidationError('zoneType is required');
  if (!ALLOWED_ZONE_TYPES.has(zoneType)) {
    throw new ValidationError(`zoneType must be one of: ${Array.from(ALLOWED_ZONE_TYPES).join(', ')}`);
  }

  if (typeof body.width !== 'number' || typeof body.height !== 'number') {
    throw new ValidationError('width and height are required numeric values');
  }

  const width = Math.floor(body.width);
  const height = Math.floor(body.height);
  if (width <= 0 || height <= 0) throw new ValidationError('width and height must be > 0');
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    throw new ValidationError(`width and height must be <= ${MAX_WIDTH}x${MAX_HEIGHT}`);
  }
  if (width * height > MAX_TILES) {
    throw new ValidationError(`tile count exceeds maximum ${MAX_TILES}`);
  }

  if (!Array.isArray(body.tiles)) {
    throw new ValidationError('tiles must be provided as 2D array');
  }

  const spawnPoint = (body.spawnPoint ?? body.spawn_point) as SpawnPoint | undefined;
  if (!spawnPoint) throw new ValidationError('spawnPoint is required');

  const seed = body.seed != null ? Math.floor(body.seed) : null;
  const metadata = (body.metadata ?? null) as Record<string, unknown> | null;

  // structural validation
  validateZoneId(zoneId);
  validateSpawnPoint(spawnPoint, width, height);
  validateTiles(body.tiles, width, height);

  return {
    campaignSeed,
    zoneId,
    zoneType,
    width,
    height,
    tiles: body.tiles,
    spawnPoint,
    seed,
    metadata
  };
};

const normalizeUpdate = (body: MapUpdateRequest): NormalizedUpdate => {
  const patch: NormalizedUpdate = {};
  if (body.tiles !== undefined) {
    if (!Array.isArray(body.tiles)) throw new ValidationError('tiles must be a 2D array');
    patch.tiles = body.tiles;
  }
  if (body.spawnPoint || body.spawn_point) {
    const sp = (body.spawnPoint ?? body.spawn_point) as SpawnPoint;
    if (!isPlainObject(sp) || typeof sp.x !== 'number' || typeof sp.y !== 'number') {
      throw new ValidationError('spawnPoint must be an object with numeric x and y');
    }
    patch.spawnPoint = sp;
  }
  if (body.metadata !== undefined) {
    if (body.metadata !== null && !isPlainObject(body.metadata)) {
      throw new ValidationError('metadata must be an object or null');
    }
    patch.metadata = body.metadata ?? null;
  }
  if (body.seed !== undefined && body.seed !== null) {
    patch.seed = Math.floor(body.seed);
  } else if (body.seed === null) {
    patch.seed = null;
  }
  return patch;
};

const toApi = (db: MapDBRecord): MapZoneDefinition => ({
  id: db.id,
  campaignSeed: db.campaign_seed,
  zoneId: db.zone_id,
  zoneType: db.zone_type,
  width: db.width,
  height: db.height,
  tiles: db.tiles,
  spawnPoint: db.spawn_point,
  seed: db.seed,
  metadata: db.metadata,
  createdAt: db.created_at,
  updatedAt: db.updated_at
});

const toListItem = (db: MapDBRecord): MapListItem => ({
  id: db.id,
  campaignSeed: db.campaign_seed,
  zoneId: db.zone_id,
  zoneType: db.zone_type,
  width: db.width,
  height: db.height,
  spawnPoint: db.spawn_point,
  seed: db.seed,
  metadata: db.metadata,
  createdAt: db.created_at,
  updatedAt: db.updated_at
});

const toDbInsert = (n: NormalizedCreate): NewMapDBRecord => ({
  campaign_seed: n.campaignSeed,
  zone_id: n.zoneId,
  zone_type: n.zoneType,
  width: n.width,
  height: n.height,
  tiles: n.tiles,
  spawn_point: n.spawnPoint,
  seed: n.seed,
  metadata: n.metadata
});

/**
 * Load a map by campaignSeed and zoneId.
 */
export const loadMap = async (campaignSeed: string, zoneId: string): Promise<MapZoneDefinition | null> => {
  const { data, error } = await supabaseServiceClient
    .from('maps')
    .select('*')
    .eq('campaign_seed', campaignSeed)
    .eq('zone_id', zoneId)
    .maybeSingle();

  if (error) {
    throw new MapServiceError(error.message, 500, error.code);
  }
  if (!data) return null;
  return toApi(data as MapDBRecord);
};

/**
 * Save a new map. Fails with 409 if the map already exists per unique(campaign_seed, zone_id).
 */
export const saveMap = async (body: MapCreateRequest): Promise<MapZoneDefinition> => {
  const normalized = normalizeCreate(body);

  const insert = toDbInsert(normalized);

  const { data, error } = await supabaseServiceClient
    .from('maps')
    .insert(insert)
    .select('*')
    .single();

  if (error) {
    // Unique violation -> 409 Conflict
    if ((error as any).code === '23505') {
      throw new MapServiceError('Map already exists for this campaignSeed and zoneId', 409, 'unique_violation');
    }
    throw new MapServiceError(error.message, 500, error.code);
  }

  return toApi(data as MapDBRecord);
};

/**
 * Update map by id. Supports updating tiles, spawnPoint, metadata, seed.
 * Does not allow changing immutable identity fields (campaignSeed, zoneId, width, height, zoneType).
 */
export const updateMapById = async (id: string, body: MapUpdateRequest): Promise<MapZoneDefinition> => {
  if (!id) throw new ValidationError('id is required');

  const patch = normalizeUpdate(body);

  // We need current width/height if spawnPoint or tiles are provided to validate bounds/dimensions
  if (patch.spawnPoint || patch.tiles) {
    const { data: existing, error: loadErr } = await supabaseServiceClient
      .from('maps')
      .select('width,height')
      .eq('id', id)
      .single();

    if (loadErr) {
      throw new MapServiceError(loadErr.message, 500, loadErr.code);
    }
    if (!existing) {
      throw new MapServiceError('Map not found', 404, 'not_found');
    }

    const width = (existing as { width: number }).width;
    const height = (existing as { height: number }).height;

    if (patch.spawnPoint) {
      validateSpawnPoint(patch.spawnPoint, width, height);
    }
    if (patch.tiles) {
      validateTiles(patch.tiles, width, height);
    }
  }

  // Build DB patch (snake_case)
  const dbPatch: Partial<NewMapDBRecord> & { updated_at?: string } = {};
  if (patch.tiles !== undefined) dbPatch.tiles = patch.tiles;
  if (patch.spawnPoint !== undefined) (dbPatch as any).spawn_point = patch.spawnPoint;
  if (patch.metadata !== undefined) dbPatch.metadata = patch.metadata ?? null;
  if (patch.seed !== undefined) dbPatch.seed = patch.seed ?? null;

  const { data, error } = await supabaseServiceClient
    .from('maps')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new MapServiceError(error.message, 500, error.code);
  }
  if (!data) {
    throw new MapServiceError('Map not found', 404, 'not_found');
  }

  return toApi(data as MapDBRecord);
};

/**
 * List maps for a campaign without tiles (faster and more efficient).
 */
export const listCampaignMaps = async (campaignSeed: string): Promise<MapListItem[]> => {
  const { data, error } = await supabaseServiceClient
    .from('maps')
    .select('id,campaign_seed,zone_id,zone_type,width,height,spawn_point,seed,metadata,created_at,updated_at')
    .eq('campaign_seed', campaignSeed)
    .order('zone_id', { ascending: true });

  if (error) {
    throw new MapServiceError(error.message, 500, error.code);
  }

  const rows = (data ?? []) as MapDBRecord[];
  return rows.map(toListItem);
};

/**
 * Optional: Generate a basic map if missing, then save it.
 * Useful for server-side generation fallback or tests.
 */
export const generateAndSaveMap = async (
  campaignSeed: string,
  zoneId: string,
  zoneType: ZoneType,
  options?: MapGenerateOptions
): Promise<MapZoneDefinition> => {
  const existing = await loadMap(campaignSeed, zoneId);
  if (existing) return existing;

  const width = Math.max(1, Math.floor(options?.width ?? 64));
  const height = Math.max(1, Math.floor(options?.height ?? 64));
  const seed = options?.seed ?? Math.floor(Math.random() * 2_147_483_647);

  // Generate a simple blank traversable grid if tiles not supplied
  const tiles: MapTile[][] =
    options?.tiles ??
    Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => ({
        x,
        y,
        biome: zoneType,
        elevation: 0,
        traversable: true,
        explored: false
      }))
    );

  const spawnPoint: SpawnPoint =
    options?.spawnPoint ?? { x: Math.floor(width / 2), y: Math.floor(height / 2) };

  const metadata: Record<string, unknown> | null = options?.metadata ?? { generator: 'basic', version: 1 };

  return await saveMap({
    campaignSeed,
    zoneId,
    zoneType,
    width,
    height,
    tiles,
    spawnPoint,
    seed,
    metadata
  });
};
