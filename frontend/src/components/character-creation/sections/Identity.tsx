/**
 * @file Identity.tsx
 * @description Section 1: Character name and gender selection with AI name generator
 */

import React, { useState } from 'react';
import type { Race, CharacterClass, Background } from '../../../types/wizard';

interface IdentityProps {
  name: string;
  gender: string;
  onNameChange: (name: string) => void;
  onGenderChange: (gender: string) => void;
  race?: Race;
  characterClass?: CharacterClass;
  background?: Background;
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other'] as const;

export function Identity({
  name,
  gender,
  onNameChange,
  onGenderChange,
  race,
  characterClass,
  background,
}: IdentityProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [nameError, setNameError] = useState<string>('');

  const validateName = (value: string): boolean => {
    if (value.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (value.length > 50) {
      setNameError('Name must be 50 characters or less');
      return false;
    }
    if (!/^[a-zA-Z0-9\s\-]+$/.test(value)) {
      setNameError('Name can only contain letters, numbers, spaces, and hyphens');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onNameChange(value);
    if (value.length > 0) {
      validateName(value);
    } else {
      setNameError('');
    }
  };

  const handleGenerateName = async () => {
    if (!race || !characterClass || !background) {
      alert('Please select race, class, and background first');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulated AI name generation - in real implementation, call backend API
      const fakeNames = {
        Male: ['Aldric', 'Brogan', 'Cedric', 'Darian', 'Eamon'],
        Female: ['Aria', 'Brenna', 'Cordelia', 'Delia', 'Elara'],
        'Non-binary': ['Ash', 'Blair', 'Casey', 'Drew', 'Ellis'],
        Other: ['Zephyr', 'Raven', 'Phoenix', 'Storm', 'Sage'],
      };

      const genderNames = fakeNames[gender as keyof typeof fakeNames] || fakeNames.Male;
      const randomName = genderNames[Math.floor(Math.random() * genderNames.length)];

      onNameChange(randomName);
      validateName(randomName);
    } finally {
      setIsGenerating(false);
    }
  };

  const isNameValid = name.length >= 2 && name.length <= 50 && /^[a-zA-Z0-9\s\-]+$/.test(name);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-nuaibria-gold mb-2 tracking-wider">Identity</h3>
        <p className="text-nuaibria-text-secondary text-sm">
          Choose your character's name and gender presentation
        </p>
      </div>

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">
            Character Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your character's name"
            className={`w-full bg-nuaibria-bg border-2 rounded-lg px-4 py-3 font-body text-nuaibria-text-primary focus:outline-none transition-all shadow-inner-dark ${
              nameError
                ? 'border-nuaibria-danger'
                : isNameValid
                ? 'border-nuaibria-success'
                : 'border-nuaibria-border focus:border-nuaibria-gold/50 focus:shadow-glow'
            }`}
          />
          {nameError && (
            <p className="mt-1 text-sm text-nuaibria-danger">{nameError}</p>
          )}
          {!nameError && name.length > 0 && (
            <p className="mt-1 text-sm text-nuaibria-success">Name looks good!</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleGenerateName}
          disabled={isGenerating || !race || !characterClass || !background}
          className="mt-7 px-4 py-3 bg-nuaibria-gold/20 hover:bg-nuaibria-gold/30 text-nuaibria-gold font-semibold rounded-lg border-2 border-nuaibria-gold/40 hover:border-nuaibria-gold transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          title="Generate unique fantasy name using AI"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div>
        <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">
          Gender *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGenderChange(g)}
              className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold ${
                gender === g
                  ? 'border-nuaibria-gold bg-nuaibria-gold/10 text-nuaibria-gold'
                  : 'border-nuaibria-border text-nuaibria-text-muted hover:border-nuaibria-gold/50 hover:text-nuaibria-gold'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
