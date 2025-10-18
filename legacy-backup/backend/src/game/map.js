'use strict';

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================================================

/**
 * Seeded random number generator using mulberry32 algorithm
 * Same seed always produces the same sequence of numbers
 */
class SeededRandom {
  constructor(seed) {
    this.seed = this.hashString(seed);
  }

  // Convert string to numeric seed
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Generate next random number (0 to 1)
  next() {
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Random integer between min and max (inclusive)
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Random float between min and max
  nextFloat(min, max) {
    return this.next() * (max - min) + min;
  }

  // Pick random item from array
  choice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// ============================================================================
// PERLIN NOISE (simplified 2D noise for terrain generation)
// ============================================================================

class SimplexNoise {
  constructor(seed) {
    this.random = new SeededRandom(seed);
    this.perm = [];

    // Generate permutation table
    for (let i = 0; i < 256; i++) {
      this.perm[i] = i;
    }

    // Shuffle using seeded random
    for (let i = 255; i > 0; i--) {
      const j = this.random.nextInt(0, i);
      [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
    }

    // Extend permutation table
    for (let i = 0; i < 256; i++) {
      this.perm[256 + i] = this.perm[i];
    }
  }

  // 2D noise function (returns value between -1 and 1)
  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.perm[X] + Y;
    const b = this.perm[X + 1] + Y;

    return this.lerp(v,
      this.lerp(u, this.grad(this.perm[a], x, y), this.grad(this.perm[b], x - 1, y)),
      this.lerp(u, this.grad(this.perm[a + 1], x, y - 1), this.grad(this.perm[b + 1], x - 1, y - 1))
    );
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }
}

// ============================================================================
// BIOME DEFINITIONS
// ============================================================================

const BIOMES = {
  WATER: { name: 'water', color: '#4A90E2', traversable: false },
  PLAINS: { name: 'plains', color: '#7EC850', traversable: true },
  FOREST: { name: 'forest', color: '#228B22', traversable: true },
  MOUNTAINS: { name: 'mountains', color: '#8B7355', traversable: true },
  DESERT: { name: 'desert', color: '#EDC9AF', traversable: true }
};

// ============================================================================
// POI TYPES
// ============================================================================

const POI_TYPES = [
  { type: 'village', name: 'Village', biomes: ['plains', 'forest'], rarity: 0.02 },
  { type: 'dungeon', name: 'Ancient Dungeon', biomes: ['mountains', 'forest'], rarity: 0.015 },
  { type: 'ruins', name: 'Ruins', biomes: ['plains', 'desert'], rarity: 0.02 },
  { type: 'cave', name: 'Cave', biomes: ['mountains'], rarity: 0.03 },
  { type: 'tower', name: 'Abandoned Tower', biomes: ['plains', 'forest'], rarity: 0.01 },
  { type: 'shrine', name: 'Ancient Shrine', biomes: ['forest', 'mountains'], rarity: 0.015 }
];

// ============================================================================
// MAP GENERATION
// ============================================================================

/**
 * Determine biome based on elevation and moisture
 */
function getBiomeFromNoise(elevation, moisture) {
  // Water (low elevation)
  if (elevation < 0.3) {
    return BIOMES.WATER;
  }

  // Mountains (high elevation)
  if (elevation > 0.7) {
    return BIOMES.MOUNTAINS;
  }

  // Desert (low moisture)
  if (moisture < 0.3) {
    return BIOMES.DESERT;
  }

  // Forest (high moisture)
  if (moisture > 0.6) {
    return BIOMES.FOREST;
  }

  // Plains (default)
  return BIOMES.PLAINS;
}

/**
 * Generate a single tile at coordinates (x, y) with given seed
 */
function generateTile(x, y, seed) {
  const noiseGen = new SimplexNoise(seed);

  // Generate elevation (multiple octaves for detail)
  const elevation1 = (noiseGen.noise2D(x * 0.05, y * 0.05) + 1) / 2;
  const elevation2 = (noiseGen.noise2D(x * 0.1, y * 0.1) + 1) / 2;
  const elevation = elevation1 * 0.7 + elevation2 * 0.3;

  // Generate moisture (different frequency)
  const moisture1 = (noiseGen.noise2D(x * 0.07 + 1000, y * 0.07 + 1000) + 1) / 2;
  const moisture2 = (noiseGen.noise2D(x * 0.12 + 1000, y * 0.12 + 1000) + 1) / 2;
  const moisture = moisture1 * 0.6 + moisture2 * 0.4;

  const biome = getBiomeFromNoise(elevation, moisture);

  return {
    x,
    y,
    biome: biome.name,
    elevation: Math.round(elevation * 100) / 100,
    traversable: biome.traversable
  };
}

/**
 * Generate map tiles in a radius around a center point
 */
function generateMapTiles(centerX, centerY, radius, seed) {
  const tiles = [];

  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      // Optional: Only generate tiles within circular radius
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (distance <= radius) {
        tiles.push(generateTile(x, y, seed));
      }
    }
  }

  return tiles;
}

/**
 * Check if a POI should exist at given coordinates
 */
function shouldGeneratePOI(x, y, seed) {
  const random = new SeededRandom(`${seed}_poi_${x}_${y}`);
  const roll = random.next();

  // POI rarity check
  const totalRarity = POI_TYPES.reduce((sum, poi) => sum + poi.rarity, 0);
  return roll < totalRarity;
}

/**
 * Generate POI at coordinates if one exists
 */
function generatePOI(x, y, seed) {
  if (!shouldGeneratePOI(x, y, seed)) {
    return null;
  }

  // Get biome at this location
  const tile = generateTile(x, y, seed);

  // Filter POIs by biome
  const validPOIs = POI_TYPES.filter(poi => poi.biomes.includes(tile.biome));

  if (validPOIs.length === 0) {
    return null;
  }

  // Select random POI type
  const random = new SeededRandom(`${seed}_poi_${x}_${y}_type`);
  const selectedPOI = validPOIs[random.nextInt(0, validPOIs.length - 1)];

  // Generate unique name
  const nameVariants = [
    'Ancient', 'Forgotten', 'Hidden', 'Mysterious', 'Dark', 'Lost', 'Abandoned',
    'Sacred', 'Cursed', 'Haunted', 'Ruined', 'Peaceful', 'Remote'
  ];
  const namePrefix = nameVariants[random.nextInt(0, nameVariants.length - 1)];

  return {
    x,
    y,
    type: selectedPOI.type,
    name: `${namePrefix} ${selectedPOI.name}`,
    description: `A ${selectedPOI.type} in the ${tile.biome}.`,
    discovered: false
  };
}

/**
 * Generate all POIs in a radius around center point
 */
function generatePOIsInRadius(centerX, centerY, radius, seed) {
  const pois = [];

  // Check POIs on a grid (not every single tile for performance)
  const poiCheckInterval = 5; // Check every 5 tiles

  for (let y = centerY - radius; y <= centerY + radius; y += poiCheckInterval) {
    for (let x = centerX - radius; x <= centerX + radius; x += poiCheckInterval) {
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (distance <= radius) {
        const poi = generatePOI(x, y, seed);
        if (poi) {
          pois.push(poi);
        }
      }
    }
  }

  return pois;
}

/**
 * Legacy function for compatibility
 */
const generateMap = (width, height, seed = 'default') => {
  const tiles = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push(generateTile(x, y, seed));
    }
  }
  return tiles;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateMap,
  generateMapTiles,
  generateTile,
  generatePOI,
  generatePOIsInRadius,
  SeededRandom,
  BIOMES,
  POI_TYPES
};
