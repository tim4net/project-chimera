/**
 * Landmark type definitions for procedural point-of-interest generation.
 */

import type { Vector2 } from './road-types';

export type LandmarkType =
  | 'stone_marker'
  | 'ancient_ruin'
  | 'waterfall'
  | 'cave'
  | 'abandoned_camp'
  | 'scenic_overlook'
  | 'shrine';

export interface LandmarkDiscoveryState {
  discovered_by: string[];
  last_discovered_at: string | null;
  notes?: Record<string, unknown>;
}

export interface LandmarkRecord {
  id: string;
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
  discovery_state: LandmarkDiscoveryState;
  created_at: string;
  updated_at: string;
}

export interface LandmarkContext {
  landmark: LandmarkRecord;
  distance: number;
  bearing: string;
}

export interface LandmarkGenerationOptions {
  radius?: number;
  tiles?: number;
  includeExisting?: boolean;
}

export interface LandmarkSummary {
  id: string;
  name: string;
  type: LandmarkType;
  description: string;
  distance: number;
  bearing: string;
  nearestRoadName?: string | null;
  nearestSettlementName?: string | null;
}

export interface LandmarkDiscoveryResult {
  newlyDiscovered: LandmarkSummary[];
  alreadyKnown: LandmarkSummary[];
}
