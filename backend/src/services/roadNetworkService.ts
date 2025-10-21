import type { SupabaseClient } from '@supabase/supabase-js';

import { generateTile } from '../game/map';
import type {
  RoadCoordinate,
  RoadProximity,
  RoadRecord,
  SettlementSummary,
  SettlementType,
  TerrainSample,
  Vector2
} from '../types/road-types';
import { supabaseServiceClient } from './supabaseClient';

export interface SettlementNode {
  id: string;
  campaignSeed: string;
  name: string;
  type: SettlementType;
  position: Vector2;
  importance: number;
}

interface RoadDBRow {
  id: string;
  campaign_seed: string;
  from_settlement_id: string;
  from_settlement_name: string;
  to_settlement_id: string;
  to_settlement_name: string;
  from_position: Vector2;
  to_position: Vector2;
  polyline: RoadCoordinate[];
  terrain_profile: TerrainSample[];
  length: number;
  average_cost: number;
  created_at: string;
  updated_at: string;
}

interface RoadDBInsert {
  campaign_seed: string;
  from_settlement_id: string;
  from_settlement_name: string;
  to_settlement_id: string;
  to_settlement_name: string;
  from_position: Vector2;
  to_position: Vector2;
  polyline: RoadCoordinate[];
  terrain_profile: TerrainSample[];
  length: number;
  average_cost: number;
}

interface RoadNetworkRepository {
  fetchSettlements(campaignSeed: string): Promise<SettlementNode[]>;
  fetchRoadRecords(campaignSeed: string): Promise<RoadDBRow[]>;
  upsertRoadRecords(rows: RoadDBInsert[]): Promise<RoadDBRow[]>;
}

class SupabaseRoadNetworkRepository implements RoadNetworkRepository {
  constructor(private readonly client: SupabaseClient) {}

  async fetchSettlements(campaignSeed: string): Promise<SettlementNode[]> {
    const settlements: SettlementNode[] = [];

    try {
      const { data, error } = await this.client
        .from('world_pois')
        .select('id, name, type, position')
        .eq('campaign_seed', campaignSeed)
        .in('type', RoadNetworkService.SUPPORTED_SETTLEMENT_TYPES)
        .order('name', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      for (const row of data ?? []) {
        const position = normalizeVector(row.position);
        if (!position) continue;

        settlements.push({
          id: row.id,
          campaignSeed,
          name: row.name ?? 'Unknown Settlement',
          type: normalizeSettlementType(row.type),
          position,
          importance: RoadNetworkService.computeImportance(normalizeSettlementType(row.type))
        });
      }
    } catch (err) {
      console.error('[RoadNetwork] Failed to fetch settlements from world_pois:', err);
    }

    return settlements;
  }

  async fetchRoadRecords(campaignSeed: string): Promise<RoadDBRow[]> {
    const { data, error } = await this.client
      .from('world_roads')
      .select('*')
      .eq('campaign_seed', campaignSeed)
      .order('created_at', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return (data ?? []) as RoadDBRow[];
  }

  async upsertRoadRecords(rows: RoadDBInsert[]): Promise<RoadDBRow[]> {
    if (rows.length === 0) return [];

    const { data, error } = await this.client
      .from('world_roads')
      .upsert(rows, {
        onConflict: 'campaign_seed,from_settlement_id,to_settlement_id'
      })
      .select('*');

    if (error) {
      throw error;
    }

    return (data ?? []) as RoadDBRow[];
  }
}

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

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
}

export interface RoadEdge {
  from: SettlementNode;
  to: SettlementNode;
  cost: number;
  samples: TerrainSample[];
}

export class RoadNetworkService {
  static readonly SUPPORTED_SETTLEMENT_TYPES: SettlementType[] = ['village', 'town', 'city', 'capital', 'fort', 'outpost'];

  private readonly repository: RoadNetworkRepository;

  constructor(repository?: RoadNetworkRepository) {
    this.repository = repository ?? new SupabaseRoadNetworkRepository(supabaseServiceClient);
  }

  async getSettlementNodes(campaignSeed: string): Promise<SettlementNode[]> {
    const settlements = await this.repository.fetchSettlements(campaignSeed);
    // Deduplicate by ID to guard against data anomalies
    const seen = new Set<string>();
    return settlements.filter(settlement => {
      if (seen.has(settlement.id)) return false;
      seen.add(settlement.id);
      return true;
    });
  }

  async listRoads(campaignSeed: string): Promise<RoadRecord[]> {
    const rows = await this.repository.fetchRoadRecords(campaignSeed);
    return rows.map(RoadNetworkService.mapRowToRecord);
  }

  async ensureRoadNetwork(campaignSeed: string): Promise<RoadRecord[]> {
    const existing = await this.listRoads(campaignSeed);
    if (existing.length > 0) {
      return existing;
    }
    return this.generateAndPersistRoads(campaignSeed);
  }

  async generateAndPersistRoads(campaignSeed: string): Promise<RoadRecord[]> {
    const settlements = await this.getSettlementNodes(campaignSeed);
    if (settlements.length < 2) {
      return [];
    }

    const existingRows = await this.repository.fetchRoadRecords(campaignSeed);
    const existingPairs = new Set(existingRows.map(row => pairKey(row.from_settlement_id, row.to_settlement_id)));

    const edges = RoadNetworkService.buildMinimumSpanningTree(campaignSeed, settlements)
      .filter(edge => !existingPairs.has(pairKey(edge.from.id, edge.to.id)));

    if (edges.length === 0) {
      return existingRows.map(RoadNetworkService.mapRowToRecord);
    }

    const inserts = edges.map(edge => RoadNetworkService.buildRoadInsert(campaignSeed, edge));
    const persisted = await this.repository.upsertRoadRecords(inserts);
    const combined = [...existingRows, ...persisted];

    return dedupeRoadRecords(combined.map(RoadNetworkService.mapRowToRecord));
  }

  static buildMinimumSpanningTree(campaignSeed: string, nodes: SettlementNode[]): RoadEdge[] {
    if (nodes.length < 2) return [];

    const visited = new Set<string>();
    const edges: RoadEdge[] = [];
    const seed = `${campaignSeed}-roads-mst`;
    const rng = new DeterministicRandom(seed);

    visited.add(nodes[0].id);

    while (visited.size < nodes.length) {
      let bestEdge: RoadEdge | null = null;

      for (const fromId of Array.from(visited)) {
        const fromNode = nodes.find(node => node.id === fromId);
        if (!fromNode) continue;

        for (const toNode of nodes) {
          if (visited.has(toNode.id)) continue;

          const { cost, samples } = RoadNetworkService.calculateTerrainAwareCost(campaignSeed, fromNode, toNode);
          const weightedCost = cost / ((fromNode.importance + toNode.importance) / 2);

          if (!bestEdge || weightedCost < bestEdge.cost || (Math.abs(weightedCost - bestEdge.cost) < 0.001 && rng.next() > 0.5)) {
            bestEdge = {
              from: fromNode,
              to: toNode,
              cost: weightedCost,
              samples
            };
          }
        }
      }

      if (!bestEdge) {
        break;
      }

      visited.add(bestEdge.to.id);
      edges.push(bestEdge);
    }

    return edges.map(edge => normalizeEdgeOrientation(edge));
  }

  static calculateTerrainAwareCost(campaignSeed: string, from: SettlementNode, to: SettlementNode): { cost: number; samples: TerrainSample[] } {
    const samples = RoadNetworkService.sampleTerrainBetweenPoints(campaignSeed, from.position, to.position);
    const distance = calculateDistance(from.position, to.position);
    const penalty = samples.reduce((total, sample) => total + (sample.traversalCost - 1), 0);
    return {
      cost: distance + penalty,
      samples
    };
  }

  static sampleTerrainBetweenPoints(campaignSeed: string, start: Vector2, end: Vector2): TerrainSample[] {
    const points = bresenhamLine(roundVector(start), roundVector(end));
    const samples: TerrainSample[] = [];
    let previousElevation: number | null = null;

    for (const point of points) {
      const tile = generateTile(point.x, point.y, campaignSeed);
      const elevation = typeof tile.elevation === 'number' ? tile.elevation : 0;
      const slope = previousElevation === null ? 0 : Math.abs(elevation - previousElevation);
      const traversable = tile.traversable !== false && tile.biome !== 'water';
      const traversalCost = 1 + (traversable ? 0 : 5) + slope * 4;

      samples.push({
        position: { x: point.x, y: point.y },
        biome: tile.biome,
        elevation,
        traversable,
        traversalCost,
        slope
      });

      previousElevation = elevation;
    }

    return mergeConsecutiveDuplicates(samples);
  }

  static sampleTerrainAlongPolyline(campaignSeed: string, polyline: RoadCoordinate[]): TerrainSample[] {
    if (polyline.length < 2) return [];

    const samples: TerrainSample[] = [];

    for (let i = 0; i < polyline.length - 1; i += 1) {
      const start = polyline[i];
      const end = polyline[i + 1];
      const segmentSamples = RoadNetworkService.sampleTerrainBetweenPoints(campaignSeed, start, end);

      if (i > 0 && segmentSamples.length > 0) {
        segmentSamples.shift();
      }

      samples.push(...segmentSamples);
    }

    return samples;
  }

  static generateDeterministicPolyline(from: Vector2, to: Vector2, seed: string): RoadCoordinate[] {
    const start = { ...from };
    const end = { ...to };
    const distance = calculateDistance(start, end);
    const segments = Math.max(4, Math.ceil(distance / 6));
    const rng = new DeterministicRandom(seed);
    const points: RoadCoordinate[] = [];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const perpendicular = angle + Math.PI / 2;
    const amplitude = Math.min(8, distance * 0.15);

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      let x = start.x + dx * t;
      let y = start.y + dy * t;

      if (i > 0 && i < segments) {
        const offsetMagnitude = amplitude * Math.sin(Math.PI * t) * (rng.range(-0.5, 0.5));
        x += Math.cos(perpendicular) * offsetMagnitude;
        y += Math.sin(perpendicular) * offsetMagnitude;
      }

      points.push({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100
      });
    }

    return points;
  }

  static calculatePolylineLength(polyline: RoadCoordinate[]): number {
    if (polyline.length < 2) return 0;
    let length = 0;
    for (let i = 0; i < polyline.length - 1; i += 1) {
      length += calculateDistance(polyline[i], polyline[i + 1]);
    }
    return length;
  }

  private static buildRoadInsert(campaignSeed: string, edge: RoadEdge): RoadDBInsert {
    const [fromNode, toNode] = orderNodes(edge.from, edge.to);
    const polyline = RoadNetworkService.generateDeterministicPolyline(
      fromNode.position,
      toNode.position,
      `${campaignSeed}:${fromNode.id}:${toNode.id}`
    );

    const terrainProfile = RoadNetworkService.sampleTerrainAlongPolyline(campaignSeed, polyline);
    const length = RoadNetworkService.calculatePolylineLength(polyline);
    const averageCost = terrainProfile.length > 0
      ? terrainProfile.reduce((total, sample) => total + sample.traversalCost, 0) / terrainProfile.length
      : length;

    return {
      campaign_seed: campaignSeed,
      from_settlement_id: fromNode.id,
      from_settlement_name: fromNode.name,
      to_settlement_id: toNode.id,
      to_settlement_name: toNode.name,
      from_position: fromNode.position,
      to_position: toNode.position,
      polyline,
      terrain_profile: terrainProfile,
      length,
      average_cost: averageCost
    };
  }

  private static mapRowToRecord(row: RoadDBRow): RoadRecord {
    return {
      id: row.id,
      campaignSeed: row.campaign_seed,
      fromSettlementId: row.from_settlement_id,
      fromSettlementName: row.from_settlement_name,
      toSettlementId: row.to_settlement_id,
      toSettlementName: row.to_settlement_name,
      polyline: (row.polyline ?? []).map(point => ({ x: point.x, y: point.y })),
      terrainProfile: (row.terrain_profile ?? []).map(sample => ({
        position: { x: sample.position.x, y: sample.position.y },
        biome: sample.biome,
        elevation: sample.elevation,
        traversable: sample.traversable,
        traversalCost: sample.traversalCost,
        slope: sample.slope
      })),
      length: Number(row.length ?? 0),
      averageTraversalCost: Number(row.average_cost ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static computeImportance(type: SettlementType): number {
    switch (type) {
      case 'capital':
        return 5;
      case 'city':
        return 4;
      case 'town':
        return 3;
      case 'fort':
        return 2.5;
      case 'outpost':
        return 2;
      default:
        return 1.5;
    }
  }

  static summarizeRoadProximity(road: RoadRecord, proximity: ReturnType<typeof distancePointToPolyline>): RoadProximity {
    return {
      roadId: road.id,
      distance: proximity.distance,
      positionOnRoad: proximity.position,
      segmentIndex: proximity.segmentIndex,
      fromSettlementId: road.fromSettlementId,
      fromSettlementName: road.fromSettlementName,
      toSettlementId: road.toSettlementId,
      toSettlementName: road.toSettlementName
    };
  }
}

function normalizeVector(value: unknown): Vector2 | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const xRaw = v.x ?? (v.X ?? v.longitude);
  const yRaw = v.y ?? (v.Y ?? v.latitude);
  const x = typeof xRaw === 'number' ? xRaw : Number(xRaw);
  const y = typeof yRaw === 'number' ? yRaw : Number(yRaw);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    return { x, y };
  }
  return null;
}

function normalizeSettlementType(type: unknown): SettlementType {
  if (typeof type === 'string') {
    const normalized = type.toLowerCase() as SettlementType;
    if (RoadNetworkService.SUPPORTED_SETTLEMENT_TYPES.includes(normalized)) {
      return normalized;
    }
  }
  return 'village';
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('::');
}

function orderNodes(a: SettlementNode, b: SettlementNode): [SettlementNode, SettlementNode] {
  return a.id < b.id ? [a, b] : [b, a];
}

function normalizeEdgeOrientation(edge: RoadEdge): RoadEdge {
  const [from, to] = orderNodes(edge.from, edge.to);
  return {
    from,
    to,
    cost: edge.cost,
    samples: edge.samples
  };
}

function calculateDistance(a: Vector2, b: Vector2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function roundVector(vector: Vector2): Vector2 {
  return { x: Math.round(vector.x), y: Math.round(vector.y) };
}

function bresenhamLine(start: Vector2, end: Vector2): Vector2[] {
  const points: Vector2[] = [];
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;

  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
}

function mergeConsecutiveDuplicates(samples: TerrainSample[]): TerrainSample[] {
  if (samples.length === 0) return samples;
  const merged: TerrainSample[] = [samples[0]];
  for (let i = 1; i < samples.length; i += 1) {
    const previous = merged[merged.length - 1];
    const current = samples[i];
    if (previous.position.x !== current.position.x || previous.position.y !== current.position.y) {
      merged.push(current);
    }
  }
  return merged;
}

function dedupeRoadRecords(records: RoadRecord[]): RoadRecord[] {
  const byKey = new Map<string, RoadRecord>();
  for (const record of records) {
    byKey.set(pairKey(record.fromSettlementId, record.toSettlementId), record);
  }
  return Array.from(byKey.values());
}

export function distancePointToPolyline(point: Vector2, polyline: RoadCoordinate[]): {
  distance: number;
  position: Vector2;
  segmentIndex: number;
} {
  if (polyline.length === 0) {
    return { distance: Infinity, position: { x: 0, y: 0 }, segmentIndex: -1 };
  }

  let bestDistance = Infinity;
  let bestPosition = polyline[0];
  let bestSegment = 0;

  for (let i = 0; i < polyline.length - 1; i += 1) {
    const a = polyline[i];
    const b = polyline[i + 1];
    const projection = projectPointOnSegment(point, a, b);
    if (projection.distance < bestDistance) {
      bestDistance = projection.distance;
      bestPosition = projection.position;
      bestSegment = i;
    }
  }

  return {
    distance: bestDistance,
    position: { x: bestPosition.x, y: bestPosition.y },
    segmentIndex: bestSegment
  };
}

function projectPointOnSegment(point: Vector2, a: Vector2, b: Vector2): { distance: number; position: Vector2 } {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ap = { x: point.x - a.x, y: point.y - a.y };
  const abLengthSquared = ab.x * ab.x + ab.y * ab.y;

  if (abLengthSquared === 0) {
    return { distance: calculateDistance(point, a), position: { x: a.x, y: a.y } };
  }

  let t = (ap.x * ab.x + ap.y * ab.y) / abLengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projection = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  return { distance: calculateDistance(point, projection), position: projection };
}

export type { RoadProximity };
