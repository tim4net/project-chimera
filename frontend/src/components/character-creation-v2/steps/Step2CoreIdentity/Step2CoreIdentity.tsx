/**
 * @fileoverview Step2CoreIdentity - Core Identity step of character creation
 * Handles alignment, backstory, gender, and portrait selection
 */

import React from 'react';
import type { CharacterDraft } from '../../../../context/characterDraftV2/validation';
import type { Alignment } from '../../../../types/wizard';
import AlignmentGrid from './components/AlignmentGrid';
import BackstoryInput from './components/BackstoryInput';
import GenderSelector from './components/GenderSelector';
import PortraitDisplay from './components/PortraitDisplay';

interface Step2CoreIdentityProps {
  draft: Partial<CharacterDraft>;
  updateDraft: (data: Partial<CharacterDraft>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const Step2CoreIdentity: React.FC<Step2CoreIdentityProps> = ({
  draft,
  updateDraft,
  onNext,
  onPrevious,
}) => {
  // Extract backstory from personalityTraits array (if exists)
  const backstoryValue = draft.personalityTraits?.[0] || '';

  // Validation: All required fields must be filled and backstory >= 10 chars
  const isValid =
    !!draft.alignment &&
    !!draft.gender &&
    backstoryValue.length >= 10 &&
    backstoryValue.length <= 300;

  const handleAlignmentSelect = (alignment: Alignment) => {
    updateDraft({ alignment });
  };

  const handleBackstoryChange = (value: string) => {
    updateDraft({ personalityTraits: [value] });
  };

  const handleGenderChange = (gender: string) => {
    updateDraft({ gender });
  };

  const handlePortraitUpdate = (avatarUrl: string) => {
    updateDraft({ avatarUrl });
  };

  const handleNext = () => {
    if (isValid && onNext) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div data-testid="step2-core-identity" className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-nuaibria-gold mb-2">
          Step 2: Core Identity
        </h2>
        <p className="text-gray-400">
          Define your character's alignment, backstory, and appearance
        </p>
      </div>

      {/* Alignment Grid */}
      <AlignmentGrid
        selectedAlignment={draft.alignment}
        onSelectAlignment={handleAlignmentSelect}
      />

      {/* Gender Selector */}
      <GenderSelector
        value={draft.gender}
        onChange={handleGenderChange}
      />

      {/* Backstory Input */}
      <BackstoryInput
        value={backstoryValue}
        onChange={handleBackstoryChange}
      />

      {/* Portrait Display */}
      <PortraitDisplay
        draft={draft}
        onPortraitUpdate={handlePortraitUpdate}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handlePrevious}
          className="px-6 py-2 bg-gray-700 text-white rounded-md
                     hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid}
          className={`
            px-6 py-2 rounded-md font-medium transition-colors
            ${
              isValid
                ? 'bg-nuaibria-gold text-gray-900 hover:bg-yellow-500'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2CoreIdentity;
