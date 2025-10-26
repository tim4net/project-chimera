/**
 * @file equipmentService.ts
 * @description Equipment preset management and validation
 */

import type { Equipment } from '../types/wizard';

export interface EquipmentPreset {
  name: string;
  description: string;
  equipment: Equipment[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EncumbranceResult {
  weight: number;
  light: boolean;
}

/**
 * Get equipment presets for a given class
 */
export function getEquipmentPresetsByClass(className: string): EquipmentPreset[] {
  const presets: Record<string, EquipmentPreset[]> = {
    Barbarian: [
      {
        name: 'Berserker',
        description: 'Heavy melee combatant with greataxe',
        equipment: [
          { name: 'Greataxe', type: 'weapon', weight: 7 },
          { name: 'Hide Armor', type: 'armor', weight: 12 },
          { name: 'Javelins (4)', type: 'weapon', weight: 8 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Tribal Warrior',
        description: 'Dual-wielding fighter with hand axes',
        equipment: [
          { name: 'Handaxe', type: 'weapon', weight: 2 },
          { name: 'Handaxe', type: 'weapon', weight: 2 },
          { name: 'Hide Armor', type: 'armor', weight: 12 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Brute',
        description: 'Maul-wielding powerhouse',
        equipment: [
          { name: 'Maul', type: 'weapon', weight: 10 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Bard: [
      {
        name: 'Performer',
        description: 'Charismatic musician with rapier',
        equipment: [
          { name: 'Rapier', type: 'weapon', weight: 2 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Lute', type: 'gear', weight: 2 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Skald',
        description: 'Battle bard with longsword',
        equipment: [
          { name: 'Longsword', type: 'weapon', weight: 3 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Lute', type: 'gear', weight: 2 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Minstrel',
        description: 'Nimble bard with dagger',
        equipment: [
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Flute', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Cleric: [
      {
        name: 'War Priest',
        description: 'Armored cleric with mace and shield',
        equipment: [
          { name: 'Mace', type: 'weapon', weight: 4 },
          { name: 'Chain Mail', type: 'armor', weight: 55 },
          { name: 'Shield', type: 'armor', weight: 6 },
          { name: 'Holy Symbol', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Healer',
        description: 'Support cleric with staff',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Scale Mail', type: 'armor', weight: 45 },
          { name: 'Holy Symbol', type: 'gear', weight: 1 },
          { name: 'Healer\'s Kit', type: 'gear', weight: 3 },
        ],
      },
      {
        name: 'Crusader',
        description: 'Divine warrior with warhammer',
        equipment: [
          { name: 'Warhammer', type: 'weapon', weight: 2 },
          { name: 'Chain Mail', type: 'armor', weight: 55 },
          { name: 'Shield', type: 'armor', weight: 6 },
          { name: 'Holy Symbol', type: 'gear', weight: 1 },
        ],
      },
    ],
    Druid: [
      {
        name: 'Nature Guardian',
        description: 'Druid with scimitar and wooden shield',
        equipment: [
          { name: 'Scimitar', type: 'weapon', weight: 3 },
          { name: 'Hide Armor', type: 'armor', weight: 12 },
          { name: 'Wooden Shield', type: 'armor', weight: 6 },
          { name: 'Druidic Focus', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Wildshaper',
        description: 'Shapeshifter druid with staff',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Druidic Focus', type: 'gear', weight: 1 },
          { name: 'Herbalism Kit', type: 'gear', weight: 3 },
        ],
      },
      {
        name: 'Circle Keeper',
        description: 'Balanced druid with club',
        equipment: [
          { name: 'Club', type: 'weapon', weight: 2 },
          { name: 'Hide Armor', type: 'armor', weight: 12 },
          { name: 'Druidic Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Fighter: [
      {
        name: 'Knight',
        description: 'Heavily armored sword and board fighter',
        equipment: [
          { name: 'Longsword', type: 'weapon', weight: 3 },
          { name: 'Chain Mail', type: 'armor', weight: 55 },
          { name: 'Shield', type: 'armor', weight: 6 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Archer',
        description: 'Ranged fighter with longbow',
        equipment: [
          { name: 'Longbow', type: 'weapon', weight: 2 },
          { name: 'Shortsword', type: 'weapon', weight: 2 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Quiver (20 arrows)', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Champion',
        description: 'Two-handed weapon specialist',
        equipment: [
          { name: 'Greatsword', type: 'weapon', weight: 6 },
          { name: 'Chain Mail', type: 'armor', weight: 55 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Monk: [
      {
        name: 'Martial Artist',
        description: 'Unarmed combat specialist',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Simple Robes', type: 'armor', weight: 3 },
          { name: 'Darts (10)', type: 'weapon', weight: 2 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Shadow Monk',
        description: 'Stealthy ninja-style monk',
        equipment: [
          { name: 'Shortsword', type: 'weapon', weight: 2 },
          { name: 'Simple Robes', type: 'armor', weight: 3 },
          { name: 'Darts (10)', type: 'weapon', weight: 2 },
          { name: 'Thieves\' Tools', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Wanderer',
        description: 'Traveling monk with staff',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Simple Robes', type: 'armor', weight: 3 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Paladin: [
      {
        name: 'Holy Knight',
        description: 'Divine warrior with longsword and shield',
        equipment: [
          { name: 'Longsword', type: 'weapon', weight: 3 },
          { name: 'Chain Mail', type: 'armor', weight: 55 },
          { name: 'Shield', type: 'armor', weight: 6 },
          { name: 'Holy Symbol', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Avenger',
        description: 'Two-handed paladin with greatsword',
        equipment: [
          { name: 'Greatsword', type: 'weapon', weight: 6 },
          { name: 'Chain Mail', type: 'armor', weight: 55 },
          { name: 'Holy Symbol', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Protector',
        description: 'Defensive paladin with warhammer',
        equipment: [
          { name: 'Warhammer', type: 'weapon', weight: 2 },
          { name: 'Plate Mail', type: 'armor', weight: 65 },
          { name: 'Shield', type: 'armor', weight: 6 },
          { name: 'Holy Symbol', type: 'gear', weight: 1 },
        ],
      },
    ],
    Ranger: [
      {
        name: 'Hunter',
        description: 'Archer ranger with tracking skills',
        equipment: [
          { name: 'Longbow', type: 'weapon', weight: 2 },
          { name: 'Shortsword', type: 'weapon', weight: 2 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Quiver (20 arrows)', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Beast Master',
        description: 'Melee ranger with dual weapons',
        equipment: [
          { name: 'Scimitar', type: 'weapon', weight: 3 },
          { name: 'Scimitar', type: 'weapon', weight: 3 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Scout',
        description: 'Versatile ranger with longbow',
        equipment: [
          { name: 'Longbow', type: 'weapon', weight: 2 },
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Rogue: [
      {
        name: 'Thief',
        description: 'Stealthy rogue with lockpicks',
        equipment: [
          { name: 'Shortsword', type: 'weapon', weight: 2 },
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Thieves\' Tools', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Assassin',
        description: 'Deadly rogue with poison',
        equipment: [
          { name: 'Shortsword', type: 'weapon', weight: 2 },
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Poisoner\'s Kit', type: 'gear', weight: 2 },
        ],
      },
      {
        name: 'Swashbuckler',
        description: 'Agile duelist with rapier',
        equipment: [
          { name: 'Rapier', type: 'weapon', weight: 2 },
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Sorcerer: [
      {
        name: 'Wild Mage',
        description: 'Unpredictable arcane caster',
        equipment: [
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Simple Robes', type: 'armor', weight: 3 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Dragon Blooded',
        description: 'Draconic heritage sorcerer',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Storm Caller',
        description: 'Lightning and thunder specialist',
        equipment: [
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Simple Robes', type: 'armor', weight: 3 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Warlock: [
      {
        name: 'Hexblade',
        description: 'Melee warlock with pact weapon',
        equipment: [
          { name: 'Longsword', type: 'weapon', weight: 3 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Eldritch Blaster',
        description: 'Ranged warlock specializing in eldritch blast',
        equipment: [
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
      {
        name: 'Fiend Pact',
        description: 'Warlock with infernal patron',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
          { name: 'Backpack', type: 'gear', weight: 5 },
        ],
      },
    ],
    Wizard: [
      {
        name: 'Battle Mage',
        description: 'Combat-ready wizard',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Leather Armor', type: 'armor', weight: 10 },
          { name: 'Spellbook', type: 'gear', weight: 3 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'Scholar',
        description: 'Traditional wizard with robes',
        equipment: [
          { name: 'Dagger', type: 'weapon', weight: 1 },
          { name: 'Simple Robes', type: 'armor', weight: 3 },
          { name: 'Spellbook', type: 'gear', weight: 3 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
        ],
      },
      {
        name: 'War Wizard',
        description: 'Tactical wizard with staff',
        equipment: [
          { name: 'Quarterstaff', type: 'weapon', weight: 4 },
          { name: 'Studded Leather', type: 'armor', weight: 13 },
          { name: 'Spellbook', type: 'gear', weight: 3 },
          { name: 'Arcane Focus', type: 'gear', weight: 1 },
        ],
      },
    ],
  };

  return presets[className] || [];
}

/**
 * Validate equipment selection
 */
export function validateEquipmentSelection(equipment: Equipment[]): ValidationResult {
  const errors: string[] = [];

  if (equipment.length === 0) {
    errors.push('Equipment list cannot be empty');
    return { valid: false, errors };
  }

  // Check for at least one weapon
  const hasWeapon = equipment.some((item) => item.type === 'weapon');
  if (!hasWeapon) {
    errors.push('At least one weapon is required');
  }

  // Check for at least one armor piece
  const hasArmor = equipment.some((item) => item.type === 'armor');
  if (!hasArmor) {
    errors.push('At least one armor piece is required');
  }

  // Check for duplicates (allow duplicate weapons for dual-wielding)
  const nonWeaponItems = equipment.filter((item) => item.type !== 'weapon');
  const nonWeaponNames = nonWeaponItems.map((item) => item.name);
  const duplicates = nonWeaponNames.filter((name, index) => nonWeaponNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate items found: ${duplicates.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate encumbrance based on equipment weight
 * Light if weight < STR score * 15
 */
export function calculateEncumbrance(
  equipment: Equipment[],
  strengthScore: number = 10
): EncumbranceResult {
  const totalWeight = equipment.reduce((sum, item) => sum + item.weight, 0);
  const carryCapacity = strengthScore * 15;

  return {
    weight: totalWeight,
    light: totalWeight <= carryCapacity,
  };
}
