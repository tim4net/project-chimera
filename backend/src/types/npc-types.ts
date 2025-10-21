/**
 * Types for globally persistent NPCs.
 */

import type { Vector2 } from './road-types';

export type NpcState = 'alive' | 'dead' | 'missing';

export type NpcHomeType = 'settlement' | 'poi' | 'landmark' | 'wilderness';

export interface NpcLocation {
  locationType: NpcHomeType;
  locationId: string | null;
  position: Vector2 | null;
}

export interface WorldNpcRecord {
  id: string;
  campaign_seed: string;
  name: string;
  race: string;
  class: string;
  role: string;
  personality: string;
  state: NpcState;
  home_location_type: NpcHomeType;
  home_location_id: string | null;
  current_location_type: NpcHomeType;
  current_location_id: string | null;
  current_position: Vector2 | null;
  quests_given_total: number;
  quests_completed_total: number;
  created_at: string;
  updated_at: string;
  last_moved_at: string | null;
}

export interface CharacterNpcReputation {
  character_id: string;
  npc_id: string;
  reputation_score: number;
  quests_given: number;
  quests_completed: number;
  last_interaction_at: string | null;
}

export interface NpcGenerationSeed {
  campaignSeed: string;
  settlementId?: string;
  poiId?: string;
  landmarkId?: string;
}

export interface NpcMovementPlan {
  npcId: string;
  fromLocation: NpcLocation;
  toLocation: NpcLocation;
  reason: string;
}

export interface NpcMovementOptions {
  allowReturnTrips?: boolean;
  movementWindowDays?: number;
}
