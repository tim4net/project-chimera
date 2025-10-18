'use strict';

// ============================================================================
// LOOT TABLES - Non-magical items only (MVP constraint)
// ============================================================================

const LOOT_TABLES = {
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
    { name: 'Thieves\' Tools', type: 'misc', description: 'Basic lockpicking tools.', properties: {}, weight: 10, quantityRange: [1, 1] },
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

// Gold amount configuration by CR
const GOLD_CONFIG = [
  { minCR: 0, maxCR: 0.5, min: 1, max: 10 },
  { minCR: 0.5, maxCR: 1, min: 10, max: 50 },
  { minCR: 1, maxCR: 2, min: 25, max: 100 },
  { minCR: 2, maxCR: 5, min: 50, max: 200 },
  { minCR: 5, maxCR: 10, min: 100, max: 500 }
];

// Number of item drops by CR
const DROP_COUNT_CONFIG = [
  { minCR: 0, maxCR: 0.5, min: 1, max: 2 },
  { minCR: 0.5, maxCR: 1, min: 1, max: 3 },
  { minCR: 1, maxCR: 2, min: 2, max: 4 },
  { minCR: 2, maxCR: 5, min: 2, max: 5 },
  { minCR: 5, maxCR: 10, min: 3, max: 6 }
];

// Enemy-specific gold modifiers
const ENEMY_GOLD_MODIFIERS = {
  wolf: 0.2,    // Wolves rarely carry gold
  skeleton: 0.5, // Skeletons have less gold
  goblin: 0.8,
  bandit: 1.2,   // Bandits carry more gold
  orc: 1.0
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get configuration range for a given CR
 */
function getRangeForCR(config, cr) {
  for (const range of config) {
    if (cr >= range.minCR && cr <= range.maxCR) {
      return [range.min, range.max];
    }
  }
  // Default to highest range if CR exceeds config
  const last = config[config.length - 1];
  return [last.min, last.max];
}

/**
 * Roll a quantity from a range [min, max]
 */
function rollQuantity(quantityRange) {
  if (!quantityRange || quantityRange.length !== 2) {
    return 1;
  }
  return randomInt(quantityRange[0], quantityRange[1]);
}

/**
 * Clone a loot template and roll its quantity
 */
function cloneLootTemplate(template) {
  const quantity = rollQuantity(template.quantityRange);
  return {
    name: template.name,
    type: template.type,
    description: template.description,
    properties: { ...template.properties },
    quantity: quantity,
    equipped: false
  };
}

/**
 * Calculate gold amount based on CR and enemy type
 */
function rollGoldAmount(challengeRating, enemyType) {
  const [min, max] = getRangeForCR(GOLD_CONFIG, challengeRating);
  const baseGold = randomInt(min, max);

  // Apply enemy-specific modifier
  const modifier = ENEMY_GOLD_MODIFIERS[enemyType] || 1.0;
  const adjustedGold = Math.floor(baseGold * modifier);

  return Math.max(0, adjustedGold); // Never negative
}

/**
 * Get number of items to drop based on CR
 */
function getDropCount(challengeRating) {
  const [min, max] = getRangeForCR(DROP_COUNT_CONFIG, challengeRating);
  return randomInt(min, max);
}

/**
 * Adjust loot table weights based on CR (higher CR = better items)
 */
function adjustWeightsForCR(lootTable, challengeRating) {
  // For CR > 1, increase weight of better items (last half of table)
  if (challengeRating <= 1) {
    return lootTable; // Use base weights
  }

  const midpoint = Math.floor(lootTable.length / 2);
  return lootTable.map((item, index) => {
    if (index >= midpoint) {
      // Boost weight of "better" items (second half of table)
      const boost = Math.min(challengeRating, 3); // Cap boost at 3x
      return { ...item, weight: item.weight * boost };
    }
    return item;
  });
}

/**
 * Perform weighted random selection from a loot table
 * @param {Array} table - Array of items with 'weight' property
 * @param {number} count - Number of items to roll
 * @param {boolean} allowDuplicates - Whether same item can be rolled multiple times
 * @returns {Array} - Array of selected items (cloned)
 */
function rollLootTable(table, count = 1, allowDuplicates = true) {
  if (!table || table.length === 0) {
    return [];
  }

  const results = [];
  const availableItems = [...table];

  for (let i = 0; i < count; i++) {
    if (availableItems.length === 0) break;

    // Calculate total weight
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);

    // Roll random number
    let roll = Math.random() * totalWeight;

    // Find selected item
    let chosen = null;
    for (const item of availableItems) {
      roll -= item.weight;
      if (roll <= 0) {
        chosen = item;
        break;
      }
    }

    if (chosen) {
      results.push(cloneLootTemplate(chosen));

      // Remove from available items if no duplicates allowed
      if (!allowDuplicates) {
        const index = availableItems.indexOf(chosen);
        if (index > -1) {
          availableItems.splice(index, 1);
        }
      }
    }
  }

  return results;
}

// ============================================================================
// MAIN LOOT GENERATION FUNCTION
// ============================================================================

/**
 * Generate loot for a defeated enemy
 * @param {string} enemyType - Type of enemy (goblin, wolf, bandit, skeleton, orc)
 * @param {number} challengeRating - CR of the enemy
 * @returns {Array} - Array of loot items ready for database insertion
 */
function generateLoot(enemyType, challengeRating) {
  const loot = [];

  // Get loot table for enemy type
  const baseLootTable = LOOT_TABLES[enemyType.toLowerCase()];
  if (!baseLootTable) {
    console.warn(`No loot table found for enemy type: ${enemyType}`);
    // Return just gold as fallback
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

  // Adjust weights based on CR
  const adjustedTable = adjustWeightsForCR(baseLootTable, challengeRating);

  // Determine number of items to drop
  const dropCount = getDropCount(challengeRating);

  // Roll for items
  const rolledItems = rollLootTable(adjustedTable, dropCount, true);
  loot.push(...rolledItems);

  // Add gold
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

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateLoot,
  rollLootTable,
  LOOT_TABLES // Export for testing
};
