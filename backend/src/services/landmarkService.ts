import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  LandmarkDiscoveryResult,
  LandmarkRecord,
  LandmarkSummary,
  LandmarkType
} from '../types/landmark-types';
import type { CharacterRecord } from '../types';
import type { Vector2 } from '../types/road-types';
import { LocationService } from './locationService';
import { supabaseServiceClient } from './supabaseClient';

const LANDMARK_CHANCE_PER_TILE = 0.005; // 0.5%
const DEFAULT_DISCOVERY_RADIUS = 6;

type LandmarkRow = Omit<LandmarkRecord, 'discovery_state'> & {
  discovery_state: any;
};

interface LandmarkServiceDependencies {
  supabaseClient?: SupabaseClient;
  locationService?: LocationService;
}

class DeterministicRandom {
  private state: number;

  constructor(seed: string) {
    this.state = DeterministicRandom.hash(seed);
  }

  static hash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      const chr = input.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  pick<T>(items: T[]): T {
    const index = Math.floor(this.next() * items.length);
    return items[Math.max(0, Math.min(items.length - 1, index))];
  }
}

const LANDMARK_TYPE_WEIGHTS: Array<{ type: LandmarkType; weight: number }> = [
  { type: 'stone_marker', weight: 18 },
  { type: 'ancient_ruin', weight: 12 },
  { type: 'waterfall', weight: 8 },
  { type: 'cave', weight: 14 },
  { type: 'abandoned_camp', weight: 16 },
  { type: 'scenic_overlook', weight: 12 },
  { type: 'shrine', weight: 10 }
];

const LANDMARK_DESCRIPTORS: Record<LandmarkType, string[]> = {
  stone_marker: [
    'an ancient stone marker carved with symbols you do not recognize',
    'a weathered obelisk leaning under moss and lichen',
    'a boundary stone etched with faded runes of warning'
  ],
  ancient_ruin: [
    'the crumbled remains of a forgotten civilization',
    'archways of toppled marble half-swallowed by earth',
    'shattered pillars spiraling toward the sky like broken teeth'
  ],
  waterfall: [
    'a veil of silver water cascading into a misty pool',
    'a thundering fall pouring between jagged basalt cliffs',
    'a delicate ribbon of water glittering in the sun'
  ],
  cave: [
    'a dark cave mouth breathing cool, damp air',
    'a cavern entrance rimmed with jagged stalactites',
    'a yawning opening echoing with distant drips'
  ],
  abandoned_camp: [
    'an abandoned camp with a cold fire pit and scattered belongings',
    'tattered bedrolls and a broken lantern left behind in haste',
    'a trampled campsite bearing signs of a hurried departure'
  ],
  scenic_overlook: [
    'a windswept overlook revealing miles of rolling landscape',
    'a cliffside perch drenched in golden light',
    'a stony ledge with panoramic views of the valley below'
  ],
  shrine: [
    'a quiet shrine adorned with carefully placed offerings',
    'a moss-covered altar humming faintly with dormant magic',
    'a humble shrine ringed with fluttering prayer ribbons'
  ]
};

const LANDMARK_NAMES: Record<LandmarkType, string[]> = {
  stone_marker: ['Silent Waystone', 'Runebound Obelisk', 'Traveler\'s Gauge', 'The Whispering Stele'],
  ancient_ruin: ['Ruins of Vaelor', 'Shattered Court of Dusk', 'Eldran Gate', 'Hallowmere Collapse'],
  waterfall: ['Silverveil Falls', 'Thunderclap Cascade', 'Moonveil Spill', 'Azure Drop'],
  cave: ['Gloomjaw Cave', 'Hollow Echo Grotto', 'Whisperdeep Cavern', 'Emberbreach'],
  abandoned_camp: ['Forsaken Bivouac', 'Ashen Camp', 'Last Watchfire', 'Scout\'s Retreat'],
  scenic_overlook: ['Windwatch Crest', 'Skyglass Bluff', 'Sunspike Overlook', 'Horizon Shelf'],
  shrine: ['Shrine of Quiet Paths', 'Springtide Shrine', 'Starwell Sanctum', 'Pilgrim\'s Repose']
};

function computeBearing(from: Vector2, to: Vector2): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const degrees = (angle * 180) / Math.PI;
  const normalized = (degrees + 360) % 360;

  if (normalized >= 337.5 || normalized < 22.5) return 'east';
  if (normalized >= 22.5 && normalized < 67.5) return 'northeast';
  if (normalized >= 67.5 && normalized < 112.5) return 'north';
  if (normalized >= 112.5 && normalized < 157.5) return 'northwest';
  if (normalized >= 157.5 && normalized < 202.5) return 'west';
  if (normalized >= 202.5 && normalized < 247.5) return 'southwest';
  if (normalized >= 247.5 && normalized < 292.5) return 'south';
  return 'southeast';
}

function distanceBetween(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function weightedPick(random: DeterministicRandom): LandmarkType {
  const totalWeight = LANDMARK_TYPE_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
  const roll = random.next() * totalWeight;
  let cumulative = 0;

  for (const entry of LANDMARK_TYPE_WEIGHTS) {
    cumulative += entry.weight;
    if (roll <= cumulative) {
      return entry.type;
    }
  }

  return LANDMARK_TYPE_WEIGHTS[0].type;
}

export class LandmarkService {
  private readonly supabase: SupabaseClient;

  private readonly locationService: LocationService;

  constructor(dependencies: LandmarkServiceDependencies = {}) {
    this.supabase = dependencies.supabaseClient ?? supabaseServiceClient;
    this.locationService = dependencies.locationService ?? new LocationService();
  }

  /**
   * Ensure deterministic generation of landmarks around a position.
   */
  async ensureLandmarksAroundPosition(
    campaignSeed: string,
    position: Vector2,
    radiusInTiles: number = 4
  ): Promise<LandmarkRecord[]> {
    const generated: LandmarkRecord[] = [];
    const minX = Math.floor(position.x) - radiusInTiles;
    const maxX = Math.floor(position.x) + radiusInTiles;
    const minY = Math.floor(position.y) - radiusInTiles;
    const maxY = Math.floor(position.y) + radiusInTiles;

    for (let tileX = minX; tileX <= maxX; tileX += 1) {
      for (let tileY = minY; tileY <= maxY; tileY += 1) {
        const existing = await this.fetchLandmark(campaignSeed, tileX, tileY);
        if (existing) {
          generated.push(existing);
          continue;
        }

        const randomSeed = `${campaignSeed}:${tileX}:${tileY}`;
        const rand = new DeterministicRandom(randomSeed);
        const roll = rand.next();

        if (roll > LANDMARK_CHANCE_PER_TILE) {
          continue;
        }

        const type = weightedPick(rand);
        const { name, description } = this.buildDescriptor(rand, type);
        const computedPosition = { x: tileX + rand.next(), y: tileY + rand.next() };
        const context = await this.resolveLocationContext(campaignSeed, computedPosition);

        const inserted = await this.insertLandmark({
          campaign_seed: campaignSeed,
          tile_x: tileX,
          tile_y: tileY,
          position: computedPosition,
          type,
          name,
          description,
          nearest_road_id: context.nearestRoadId,
          nearest_road_name: context.nearestRoadName,
          nearest_settlement_id: context.nearestSettlementId,
          nearest_settlement_name: context.nearestSettlementName
        });

        if (inserted) {
          generated.push(inserted);
        }
      }
    }

    return generated;
  }

  /**
   * Retrieve nearby landmarks within a specified radius (in tiles/miles).
   */
  async getNearbyLandmarks(
    campaignSeed: string,
    position: Vector2,
    radius: number = 30
  ): Promise<LandmarkSummary[]> {
    const { data, error } = await this.supabase
      .from('world_landmarks')
      .select('*')
      .eq('campaign_seed', campaignSeed);

    if (error) {
      console.error('[LandmarkService] Failed to fetch landmarks:', error);
      return [];
    }

    const summaries: LandmarkSummary[] = [];

    for (const row of (data ?? []) as LandmarkRow[]) {
      const landmarkPosition = row.position as Vector2;
      const distance = distanceBetween(position, landmarkPosition);

      if (distance > radius) continue;

      const bearing = computeBearing(position, landmarkPosition);

      summaries.push({
        id: row.id,
        name: row.name,
        type: row.type as LandmarkType,
        description: row.description,
        distance,
        bearing,
        nearestRoadName: row.nearest_road_name,
        nearestSettlementName: row.nearest_settlement_name
      });
    }

    return summaries.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Record landmark discovery for a character near a position.
   */
  async recordNearbyDiscoveries(
    character: CharacterRecord,
    radius: number = DEFAULT_DISCOVERY_RADIUS
  ): Promise<LandmarkDiscoveryResult> {
    const campaignSeed = character.campaign_seed;
    const position = { x: character.position_x ?? 0, y: character.position_y ?? 0 };
    const nearby = await this.getNearbyLandmarks(campaignSeed, position, radius);

    if (nearby.length === 0) {
      return { newlyDiscovered: [], alreadyKnown: [] };
    }

    const newlyDiscovered: LandmarkSummary[] = [];
    const alreadyKnown: LandmarkSummary[] = [];

    for (const summary of nearby) {
      const row = await this.fetchLandmarkById(summary.id);
      if (!row) continue;

      const discoveryState = row.discovery_state as {
        discovered_by?: string[];
        last_discovered_at?: string | null;
      };

      const discoveredBy = discoveryState?.discovered_by ?? [];

      if (discoveredBy.includes(character.id)) {
        alreadyKnown.push(summary);
        continue;
      }

      const updatedState = {
        ...discoveryState,
        discovered_by: [...new Set([...discoveredBy, character.id])],
        last_discovered_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('world_landmarks')
        .update({ discovery_state: updatedState })
        .eq('id', summary.id);

      if (error) {
        console.error('[LandmarkService] Failed to update discovery state:', error);
      } else {
        newlyDiscovered.push(summary);
      }
    }

    return {
      newlyDiscovered,
      alreadyKnown
    };
  }

  private async fetchLandmark(campaignSeed: string, tileX: number, tileY: number): Promise<LandmarkRecord | null> {
    const { data, error } = await this.supabase
      .from('world_landmarks')
      .select('*')
      .eq('campaign_seed', campaignSeed)
      .eq('tile_x', tileX)
      .eq('tile_y', tileY)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[LandmarkService] Failed to fetch landmark:', error);
      }
      return null;
    }

    return data as LandmarkRecord;
  }

  private async fetchLandmarkById(id: string): Promise<LandmarkRecord | null> {
    const { data, error } = await this.supabase
      .from('world_landmarks')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[LandmarkService] Failed to fetch landmark by ID:', error);
      }
      return null;
    }

    return data as LandmarkRecord;
  }

  private buildDescriptor(random: DeterministicRandom, type: LandmarkType): { name: string; description: string } {
    const name = random.pick(LANDMARK_NAMES[type]);
    const description = random.pick(LANDMARK_DESCRIPTORS[type]);
    return { name, description };
  }

  private async resolveLocationContext(campaignSeed: string, position: Vector2): Promise<{
    nearestRoadId: string | null;
    nearestRoadName: string | null;
    nearestSettlementId: string | null;
    nearestSettlementName: string | null;
  }> {
    try {
      const context = await this.locationService.buildLocationContext(
        campaignSeed,
        position,
        { persist: false, radius: 40 }
      );

      return {
        nearestRoadId: context.nearestRoad?.roadId ?? null,
        nearestRoadName: context.nearestRoad ? `${context.nearestRoad.fromSettlementName} ↔ ${context.nearestRoad.toSettlementName}` : null,
        nearestSettlementId: context.nearestSettlement?.id ?? null,
        nearestSettlementName: context.nearestSettlement?.name ?? null
      };
    } catch (error) {
      console.warn('[LandmarkService] Failed to resolve location context for landmark:', error);
      return {
        nearestRoadId: null,
        nearestRoadName: null,
        nearestSettlementId: null,
        nearestSettlementName: null
      };
    }
  }

  private async insertLandmark(row: {
    campaign_seed: string;
    tile_x: number;
    tile_y: number;
    position: Vector2;
    type: LandmarkType;
    name: string;
    description: string;
    nearest_road_id: string | null;
    nearest_road_name: string | null;
    nearest_settlement_id: string | null;
    nearest_settlement_name: string | null;
  }): Promise<LandmarkRecord | null> {
    const { data, error } = await this.supabase
      .from('world_landmarks')
      .insert(row)
      .select('*')
      .single();

    if (error) {
      console.error('[LandmarkService] Failed to insert landmark:', error);
      return null;
    }

    return data as LandmarkRecord;
  }
}

export const landmarkService = new LandmarkService();
