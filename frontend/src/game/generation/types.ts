/**
 * @file Defines shared types and constants for procedural map generation.
 */

/**
 * Represents the type of a single tile on the map.
 * These values typically correspond to tile indices in a spritesheet.
 */
export const TileType = {
  // Generic
  EMPTY: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,

  // Biome-specific
  GRASS: 10,
  TREE: 11,
  WATER: 12,
  ROAD: 13,      // Dirt/stone roads connecting areas
  SAND: 14,      // Beach/desert
} as const;

// Creates a union type from the values of TileType
export type Tile = (typeof TileType)[keyof typeof TileType];

/**
 * Defines the structure of a rectangular room.
 */
export interface Room {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
}

/**
 * Represents a point on the map.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * The output structure for any map generator.
 * This data is designed to be consumed by a Phaser Tilemap.
 */
export interface GeneratedMap {
  readonly width: number;
  readonly height: number;
  readonly tiles: number[][];
  readonly spawnPoint: Point;
  readonly rooms?: Room[];
  readonly doors?: Point[];
  readonly interestingPoints?: Record<string, Point[]>;
}
