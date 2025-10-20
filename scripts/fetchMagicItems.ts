/**
 * Magic Items Data Fetcher
 * Fetches all magic items from D&D 5e API and generates TypeScript data files
 */

interface APIItem {
  index: string;
  name: string;
  url: string;
}

interface APIItemDetail {
  index: string;
  name: string;
  desc: string[];
  rarity: {
    name: string;
  };
  variants?: APIItem[];
  variant?: boolean;
  equipment_category?: {
    name: string;
  };
}

interface MagicItem {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  type: string;
  requiresAttunement: boolean;
  description: string;
  properties?: {
    bonus?: number;
    charges?: number;
    damage?: string;
    ac?: number;
    effects?: string[];
  };
}

const API_BASE = 'https://www.dnd5eapi.co/api';

// Rarity mapping
const RARITY_MAP: Record<string, MagicItem['rarity']> = {
  'Common': 'common',
  'Uncommon': 'uncommon',
  'Rare': 'rare',
  'Very Rare': 'very-rare',
  'Legendary': 'legendary',
  'Artifact': 'artifact',
  'Varies': 'common' // Default for variant items
};

// Type detection from equipment category and name
function detectItemType(item: APIItemDetail): string {
  const name = item.name.toLowerCase();
  const category = item.equipment_category?.name.toLowerCase() || '';

  if (name.includes('potion')) return 'potion';
  if (name.includes('scroll')) return 'scroll';
  if (name.includes('staff')) return 'staff';
  if (name.includes('wand')) return 'wand';
  if (name.includes('rod')) return 'rod';
  if (name.includes('ring')) return 'ring';
  if (name.includes('amulet') || name.includes('necklace')) return 'amulet';
  if (name.includes('cloak') || name.includes('cape')) return 'cloak';
  if (name.includes('boots') || name.includes('shoes')) return 'boots';
  if (name.includes('gloves') || name.includes('gauntlets')) return 'gloves';
  if (name.includes('belt') || name.includes('girdle')) return 'belt';
  if (name.includes('helm') || name.includes('crown') || name.includes('circlet')) return 'headgear';
  if (name.includes('armor') || name.includes('plate') || name.includes('chain') || name.includes('leather')) return 'armor';
  if (name.includes('weapon') || name.includes('sword') || name.includes('axe') || name.includes('bow') ||
      name.includes('dagger') || name.includes('mace') || name.includes('hammer')) return 'weapon';
  if (name.includes('bag') || name.includes('sack')) return 'container';
  if (name.includes('ioun stone')) return 'ioun-stone';

  if (category.includes('weapon')) return 'weapon';
  if (category.includes('armor')) return 'armor';

  return 'wondrous-item';
}

// Detect attunement requirement from description
function requiresAttunement(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  return lowerDesc.includes('requires attunement') ||
         lowerDesc.includes('attune to this');
}

// Extract bonus from name (e.g., "Weapon, +1" -> 1)
function extractBonus(name: string, description: string): number | undefined {
  const nameMatch = name.match(/[+\-](\d+)/);
  if (nameMatch) return parseInt(nameMatch[1]);

  const descMatch = description.match(/[+\-](\d+)\s+bonus/);
  if (descMatch) return parseInt(descMatch[1]);

  return undefined;
}

// Extract charges from description
function extractCharges(description: string): number | undefined {
  const chargeMatch = description.match(/has (\d+) charges?/i);
  if (chargeMatch) return parseInt(chargeMatch[1]);

  return undefined;
}

// Extract effects from description (sentences with "you can", "grants", etc.)
function extractEffects(description: string): string[] | undefined {
  const effects: string[] = [];
  const sentences = description.split(/[.!?]+/);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase().trim();
    if (lower.includes('you can') ||
        lower.includes('you gain') ||
        lower.includes('grants') ||
        lower.includes('allows') ||
        lower.includes('advantage on') ||
        lower.includes('immunity to') ||
        lower.includes('resistance to')) {
      effects.push(sentence.trim());
    }
  }

  return effects.length > 0 ? effects : undefined;
}

// Process a single item detail into our MagicItem format
function processItem(detail: APIItemDetail): MagicItem {
  const description = detail.desc.join(' ');
  const bonus = extractBonus(detail.name, description);
  const charges = extractCharges(description);
  const effects = extractEffects(description);

  const properties: MagicItem['properties'] = {};
  if (bonus !== undefined) properties.bonus = bonus;
  if (charges !== undefined) properties.charges = charges;
  if (effects !== undefined) properties.effects = effects;

  return {
    name: detail.name,
    rarity: RARITY_MAP[detail.rarity.name] || 'common',
    type: detectItemType(detail),
    requiresAttunement: requiresAttunement(description),
    description,
    properties: Object.keys(properties).length > 0 ? properties : undefined
  };
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries} for ${url}`);
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

async function main() {
  console.log('Fetching magic items list...');
  const listResponse = await fetchWithRetry(`${API_BASE}/magic-items`);
  const items: APIItem[] = listResponse.results;

  console.log(`Found ${items.length} magic items. Fetching details...`);

  const magicItems: MagicItem[] = [];
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      console.log(`[${i + 1}/${items.length}] Fetching ${item.name}...`);
      // item.url already includes /api/, so just prepend the base domain
      const url = `https://www.dnd5eapi.co${item.url}`;
      const detail = await fetchWithRetry(url);

      // Skip variant items (they're grouped under the parent)
      if (detail.variant) {
        console.log(`  Skipping variant: ${item.name}`);
        continue;
      }

      const processed = processItem(detail);
      magicItems.push(processed);

      // Rate limiting
      await delay(100);
    } catch (error) {
      console.error(`Error fetching ${item.name}:`, error);
      errors.push(`${item.name}: ${error}`);
    }
  }

  console.log(`\nSuccessfully processed ${magicItems.length} items`);
  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach(e => console.log(`  ${e}`));
  }

  // Generate statistics
  const stats = {
    total: magicItems.length,
    byRarity: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    requiresAttunement: magicItems.filter(i => i.requiresAttunement).length
  };

  for (const item of magicItems) {
    stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
  }

  console.log('\n=== Statistics ===');
  console.log('By Rarity:');
  Object.entries(stats.byRarity).sort((a, b) => b[1] - a[1]).forEach(([rarity, count]) => {
    console.log(`  ${rarity}: ${count}`);
  });

  console.log('\nBy Type:');
  Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log(`\nRequires Attunement: ${stats.requiresAttunement}`);

  // Write to JSON file
  const fs = await import('fs/promises');
  const outputPath = 'magic_items_data.json';
  await fs.writeFile(outputPath, JSON.stringify(magicItems, null, 2));
  console.log(`\nData written to ${outputPath}`);

  return magicItems;
}

main().catch(console.error);
