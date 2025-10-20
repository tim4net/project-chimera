/**
 * @file Procedural dungeon generator using rot.js Digger algorithm.
 */
import * as ROT from 'rot-js';
import { GeneratedMap, Point, Room, TileType } from './types';

/**
 * Configuration options for the DungeonGenerator.
 */
export interface DungeonGeneratorConfig {
  width: number;
  height: number;
  seed?: number;
  roomWidth?: [min: number, max: number];
  roomHeight?: [min: number, max: number];
  corridorLength?: [min: number, max: number];
  dugPercentage?: number;
  timeLimit?: number;
}

/**
 * Generates a classic roguelike dungeon map.
 *
 * @example
 * const config = { width: 80, height: 50 };
 * const generator = new DungeonGenerator(config);
 * const mapData = generator.generate();
 * // mapData can now be used to create a Phaser tilemap.
 */
export class DungeonGenerator {
  private readonly config: Required<DungeonGeneratorConfig>;
  private tiles: number[][] = [];
  private generatedRooms: Room[] = [];
  private generatedDoors: Point[] = [];

  constructor(config: DungeonGeneratorConfig) {
    this.config = {
      seed: config.seed ?? Date.now(),
      roomWidth: config.roomWidth ?? [4, 10],
      roomHeight: config.roomHeight ?? [4, 8],
      corridorLength: config.corridorLength ?? [3, 7],
      dugPercentage: config.dugPercentage ?? 0.2,
      timeLimit: config.timeLimit ?? 1000,
      ...config,
    };
  }

  /**
   * Generates the dungeon map data.
   * @returns A GeneratedMap object containing the tile data and metadata.
   */
  public generate(): GeneratedMap {
    this.initializeTiles();
    ROT.RNG.setSeed(this.config.seed);

    const digger = new ROT.Map.Digger(this.config.width, this.config.height, {
      roomWidth: this.config.roomWidth,
      roomHeight: this.config.roomHeight,
      corridorLength: this.config.corridorLength,
      dugPercentage: this.config.dugPercentage,
      timeLimit: this.config.timeLimit,
    });

    // The callback function for the digger algorithm
    const digCallback = (x: number, y: number, value: number) => {
      // value is 1 for wall, 0 for floor
      this.tiles[y][x] = value === 1 ? TileType.WALL : TileType.FLOOR;
    };

    digger.create(digCallback);

    this.processFeatures(digger);

    if (this.generatedRooms.length === 0) {
      throw new Error('Dungeon generation failed: No rooms were created.');
    }

    const spawnPoint = {
      x: this.generatedRooms[0].centerX,
      y: this.generatedRooms[0].centerY,
    };

    return {
      width: this.config.width,
      height: this.config.height,
      tiles: this.tiles,
      spawnPoint,
      rooms: this.generatedRooms,
      doors: this.generatedDoors,
    };
  }

  /**
   * Initializes the tile grid with a default value (e.g., WALL).
   */
  private initializeTiles(): void {
    this.tiles = Array.from({ length: this.config.height }, () =>
      Array(this.config.width).fill(TileType.WALL)
    );
    this.generatedRooms = [];
    this.generatedDoors = [];
  }

  /**
   * Extracts rooms and doors from the generated map features.
   * @param digger - The ROT.Map.Digger instance after generation.
   */
  private processFeatures(digger: typeof ROT.Map.Digger.prototype): void {
    // Extract rooms
    this.generatedRooms = digger.getRooms().map((room: any) => {
      const r: Room = {
        x: room.getLeft(),
        y: room.getTop(),
        width: room.getRight() - room.getLeft() + 1,
        height: room.getBottom() - room.getTop() + 1,
        centerX: room.getCenter()[0],
        centerY: room.getCenter()[1],
      };
      return r;
    });

    // Extract doors and place them on the tilemap
    digger.getCorridors().forEach((corridor: any) => {
        // A corridor in rot.js is essentially a list of doors
        corridor.create((x: number, y: number) => {
            this.tiles[y][x] = TileType.DOOR;
            this.generatedDoors.push({ x, y });
        });
    });
  }
}
