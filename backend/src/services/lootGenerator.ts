/**
 * @file Loot Generator - Creates rewards from combat and exploration
 *
 * Handles:
 * - Rolling on loot tables
 * - Generating appropriate loot for enemy CR
 * - Adding items to character inventory
 * - Gold drops
 */

import { supabaseServiceClient } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export interface LootItem {
  name: string;
  rarity: string;
  item_type: string;
  properties: Record<string, any>;
  value_gold: number;
  quantity: number;
}

export interface LootResult {
  items: LootItem[];
  gold: number;
  totalValue: number;
}

// ============================================================================
// LOOT GENERATION
// ============================================================================

/**
 * Generate loot for defeated enemy based on CR
 */
export async function generateCombatLoot(enemyCR: number): Promise<LootResult> {
  const items: LootItem[] = [];
  let gold = 0;

  // Base gold drops by CR
  const goldByCR: Record<number, { min: number; max: number }> = {
    0: { min: 1, max: 5 },
    1: { min: 5, max: 15 },
    2: { min: 10, max: 30 },
    3: { min: 20, max: 50 },
    4: { min: 30, max: 80 },
    5: { min: 50, max: 150 },
  };

  const goldRange = goldByCR[enemyCR] || goldByCR[1];
  gold = Math.floor(Math.random() * (goldRange.max - goldRange.min + 1)) + goldRange.min;

  // Roll for items (higher CR = more/better items)
  const numItemRolls = Math.min(3, Math.floor(enemyCR / 2) + 1);

  for (let i = 0; i < numItemRolls; i++) {
    const item = await rollLootTable(enemyCR);
    if (item) {
      items.push(item);
    }
  }

  const totalValue = gold + items.reduce((sum, item) => sum + item.value_gold, 0);

  console.log(`[LootGenerator] Generated loot for CR ${enemyCR}: ${gold}g + ${items.length} items (${totalValue}g total)`);

  return { items, gold, totalValue };
}

/**
 * Roll on loot table based on CR
 */
async function rollLootTable(enemyCR: number): Promise<LootItem | null> {
  // Determine rarity based on CR
  let rarity = 'common';
  const roll = Math.random() * 100;

  if (enemyCR >= 4 && roll < 20) {
    rarity = 'rare';
  } else if (enemyCR >= 2 && roll < 40) {
    rarity = 'uncommon';
  }

  // Query loot table
  const { data: lootPool, error } = await supabaseServiceClient
    .from('loot_tables')
    .select('*')
    .eq('rarity', rarity)
    .gte('drop_chance', Math.random() * 100); // Filter by drop chance

  if (error || !lootPool || lootPool.length === 0) {
    console.warn(`[LootGenerator] No loot found for rarity ${rarity}`);
    return null;
  }

  // Pick random item from filtered pool
  const item = lootPool[Math.floor(Math.random() * lootPool.length)];

  return {
    name: item.item_name,
    rarity: item.rarity,
    item_type: item.item_type,
    properties: item.properties || {},
    value_gold: item.value_gold,
    quantity: 1,
  };
}

/**
 * Generate exploration/treasure loot
 */
export async function generateExplorationLoot(): Promise<LootResult> {
  const items: LootItem[] = [];

  // Exploration finds 1-2 items
  const numItems = Math.random() > 0.5 ? 2 : 1;

  for (let i = 0; i < numItems; i++) {
    const item = await rollLootTable(1); // CR 1 equivalent
    if (item) {
      items.push(item);
    }
  }

  // Small gold find
  const gold = Math.floor(Math.random() * 20) + 5;

  return { items, gold, totalValue: gold + items.reduce((sum, item) => sum + item.value_gold, 0) };
}

// ============================================================================
// AWARD LOOT TO CHARACTER
// ============================================================================

/**
 * Add loot to character inventory and gold
 */
export async function awardLoot(
  characterId: string,
  loot: LootResult
): Promise<void> {

  console.log(`[LootGenerator] Awarding loot to ${characterId}: ${loot.gold}g + ${loot.items.length} items`);

  // Award gold
  if (loot.gold > 0) {
    const { data: charData } = await supabaseServiceClient
      .from('characters')
      .select('gold')
      .eq('id', characterId)
      .single();

    if (charData) {
      await supabaseServiceClient
        .from('characters')
        .update({ gold: (charData.gold || 0) + loot.gold })
        .eq('id', characterId);
    }
  }

  // Award items (add to items table)
  for (const item of loot.items) {
    await supabaseServiceClient
      .from('game_items')
      .insert({
        character_id: characterId,
        name: item.name,
        type: item.item_type,
        description: `${item.rarity} ${item.item_type}`,
        properties: item.properties,
        quantity: item.quantity,
        equipped: false,
      });
  }

  console.log(`[LootGenerator] Loot awarded successfully`);
}

/**
 * Format loot for display in narrative
 */
export function formatLootForNarrative(loot: LootResult): string {
  const parts: string[] = [];

  if (loot.gold > 0) {
    parts.push(`${loot.gold} gold`);
  }

  if (loot.items.length > 0) {
    const itemNames = loot.items.map(i => i.name).join(', ');
    parts.push(itemNames);
  }

  return parts.join(' and ');
}
