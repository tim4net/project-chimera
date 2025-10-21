import type { SupabaseClient } from '@supabase/supabase-js';

import type { NpcMovementOptions, NpcMovementPlan, NpcHomeType, WorldNpcRecord } from '../types/npc-types';
import type { Vector2 } from '../types/road-types';
import { supabaseServiceClient } from './supabaseClient';

interface NpcMovementServiceDependencies {
  supabaseClient?: SupabaseClient;
}

interface LocationCandidate {
  id: string | null;
  locationType: NpcHomeType;
  name: string;
  position: Vector2 | null;
}

const MOVEMENT_CHANCE = 0.25;

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

export class NpcMovementService {
  private readonly supabase: SupabaseClient;

  constructor(dependencies: NpcMovementServiceDependencies = {}) {
    this.supabase = dependencies.supabaseClient ?? supabaseServiceClient;
  }

  async performWeeklyMovement(campaignSeed: string, options: NpcMovementOptions = {}): Promise<NpcMovementPlan[]> {
    const npcs = await this.fetchMovableNpcs(campaignSeed);
    if (npcs.length === 0) return [];

    const candidates = await this.buildLocationCandidates(campaignSeed);
    if (candidates.length === 0) return [];

    const random = new DeterministicRandom(`${campaignSeed}:${new Date().toISOString().slice(0, 10)}`);
    const plans: NpcMovementPlan[] = [];

    for (const npc of npcs) {
      if (random.next() > MOVEMENT_CHANCE) continue;

      const destination = random.pick(candidates);
      if (destination.locationType === npc.current_location_type && destination.id === npc.current_location_id) {
        continue;
      }

      await this.moveNpc(npc, destination);

      plans.push({
        npcId: npc.id,
        fromLocation: {
          locationType: npc.current_location_type,
          locationId: npc.current_location_id,
          position: npc.current_position
        },
        toLocation: {
          locationType: destination.locationType,
          locationId: destination.id,
          position: destination.position
        },
        reason: destination.locationType === 'wilderness'
          ? 'scouting the wilds between settlements'
          : `traveling to ${destination.name}`
      });
    }

    return plans;
  }

  private async fetchMovableNpcs(campaignSeed: string): Promise<WorldNpcRecord[]> {
    const { data, error } = await this.supabase
      .from('world_npcs')
      .select('*')
      .eq('campaign_seed', campaignSeed)
      .eq('state', 'alive');

    if (error) {
      console.error('[NpcMovementService] Failed to fetch movable NPCs:', error);
      return [];
    }

    return (data ?? []) as WorldNpcRecord[];
  }

  private async buildLocationCandidates(campaignSeed: string): Promise<LocationCandidate[]> {
    const candidates: LocationCandidate[] = [];

    const { data: settlements, error: settlementsError } = await this.supabase
      .from('world_pois')
      .select('id, name, type, position')
      .eq('campaign_seed', campaignSeed)
      .in('type', ['village', 'town', 'city', 'capital', 'fort', 'outpost']);

    if (!settlementsError) {
      for (const settlement of settlements ?? []) {
        candidates.push({
          id: settlement.id,
          locationType: 'settlement',
          name: settlement.name ?? 'Unnamed Settlement',
          position: settlement.position as Vector2 | null
        });
      }
    }

    const { data: landmarks, error: landmarksError } = await this.supabase
      .from('world_landmarks')
      .select('id, name, position')
      .eq('campaign_seed', campaignSeed);

    if (!landmarksError) {
      for (const landmark of landmarks ?? []) {
        candidates.push({
          id: landmark.id,
          locationType: 'landmark',
          name: landmark.name,
          position: landmark.position as Vector2 | null
        });
      }
    }

    // Wilderness roaming option
    candidates.push({
      id: null,
      locationType: 'wilderness',
      name: 'the open road',
      position: null
    });

    return candidates;
  }

  private async moveNpc(npc: WorldNpcRecord, destination: LocationCandidate): Promise<void> {
    const payload: Partial<WorldNpcRecord> = {
      current_location_type: destination.locationType,
      current_location_id: destination.id,
      current_position: destination.position,
      last_moved_at: new Date().toISOString()
    } as Partial<WorldNpcRecord>;

    const { error } = await this.supabase
      .from('world_npcs')
      .update(payload)
      .eq('id', npc.id);

    if (error) {
      console.error('[NpcMovementService] Failed to move NPC:', error);
    }
  }
}

export const npcMovementService = new NpcMovementService();
