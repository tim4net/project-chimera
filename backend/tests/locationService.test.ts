jest.mock('../src/services/supabaseClient', () => ({
  supabaseServiceClient: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null })
  }
}));

import { LocationService } from '../src/services/locationService';
import { RoadNetworkService, type SettlementNode } from '../src/services/roadNetworkService';

describe('LocationService utilities', () => {
  const makeSettlement = (id: string, type: SettlementNode['type'], x: number, y: number): SettlementNode => ({
    id,
    campaignSeed: 'campaign',
    name: `${type}-${id}`,
    type,
    position: { x, y },
    importance: RoadNetworkService.computeImportance(type)
  });

  it('computes the shortest distance from a point to a polyline', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 }
    ];
    const point = { x: 5, y: 4 };

    const proximity = LocationService.distancePointToPolyline(point, polyline);

    expect(proximity.segmentIndex).toBe(0);
    expect(proximity.distance).toBeCloseTo(4, 3);
    expect(proximity.position.x).toBeCloseTo(5, 3);
    expect(proximity.position.y).toBeCloseTo(0, 3);
  });

  it('picks the nearest settlement from candidate nodes', () => {
    const settlements: SettlementNode[] = [
      makeSettlement('a', 'town', -5, -5),
      makeSettlement('b', 'village', 3, 4),
      makeSettlement('c', 'city', 10, 10)
    ];

    const position = { x: 2, y: 2 };
    const nearest = LocationService.findNearestSettlement(position, settlements);

    expect(nearest).not.toBeNull();
    expect(nearest?.id).toBe('b');
    expect(nearest?.distance).toBeCloseTo(Math.hypot(1, 2), 3);
  });

  it('returns nearby settlements sorted by distance and bounded by limit', () => {
    const settlements: SettlementNode[] = [
      makeSettlement('a', 'town', 0, 0),
      makeSettlement('b', 'village', 8, 0),
      makeSettlement('c', 'city', -6, -1),
      makeSettlement('d', 'outpost', 20, 0)
    ];

    const nearby = LocationService.computeNearbySettlements({ x: 2, y: 1 }, settlements, 3, 12);

    expect(nearby).toHaveLength(3);
    expect(nearby.map(s => s.id)).toEqual(['a', 'b', 'c']);
    expect(nearby[0].distance).toBeLessThanOrEqual(nearby[1].distance);
  });
});
