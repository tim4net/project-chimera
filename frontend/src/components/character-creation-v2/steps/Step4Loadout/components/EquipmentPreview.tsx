/**
 * @file EquipmentPreview.tsx
 * @description Displays selected equipment with visual representation
 */

import React from 'react';

interface EquipmentPreviewProps {
  equipment: string[];
}

/**
 * Get equipment type from name (simple heuristic)
 */
function getEquipmentType(name: string): string {
  const nameLower = name.toLowerCase();

  // Weapons
  if (nameLower.includes('sword') || nameLower.includes('axe') ||
      nameLower.includes('bow') || nameLower.includes('dagger') ||
      nameLower.includes('mace') || nameLower.includes('staff') ||
      nameLower.includes('hammer') || nameLower.includes('javelin') ||
      nameLower.includes('dart') || nameLower.includes('club') ||
      nameLower.includes('scimitar') || nameLower.includes('rapier') ||
      nameLower.includes('quarterstaff') || nameLower.includes('maul')) {
    return 'Weapon';
  }

  // Shield (treated as armor in D&D, but shown as Shield for clarity)
  if (nameLower.includes('shield')) {
    return 'Shield';
  }

  // Armor
  if (nameLower.includes('armor') || nameLower.includes('mail') ||
      nameLower.includes('leather') || nameLower.includes('plate') ||
      nameLower.includes('robe')) {
    return 'Armor';
  }

  // Default to gear
  return 'Gear';
}

export const EquipmentPreview: React.FC<EquipmentPreviewProps> = ({ equipment }) => {
  if (!equipment || equipment.length === 0) {
    return (
      <div
        data-testid="equipment-preview"
        className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-center"
      >
        <p className="text-gray-500">No equipment selected</p>
        <p className="text-sm text-gray-600 mt-2">Choose a loadout preset to see equipment</p>
      </div>
    );
  }

  return (
    <div
      data-testid="equipment-preview"
      className="p-6 bg-gray-800/50 rounded-lg border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-nuaibria-gold mb-4">Your Equipment</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {equipment.map((item, index) => {
          const itemType = getEquipmentType(item);

          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700"
            >
              {/* Item Icon/Type Badge */}
              <div className="flex-shrink-0 w-10 h-10 bg-nuaibria-purple/20 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-nuaibria-purple">
                  {itemType === 'Weapon' && '⚔️'}
                  {itemType === 'Armor' && '🛡️'}
                  {itemType === 'Shield' && '🛡️'}
                  {itemType === 'Gear' && '🎒'}
                </span>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{item}</div>
                {/* Only show type if it's different from the item name */}
                {item !== itemType && (
                  <div className="text-xs text-gray-500">{itemType}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
