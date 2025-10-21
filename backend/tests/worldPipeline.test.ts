jest.mock('../src/services/supabaseClient', () => {
  const supabaseMock = createSupabaseMock();
  return {
    supabaseServiceClient: supabaseMock
  };
});

import type { SettlementNode } from '../src/services/roadNetworkService';
import { RoadNetworkService } from '../src/services/roadNetworkService';
import type { CharacterLocationRecord, CharacterLocationRepository } from '../src/services/locationService';
import { LocationService } from '../src/services/locationService';
import { supabaseServiceClient as supabaseMock } from '../src/services/supabaseClient';
import { initializeStartingArea } from '../src/services/fogOfWarService';

interface RoadDBRowLike {
  id: string;
  campaign_seed: string;
  from_settlement_id: string;
  from_settlement_name: string;
  to_settlement_id: string;
  to_settlement_name: string;
  from_position: { x: number; y: number };
  to_position: { x: number; y: number };
  polyline: { x: number; y: number }[];
  terrain_profile: any[];
  length: number;
  average_cost: number;
  created_at: string;
  updated_at: string;
}

class InMemoryRoadRepository {
  private readonly settlements: SettlementNode[];
  private rows: RoadDBRowLike[] = [];
  private idCounter = 0;

  constructor(settlements: SettlementNode[]) {
    this.settlements = settlements;
  }

  async fetchSettlements(campaignSeed: string): Promise<SettlementNode[]> {
    return this.settlements.filter(settlement => settlement.campaignSeed === campaignSeed);
  }

  async fetchRoadRecords(campaignSeed: string): Promise<RoadDBRowLike[]> {
    return this.rows.filter(row => row.campaign_seed === campaignSeed);
  }

  async upsertRoadRecords(rows: any[]): Promise<RoadDBRowLike[]> {
    const persisted: RoadDBRowLike[] = [];
    for (const row of rows) {
      const key = [row.from_settlement_id, row.to_settlement_id].sort().join('::');
      const existingIndex = this.rows.findIndex(existing => [existing.from_settlement_id, existing.to_settlement_id].sort().join('::') === key && existing.campaign_seed === row.campaign_seed);
      const now = new Date().toISOString();
      const payload: RoadDBRowLike = {
        id: existingIndex >= 0 ? this.rows[existingIndex].id : `road-${++this.idCounter}`,
        campaign_seed: row.campaign_seed,
        from_settlement_id: row.from_settlement_id,
        from_settlement_name: row.from_settlement_name,
        to_settlement_id: row.to_settlement_id,
        to_settlement_name: row.to_settlement_name,
        from_position: row.from_position,
        to_position: row.to_position,
        polyline: row.polyline,
        terrain_profile: row.terrain_profile,
        length: row.length,
        average_cost: row.average_cost,
        created_at: existingIndex >= 0 ? this.rows[existingIndex].created_at : now,
        updated_at: now
      };

      if (existingIndex >= 0) {
        this.rows[existingIndex] = payload;
      } else {
        this.rows.push(payload);
      }
      persisted.push(payload);
    }
    return persisted;
  }
}

class InMemoryCharacterLocationRepository implements CharacterLocationRepository {
  public records: CharacterLocationRecord[] = [];

  async upsertCharacterLocation(record: CharacterLocationRecord): Promise<void> {
    const index = this.records.findIndex(existing => existing.character_id === record.character_id);
    if (index >= 0) {
      this.records[index] = record;
    } else {
      this.records.push(record);
    }
  }
}

describe('World pipeline integration', () => {
  const campaignSeed = 'pipeline-campaign';

  const buildSettlement = (id: string, type: SettlementNode['type'], position: { x: number; y: number }): SettlementNode => ({
    id,
    campaignSeed,
    name: `${type}-${id}`,
    type,
    position,
    importance: RoadNetworkService.computeImportance(type)
  });

  it('generates roads after fog initialization and persists location context', async () => {
    const settlements: SettlementNode[] = [
      buildSettlement('alpha', 'town', { x: 0, y: 0 }),
      buildSettlement('bravo', 'city', { x: 16, y: 4 }),
      buildSettlement('charlie', 'village', { x: -12, y: -6 })
    ];

    const roadRepository = new InMemoryRoadRepository(settlements);
    const characterLocationRepository = new InMemoryCharacterLocationRepository();

    const roadService = new RoadNetworkService(roadRepository as unknown as any);
    const locationService = new LocationService({
      roadNetworkService: roadService,
      characterLocationRepository
    });

    const character = {
      id: 'character-1',
      campaign_seed: campaignSeed,
      position: { x: 2, y: 2 }
    };

    await initializeStartingArea(campaignSeed, character.position.x, character.position.y, character.id);

    const roads = await roadService.generateAndPersistRoads(campaignSeed);
    const context = await locationService.buildLocationContext(campaignSeed, character.position, {
      characterId: character.id,
      persist: true
    });

    expect(roads).toHaveLength(settlements.length - 1);
    expect(characterLocationRepository.records).toHaveLength(1);
    expect(context.nearestRoad).not.toBeNull();
    expect(context.nearestSettlement).not.toBeNull();

    const supabaseState = (supabaseMock as any).__getState();
    expect(supabaseState.world_fog.length).toBeGreaterThan(0);
  });
});

function createSupabaseMock() {
  const state = {
    world_fog: [] as Array<{ campaign_seed: string; tile_x: number; tile_y: number }>,
    campaign_bounds: new Map<string, { min_x: number; max_x: number; min_y: number; max_y: number }>()
  };

  const client = {
    from(table: string) {
      if (table !== 'world_fog') {
        throw new Error(`Unsupported table ${table} in mock`);
      }
      return {
        async upsert(rows: Array<{ campaign_seed: string; tile_x: number; tile_y: number }>) {
          rows.forEach(row => {
            const exists = state.world_fog.find(entry => entry.campaign_seed === row.campaign_seed && entry.tile_x === row.tile_x && entry.tile_y === row.tile_y);
            if (!exists) {
              state.world_fog.push({ campaign_seed: row.campaign_seed, tile_x: row.tile_x, tile_y: row.tile_y });
            }
          });
          return { data: rows, error: null };
        }
      };
    },
    async rpc(name: string, params: Record<string, unknown>) {
      if (name === 'update_campaign_bounds_atomic') {
        const tiles = JSON.parse(params.p_new_tiles as string) as Array<{ x: number; y: number }>;
        const seed = params.p_campaign_seed as string;
        const existing = state.campaign_bounds.get(seed) ?? {
          min_x: tiles[0].x,
          max_x: tiles[0].x,
          min_y: tiles[0].y,
          max_y: tiles[0].y
        };

        tiles.forEach(tile => {
          existing.min_x = Math.min(existing.min_x, tile.x);
          existing.max_x = Math.max(existing.max_x, tile.x);
          existing.min_y = Math.min(existing.min_y, tile.y);
          existing.max_y = Math.max(existing.max_y, tile.y);
        });

        state.campaign_bounds.set(seed, existing);
        return { data: null, error: null };
      }

      throw new Error(`Unsupported RPC ${name}`);
    },
    __getState() {
      return state;
    }
  } as const;

  return client;
}
