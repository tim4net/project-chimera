/**
 * @file AppearanceInput.tsx
 * @description Text input for character appearance description with character counter
 */

import React from 'react';

interface AppearanceInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MIN_CHARS = 5;
const MAX_CHARS = 150;

export const AppearanceInput: React.FC<AppearanceInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce max length
    if (newValue.length <= MAX_CHARS) {
      onChange(newValue);
    }
  };

  const isValid = value.length >= MIN_CHARS;
  const charCount = value.length;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-nuaibria-gold">Character Appearance</h3>

      <div className="relative">
        <textarea
          data-testid="appearance-input"
          value={value}
          onChange={handleChange}
          placeholder="Describe your character appearance (e.g., Tall dwarf with red beard and battle scars...)"
          className={`
            w-full px-4 py-3 bg-gray-800/50 rounded-lg border-2
            text-white placeholder-gray-500 resize-none
            transition-all focus:outline-none focus:ring-2
            ${
              error || (!isValid && value.length > 0)
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-700 focus:border-nuaibria-purple focus:ring-nuaibria-purple/20'
            }
          `}
          rows={4}
          maxLength={MAX_CHARS}
        />

        {/* Character Counter */}
        <div
          data-testid="appearance-counter"
          className={`
            absolute bottom-2 right-2 text-xs font-mono
            ${charCount >= MAX_CHARS ? 'text-red-400' : 'text-gray-500'}
          `}
        >
          {charCount} / {MAX_CHARS}
        </div>
      </div>

      {/* Validation Messages */}
      {value.length > 0 && !isValid && (
        <p className="text-sm text-red-400">
          Description must be at least {MIN_CHARS} characters
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {isValid && (
        <p className="text-sm text-green-400">
          Appearance description looks good!
        </p>
      )}
    </div>
  );
};
