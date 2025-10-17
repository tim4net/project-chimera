const loot_tables = {
  common: [
    { name: 'Gold', quantity: '1d6' },
    { name: 'Healing Potion', quantity: 1 },
  ],
  uncommon: [
    { name: 'Gold', quantity: '2d6' },
    { name: 'Greater Healing Potion', quantity: 1 },
  ],
  rare: [
    { name: 'Gold', quantity: '3d6' },
    { name: 'Superior Healing Potion', quantity: 1 },
  ],
};

function generateLoot(rarity) {
  const table = loot_tables[rarity];
  if (!table) {
    return [];
  }
  const item = table[Math.floor(Math.random() * table.length)];
  return [item];
}

module.exports = {
  generateLoot,
};
