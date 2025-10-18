import type { MapTile, PointOfInterest } from '../types';

class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  public next(): number {
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  public choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

class SimplexNoise {
  private readonly random: SeededRandom;
  private readonly perm: number[] = [];

  constructor(seed: string) {
    this.random = new SeededRandom(seed);

    for (let i = 0; i < 256; i += 1) {
      this.perm[i] = i;
    }

    for (let i = 255; i > 0; i -= 1) {
      const j = this.random.nextInt(0, i);
      [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
    }

    for (let i = 0; i < 256; i += 1) {
      this.perm[256 + i] = this.perm[i];
    }
  }

  public noise2D(x: number, y: number): number {
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

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }
}

interface BiomeDefinition {
  name: string;
  color: string;
  traversable: boolean;
}

const BIOMES: Record<string, BiomeDefinition> = {
  WATER: { name: 'water', color: '#4A90E2', traversable: false },
  PLAINS: { name: 'plains', color: '#7EC850', traversable: true },
  FOREST: { name: 'forest', color: '#228B22', traversable: true },
  MOUNTAINS: { name: 'mountains', color: '#8B7355', traversable: true },
  DESERT: { name: 'desert', color: '#EDC9AF', traversable: true }
};

interface PoiTemplate {
  type: string;
  name: string;
  biomes: string[];
  rarity: number;
}

const POI_TYPES: PoiTemplate[] = [
  { type: 'village', name: 'Village', biomes: ['plains', 'forest'], rarity: 0.02 },
  { type: 'dungeon', name: 'Ancient Dungeon', biomes: ['mountains', 'forest'], rarity: 0.015 },
  { type: 'ruins', name: 'Ruins', biomes: ['plains', 'desert'], rarity: 0.02 },
  { type: 'cave', name: 'Cave', biomes: ['mountains'], rarity: 0.03 },
  { type: 'tower', name: 'Abandoned Tower', biomes: ['plains', 'forest'], rarity: 0.01 },
  { type: 'shrine', name: 'Ancient Shrine', biomes: ['forest', 'mountains'], rarity: 0.015 }
];

const getBiomeFromNoise = (elevation: number, moisture: number): BiomeDefinition => {
  if (elevation < 0.3) {
    return BIOMES.WATER;
  }

  if (elevation > 0.7) {
    return BIOMES.MOUNTAINS;
  }

  if (moisture < 0.3) {
    return BIOMES.DESERT;
  }

  if (moisture > 0.6) {
    return BIOMES.FOREST;
  }

  return BIOMES.PLAINS;
};

export const generateTile = (x: number, y: number, seed: string): MapTile => {
  const noiseGen = new SimplexNoise(seed);

  const elevation1 = (noiseGen.noise2D(x * 0.05, y * 0.05) + 1) / 2;
  const elevation2 = (noiseGen.noise2D(x * 0.1, y * 0.1) + 1) / 2;
  const elevation = elevation1 * 0.7 + elevation2 * 0.3;

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
};

export const generateMapTiles = (centerX: number, centerY: number, radius: number, seed: string): MapTile[] => {
  const tiles: MapTile[] = [];
  for (let x = centerX - radius; x <= centerX + radius; x += 1) {
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      tiles.push(generateTile(x, y, seed));
    }
  }
  return tiles;
};

export const generatePOI = (x: number, y: number, seed: string): PointOfInterest | null => {
  const random = new SeededRandom(`${seed}-${x}-${y}`);
  const tile = generateTile(x, y, seed);
  const match = POI_TYPES.find(poi => poi.biomes.includes(tile.biome));

  if (!match) {
    return null;
  }

  if (random.next() > match.rarity) {
    return null;
  }

  return {
    x,
    y,
    type: match.type,
    name: match.name,
    biome: tile.biome,
    description: `A ${match.name.toLowerCase()} situated within the ${tile.biome}.`,
    dangerLevel: random.nextInt(1, 5)
  };
};

export const generatePOIsInRadius = (centerX: number, centerY: number, radius: number, seed: string): PointOfInterest[] => {
  const pois: PointOfInterest[] = [];
  for (let x = centerX - radius; x <= centerX + radius; x += 1) {
    for (let y = centerY - radius; y <= centerY + radius; y += 1) {
      const poi = generatePOI(x, y, seed);
      if (poi) {
        pois.push(poi);
      }
    }
  }
  return pois;
};

export default {
  generateTile,
  generateMapTiles,
  generatePOI,
  generatePOIsInRadius
};
