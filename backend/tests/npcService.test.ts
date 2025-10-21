import type { CharacterNpcReputation, WorldNpcRecord } from '../src/types/npc-types';
import type { SettlementType } from '../src/types/road-types';
import { NpcService } from '../src/services/npcService';

function createSettlement(type: SettlementType) {
  return {
    id: `${type}-1`,
    name: `${type}-name`,
    type,
    position: { x: 0, y: 0 }
  };
}

function createSupabaseStub() {
  const tables: Record<string, any[]> = {
    world_npcs: [],
    character_npc_reputation: []
  };

  return {
    tables,
    from(table: string) {
      switch (table) {
        case 'character_npc_reputation':
          return {
            select: () => {
              const filters: Record<string, string> = {};
              return {
                eq(field: string, value: string) {
                  filters[field] = value;
                  return this;
                },
                async maybeSingle() {
                  const row = tables.character_npc_reputation.find(record => {
                    const matchCharacter = filters.character_id ? record.character_id === filters.character_id : true;
                    const matchNpc = filters.npc_id ? record.npc_id === filters.npc_id : true;
                    return matchCharacter && matchNpc;
                  }) ?? null;

                  return { data: row, error: row ? null : { code: 'PGRST116' } };
                }
              };
            },
            upsert: (payload: CharacterNpcReputation) => ({
              select: () => ({
                single: async () => {
                  const idx = tables.character_npc_reputation.findIndex(r =>
                    r.character_id === payload.character_id && r.npc_id === payload.npc_id
                  );
                  if (idx >= 0) {
                    tables.character_npc_reputation[idx] = {
                      ...tables.character_npc_reputation[idx],
                      ...payload
                    };
                    return { data: tables.character_npc_reputation[idx], error: null };
                  }

                  tables.character_npc_reputation.push({ ...payload });
                  return { data: payload, error: null };
                }
              })
            })
          };
        case 'world_npcs':
          return {
            select: () => ({
              eq: function () { return this; },
              async in(_field: string, _values: string[]) { return { data: [], error: null }; },
              async maybeSingle() { return { data: null, error: { code: 'PGRST116' } }; },
              async single() { return { data: null, error: { message: 'not implemented' } }; }
            }),
            update: () => ({ eq: async () => ({ data: null, error: null }) })
          };
        default:
          throw new Error(`Table ${table} not supported in stub`);
      }
    }
  };
}

describe('NpcService', () => {
  it('generates deterministic settlement rosters per seed', async () => {
    const settlement = createSettlement('village');

    const buildService = () => {
      const svc = new NpcService({ supabaseClient: createSupabaseStub() as any });
      const store: WorldNpcRecord[] = [];

      (svc as any).fetchNpcsByHome = jest.fn(async () => store);
      (svc as any).createNpcRecord = jest.fn(async () => {
        const record: WorldNpcRecord = {
          id: `npc-${store.length}`,
          campaign_seed: 'seed',
          name: `NPC ${store.length}`,
          race: 'Human',
          class: 'Fighter',
          role: 'Bartender',
          personality: 'stoic',
          state: 'alive',
          home_location_type: 'settlement',
          home_location_id: settlement.id,
          current_location_type: 'settlement',
          current_location_id: settlement.id,
          current_position: null,
          quests_given_total: 0,
          quests_completed_total: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_moved_at: null
        };
        store.push(record);
        return record;
      });

      return { svc, store };
    };

    const { svc: firstService } = buildService();
    const rosterFirst = await firstService.ensureSettlementNpcs('seed', settlement);

    const { svc: secondService } = buildService();
    const rosterSecond = await secondService.ensureSettlementNpcs('seed', settlement);

    expect(rosterFirst.length).toBeGreaterThanOrEqual(2);
    expect(rosterSecond.length).toBeGreaterThanOrEqual(2);
    expect(rosterSecond.map(npc => npc.name)).toEqual(rosterFirst.map(npc => npc.name));
  });

  it('tracks reputation adjustments per character', async () => {
    const supabase = createSupabaseStub();
    const service = new NpcService({ supabaseClient: supabase as any });

    const updated = await service.adjustReputation('char-1', 'npc-1', 15, 1, 0);
    expect(updated.reputation_score).toBe(15);
    expect(updated.quests_given).toBe(1);

    const second = await service.adjustReputation('char-1', 'npc-1', -40, 0, 1);
    expect(second.reputation_score).toBe(-25);
    expect(second.quests_completed).toBe(1);
  });
});
jest.mock('../src/services/supabaseClient', () => ({
  supabaseServiceClient: {}
}));
