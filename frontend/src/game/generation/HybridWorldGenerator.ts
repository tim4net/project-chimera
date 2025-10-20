import { BiomeGenerator } from './BiomeGenerator';
import { GeneratedMap, Point, TileType } from './types';

export interface HybridWorldGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  clearingRadius?: number;
  caveCountRange?: [number, number];
}

export class HybridWorldGenerator {
  private readonly config: Required<HybridWorldGeneratorConfig>;
  private random: () => number;

  constructor(config: HybridWorldGeneratorConfig) {
    const seed = config.seed ?? Date.now();
    this.config = {
      seed,
      clearingRadius: config.clearingRadius ?? 10,
      caveCountRange: config.caveCountRange ?? [2, 3],
      ...config,
    };
    this.random = this.createSeededRandom(seed);
  }

  public generate(): GeneratedMap {
    // Generate base wilderness terrain
    const biomeGen = new BiomeGenerator({
      width: this.config.width,
      height: this.config.height,
      seed: this.config.seed,
      randomizationFactor: 0.35,
      smoothingCycles: 6,
    });

    const biome = biomeGen.generate();
    const tiles = biome.tiles.map(row => [...row]);

    // Find a good central location for village
    const center: Point = {
      x: Math.floor(this.config.width / 2),
      y: Math.floor(this.config.height / 2),
    };

    // Carve village clearing
    this.carveClearing(tiles, center, this.config.clearingRadius);

    // Add 4 buildings around the clearing
    const buildings = this.addBuildings(tiles, center);

    // Add paths connecting village to edges
    this.addPaths(tiles, center);

    // Place POIs
    const caves = this.placePOIs(tiles, center, 'cave', this.config.caveCountRange);
    const ruins = this.placePOIs(tiles, center, 'ruins', [1, 1]);
    const camps = this.placePOIs(tiles, center, 'campsite', [1, 2]);

    return {
      width: this.config.width,
      height: this.config.height,
      tiles,
      spawnPoint: center,
      interestingPoints: {
        village_center: [center],
        buildings,
        cave_entrances: caves,
        ruins,
        campsites: camps,
      },
    };
  }

  private carveClearing(tiles: number[][], center: Point, radius: number): void {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        if (this.inBounds(x, y)) {
          const dist = Math.hypot(x - center.x, y - center.y);
          if (dist <= radius) {
            tiles[y][x] = dist <= radius - 3 ? TileType.FLOOR : TileType.GRASS;
          }
        }
      }
    }
  }

  private addBuildings(tiles: number[][], center: Point): Point[] {
    const buildings: Point[] = [];
    const distance = this.config.clearingRadius + 5;
    const positions = [
      { x: center.x, y: center.y - distance, side: 'south' },
      { x: center.x, y: center.y + distance, side: 'north' },
      { x: center.x - distance, y: center.y, side: 'east' },
      { x: center.x + distance, y: center.y, side: 'west' },
    ];

    positions.forEach(pos => {
      const building = this.drawBuilding(tiles, pos.x, pos.y, 6, 5, pos.side as any);
      if (building) buildings.push(building);
    });

    return buildings;
  }

  private drawBuilding(tiles: number[][], cx: number, cy: number, w: number, h: number, doorSide: string): Point | null {
    const x = cx - Math.floor(w / 2);
    const y = cy - Math.floor(h / 2);

    if (!this.rectangleInBounds(x, y, w, h)) return null;

    for (let by = y; by < y + h; by++) {
      for (let bx = x; bx < x + w; bx++) {
        const isWall = bx === x || bx === x + w - 1 || by === y || by === y + h - 1;
        tiles[by][bx] = isWall ? TileType.WALL : TileType.FLOOR;
      }
    }

    // Add door
    const doorX = x + Math.floor(w / 2);
    const doorY = doorSide === 'south' ? y + h - 1 : y;
    if (this.inBounds(doorX, doorY)) {
      tiles[doorY][doorX] = TileType.DOOR;
    }

    return { x: cx, y: cy };
  }

  private addPaths(tiles: number[][], center: Point): void {
    // Horizontal road (dirt path)
    for (let x = 5; x < this.config.width - 5; x++) {
      if (tiles[center.y][x] !== TileType.WALL) {
        tiles[center.y][x] = TileType.ROAD;
      }
    }
    // Vertical road (dirt path)
    for (let y = 5; y < this.config.height - 5; y++) {
      if (tiles[y][center.x] !== TileType.WALL) {
        tiles[y][center.x] = TileType.ROAD;
      }
    }
  }

  private placePOIs(tiles: number[][], center: Point, type: string, range: [number, number]): Point[] {
    const count = this.randomInt(range[0], range[1]);
    const pois: Point[] = [];
    const minDist = this.config.clearingRadius + 15;

    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const x = this.randomInt(minDist, this.config.width - minDist);
        const y = this.randomInt(minDist, this.config.height - minDist);
        const dist = Math.hypot(x - center.x, y - center.y);

        if (dist >= minDist && tiles[y][x] === TileType.GRASS) {
          pois.push({ x, y });
          // Mark with floor tile as placeholder
          tiles[y][x] = TileType.FLOOR;
          break;
        }
      }
    }

    return pois;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height;
  }

  private rectangleInBounds(x: number, y: number, w: number, h: number): boolean {
    return x >= 0 && y >= 0 && x + w <= this.config.width && y + h <= this.config.height;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}
