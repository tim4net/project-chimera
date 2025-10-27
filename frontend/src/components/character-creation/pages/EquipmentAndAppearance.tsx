/**
 * @file EquipmentAndAppearance.tsx
 * @description Page 2 of character creation wizard
 * Handles equipment selection and portrait generation
 */

import React, { useState } from 'react';
import type { Character, EquipmentData } from '../../../types/wizard';
import CharacterPreview from '../CharacterPreview';
import EquipmentSelector from '../components/EquipmentSelector';
import AppearancePanel from '../components/AppearancePanel';

export interface EquipmentAndAppearanceProps {
  character: Partial<Character>;
  onComplete: (data: EquipmentData, portraitUrl: string | null) => void;
  onBack?: () => void;
  className?: string;
}

export const EquipmentAndAppearance: React.FC<EquipmentAndAppearanceProps> = ({
  character,
  onComplete,
  onBack,
  className = '',
}) => {
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate character class is set
    if (!character.class) {
      alert('Character class must be selected first');
      return;
    }

    // Build equipment data from selected package
    // This would typically fetch from the equipment packages data
    const equipmentData: EquipmentData = {
      startingGold: 0, // Will be calculated based on package
      selectedEquipment: [], // Will be populated from package
      weapon: undefined,
      armor: undefined,
      tools: [],
    };

    onComplete(equipmentData, portraitUrl);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg text-white p-4 sm:p-8 font-body ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-nuaibria-gold tracking-widest drop-shadow-lg">
            Equipment & Appearance
          </h1>
          <p className="text-nuaibria-text-secondary mt-3 text-lg">
            Choose your starting gear and create your portrait
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar: Character Preview */}
            <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
              <CharacterPreview character={character} portraitUrl={portraitUrl} />
            </div>

            {/* Right Content: Equipment and Appearance */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Equipment Selection */}
              <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
                {character.class ? (
                  <EquipmentSelector
                    characterClass={character.class as any}
                    selectedPackageIndex={selectedPackageIndex}
                    onSelectPackage={setSelectedPackageIndex}
                  />
                ) : (
                  <div className="text-nuaibria-text-secondary">
                    <p>Please select a character class first</p>
                  </div>
                )}
              </div>

              {/* Section 2: Appearance and Portrait */}
              <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
                <AppearancePanel
                  character={character}
                  portraitUrl={portraitUrl}
                  onPortraitGenerated={setPortraitUrl}
                  customDescription={customDescription}
                  onDescriptionChange={setCustomDescription}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="font-display text-lg bg-nuaibria-elevated border-2 border-nuaibria-gold/50 text-nuaibria-gold px-8 py-3 rounded-lg hover:bg-nuaibria-gold/10 hover:border-nuaibria-gold transition-all"
                  >
                    Back
                  </button>
                )}

                <button
                  type="submit"
                  className="font-display text-xl bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember text-white px-12 py-4 rounded-lg hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 hover:shadow-glow-lg transition-all hover:-translate-y-0.5 ml-auto"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentAndAppearance;
