const { generateLoot } = require('./loot');

describe('Loot Generation', () => {
  it('should generate common loot', () => {
    const loot = generateLoot('common');
    expect(loot.length).toBe(1);
    expect(['Gold', 'Healing Potion']).toContain(loot[0].name);
  });

  it('should generate uncommon loot', () => {
    const loot = generateLoot('uncommon');
    expect(loot.length).toBe(1);
    expect(['Gold', 'Greater Healing Potion']).toContain(loot[0].name);
  });

  it('should generate rare loot', () => {
    const loot = generateLoot('rare');
    expect(loot.length).toBe(1);
    expect(['Gold', 'Superior Healing Potion']).toContain(loot[0].name);
  });

  it('should return an empty array for an invalid rarity', () => {
    const loot = generateLoot('invalid');
    expect(loot.length).toBe(0);
  });
});
