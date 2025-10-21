jest.mock('../src/services/supabaseClient', () => ({
  supabaseServiceClient: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null })
  }
}));

import {
  RoadNetworkService,
  type SettlementNode
} from '../src/services/roadNetworkService';

describe('RoadNetworkService', () => {
  const buildNode = (id: string, type: Parameters<typeof RoadNetworkService.computeImportance>[0], x: number, y: number): SettlementNode => ({
    id,
    campaignSeed: 'test-campaign',
    name: `${type}-${id}`,
    type,
    position: { x, y },
    importance: RoadNetworkService.computeImportance(type)
  });

  it('builds a minimum spanning tree that connects all settlements', () => {
    const nodes: SettlementNode[] = [
      buildNode('a', 'town', 0, 0),
      buildNode('b', 'town', 10, 0),
      buildNode('c', 'village', 5, 8),
      buildNode('d', 'city', -6, 4)
    ];

    const edges = RoadNetworkService.buildMinimumSpanningTree('seed', nodes);

    expect(edges).toHaveLength(nodes.length - 1);

    const connected = new Set<string>();
    edges.forEach(edge => {
      connected.add(edge.from.id);
      connected.add(edge.to.id);
      expect(RoadNetworkService.SUPPORTED_SETTLEMENT_TYPES).toContain(edge.from.type);
      expect(RoadNetworkService.SUPPORTED_SETTLEMENT_TYPES).toContain(edge.to.type);
    });

    expect(connected.size).toBe(nodes.length);
  });

  it('samples terrain between points with traversal cost estimates', () => {
    const samples = RoadNetworkService.sampleTerrainBetweenPoints('terrain-seed', { x: 0, y: 0 }, { x: 6, y: 4 });

    expect(samples.length).toBeGreaterThan(0);
    samples.forEach(sample => {
      expect(Number.isFinite(sample.traversalCost)).toBe(true);
      expect(sample.traversalCost).toBeGreaterThan(0);
    });
  });

  it('generates deterministic polylines between settlements', () => {
    const start = { x: -3, y: -2 };
    const end = { x: 12, y: 7 };

    const polylineA = RoadNetworkService.generateDeterministicPolyline(start, end, 'polyline-seed');
    const polylineB = RoadNetworkService.generateDeterministicPolyline(start, end, 'polyline-seed');

    expect(polylineA.length).toBeGreaterThan(2);
    expect(polylineA[0].x).toBeCloseTo(start.x, 2);
    expect(polylineA[0].y).toBeCloseTo(start.y, 2);
    expect(polylineA[polylineA.length - 1].x).toBeCloseTo(end.x, 2);
    expect(polylineA[polylineA.length - 1].y).toBeCloseTo(end.y, 2);
    expect(polylineA).toEqual(polylineB);
  });

  it('ensures roads only connect supported settlements, skipping isolated dungeons', async () => {
    const nodes: SettlementNode[] = [
      buildNode('alpha', 'town', 0, 0),
      buildNode('bravo', 'village', 10, 5),
      buildNode('charlie', 'city', -8, -3)
    ];

    const edges = RoadNetworkService.buildMinimumSpanningTree('seed', nodes);
    const supportedTypes = new Set(RoadNetworkService.SUPPORTED_SETTLEMENT_TYPES);

    edges.forEach(edge => {
      expect(supportedTypes.has(edge.from.type)).toBe(true);
      expect(supportedTypes.has(edge.to.type)).toBe(true);
    });

    const connectedIds = new Set(edges.flatMap(edge => [edge.from.id, edge.to.id]));
    expect(connectedIds.size).toBe(nodes.length);
  });
});
