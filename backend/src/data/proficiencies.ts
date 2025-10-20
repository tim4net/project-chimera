/**
 * D&D 5e Proficiency Lists
 * 
 * Standard armor, weapon, and tool proficiencies.
 */

// Armor Types
export const ARMOR_TYPES = {
  LIGHT: ["Padded", "Leather", "Studded Leather"],
  MEDIUM: ["Hide", "Chain Shirt", "Scale Mail", "Breastplate", "Half Plate"],
  HEAVY: ["Ring Mail", "Chain Mail", "Splint", "Plate"],
  SHIELDS: ["Shield"]
} as const;

// Weapon Categories
export const WEAPON_CATEGORIES = {
  SIMPLE_MELEE: [
    "Club", "Dagger", "Greatclub", "Handaxe", "Javelin",
    "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear"
  ],
  SIMPLE_RANGED: [
    "Light Crossbow", "Dart", "Shortbow", "Sling"
  ],
  MARTIAL_MELEE: [
    "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword",
    "Halberd", "Lance", "Longsword", "Maul", "Morningstar",
    "Pike", "Rapier", "Scimitar", "Shortsword", "Trident",
    "War Pick", "Warhammer", "Whip"
  ],
  MARTIAL_RANGED: [
    "Blowgun", "Hand Crossbow", "Heavy Crossbow", "Longbow", "Net"
  ]
} as const;

// Common Tool Proficiencies
export const TOOL_TYPES = {
  ARTISAN: [
    "Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies",
    "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools",
    "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools",
    "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies",
    "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools",
    "Woodcarver's Tools"
  ],
  MUSICAL: [
    "Bagpipes", "Drum", "Dulcimer", "Flute", "Lute",
    "Lyre", "Horn", "Pan Flute", "Shawm", "Viol"
  ],
  GAMING: [
    "Dice Set", "Dragonchess Set", "Playing Card Set", "Three-Dragon Ante Set"
  ],
  OTHER: [
    "Disguise Kit", "Forgery Kit", "Herbalism Kit", "Navigator's Tools",
    "Poisoner's Kit", "Thieves' Tools", "Vehicles (Land)", "Vehicles (Water)"
  ]
} as const;

// Ability Scores
export const ABILITY_SCORES = [
  "STR", "DEX", "CON", "INT", "WIS", "CHA"
] as const;

export type AbilityScore = typeof ABILITY_SCORES[number];

// Skill to Ability mapping
export const SKILL_ABILITIES: Record<string, AbilityScore> = {
  "Acrobatics": "DEX",
  "Animal Handling": "WIS",
  "Arcana": "INT",
  "Athletics": "STR",
  "Deception": "CHA",
  "History": "INT",
  "Insight": "WIS",
  "Intimidation": "CHA",
  "Investigation": "INT",
  "Medicine": "WIS",
  "Nature": "INT",
  "Perception": "WIS",
  "Performance": "CHA",
  "Persuasion": "CHA",
  "Religion": "INT",
  "Sleight of Hand": "DEX",
  "Stealth": "DEX",
  "Survival": "WIS"
};

// Proficiency bonus by level
export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}
