/**
 * @fileoverview BackstoryInput - Text area for character backstory
 * Enforces 10-300 character limit with real-time validation
 */

import React from 'react';

interface BackstoryInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;

const BackstoryInput: React.FC<BackstoryInputProps> = ({ value, onChange }) => {
  const currentLength = value.length;
  const isTooShort = currentLength > 0 && currentLength < MIN_LENGTH;
  const isTooLong = currentLength > MAX_LENGTH;
  const hasError = isTooShort || isTooLong;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Don't prevent typing over max, just show error
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="backstory"
        className="block text-sm font-medium text-gray-300"
      >
        Backstory
      </label>
      <textarea
        id="backstory"
        data-testid="backstory-input"
        placeholder="Describe your character's backstory, personality, and motivations..."
        value={value}
        onChange={handleChange}
        rows={4}
        className={`
          w-full px-3 py-2 bg-gray-800 border rounded-md
          text-gray-200 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-nuaibria-purple
          ${hasError ? 'border-red-500' : 'border-gray-600'}
        `}
      />
      <div className="flex justify-between items-start">
        <div className="text-sm space-y-1">
          {isTooShort && (
            <p className="text-red-400">
              Backstory must be at least 10 characters
            </p>
          )}
          {isTooLong && (
            <p className="text-red-400">
              Backstory cannot exceed 300 characters
            </p>
          )}
        </div>
        <div
          data-testid="backstory-counter"
          className={`
            text-sm font-mono
            ${hasError ? 'text-red-400' : 'text-gray-400'}
          `}
        >
          {currentLength}/{MAX_LENGTH}
        </div>
      </div>
    </div>
  );
};

export default BackstoryInput;
