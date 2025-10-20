/**
 * @file Procedural biome generator using rot.js Cellular Automata.
 */
import * as ROT from 'rot-js';
import { GeneratedMap, Point, TileType } from './types';

/**
 * Configuration options for the BiomeGenerator.
 */
export interface BiomeGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  /** Percentage of tiles that start as "alive" (e.g., trees). Range: 0-1 */
  randomizationFactor?: number;
  /** Number of smoothing iterations to run. */
  smoothingCycles?: number;
}

/**
 * Generates an organic, biome-style map (e.g., forest, cave)
 * using cellular automata.
 *
 * @example
 * const config = { width: 100, height: 100 };
 * const generator = new BiomeGenerator(config);
 * const mapData = generator.generate();
 * // mapData can now be used to create a Phaser tilemap.
 */
export class BiomeGenerator {
  private readonly config: Required<BiomeGeneratorConfig>;
  private tiles: number[][] = [];

  constructor(config: BiomeGeneratorConfig) {
    this.config = {
      seed: config.seed ?? Date.now(),
      randomizationFactor: config.randomizationFactor ?? 0.45,
      smoothingCycles: config.smoothingCycles ?? 4,
      ...config,
    };
  }

  /**
   * Generates the biome map data.
   * @returns A GeneratedMap object.
   */
  public generate(): GeneratedMap {
    this.initializeTiles();
    ROT.RNG.setSeed(this.config.seed);

    const cellular = new ROT.Map.Cellular(
      this.config.width,
      this.config.height
    );
    cellular.randomize(this.config.randomizationFactor);

    // Run smoothing cycles
    for (let i = 0; i < this.config.smoothingCycles; i++) {
      cellular.create();
    }

    // The callback populates our tile grid
    const mapCallback = (x: number, y: number, value: number) => {
      // value is 1 for wall/tree, 0 for floor/grass
      this.tiles[y][x] = value === 1 ? TileType.TREE : TileType.GRASS;
    };
    cellular.create(mapCallback);

    const spawnPoint = this.findSpawnPoint();
    if (!spawnPoint) {
      throw new Error('Biome generation failed: Could not find a valid spawn point.');
    }

    return {
      width: this.config.width,
      height: this.config.height,
      tiles: this.tiles,
      spawnPoint,
    };
  }

  /**
   * Initializes the tile grid with a default value.
   */
  private initializeTiles(): void {
    this.tiles = Array.from({ length: this.config.height }, () =>
      Array(this.config.width).fill(TileType.TREE)
    );
  }

  /**
   * Finds a suitable spawn point by identifying the largest open area.
   * @returns A Point for the spawn location, or null if none is found.
   */
  private findSpawnPoint(): Point | null {
    const visited: boolean[][] = Array.from({ length: this.config.height }, () =>
      Array(this.config.width).fill(false)
    );
    let largestArea: Point[] = [];

    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        if (!visited[y][x] && this.tiles[y][x] === TileType.GRASS) {
          const currentArea = this.floodFill(x, y, visited);
          if (currentArea.length > largestArea.length) {
            largestArea = currentArea;
          }
        }
      }
    }

    // Return the center point of the largest area
    if (largestArea.length > 0) {
      const centerIndex = Math.floor(largestArea.length / 2);
      return largestArea[centerIndex];
    }

    return null;
  }

  /**
   * Performs a flood fill to find all connected tiles of the same type.
   * @param startX - The starting X coordinate.
   * @param startY - The starting Y coordinate.
   * @param visited - A 2D array tracking visited tiles.
   * @returns An array of points in the connected area.
   */
  private floodFill(startX: number, startY: number, visited: boolean[][]): Point[] {
    const queue: Point[] = [{ x: startX, y: startY }];
    const area: Point[] = [];
    const targetType = this.tiles[startY][startX];
    visited[startY][startX] = true;

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      area.push({ x, y });

      const neighbors = [
        { x: x, y: y - 1 }, // North
        { x: x, y: y + 1 }, // South
        { x: x - 1, y: y }, // West
        { x: x + 1, y: y }, // East
      ];

      for (const neighbor of neighbors) {
        const { x: nx, y: ny } = neighbor;
        if (
          nx >= 0 && nx < this.config.width &&
          ny >= 0 && ny < this.config.height &&
          !visited[ny][nx] &&
          this.tiles[ny][nx] === targetType
        ) {
          visited[ny][nx] = true;
          queue.push(neighbor);
        }
      }
    }
    return area;
  }
}
