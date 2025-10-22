/**
 * @file Enemy Service - Query and spawn enemies for encounters
 */

import { supabaseServiceClient } from './supabaseClient';

export interface Enemy {
  id: string;
  name: string;
  enemy_type: string;
  cr: number;
  hp_max: number;
  hp_current?: number; // Set during combat
  armor_class: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  attack_bonus: number;
  damage_dice: string;
  damage_type: string;
  gold_min: number;
  gold_max: number;
  biomes: string[];
  rarity: string;
  description: string;
}

/**
 * Get random enemy by CR range
 */
export async function getRandomEnemyByCR(minCR: number, maxCR: number): Promise<Enemy | null> {
  const { data, error } = await supabaseServiceClient
    .from('enemies')
    .select('*')
    .gte('cr', minCR)
    .lte('cr', maxCR);

  if (error || !data || data.length === 0) {
    console.error('[EnemyService] No enemies found for CR range', minCR, '-', maxCR);
    return null;
  }

  const enemy = data[Math.floor(Math.random() * data.length)] as Enemy;
  return { ...enemy, hp_current: enemy.hp_max }; // Start at full HP
}

/**
 * Get random enemy for biome
 */
export async function getRandomEnemyForBiome(biome: string, characterLevel: number): Promise<Enemy | null> {
  // CR should be roughly = character level / 4 (for balanced encounter)
  const targetCR = Math.max(0.25, characterLevel / 4);
  const minCR = targetCR * 0.5;
  const maxCR = targetCR * 1.5;

  const { data, error } = await supabaseServiceClient
    .from('enemies')
    .select('*')
    .contains('biomes', [biome])
    .gte('cr', minCR)
    .lte('cr', maxCR);

  if (error || !data || data.length === 0) {
    console.warn(`[EnemyService] No enemies found for biome "${biome}", using any enemy`);
    return getRandomEnemyByCR(minCR, maxCR);
  }

  const enemy = data[Math.floor(Math.random() * data.length)] as Enemy;
  return { ...enemy, hp_current: enemy.hp_max };
}

/**
 * Get enemy by ID
 */
export async function getEnemyById(id: string): Promise<Enemy | null> {
  const { data, error } = await supabaseServiceClient
    .from('enemies')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error(`[EnemyService] Enemy with ID "${id}" not found`);
    return null;
  }

  return { ...data as Enemy, hp_current: data.hp_max };
}

/**
 * Get enemy by name (for quest-specific encounters)
 */
export async function getEnemyByName(name: string): Promise<Enemy | null> {
  const { data, error } = await supabaseServiceClient
    .from('enemies')
    .select('*')
    .ilike('name', name)
    .single();

  if (error || !data) {
    console.error(`[EnemyService] Enemy "${name}" not found`);
    return null;
  }

  return { ...data as Enemy, hp_current: data.hp_max };
}

/**
 * Spawn multiple enemies (for group encounters)
 */
export async function spawnEnemyGroup(
  biome: string,
  characterLevel: number,
  groupSize: number = 3
): Promise<Enemy[]> {
  const enemies: Enemy[] = [];

  for (let i = 0; i < groupSize; i++) {
    const enemy = await getRandomEnemyForBiome(biome, characterLevel);
    if (enemy) {
      enemies.push({ ...enemy, id: `${enemy.id}_${i}` }); // Unique ID per instance
    }
  }

  return enemies;
}
