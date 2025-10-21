import type { SupabaseClient } from '@supabase/supabase-js';

import { generateTile } from '../game/map';
import type {
  LocationContext,
  RoadProximity,
  RoadRecord,
  SettlementSummary,
  TerrainSample,
  Vector2
} from '../types/road-types';
import { supabaseServiceClient } from './supabaseClient';
import {
  RoadNetworkService,
  type SettlementNode,
  distancePointToPolyline
} from './roadNetworkService';

export interface CharacterLocationRecord {
  character_id: string;
  campaign_seed: string;
  last_position: Vector2;
  nearest_settlement: SettlementSummary | null;
  nearest_road: RoadProximity | null;
  nearby_settlements: SettlementSummary[];
  terrain_profile: TerrainSample[];
  updated_at: string;
}

export interface CharacterLocationRepository {
  upsertCharacterLocation(record: CharacterLocationRecord): Promise<void>;
}

class SupabaseCharacterLocationRepository implements CharacterLocationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async upsertCharacterLocation(record: CharacterLocationRecord): Promise<void> {
    const { error } = await this.client
      .from('character_locations')
      .upsert({
        character_id: record.character_id,
        campaign_seed: record.campaign_seed,
        last_position: record.last_position,
        nearest_settlement: record.nearest_settlement,
        nearest_road: record.nearest_road,
        nearby_settlements: record.nearby_settlements,
        terrain_profile: record.terrain_profile,
        updated_at: record.updated_at
      });

    if (error) {
      throw error;
    }
  }
}

export interface LocationServiceOptions {
  radius?: number;
  nearbySettlementLimit?: number;
  persist?: boolean;
  characterId?: string;
}

interface LocationServiceDependencies {
  roadNetworkService?: RoadNetworkService;
  characterLocationRepository?: CharacterLocationRepository;
  supabaseClient?: SupabaseClient | null;
}

export class LocationService {
  private readonly roadService: RoadNetworkService;

  private readonly characterLocationRepo: CharacterLocationRepository;

  private readonly supabaseClient: SupabaseClient | null;

  constructor(dependencies: LocationServiceDependencies = {}) {
    this.roadService = dependencies.roadNetworkService ?? new RoadNetworkService();
    const supabaseClient = dependencies.supabaseClient ?? (dependencies.characterLocationRepository ? null : supabaseServiceClient);

    if (dependencies.characterLocationRepository) {
      this.characterLocationRepo = dependencies.characterLocationRepository;
      this.supabaseClient = supabaseClient;
    } else if (supabaseClient) {
      this.characterLocationRepo = new SupabaseCharacterLocationRepository(supabaseClient);
      this.supabaseClient = supabaseClient;
    } else {
      throw new Error('LocationService requires either a Supabase client or a character location repository.');
    }
  }

  async buildLocationContext(
    campaignSeed: string,
    position: Vector2,
    options: LocationServiceOptions = {}
  ): Promise<LocationContext> {
    const radius = options.radius ?? 30;
    const settlementLimit = options.nearbySettlementLimit ?? 3;

    const settlements = await this.roadService.getSettlementNodes(campaignSeed);
    let roads = await this.roadService.listRoads(campaignSeed);

    if (roads.length === 0 && settlements.length >= 2) {
      roads = await this.roadService.generateAndPersistRoads(campaignSeed);
    }

    const nearestSettlement = LocationService.findNearestSettlement(position, settlements);
    const nearbySettlements = LocationService.computeNearbySettlements(position, settlements, settlementLimit, radius);
    const nearestRoadProximity = LocationService.findNearestRoad(position, roads);
    const roadsWithinRadius = LocationService.filterRoadsWithinRadius(position, roads, radius);
    const terrainSample = LocationService.sampleTerrainNeighborhood(campaignSeed, position, Math.min(5, Math.max(2, Math.floor(radius / 6))));

    const context: LocationContext = {
      campaignSeed,
      position,
      nearestSettlement,
      nearbySettlements,
      nearestRoad: nearestRoadProximity,
      roadsWithinRadius,
      terrainSample
    };

    if (options.characterId && options.persist !== false) {
      await this.characterLocationRepo.upsertCharacterLocation({
        character_id: options.characterId,
        campaign_seed: campaignSeed,
        last_position: position,
        nearest_settlement: nearestSettlement,
        nearest_road: nearestRoadProximity,
        nearby_settlements: nearbySettlements,
        terrain_profile: terrainSample,
        updated_at: new Date().toISOString()
      });
    }

    return context;
  }

  static findNearestSettlement(position: Vector2, settlements: SettlementNode[]): SettlementSummary | null {
    let nearest: SettlementSummary | null = null;

    for (const settlement of settlements) {
      const distance = euclideanDistance(position, settlement.position);
      if (!nearest || distance < nearest.distance) {
        nearest = {
          id: settlement.id,
          name: settlement.name,
          type: settlement.type,
          x: settlement.position.x,
          y: settlement.position.y,
          distance
        };
      }
    }

    return nearest;
  }

  static computeNearbySettlements(
    position: Vector2,
    settlements: SettlementNode[],
    limit: number,
    maxDistance: number
  ): SettlementSummary[] {
    return settlements
      .map(settlement => ({
        id: settlement.id,
        name: settlement.name,
        type: settlement.type,
        x: settlement.position.x,
        y: settlement.position.y,
        distance: euclideanDistance(position, settlement.position)
      }))
      .filter(summary => summary.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  static findNearestRoad(position: Vector2, roads: RoadRecord[]): RoadProximity | null {
    let nearest: RoadProximity | null = null;

    for (const road of roads) {
      const proximity = distancePointToPolyline(position, road.polyline);
      if (!nearest || proximity.distance < nearest.distance) {
        nearest = RoadNetworkService.summarizeRoadProximity(road, proximity);
      }
    }

    return nearest;
  }

  static filterRoadsWithinRadius(position: Vector2, roads: RoadRecord[], radius: number): RoadRecord[] {
    return roads.filter(road => {
      const proximity = distancePointToPolyline(position, road.polyline);
      return proximity.distance <= radius;
    });
  }

  static sampleTerrainNeighborhood(campaignSeed: string, position: Vector2, radius: number): TerrainSample[] {
    const samples: TerrainSample[] = [];
    const center = {
      x: Math.round(position.x),
      y: Math.round(position.y)
    };
    const centerTile = generateTile(center.x, center.y, campaignSeed);
    const centerElevation = typeof centerTile.elevation === 'number' ? centerTile.elevation : 0;

    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const tileX = center.x + dx;
        const tileY = center.y + dy;
        const tile = generateTile(tileX, tileY, campaignSeed);
        const elevation = typeof tile.elevation === 'number' ? tile.elevation : 0;
        const slope = Math.abs(elevation - centerElevation);
        const traversable = tile.traversable !== false && tile.biome !== 'water';
        const traversalCost = 1 + (traversable ? 0 : 5) + slope * 4;

        samples.push({
          position: { x: tileX, y: tileY },
          biome: tile.biome,
          elevation,
          traversable,
          traversalCost,
          slope
        });
      }
    }

    return samples;
  }

  static distancePointToPolyline(point: Vector2, polyline: Vector2[]): { distance: number; position: Vector2; segmentIndex: number } {
    return distancePointToPolyline(point, polyline);
  }
}

function euclideanDistance(a: Vector2, b: Vector2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export default LocationService;
