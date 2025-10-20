/**
 * D&D 5e Tool Proficiencies
 * Implements all SRD tools including artisan's tools, gaming sets, and musical instruments
 */

export interface Tool {
  name: string;
  category: 'artisan' | 'gaming' | 'instrument' | 'other';
  cost: { amount: number; unit: string };
  weight: number; // in pounds
  description: string;
  relatedAbility?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  commonUses?: string[];
}

/**
 * Artisan's Tools - used for crafting and repairs
 */
export const ARTISAN_TOOLS: Tool[] = [
  {
    name: "Alchemist's Supplies",
    category: 'artisan',
    cost: { amount: 50, unit: 'gp' },
    weight: 8,
    relatedAbility: 'INT',
    description: 'Proficiency with these tools allows you to craft alchemical items',
    commonUses: ['Craft potions', 'Identify substances', 'Detect poison']
  },
  {
    name: "Brewer's Supplies",
    category: 'artisan',
    cost: { amount: 20, unit: 'gp' },
    weight: 9,
    relatedAbility: 'INT',
    description: 'Tools for brewing beer, ale, and other fermented beverages',
    commonUses: ['Brew drinks', 'Detect poisoned drinks', 'Purify water']
  },
  {
    name: "Calligrapher's Supplies",
    category: 'artisan',
    cost: { amount: 10, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Tools for fine writing and document creation',
    commonUses: ['Forge documents', 'Identify forgeries', 'Create illuminated manuscripts']
  },
  {
    name: "Carpenter's Tools",
    category: 'artisan',
    cost: { amount: 8, unit: 'gp' },
    weight: 6,
    relatedAbility: 'STR',
    description: 'Tools for working with wood and construction',
    commonUses: ['Build structures', 'Repair wooden items', 'Assess structural integrity']
  },
  {
    name: "Cartographer's Tools",
    category: 'artisan',
    cost: { amount: 15, unit: 'gp' },
    weight: 6,
    relatedAbility: 'WIS',
    description: 'Tools for creating maps and navigational charts',
    commonUses: ['Create accurate maps', 'Navigate terrain', 'Identify landmarks']
  },
  {
    name: "Cobbler's Tools",
    category: 'artisan',
    cost: { amount: 5, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Tools for crafting and repairing shoes and boots',
    commonUses: ['Craft footwear', 'Assess travel conditions', 'Create hidden compartments in shoes']
  },
  {
    name: "Cook's Utensils",
    category: 'artisan',
    cost: { amount: 1, unit: 'gp' },
    weight: 8,
    relatedAbility: 'WIS',
    description: 'Pots, pans, and utensils for preparing meals',
    commonUses: ['Prepare meals', 'Identify spoiled food', 'Create special dishes']
  },
  {
    name: "Glassblower's Tools",
    category: 'artisan',
    cost: { amount: 30, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Tools for shaping molten glass into objects',
    commonUses: ['Craft glass items', 'Identify glass quality', 'Assess gem authenticity']
  },
  {
    name: "Jeweler's Tools",
    category: 'artisan',
    cost: { amount: 25, unit: 'gp' },
    weight: 2,
    relatedAbility: 'DEX',
    description: 'Precision tools for working with gems and precious metals',
    commonUses: ['Craft jewelry', 'Appraise gems', 'Identify forgeries']
  },
  {
    name: "Leatherworker's Tools",
    category: 'artisan',
    cost: { amount: 5, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Tools for working leather into armor and goods',
    commonUses: ['Craft leather armor', 'Repair leather items', 'Identify leather quality']
  },
  {
    name: "Mason's Tools",
    category: 'artisan',
    cost: { amount: 10, unit: 'gp' },
    weight: 8,
    relatedAbility: 'STR',
    description: 'Tools for shaping and setting stone',
    commonUses: ['Build stone structures', 'Find hidden passages', 'Assess structural weaknesses']
  },
  {
    name: "Painter's Supplies",
    category: 'artisan',
    cost: { amount: 10, unit: 'gp' },
    weight: 5,
    relatedAbility: 'CHA',
    description: 'Pigments, brushes, and canvas for creating art',
    commonUses: ['Create paintings', 'Forge artwork', 'Replicate images accurately']
  },
  {
    name: "Potter's Tools",
    category: 'artisan',
    cost: { amount: 10, unit: 'gp' },
    weight: 3,
    relatedAbility: 'DEX',
    description: 'Tools for shaping clay into pottery',
    commonUses: ['Craft pottery', 'Identify clay types', 'Assess soil quality']
  },
  {
    name: "Smith's Tools",
    category: 'artisan',
    cost: { amount: 20, unit: 'gp' },
    weight: 8,
    relatedAbility: 'STR',
    description: 'Tools for working metal into weapons and armor',
    commonUses: ['Craft metal items', 'Repair armor and weapons', 'Assess metal quality']
  },
  {
    name: "Tinker's Tools",
    category: 'artisan',
    cost: { amount: 50, unit: 'gp' },
    weight: 10,
    relatedAbility: 'DEX',
    description: 'Various tools for mechanical repairs and gadgets',
    commonUses: ['Repair clockwork devices', 'Pick locks', 'Disarm traps']
  },
  {
    name: "Weaver's Tools",
    category: 'artisan',
    cost: { amount: 1, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Tools for weaving cloth and creating textiles',
    commonUses: ['Craft cloth', 'Repair clothing', 'Create disguises']
  },
  {
    name: "Woodcarver's Tools",
    category: 'artisan',
    cost: { amount: 1, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Knives and chisels for carving wood',
    commonUses: ['Craft wooden items', 'Create decorative carvings', 'Repair wooden objects']
  }
];

/**
 * Gaming Sets - used for gambling and entertainment
 */
export const GAMING_SETS: Tool[] = [
  {
    name: 'Dice Set',
    category: 'gaming',
    cost: { amount: 1, unit: 'sp' },
    weight: 0,
    relatedAbility: 'WIS',
    description: 'A set of dice for various games of chance',
    commonUses: ['Play games', 'Detect cheating', 'Assess probability']
  },
  {
    name: 'Dragonchess Set',
    category: 'gaming',
    cost: { amount: 1, unit: 'gp' },
    weight: 0.5,
    relatedAbility: 'INT',
    description: 'A complex strategy game played on multiple boards',
    commonUses: ['Play dragonchess', 'Predict opponent moves', 'Strategic thinking']
  },
  {
    name: 'Playing Card Set',
    category: 'gaming',
    cost: { amount: 5, unit: 'sp' },
    weight: 0,
    relatedAbility: 'CHA',
    description: 'A deck of cards for various games',
    commonUses: ['Play card games', 'Perform tricks', 'Detect marked cards']
  },
  {
    name: 'Three-Dragon Ante Set',
    category: 'gaming',
    cost: { amount: 1, unit: 'gp' },
    weight: 0,
    relatedAbility: 'CHA',
    description: 'A popular gambling card game',
    commonUses: ['Play Three-Dragon Ante', 'Bluff opponents', 'Read tells']
  }
];

/**
 * Musical Instruments - used for performance and entertainment
 */
export const MUSICAL_INSTRUMENTS: Tool[] = [
  {
    name: 'Bagpipes',
    category: 'instrument',
    cost: { amount: 30, unit: 'gp' },
    weight: 6,
    relatedAbility: 'CHA',
    description: 'A wind instrument with a distinctive droning sound',
    commonUses: ['Perform music', 'Rally troops', 'Create loud distractions']
  },
  {
    name: 'Drum',
    category: 'instrument',
    cost: { amount: 6, unit: 'gp' },
    weight: 3,
    relatedAbility: 'CHA',
    description: 'A percussion instrument',
    commonUses: ['Perform music', 'Send signals', 'Set marching rhythm']
  },
  {
    name: 'Dulcimer',
    category: 'instrument',
    cost: { amount: 25, unit: 'gp' },
    weight: 10,
    relatedAbility: 'CHA',
    description: 'A stringed instrument played with small hammers',
    commonUses: ['Perform music', 'Entertain nobility', 'Soothe listeners']
  },
  {
    name: 'Flute',
    category: 'instrument',
    cost: { amount: 2, unit: 'gp' },
    weight: 1,
    relatedAbility: 'CHA',
    description: 'A simple wind instrument',
    commonUses: ['Perform music', 'Signal allies', 'Charm animals']
  },
  {
    name: 'Lute',
    category: 'instrument',
    cost: { amount: 35, unit: 'gp' },
    weight: 2,
    relatedAbility: 'CHA',
    description: 'A popular stringed instrument favored by bards',
    commonUses: ['Perform music', 'Accompany stories', 'Earn tips performing']
  },
  {
    name: 'Lyre',
    category: 'instrument',
    cost: { amount: 30, unit: 'gp' },
    weight: 2,
    relatedAbility: 'CHA',
    description: 'A classical stringed instrument',
    commonUses: ['Perform music', 'Recite poetry', 'Invoke tradition']
  },
  {
    name: 'Horn',
    category: 'instrument',
    cost: { amount: 3, unit: 'gp' },
    weight: 2,
    relatedAbility: 'CHA',
    description: 'A brass wind instrument',
    commonUses: ['Perform music', 'Sound alarms', 'Rally forces']
  },
  {
    name: 'Pan Flute',
    category: 'instrument',
    cost: { amount: 12, unit: 'gp' },
    weight: 2,
    relatedAbility: 'CHA',
    description: 'A set of pipes bound together',
    commonUses: ['Perform music', 'Create haunting melodies', 'Attract attention']
  },
  {
    name: 'Shawm',
    category: 'instrument',
    cost: { amount: 2, unit: 'gp' },
    weight: 1,
    relatedAbility: 'CHA',
    description: 'A loud, piercing wind instrument',
    commonUses: ['Perform music', 'Announce arrivals', 'Create noise']
  },
  {
    name: 'Viol',
    category: 'instrument',
    cost: { amount: 30, unit: 'gp' },
    weight: 1,
    relatedAbility: 'CHA',
    description: 'An elegant stringed instrument played with a bow',
    commonUses: ['Perform music', 'Entertain nobles', 'Create ambiance']
  }
];

/**
 * Other Tools - specialized tools for specific tasks
 */
export const OTHER_TOOLS: Tool[] = [
  {
    name: "Disguise Kit",
    category: 'other',
    cost: { amount: 25, unit: 'gp' },
    weight: 3,
    relatedAbility: 'CHA',
    description: 'Tools for altering appearance including cosmetics, hair dye, and props',
    commonUses: ['Create disguises', 'Impersonate others', 'Detect disguises']
  },
  {
    name: "Forgery Kit",
    category: 'other',
    cost: { amount: 15, unit: 'gp' },
    weight: 5,
    relatedAbility: 'DEX',
    description: 'Materials for creating fake documents and seals',
    commonUses: ['Forge documents', 'Copy signatures', 'Detect forgeries']
  },
  {
    name: "Herbalism Kit",
    category: 'other',
    cost: { amount: 5, unit: 'gp' },
    weight: 3,
    relatedAbility: 'INT',
    description: 'Tools for identifying and preparing herbs',
    commonUses: ['Craft potions of healing', 'Identify plants', 'Create antitoxins']
  },
  {
    name: "Navigator's Tools",
    category: 'other',
    cost: { amount: 25, unit: 'gp' },
    weight: 2,
    relatedAbility: 'WIS',
    description: 'Sextant, compass, and charts for navigation',
    commonUses: ['Navigate by stars', 'Chart courses', 'Predict weather']
  },
  {
    name: "Poisoner's Kit",
    category: 'other',
    cost: { amount: 50, unit: 'gp' },
    weight: 2,
    relatedAbility: 'INT',
    description: 'Vials and chemicals for handling poisons',
    commonUses: ['Apply poison safely', 'Identify poisons', 'Craft poisons']
  },
  {
    name: "Thieves' Tools",
    category: 'other',
    cost: { amount: 25, unit: 'gp' },
    weight: 1,
    relatedAbility: 'DEX',
    description: 'Lock picks and tools for bypassing security',
    commonUses: ['Pick locks', 'Disarm traps', 'Open shackles']
  }
];

/**
 * All tools combined
 */
export const ALL_TOOLS: Tool[] = [
  ...ARTISAN_TOOLS,
  ...GAMING_SETS,
  ...MUSICAL_INSTRUMENTS,
  ...OTHER_TOOLS
];

/**
 * Get tool by name
 */
export function getTool(name: string): Tool | undefined {
  return ALL_TOOLS.find(tool =>
    tool.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all tools of a specific category
 */
export function getToolsByCategory(
  category: 'artisan' | 'gaming' | 'instrument' | 'other'
): Tool[] {
  return ALL_TOOLS.filter(tool => tool.category === category);
}

/**
 * Check if a tool exists
 */
export function isValidTool(name: string): boolean {
  return getTool(name) !== undefined;
}

/**
 * Get tools that use a specific ability
 */
export function getToolsByAbility(
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
): Tool[] {
  return ALL_TOOLS.filter(tool => tool.relatedAbility === ability);
}

/**
 * Calculate total cost of multiple tools
 */
export function calculateToolCost(toolNames: string[]): { amount: number; unit: string } {
  let totalGp = 0;
  let totalSp = 0;
  let totalCp = 0;

  toolNames.forEach(name => {
    const tool = getTool(name);
    if (tool) {
      switch (tool.cost.unit) {
        case 'gp':
          totalGp += tool.cost.amount;
          break;
        case 'sp':
          totalSp += tool.cost.amount;
          break;
        case 'cp':
          totalCp += tool.cost.amount;
          break;
      }
    }
  });

  // Convert to gold pieces
  totalGp += totalSp / 10;
  totalGp += totalCp / 100;

  return { amount: Math.round(totalGp * 100) / 100, unit: 'gp' };
}
