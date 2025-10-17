/**
 * Seed initial world data for Nuaibria from documentation and AI generation
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedDeities() {
  console.log('Seeding deities...');

  const deities = [
    {
      name: 'The Chronicler',
      title: 'Keeper of Tales and Fates',
      domains: ['knowledge', 'fate', 'time', 'memory'],
      alignment: 'true_neutral',
      description: 'The Chronicler is an enigmatic entity who observes and records the stories of mortals. Neither good nor evil, The Chronicler values the preservation of tales above all else. Some say The Chronicler can see all possible futures, while others believe they merely witness and remember.',
      symbol_description: 'An open book with pages turning into wisps of smoke',
      followers_description: 'Scholars, historians, and those seeking to understand their place in the grand tapestry of fate',
      tenets: [
        'Every story deserves to be told',
        'Knowledge is the greatest treasure',
        'The past shapes the future, but does not bind it',
        'Witness without judgment, record without bias'
      ],
      is_active: true,
      power_level: 'greater'
    }
  ];

  for (const deity of deities) {
    const { error } = await supabase
      .from('deities')
      .upsert(deity, { onConflict: 'name' });

    if (error) {
      console.error(`Error seeding deity ${deity.name}:`, error);
    } else {
      console.log(`✓ Seeded deity: ${deity.name}`);
    }
  }
}

async function seedRaceLore() {
  console.log('Seeding race lore...');

  const racesLore = [
    {
      race_name: 'Human',
      origin_story: 'Humans emerged during the twilight of the Old Empire, adapting quickly to the fractured world left behind. Unlike the elder races, they have no ancient homeland—they are everywhere, claiming no single origin but many.',
      culture: 'Human culture is diverse and ever-changing. They value innovation, ambition, and the pursuit of legacy. Their short lives drive them to leave lasting marks on the world.',
      relations: {
        Elf: 'respectful_curiosity',
        Dwarf: 'trading_partners',
        Orc: 'wary_but_learning'
      },
      notable_figures: ['Queen Mira the Unifier', 'Aldric the Wanderer'],
      homeland: 'No single homeland—found across all regions',
      lifespan: '~80 years',
      physical_traits: 'Highly varied in appearance, adaptable physiology',
      cultural_values: ['ambition', 'innovation', 'legacy', 'adaptability']
    }
  ];

  for (const race of racesLore) {
    const { error } = await supabase
      .from('races_lore')
      .upsert(race, { onConflict: 'race_name' });

    if (error) {
      console.error(`Error seeding race ${race.race_name}:`, error);
    } else {
      console.log(`✓ Seeded race lore: ${race.race_name}`);
    }
  }
}

async function seedWorldLore() {
  console.log('Seeding world lore...');

  const lore = [
    {
      category: 'creation_myth',
      title: 'The Sundering',
      content: 'In the beginning, Nuaibria was whole—a single landmass blessed by the celestial powers. But mortal ambition reached too far. The Old Empire\'s mages sought to harness the power of creation itself. Their ritual succeeded... and failed. The world shattered, magic fractured, and what remained was a realm of broken beauty where ancient power bleeds through the cracks.',
      era: 'ancient',
      importance: 10,
      generated_by: 'human_authored',
      tags: ['origin', 'magic', 'empire', 'cataclysm']
    },
    {
      category: 'legend',
      title: 'The Last Emperor',
      content: 'Emperor Valdris the Eternal was the final ruler of the Old Empire. When The Sundering began, he is said to have bound his soul to the throne room itself, refusing to abandon his crumbling empire. Some say his spirit still lingers in the Imperial Ruins, offering cryptic wisdom to those brave enough to seek him.',
      era: 'old_empire',
      importance: 8,
      generated_by: 'human_authored',
      tags: ['emperor', 'spirit', 'ruins', 'imperial']
    }
  ];

  for (const entry of lore) {
    const { error } = await supabase
      .from('world_lore')
      .insert(entry);

    if (error && error.code !== '23505') { // Ignore duplicates
      console.error(`Error seeding lore "${entry.title}":`, error);
    } else {
      console.log(`✓ Seeded lore: ${entry.title}`);
    }
  }
}

async function main() {
  console.log('🌍 Seeding Nuaibria world data...\n');

  await seedDeities();
  await seedRaceLore();
  await seedWorldLore();

  console.log('\n✅ World seeding complete!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
});
