/**
 * Test script to verify monster data integrity
 */

// This will fail at compile time if there are type errors
import { ALL_MONSTERS, getMonstersByCR, getLegendaryMonsters } from '../backend/src/data/monsters';

console.log('Testing monster database...');
console.log(`Total monsters: ${Object.keys(ALL_MONSTERS).length}`);

// Test CR categories
const crCategories = [
  { name: 'CR 0-2', min: 0, max: 2 },
  { name: 'CR 3-5', min: 3, max: 5 },
  { name: 'CR 6-10', min: 6, max: 10 },
  { name: 'CR 11-15', min: 11, max: 15 },
  { name: 'CR 16-20', min: 16, max: 20 },
  { name: 'CR 21-30', min: 21, max: 30 }
];

console.log('\nMonsters by CR:');
crCategories.forEach(cat => {
  const monsters = getMonstersByCR(cat.min, cat.max);
  console.log(`  ${cat.name}: ${monsters.length} monsters`);
});

// Test legendary monsters
const legendary = getLegendaryMonsters();
console.log(`\nLegendary monsters: ${legendary.length}`);
if (legendary.length > 0) {
  console.log('Examples:');
  legendary.slice(0, 5).forEach(m => {
    console.log(`  - ${m.name} (CR ${m.challengeRating}): ${m.legendaryActions?.length || 0} legendary actions`);
  });
}

console.log('\n✓ Monster database loaded successfully!');
