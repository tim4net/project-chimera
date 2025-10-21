/**
 * Shared types for road network and location context features.
 */

export type SettlementType = 'village' | 'town' | 'city' | 'capital' | 'fort' | 'outpost';

export interface Vector2 {
  x: number;
  y: number;
}

export interface RoadCoordinate extends Vector2 {}

export interface TerrainSample {
  position: Vector2;
  biome: string;
  elevation: number;
  traversable: boolean;
  traversalCost: number;
  slope: number;
}

export interface SettlementSummary extends Vector2 {
  id: string;
  name: string;
  type: SettlementType;
  distance: number;
}

export interface RoadRecord {
  id: string;
  campaignSeed: string;
  fromSettlementId: string;
  fromSettlementName: string;
  toSettlementId: string;
  toSettlementName: string;
  polyline: RoadCoordinate[];
  terrainProfile: TerrainSample[];
  length: number;
  averageTraversalCost: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoadProximity {
  roadId: string;
  distance: number;
  positionOnRoad: Vector2;
  segmentIndex: number;
  fromSettlementId: string;
  fromSettlementName: string;
  toSettlementId: string;
  toSettlementName: string;
}

export interface LocationContext {
  campaignSeed: string;
  position: Vector2;
  nearestSettlement: SettlementSummary | null;
  nearbySettlements: SettlementSummary[];
  nearestRoad: RoadProximity | null;
  roadsWithinRadius: RoadRecord[];
  terrainSample: TerrainSample[];
}
