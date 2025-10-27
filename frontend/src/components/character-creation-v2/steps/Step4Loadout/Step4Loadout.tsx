/**
 * @fileoverview Step 4: Loadout (Equipment & Portrait)
 * Complete implementation with all sub-components integrated
 */

import React, { useState } from 'react';
import type { CharacterDraft } from '../../../../context/CharacterDraftContextV2';
import type { EquipmentPreset } from '../../../../services/equipmentService';
import { EquipmentPresets } from './components/EquipmentPresets';
import { EquipmentPreview } from './components/EquipmentPreview';
import { AppearanceInput } from './components/AppearanceInput';
import { PortraitGenerator } from './components/PortraitGenerator';

interface Step4LoadoutProps {
  draft: Partial<CharacterDraft>;
  updateDraft: (data: Partial<CharacterDraft>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  errors: Record<string, string>;
}

/**
 * Step 4: Equipment & Portrait Selection
 * Implements equipment presets, appearance input, and portrait generation
 */
export const Step4Loadout: React.FC<Step4LoadoutProps> = ({
  draft,
  updateDraft,
  onNext,
  onPrevious,
  errors,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [appearance, setAppearance] = useState(draft.appearance || '');
  const [localEquipment, setLocalEquipment] = useState<string[]>(draft.selectedEquipment || []);
  const [localPortraitUrl, setLocalPortraitUrl] = useState<string | undefined>(draft.portraitUrl);

  const handleSelectPreset = (preset: EquipmentPreset, index: number) => {
    setSelectedPresetIndex(index);

    // Extract equipment names from preset
    const equipmentNames = preset.equipment.map((item) => item.name);

    // Update local state for immediate UI feedback
    setLocalEquipment(equipmentNames);

    // Update draft with selected equipment
    updateDraft({
      selectedEquipment: equipmentNames,
    });
  };

  const handleAppearanceChange = (value: string) => {
    setAppearance(value);
    // Update draft with appearance description
    updateDraft({ appearance: value });
  };

  const handlePortraitGenerated = (url: string) => {
    // Update local state for immediate UI feedback
    setLocalPortraitUrl(url);
    // Update draft
    updateDraft({ portraitUrl: url });
  };

  // Determine if Next button should be enabled
  const hasEquipment = localEquipment.length > 0 || (draft.selectedEquipment?.length ?? 0) > 0;
  const hasValidAppearance = appearance.length >= 5;
  const canProceed = hasEquipment && hasValidAppearance;

  return (
    <div data-testid="step4-loadout" className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Step 4: Equipment & Appearance</h2>
        <p className="text-gray-400">
          Choose your starting equipment and describe your character's appearance
        </p>
      </div>

      {/* Equipment Section */}
      <div className="space-y-6">
        <EquipmentPresets
          characterClass={draft.class || 'Fighter'}
          selectedIndex={selectedPresetIndex}
          onSelectPreset={handleSelectPreset}
        />

        <EquipmentPreview equipment={localEquipment.length > 0 ? localEquipment : (draft.selectedEquipment || [])} />
      </div>

      {/* Appearance & Portrait Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Input */}
        <AppearanceInput
          value={appearance}
          onChange={handleAppearanceChange}
          error={errors.appearance}
        />

        {/* Portrait Generator */}
        <PortraitGenerator
          character={draft}
          portraitUrl={localPortraitUrl || draft.portraitUrl}
          onPortraitGenerated={handlePortraitGenerated}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={onPrevious}
          className="
            px-6 py-3 bg-gray-700 rounded-lg font-semibold text-white
            transition-all hover:bg-gray-600
          "
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="
            px-6 py-3 bg-nuaibria-purple rounded-lg font-semibold text-white
            transition-all hover:bg-nuaibria-purple/80
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Next
        </button>
      </div>
    </div>
  );
};
