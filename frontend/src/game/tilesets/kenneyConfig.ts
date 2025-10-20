/**
 * Kenney.nl Micro Roguelike tileset configuration
 * Tileset: 8x8px tiles, 1px spacing, 16x10 grid (160 tiles total)
 */

export const KENNEY_MICRO_ROGUELIKE = {
  imageUrl: '/assets/tilesets/dungeon-tiles.png',
  tileWidth: 8,
  tileHeight: 8,
  spacing: 1,
  margin: 0,
  columns: 16,
  rows: 10,

  // Tile indices (row * 16 + col)
  tiles: {
    // Row 0: Floors and basic ground
    FLOOR_STONE_1: 0,
    FLOOR_STONE_2: 1,
    FLOOR_WOOD: 2,
    FLOOR_DIRT: 3,
    GRASS_LIGHT: 4,
    GRASS_DARK: 5,
    WATER_1: 6,
    WATER_2: 7,

    // Row 1: Walls (16-31)
    WALL_STONE_TOP: 16,
    WALL_STONE_MID: 17,
    WALL_STONE_BOT: 18,
    WALL_BRICK: 19,
    WALL_WOOD: 20,

    // Row 2: Doors and openings (32-47)
    DOOR_CLOSED: 32,
    DOOR_OPEN: 33,
    STAIRS_DOWN: 34,
    STAIRS_UP: 35,

    // Row 3: Trees and nature (48-63)
    TREE_1: 48,
    TREE_2: 49,
    TREE_3: 50,
    BUSH: 51,
    FLOWER: 52,

    // Commonly used
    VOID: 0,
    DEFAULT_FLOOR: 1,
    DEFAULT_WALL: 17,
    DEFAULT_TREE: 48,
  },
} as const;

/**
 * Maps our TileType enum to Kenney tileset indices
 */
export const TILE_TYPE_TO_KENNEY_INDEX = {
  [0]: 0,   // EMPTY → void/black
  [1]: 1,   // FLOOR → stone floor
  [2]: 17,  // WALL → stone wall
  [3]: 33,  // DOOR → open door
  [10]: 4,  // GRASS → light grass
  [11]: 48, // TREE → tree sprite
  [12]: 6,  // WATER → water tile
} as const;

/**
 * Helper to get Kenney tile index from our TileType
 */
export function getTileIndex(tileType: number): number {
  return TILE_TYPE_TO_KENNEY_INDEX[tileType as keyof typeof TILE_TYPE_TO_KENNEY_INDEX] ?? 0;
}
