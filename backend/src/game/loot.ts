import type { LootItem } from '../types';

interface LootTemplate {
  name: string;
  type: string;
  description: string;
  properties: Record<string, unknown>;
  weight: number;
  quantityRange: [number, number];
}

const LOOT_TABLES: Record<string, LootTemplate[]> = {
  goblin: [
    { name: 'Rusty Dagger', type: 'weapon', description: 'A worn dagger with a rusted blade.', properties: { damage: '1d4', damageType: 'piercing' }, weight: 30, quantityRange: [1, 1] },
    { name: 'Crude Shortbow', type: 'weapon', description: 'A poorly made shortbow.', properties: { damage: '1d6', damageType: 'piercing', range: '80/320' }, weight: 15, quantityRange: [1, 1] },
    { name: 'Leather Scraps', type: 'misc', description: 'Pieces of worn leather armor.', properties: {}, weight: 20, quantityRange: [1, 3] },
    { name: 'Health Potion (Minor)', type: 'consumable', description: 'Restores 1d4+1 HP.', properties: { healing: '1d4+1' }, weight: 15, quantityRange: [1, 1] },
    { name: 'Stale Bread', type: 'consumable', description: 'Hard, dry bread.', properties: {}, weight: 25, quantityRange: [1, 2] },
    { name: 'Torch', type: 'misc', description: 'A simple wooden torch.', properties: { duration: '1 hour' }, weight: 20, quantityRange: [1, 2] }
  ],
  wolf: [
    { name: 'Wolf Pelt', type: 'misc', description: 'A thick wolf hide.', properties: { value: 5 }, weight: 40, quantityRange: [1, 1] },
    { name: 'Wolf Fang', type: 'misc', description: 'A sharp wolf tooth.', properties: {}, weight: 25, quantityRange: [1, 2] },
    { name: 'Raw Meat', type: 'consumable', description: 'Fresh wolf meat (requires cooking).', properties: {}, weight: 35, quantityRange: [1, 3] }
  ],
  bandit: [
    { name: 'Shortsword', type: 'weapon', description: 'A standard shortsword in decent condition.', properties: { damage: '1d6', damageType: 'piercing' }, weight: 25, quantityRange: [1, 1] },
    { name: 'Leather Armor', type: 'armor', description: 'Standard leather armor.', properties: { ac: 11 }, weight: 15, quantityRange: [1, 1] },
    { name: 'Crossbow Bolts', type: 'misc', description: 'Standard crossbow ammunition.', properties: {}, weight: 20, quantityRange: [5, 10] },
    { name: 'Health Potion', type: 'consumable', description: 'Restores 2d4+2 HP.', properties: { healing: '2d4+2' }, weight: 20, quantityRange: [1, 1] },
    { name: 'Rations (1 day)', type: 'consumable', description: 'Preserved food for travel.', properties: {}, weight: 25, quantityRange: [1, 3] },
    { name: "Thieves' Tools", type: 'misc', description: 'Basic lockpicking tools.', properties: {}, weight: 10, quantityRange: [1, 1] },
    { name: 'Rope (50 ft)', type: 'misc', description: 'Hempen rope.', properties: {}, weight: 15, quantityRange: [1, 1] }
  ],
  skeleton: [
    { name: 'Rusted Scimitar', type: 'weapon', description: 'An ancient, rusted blade.', properties: { damage: '1d6', damageType: 'slashing' }, weight: 30, quantityRange: [1, 1] },
    { name: 'Bone Fragment', type: 'misc', description: 'A piece of ancient bone.', properties: {}, weight: 25, quantityRange: [1, 4] },
    { name: 'Tattered Shield', type: 'armor', description: 'A worn wooden shield.', properties: { acBonus: 1 }, weight: 20, quantityRange: [1, 1] },
    { name: 'Ancient Coin', type: 'misc', description: 'An old coin from a forgotten era.', properties: { value: 2 }, weight: 15, quantityRange: [1, 3] }
  ],
  orc: [
    { name: 'Greataxe', type: 'weapon', description: 'A heavy, brutal axe.', properties: { damage: '1d12', damageType: 'slashing' }, weight: 20, quantityRange: [1, 1] },
    { name: 'Javelin', type: 'weapon', description: 'A throwing spear.', properties: { damage: '1d6', damageType: 'piercing', range: '30/120' }, weight: 25, quantityRange: [1, 2] },
    { name: 'Hide Armor', type: 'armor', description: 'Thick animal hide armor.', properties: { ac: 12 }, weight: 20, quantityRange: [1, 1] },
    { name: 'Health Potion (Greater)', type: 'consumable', description: 'Restores 4d4+4 HP.', properties: { healing: '4d4+4' }, weight: 15, quantityRange: [1, 1] },
    { name: 'War Horn', type: 'misc', description: 'A tribal war horn.', properties: {}, weight: 10, quantityRange: [1, 1] },
    { name: 'Iron Rations', type: 'consumable', description: 'Preserved meat and bread.', properties: {}, weight: 20, quantityRange: [2, 4] }
  ]
};

interface RangeConfig {
  minCR: number;
  maxCR: number;
  min: number;
  max: number;
}

const GOLD_CONFIG: RangeConfig[] = [
  { minCR: 0, maxCR: 0.5, min: 1, max: 10 },
  { minCR: 0.5, maxCR: 1, min: 10, max: 50 },
  { minCR: 1, maxCR: 2, min: 25, max: 100 },
  { minCR: 2, maxCR: 5, min: 50, max: 200 },
  { minCR: 5, maxCR: 10, min: 100, max: 500 }
];

const DROP_COUNT_CONFIG: RangeConfig[] = [
  { minCR: 0, maxCR: 0.5, min: 1, max: 2 },
  { minCR: 0.5, maxCR: 1, min: 1, max: 3 },
  { minCR: 1, maxCR: 2, min: 2, max: 4 },
  { minCR: 2, maxCR: 5, min: 2, max: 5 },
  { minCR: 5, maxCR: 10, min: 3, max: 6 }
];

const ENEMY_GOLD_MODIFIERS: Record<string, number> = {
  wolf: 0.2,
  skeleton: 0.5,
  goblin: 0.8,
  bandit: 1.2,
  orc: 1.0
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRangeForCR = (config: RangeConfig[], cr: number): [number, number] => {
  for (const range of config) {
    if (cr >= range.minCR && cr <= range.maxCR) {
      return [range.min, range.max];
    }
  }

  const last = config[config.length - 1];
  return [last.min, last.max];
};

const rollQuantity = (quantityRange: [number, number]): number => {
  return randomInt(quantityRange[0], quantityRange[1]);
};

const cloneLootTemplate = (template: LootTemplate): LootItem => {
  const quantity = rollQuantity(template.quantityRange);
  return {
    name: template.name,
    type: template.type,
    description: template.description,
    properties: { ...template.properties },
    quantity,
    equipped: false
  };
};

const rollGoldAmount = (challengeRating: number, enemyType: string): number => {
  const [min, max] = getRangeForCR(GOLD_CONFIG, challengeRating);
  const baseGold = randomInt(min, max);
  const modifier = ENEMY_GOLD_MODIFIERS[enemyType] ?? 1.0;
  return Math.max(0, Math.floor(baseGold * modifier));
};

const getDropCount = (challengeRating: number): number => {
  const [min, max] = getRangeForCR(DROP_COUNT_CONFIG, challengeRating);
  return randomInt(min, max);
};

const adjustWeightsForCR = (lootTable: LootTemplate[], challengeRating: number): LootTemplate[] => {
  if (challengeRating <= 1) {
    return lootTable;
  }

  const midpoint = Math.floor(lootTable.length / 2);
  return lootTable.map((item, index) => {
    if (index >= midpoint) {
      const boost = Math.min(challengeRating, 3);
      return { ...item, weight: item.weight * boost };
    }

    return item;
  });
};

const rollLootTable = (table: LootTemplate[], count = 1, allowDuplicates = true): LootItem[] => {
  if (!table || table.length === 0) {
    return [];
  }

  const results: LootItem[] = [];
  const availableItems = [...table];

  for (let i = 0; i < count; i += 1) {
    if (availableItems.length === 0) break;

    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;

    let chosen: LootTemplate | null = null;
    for (const item of availableItems) {
      roll -= item.weight;
      if (roll <= 0) {
        chosen = item;
        break;
      }
    }

    if (chosen) {
      results.push(cloneLootTemplate(chosen));

      if (!allowDuplicates) {
        const index = availableItems.indexOf(chosen);
        if (index > -1) {
          availableItems.splice(index, 1);
        }
      }
    }
  }

  return results;
};

export const generateLoot = (enemyType: string, challengeRating: number): LootItem[] => {
  const loot: LootItem[] = [];
  const baseLootTable = LOOT_TABLES[enemyType.toLowerCase()];

  if (!baseLootTable) {
    console.warn(`No loot table found for enemy type: ${enemyType}`);
    const goldAmount = rollGoldAmount(challengeRating, enemyType);
    if (goldAmount > 0) {
      loot.push({
        name: 'Gold Coins',
        type: 'gold',
        description: `${goldAmount} gold coins.`,
        properties: { value: goldAmount },
        quantity: goldAmount,
        equipped: false
      });
    }
    return loot;
  }

  const adjustedTable = adjustWeightsForCR(baseLootTable, challengeRating);
  const dropCount = getDropCount(challengeRating);
  loot.push(...rollLootTable(adjustedTable, dropCount, true));

  const goldAmount = rollGoldAmount(challengeRating, enemyType);
  if (goldAmount > 0) {
    loot.push({
      name: 'Gold Coins',
      type: 'gold',
      description: `${goldAmount} gold coins.`,
      properties: { value: goldAmount },
      quantity: goldAmount,
      equipped: false
    });
  }

  return loot;
};

export { rollLootTable, LOOT_TABLES };
