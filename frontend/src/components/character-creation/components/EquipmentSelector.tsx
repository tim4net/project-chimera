/**
 * @file EquipmentSelector.tsx
 * @description Equipment selection component with class-specific presets
 * Displays equipment packages and gold calculations
 */

import React, { useMemo } from 'react';
import type { CharacterClass } from '../../../types/wizard';

export interface EquipmentPackage {
  name: string;
  items: string[];
  goldValue: number;
}

// Class-specific equipment packages with gold values
const EQUIPMENT_PACKAGES: Record<CharacterClass, EquipmentPackage[]> = {
  Barbarian: [
    {
      name: 'Greataxe Package',
      items: ['Greataxe', 'Two Handaxes', 'Four Javelins', "Explorer's Pack"],
      goldValue: 50,
    },
    {
      name: 'Martial Weapon Package',
      items: ['Greatsword', 'Two Handaxes', 'Four Javelins', "Explorer's Pack"],
      goldValue: 55,
    },
  ],
  Bard: [
    {
      name: 'Rapier & Lute',
      items: ['Leather Armor', 'Rapier', 'Lute', 'Dagger', "Entertainer's Pack"],
      goldValue: 75,
    },
    {
      name: 'Longsword & Lyre',
      items: ['Leather Armor', 'Longsword', 'Lyre', 'Dagger', "Entertainer's Pack"],
      goldValue: 70,
    },
  ],
  Cleric: [
    {
      name: 'Mace & Shield',
      items: [
        'Chain Mail',
        'Mace',
        'Shield',
        'Holy Symbol',
        'Light Crossbow',
        "Priest's Pack",
      ],
      goldValue: 125,
    },
    {
      name: 'Warhammer & Chain',
      items: [
        'Chain Mail',
        'Warhammer',
        'Shield',
        'Holy Symbol',
        'Five Javelins',
        "Priest's Pack",
      ],
      goldValue: 130,
    },
  ],
  Druid: [
    {
      name: 'Shield & Scimitar',
      items: [
        'Leather Armor',
        'Wooden Shield',
        'Scimitar',
        'Druidic Focus',
        "Explorer's Pack",
      ],
      goldValue: 60,
    },
    {
      name: 'Shield & Spear',
      items: [
        'Leather Armor',
        'Wooden Shield',
        'Spear',
        'Druidic Focus',
        "Explorer's Pack",
      ],
      goldValue: 55,
    },
  ],
  Fighter: [
    {
      name: 'Chain Mail & Shield',
      items: [
        'Chain Mail',
        'Longsword',
        'Shield',
        'Light Crossbow',
        "Dungeoneer's Pack",
      ],
      goldValue: 150,
    },
    {
      name: 'Leather & Greatsword',
      items: [
        'Leather Armor',
        'Greatsword',
        'Two Handaxes',
        "Dungeoneer's Pack",
      ],
      goldValue: 85,
    },
  ],
  Monk: [
    {
      name: 'Shortsword & Darts',
      items: ['Shortsword', 'Ten Darts', "Dungeoneer's Pack"],
      goldValue: 25,
    },
    {
      name: 'Spear & Darts',
      items: ['Spear', 'Ten Darts', "Explorer's Pack"],
      goldValue: 20,
    },
  ],
  Paladin: [
    {
      name: 'Martial & Shield',
      items: [
        'Chain Mail',
        'Longsword',
        'Shield',
        'Five Javelins',
        'Holy Symbol',
        "Priest's Pack",
      ],
      goldValue: 160,
    },
    {
      name: 'Greatsword & Chain',
      items: [
        'Chain Mail',
        'Greatsword',
        'Two Handaxes',
        'Holy Symbol',
        "Priest's Pack",
      ],
      goldValue: 165,
    },
  ],
  Ranger: [
    {
      name: 'Scale Mail & Shortswords',
      items: [
        'Scale Mail',
        'Two Shortswords',
        'Longbow',
        'Twenty Arrows',
        "Dungeoneer's Pack",
      ],
      goldValue: 110,
    },
    {
      name: 'Leather & Longsword',
      items: [
        'Leather Armor',
        'Longsword',
        'Shield',
        'Longbow',
        'Twenty Arrows',
        "Explorer's Pack",
      ],
      goldValue: 95,
    },
  ],
  Rogue: [
    {
      name: 'Rapier & Shortbow',
      items: [
        'Leather Armor',
        'Rapier',
        'Shortbow',
        'Twenty Arrows',
        'Dagger',
        "Burglar's Pack",
      ],
      goldValue: 70,
    },
    {
      name: 'Shortsword & Daggers',
      items: ['Leather Armor', 'Shortsword', 'Two Daggers', "Burglar's Pack"],
      goldValue: 55,
    },
  ],
  Sorcerer: [
    {
      name: 'Light Crossbow & Daggers',
      items: [
        'Light Crossbow',
        'Twenty Bolts',
        'Two Daggers',
        'Arcane Focus',
        "Dungeoneer's Pack",
      ],
      goldValue: 50,
    },
    {
      name: 'Quarterstaff & Focus',
      items: [
        'Quarterstaff',
        'Two Daggers',
        'Component Pouch',
        "Explorer's Pack",
      ],
      goldValue: 35,
    },
  ],
  Warlock: [
    {
      name: 'Light Crossbow & Focus',
      items: [
        'Leather Armor',
        'Light Crossbow',
        'Twenty Bolts',
        'Two Daggers',
        'Arcane Focus',
        "Scholar's Pack",
      ],
      goldValue: 65,
    },
    {
      name: 'Dagger & Component Pouch',
      items: [
        'Leather Armor',
        'Dagger',
        'Two Daggers',
        'Component Pouch',
        "Dungeoneer's Pack",
      ],
      goldValue: 45,
    },
  ],
  Wizard: [
    {
      name: 'Dagger & Spellbook',
      items: ['Robes', 'Dagger', 'Arcane Focus', 'Spellbook', "Scholar's Pack"],
      goldValue: 40,
    },
    {
      name: 'Quarterstaff & Spellbook',
      items: [
        'Robes',
        'Quarterstaff',
        'Component Pouch',
        'Spellbook',
        "Explorer's Pack",
      ],
      goldValue: 35,
    },
  ],
};

export interface EquipmentSelectorProps {
  characterClass: CharacterClass;
  selectedPackageIndex: number;
  onSelectPackage: (index: number) => void;
  className?: string;
}

export const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  characterClass,
  selectedPackageIndex,
  onSelectPackage,
  className = '',
}) => {
  const packages = useMemo(
    () => EQUIPMENT_PACKAGES[characterClass] || [],
    [characterClass]
  );

  const selectedPackage = packages[selectedPackageIndex];

  if (packages.length === 0) {
    return (
      <div className={`text-nuaibria-text-secondary ${className}`}>
        No equipment packages available for {characterClass}
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="font-display text-xl text-nuaibria-gold mb-4 tracking-wider">
        Starting Equipment
      </h3>

      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {packages.map((pkg, index) => (
          <div
            key={index}
            onClick={() => onSelectPackage(index)}
            className={`
              p-4 rounded-lg border-2 transition-all cursor-pointer
              ${
                selectedPackageIndex === index
                  ? 'border-nuaibria-gold shadow-glow bg-nuaibria-gold/10'
                  : 'border-nuaibria-border hover:border-nuaibria-gold/50'
              }
            `}
          >
            <h4 className="font-semibold text-lg text-nuaibria-text-primary mb-2">
              {pkg.name}
            </h4>
            <ul className="list-disc list-inside text-nuaibria-text-secondary text-sm space-y-1">
              {pkg.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-nuaibria-border">
              <span className="text-nuaibria-gold font-semibold">
                Value: {pkg.goldValue} gp
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Package Summary */}
      {selectedPackage && (
        <div className="bg-nuaibria-elevated/50 border border-nuaibria-gold/30 rounded-lg p-4">
          <h4 className="font-semibold text-nuaibria-text-primary mb-2">
            Selected: {selectedPackage.name}
          </h4>
          <p className="text-nuaibria-text-secondary text-sm">
            Your {characterClass} will start with{' '}
            <span className="text-nuaibria-gold font-semibold">
              {selectedPackage.goldValue} gp
            </span>{' '}
            worth of equipment.
          </p>
        </div>
      )}
    </div>
  );
};

export default EquipmentSelector;
