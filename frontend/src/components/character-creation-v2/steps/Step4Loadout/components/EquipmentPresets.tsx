/**
 * @file EquipmentPresets.tsx
 * @description Displays and allows selection of equipment presets based on character class
 */

import React from 'react';
import type { Equipment } from '../../../../../types/wizard';
import { getEquipmentPresetsByClass, type EquipmentPreset } from '../../../../../services/equipmentService';

interface EquipmentPresetsProps {
  characterClass: string;
  selectedIndex: number | null;
  onSelectPreset: (preset: EquipmentPreset, index: number) => void;
}

export const EquipmentPresets: React.FC<EquipmentPresetsProps> = ({
  characterClass,
  selectedIndex,
  onSelectPreset,
}) => {
  const presets = getEquipmentPresetsByClass(characterClass);

  if (presets.length === 0) {
    return (
      <div className="text-gray-400">
        No equipment presets available for {characterClass}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-nuaibria-gold">Choose Your Loadout</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((preset, index) => (
          <div
            key={index}
            data-testid={`equipment-preset-${index}`}
            onClick={() => onSelectPreset(preset, index)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all
              ${
                selectedIndex === index
                  ? 'border-nuaibria-gold bg-nuaibria-gold/10 selected'
                  : 'border-gray-700 bg-gray-800/50 hover:border-nuaibria-purple hover:bg-gray-800'
              }
            `}
          >
            {/* Preset Icon */}
            <div className="mb-3" data-testid={`preset-icon-${index}`}>
              <div className="w-12 h-12 bg-nuaibria-purple/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚔️</span>
              </div>
            </div>

            {/* Preset Name */}
            <h4 className="text-lg font-bold text-white mb-2">{preset.name}</h4>

            {/* Preset Description */}
            <p className="text-sm text-gray-400 mb-3">{preset.description}</p>

            {/* Equipment Count */}
            <div className="text-xs text-gray-500">
              {preset.equipment.length} items included
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
