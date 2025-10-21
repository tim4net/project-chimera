import { LandmarkService } from '../src/services/landmarkService';
import type { LandmarkRecord } from '../src/types';

describe('LandmarkService', () => {
  const timestamp = new Date().toISOString();

  function createService(withStore: LandmarkRecord[]): LandmarkService {
    const service = new LandmarkService({ supabaseClient: {} as any });

    (service as any).resolveLocationContext = jest.fn(async () => ({
      nearestRoadId: null,
      nearestRoadName: null,
      nearestSettlementId: null,
      nearestSettlementName: null
    }));

    (service as any).fetchLandmark = jest.fn(async (_seed: string, tileX: number, tileY: number) =>
      withStore.find(record => record.tile_x === tileX && record.tile_y === tileY) ?? null
    );

    (service as any).insertLandmark = jest.fn(async (row: any) => {
      const record: LandmarkRecord = {
        id: `${row.tile_x}:${row.tile_y}`,
        campaign_seed: row.campaign_seed,
        tile_x: row.tile_x,
        tile_y: row.tile_y,
        position: row.position,
        type: row.type,
        name: row.name,
        description: row.description,
        nearest_road_id: row.nearest_road_id,
        nearest_road_name: row.nearest_road_name,
        nearest_settlement_id: row.nearest_settlement_id,
        nearest_settlement_name: row.nearest_settlement_name,
        discovery_state: { discovered_by: [], last_discovered_at: null },
        created_at: timestamp,
        updated_at: timestamp
      };
      withStore.push(record);
      return record;
    });

    (service as any).fetchLandmarkById = jest.fn(async (id: string) =>
      withStore.find(record => record.id === id) ?? null
    );

    (service as any).supabase = {
      from: () => ({
        update: (payload: any) => ({
          eq: async (field: string, value: string) => {
            const match = withStore.find(record => (record as any)[field] === value);
            if (match) {
              match.discovery_state = payload.discovery_state;
            }
            return { data: match ?? null, error: null };
          }
        }),
        select: () => ({ eq: async () => ({ data: withStore, error: null }) })
      })
    };

    return service;
  }

  it('generates deterministic landmarks per tile', async () => {
    const store: LandmarkRecord[] = [];
    const service = createService(store);

    const firstRun = await service.ensureLandmarksAroundPosition('seed-123', { x: 42.7, y: -19.4 }, 1);
    expect(firstRun.length).toBeGreaterThanOrEqual(0);

    const secondRun = await service.ensureLandmarksAroundPosition('seed-123', { x: 42.7, y: -19.4 }, 1);

    expect(secondRun).toEqual(firstRun);
    expect((service as any).insertLandmark).toHaveBeenCalledTimes(firstRun.length);
  });

  it('records discovery once per character', async () => {
    const store: LandmarkRecord[] = [];
    const service = createService(store);

    const [landmark] = await service.ensureLandmarksAroundPosition('seed-xyz', { x: 10, y: 10 }, 1);
    expect(landmark).toBeDefined();

    const character: any = {
      id: 'char-1',
      campaign_seed: 'seed-xyz',
      position: { x: landmark?.position.x ?? 10, y: landmark?.position.y ?? 10 }
    };

    const discoveries = await service.recordNearbyDiscoveries(character, 5);
    expect(discoveries.newlyDiscovered.length + discoveries.alreadyKnown.length).toBeGreaterThan(0);

    const secondPass = await service.recordNearbyDiscoveries(character, 5);
    expect(secondPass.newlyDiscovered).toHaveLength(0);
    expect(secondPass.alreadyKnown.length).toBeGreaterThanOrEqual(1);
  });
});
jest.mock('../src/services/supabaseClient', () => ({
  supabaseServiceClient: {}
}));
