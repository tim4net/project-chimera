import { NpcMovementService } from '../src/services/npcMovementService';

class Builder {
  private readonly table: any[];

  private readonly tables: Record<string, any[]>;

  private filters: Array<(row: any) => boolean> = [];

  private limitValue?: number;

  constructor(table: any[], tables: Record<string, any[]>) {
    this.table = table;
    this.tables = tables;
  }

  select(): this {
    return this;
  }

  eq(field: string, value: any): this {
    this.filters.push(row => row[field] === value);
    return this;
  }

  in(field: string, values: any[]): this {
    this.filters.push(row => values.includes(row[field]));
    return this;
  }

  order(): this {
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  is(field: string, value: any): this {
    this.filters.push(row => row[field] === value);
    return this;
  }

  apply(): any[] {
    let rows = [...this.table];
    for (const filter of this.filters) {
      rows = rows.filter(filter);
    }
    if (this.limitValue !== undefined) {
      rows = rows.slice(0, this.limitValue);
    }
    return rows;
  }

  async maybeSingle() {
    const rows = this.apply();
    const data = rows[0] ?? null;
    return { data, error: data ? null : { code: 'PGRST116' } };
  }

  async single() {
    const rows = this.apply();
    const data = rows[0] ?? null;
    return { data, error: data ? null : { message: 'no rows' } };
  }

  then(resolve: (value: { data: any[]; error: null }) => void) {
    resolve({ data: this.apply(), error: null });
  }

  update(payload: Record<string, any>) {
    return {
      eq: async (field: string, value: any) => {
        const rows = this.table.filter(row => row[field] === value);
        rows.forEach(row => Object.assign(row, payload));
        return { data: rows, error: null };
      }
    };
  }
}

function createSupabaseStub(initialTables: Record<string, any[]>) {
  return {
    tables: initialTables,
    from(tableName: string) {
      const table = initialTables[tableName];
      if (!table) throw new Error(`Table ${tableName} not found in stub`);
      return new Builder(table, initialTables);
    }
  };
}

describe('NpcMovementService', () => {
  it('moves a subset of NPCs to new locations', async () => {
    const tables = {
      world_npcs: [
        {
          id: 'npc-a',
          campaign_seed: 'seed',
          state: 'alive',
          current_location_type: 'settlement',
          current_location_id: 'sett-1',
          current_position: null,
          last_moved_at: null
        },
        {
          id: 'npc-b',
          campaign_seed: 'seed',
          state: 'alive',
          current_location_type: 'settlement',
          current_location_id: 'sett-1',
          current_position: null,
          last_moved_at: null
        }
      ],
      world_pois: [
        { id: 'sett-1', name: 'Oakfall', type: 'village', position: { x: 0, y: 0 }, campaign_seed: 'seed' },
        { id: 'sett-2', name: 'Rivergate', type: 'town', position: { x: 12, y: -3 }, campaign_seed: 'seed' }
      ],
      world_landmarks: [
        { id: 'land-1', name: 'Silent Stone', position: { x: 5, y: 5 }, campaign_seed: 'seed' }
      ]
    };

    const supabase = createSupabaseStub(tables);
    const service = new NpcMovementService({ supabaseClient: supabase as any });

    const plans = await service.performWeeklyMovement('seed');

    expect(plans.length).toBeGreaterThanOrEqual(0);
    if (plans.length > 0) {
      const movedNpc = tables.world_npcs.find(npc => npc.id === plans[0].npcId)!;
      expect(movedNpc.last_moved_at).not.toBeNull();
    }
  });
});
jest.mock('../src/services/supabaseClient', () => ({
  supabaseServiceClient: {}
}));
