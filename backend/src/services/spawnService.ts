/**
 * @file Spawn Service - Determines starting locations for new players
 *
 * Players spawn near (but not in) settlements, distributed within ~1 mile
 */

interface Point {
  x: number;
  y: number;
}

interface SpawnConfig {
  worldWidth: number;
  worldHeight: number;
  seed: number;
  playerId: string; // For deterministic but varied spawns
}

const TILES_PER_MILE = 20; // Rough scale: 1 tile = ~250 feet
const SPAWN_RADIUS_MIN = 15; // ~0.75 miles from city
const SPAWN_RADIUS_MAX = 25; // ~1.25 miles from city
const CITY_SEARCH_RADIUS = 50; // How far to search for cities

/**
 * Find the nearest city/village center in the procedurally generated world.
 * HybridWorldGenerator places villages at the map center, but we should
 * search for it in case generation changes.
 */
function findNearestCity(worldWidth: number, worldHeight: number, seed: number): Point {
  // For HybridWorldGenerator, the village is always at center
  // TODO: In future, scan for FLOOR tiles in large clusters
  return {
    x: Math.floor(worldWidth / 2),
    y: Math.floor(worldHeight / 2),
  };
}

/**
 * Generate a deterministic but varied spawn point for a player.
 * Uses player ID as additional seed for distribution.
 */
export function calculateSpawnLocation(config: SpawnConfig): Point {
  const city = findNearestCity(config.worldWidth, config.worldHeight, config.seed);

  // Create deterministic RNG from player ID
  const hash = simpleHash(config.playerId);
  const rng = createSeededRandom(hash);

  // Random angle around city
  const angle = rng() * Math.PI * 2;

  // Random distance from city (between min and max radius)
  const distance = SPAWN_RADIUS_MIN + rng() * (SPAWN_RADIUS_MAX - SPAWN_RADIUS_MIN);

  // Calculate offset
  const offsetX = Math.cos(angle) * distance;
  const offsetY = Math.sin(angle) * distance;

  // Apply offset to city position
  let spawnX = Math.round(city.x + offsetX);
  let spawnY = Math.round(city.y + offsetY);

  // Clamp to world bounds
  spawnX = Math.max(5, Math.min(config.worldWidth - 5, spawnX));
  spawnY = Math.max(5, Math.min(config.worldHeight - 5, spawnY));

  return { x: spawnX, y: spawnY };
}

/**
 * Simple string hash function for deterministic RNG seeding
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Create a seeded random number generator
 * Returns a function that generates numbers between 0 and 1
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return function() {
    // Linear congruential generator
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Get spawn metadata for logging/debugging
 */
export function getSpawnInfo(spawnPoint: Point, config: SpawnConfig): {
  cityLocation: Point;
  distanceFromCity: number;
  approximateMiles: number;
} {
  const city = findNearestCity(config.worldWidth, config.worldHeight, config.seed);
  const distance = Math.hypot(spawnPoint.x - city.x, spawnPoint.y - city.y);

  return {
    cityLocation: city,
    distanceFromCity: distance,
    approximateMiles: distance / TILES_PER_MILE,
  };
}
