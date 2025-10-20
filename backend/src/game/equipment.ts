import type { EquipmentItem } from '../types';

/**
 * D&D 5e Starting Equipment by Class
 * Based on Player's Handbook standard equipment packages
 */

const startingEquipment: Record<string, EquipmentItem[]> = {
  // Barbarian - Simple weapons, light/medium armor
  Barbarian: [
    { name: 'Greataxe', quantity: 1 },
    { name: 'Handaxe', quantity: 2 },
    { name: 'Javelin', quantity: 4 },
    { name: "Explorer's Pack", quantity: 1 }
  ],

  // Bard - Simple weapons, hand crossbows, longswords, rapiers, shortswords, light armor
  Bard: [
    { name: 'Rapier', quantity: 1 },
    { name: 'Dagger', quantity: 1 },
    { name: 'Leather Armor', quantity: 1 },
    { name: 'Lute', quantity: 1 },
    { name: "Entertainer's Pack", quantity: 1 }
  ],

  // Cleric - Simple weapons, light/medium armor, shields
  Cleric: [
    { name: 'Mace', quantity: 1 },
    { name: 'Scale Mail', quantity: 1 },
    { name: 'Light Crossbow', quantity: 1 },
    { name: 'Crossbow Bolts', quantity: 20 },
    { name: 'Shield', quantity: 1 },
    { name: 'Holy Symbol', quantity: 1 },
    { name: "Priest's Pack", quantity: 1 }
  ],

  // Druid - Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears
  Druid: [
    { name: 'Scimitar', quantity: 1 },
    { name: 'Leather Armor', quantity: 1 },
    { name: "Explorer's Pack", quantity: 1 },
    { name: 'Druidic Focus', quantity: 1 }
  ],

  // Fighter - All weapons and armor
  Fighter: [
    { name: 'Longsword', quantity: 1 },
    { name: 'Shield', quantity: 1 },
    { name: 'Chain Mail', quantity: 1 },
    { name: 'Light Crossbow', quantity: 1 },
    { name: 'Crossbow Bolts', quantity: 20 },
    { name: "Dungeoneer's Pack", quantity: 1 }
  ],

  // Monk - Simple weapons, shortswords
  Monk: [
    { name: 'Shortsword', quantity: 1 },
    { name: 'Dart', quantity: 10 },
    { name: "Explorer's Pack", quantity: 1 }
  ],

  // Paladin - All weapons and armor
  Paladin: [
    { name: 'Longsword', quantity: 1 },
    { name: 'Shield', quantity: 1 },
    { name: 'Chain Mail', quantity: 1 },
    { name: 'Javelin', quantity: 5 },
    { name: 'Holy Symbol', quantity: 1 },
    { name: "Priest's Pack", quantity: 1 }
  ],

  // Ranger - Simple and martial weapons, light and medium armor, shields
  Ranger: [
    { name: 'Longbow', quantity: 1 },
    { name: 'Arrows', quantity: 20 },
    { name: 'Shortsword', quantity: 2 },
    { name: 'Scale Mail', quantity: 1 },
    { name: "Explorer's Pack", quantity: 1 }
  ],

  // Rogue - Simple weapons, hand crossbows, longswords, rapiers, shortswords, light armor
  Rogue: [
    { name: 'Rapier', quantity: 1 },
    { name: 'Shortbow', quantity: 1 },
    { name: 'Arrows', quantity: 20 },
    { name: 'Leather Armor', quantity: 1 },
    { name: 'Dagger', quantity: 2 },
    { name: "Burglar's Pack", quantity: 1 },
    { name: "Thieves' Tools", quantity: 1 }
  ],

  // Sorcerer - Daggers, darts, slings, quarterstaffs, light crossbows
  Sorcerer: [
    { name: 'Light Crossbow', quantity: 1 },
    { name: 'Crossbow Bolts', quantity: 20 },
    { name: 'Dagger', quantity: 2 },
    { name: 'Arcane Focus', quantity: 1 },
    { name: "Dungeoneer's Pack", quantity: 1 }
  ],

  // Warlock - Simple weapons, light armor
  Warlock: [
    { name: 'Light Crossbow', quantity: 1 },
    { name: 'Crossbow Bolts', quantity: 20 },
    { name: 'Dagger', quantity: 2 },
    { name: 'Leather Armor', quantity: 1 },
    { name: 'Arcane Focus', quantity: 1 },
    { name: "Scholar's Pack", quantity: 1 }
  ],

  // Wizard - Daggers, darts, slings, quarterstaffs, light crossbows
  Wizard: [
    { name: 'Quarterstaff', quantity: 1 },
    { name: 'Spellbook', quantity: 1 },
    { name: 'Arcane Focus', quantity: 1 },
    { name: "Scholar's Pack", quantity: 1 },
    { name: 'Dagger', quantity: 1 }
  ]
};

/**
 * Starting gold amounts by class (average values)
 * These are fixed amounts based on class, simpler than rolling dice
 */
export const startingGold: Record<string, number> = {
  Barbarian: 50,  // 2d4 × 10 average = 50
  Bard: 125,      // 5d4 × 10 average = 125
  Cleric: 125,    // 5d4 × 10 average = 125
  Druid: 50,      // 2d4 × 10 average = 50
  Fighter: 125,   // 5d4 × 10 average = 125
  Monk: 13,       // 5d4 average = 13 (no multiplier)
  Paladin: 125,   // 5d4 × 10 average = 125
  Ranger: 125,    // 5d4 × 10 average = 125
  Rogue: 100,     // 4d4 × 10 average = 100
  Sorcerer: 75,   // 3d4 × 10 average = 75
  Warlock: 100,   // 4d4 × 10 average = 100
  Wizard: 100     // 4d4 × 10 average = 100
};

export const getStartingEquipment = (characterClass: string): EquipmentItem[] => {
  return startingEquipment[characterClass] ?? [];
};

export const getStartingGold = (characterClass: string): number => {
  return startingGold[characterClass] ?? 100; // Default to 100gp if class not found
};

export default getStartingEquipment;
