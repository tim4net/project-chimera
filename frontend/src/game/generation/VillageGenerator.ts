/**
 * @file Village/settlement generator for safe starting areas
 * Creates a small village with buildings, paths, and a central clearing
 */
import { GeneratedMap, Point, TileType } from './types';

export interface VillageGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  buildingCount?: number;
  pathWidth?: number;
}

/**
 * Generates a small village/settlement as a starting safe zone
 */
export class VillageGenerator {
  private readonly config: Required<VillageGeneratorConfig>;
  private tiles: number[][] = [];

  constructor(config: VillageGeneratorConfig) {
    this.config = {
      seed: config.seed ?? Date.now(),
      buildingCount: config.buildingCount ?? 5,
      pathWidth: config.pathWidth ?? 3,
      ...config,
    };
  }

  public generate(): GeneratedMap {
    this.initializeTiles();

    // Start with all grass
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        this.tiles[y][x] = TileType.GRASS;
      }
    }

    // Add some decorative trees around the edges
    this.addPerimeterTrees();

    // Create central clearing (spawn point)
    const centerX = Math.floor(this.config.width / 2);
    const centerY = Math.floor(this.config.height / 2);
    const clearingRadius = 8;

    for (let y = centerY - clearingRadius; y <= centerY + clearingRadius; y++) {
      for (let x = centerX - clearingRadius; x <= centerX + clearingRadius; x++) {
        if (this.inBounds(x, y)) {
          const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (dist <= clearingRadius) {
            this.tiles[y][x] = TileType.FLOOR; // Stone plaza
          }
        }
      }
    }

    // Add simple buildings around the clearing
    this.addBuildings(centerX, centerY, clearingRadius + 3);

    // Add paths
    this.addPaths();

    const spawnPoint: Point = {
      x: centerX,
      y: centerY,
    };

    return {
      width: this.config.width,
      height: this.config.height,
      tiles: this.tiles,
      spawnPoint,
      interestingPoints: {
        village_center: [{ x: centerX, y: centerY }],
        buildings: this.findBuildingCenters(),
      },
    };
  }

  private initializeTiles(): void {
    this.tiles = Array.from({ length: this.config.height }, () =>
      Array(this.config.width).fill(TileType.GRASS)
    );
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height;
  }

  private addPerimeterTrees(): void {
    const border = 5;
    for (let x = 0; x < this.config.width; x++) {
      for (let y = 0; y < border; y++) {
        if (Math.random() > 0.3) this.tiles[y][x] = TileType.TREE;
      }
      for (let y = this.config.height - border; y < this.config.height; y++) {
        if (Math.random() > 0.3) this.tiles[y][x] = TileType.TREE;
      }
    }
    for (let y = border; y < this.config.height - border; y++) {
      for (let x = 0; x < border; x++) {
        if (Math.random() > 0.3) this.tiles[y][x] = TileType.TREE;
      }
      for (let x = this.config.width - border; x < this.config.width; x++) {
        if (Math.random() > 0.3) this.tiles[y][x] = TileType.TREE;
      }
    }
  }

  private addBuildings(centerX: number, centerY: number, radius: number): void {
    const buildingPositions = [
      { x: centerX - radius - 4, y: centerY - 6 },
      { x: centerX + radius + 2, y: centerY - 6 },
      { x: centerX - radius - 4, y: centerY + 4 },
      { x: centerX + radius + 2, y: centerY + 4 },
      { x: centerX, y: centerY - radius - 6 },
    ];

    buildingPositions.slice(0, this.config.buildingCount).forEach((pos) => {
      this.addBuilding(pos.x, pos.y, 6, 5);
    });
  }

  private addBuilding(x: number, y: number, width: number, height: number): void {
    for (let by = y; by < y + height; by++) {
      for (let bx = x; bx < x + width; bx++) {
        if (this.inBounds(bx, by)) {
          // Walls on perimeter, floor inside
          if (bx === x || bx === x + width - 1 || by === y || by === y + height - 1) {
            this.tiles[by][bx] = TileType.WALL;
          } else {
            this.tiles[by][bx] = TileType.FLOOR;
          }
        }
      }
    }

    // Add door in the middle of the bottom wall
    const doorX = x + Math.floor(width / 2);
    if (this.inBounds(doorX, y + height - 1)) {
      this.tiles[y + height - 1][doorX] = TileType.DOOR;
    }
  }

  private addPaths(): void {
    const centerX = Math.floor(this.config.width / 2);
    const centerY = Math.floor(this.config.height / 2);

    // Horizontal path through center
    for (let x = centerX - 20; x < centerX + 20; x++) {
      if (this.inBounds(x, centerY) && this.tiles[centerY][x] !== TileType.WALL) {
        this.tiles[centerY][x] = TileType.FLOOR;
      }
    }

    // Vertical path through center
    for (let y = centerY - 15; y < centerY + 15; y++) {
      if (this.inBounds(centerX, y) && this.tiles[y][centerX] !== TileType.WALL) {
        this.tiles[y][centerX] = TileType.FLOOR;
      }
    }
  }

  private findBuildingCenters(): Point[] {
    const buildings: Point[] = [];
    const visited = new Set<string>();

    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        if (this.tiles[y][x] === TileType.FLOOR && !visited.has(`${x},${y}`)) {
          // Found a floor tile, check if it's part of a building
          const buildingTiles = this.floodFillFloor(x, y, visited);
          if (buildingTiles.length > 4 && buildingTiles.length < 50) {
            // It's a building (not the plaza)
            const centerX = Math.floor(buildingTiles.reduce((sum, t) => sum + t.x, 0) / buildingTiles.length);
            const centerY = Math.floor(buildingTiles.reduce((sum, t) => sum + t.y, 0) / buildingTiles.length);
            buildings.push({ x: centerX, y: centerY });
          }
        }
      }
    }

    return buildings;
  }

  private floodFillFloor(startX: number, startY: number, visited: Set<string>): Point[] {
    const queue: Point[] = [{ x: startX, y: startY }];
    const result: Point[] = [];
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      result.push({ x, y });

      const neighbors = [
        { x: x - 1, y }, { x: x + 1, y },
        { x, y: y - 1 }, { x, y: y + 1 },
      ];

      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (this.inBounds(n.x, n.y) && !visited.has(key) && this.tiles[n.y][n.x] === TileType.FLOOR) {
          visited.add(key);
          queue.push(n);
        }
      }
    }

    return result;
  }
}
