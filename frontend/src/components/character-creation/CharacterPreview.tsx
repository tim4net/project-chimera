/**
 * @file CharacterPreview.tsx
 * @description Character preview sidebar showing current character state
 * Used across all wizard pages for consistent visual feedback
 */

import React from 'react';
import type { Character } from '../../types/wizard';

interface CharacterPreviewProps {
  character: Partial<Character>;
  portraitUrl?: string | null;
  className?: string;
}

const CharacterPlaceholderIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="128"
    height="128"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    className="text-nuaibria-gold/20"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  character,
  portraitUrl,
  className = '',
}) => {
  const { name, race, class: characterClass, alignment } = character;

  return (
    <div
      className={`bg-nuaibria-surface/50 border-2 border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover min-h-[400px] flex flex-col items-center justify-center ${className}`}
    >
      {/* Portrait Area */}
      <div className="w-64 h-64 rounded-lg bg-nuaibria-bg border-2 border-nuaibria-border flex items-center justify-center overflow-hidden mb-6 relative">
        {portraitUrl ? (
          <img
            src={portraitUrl}
            alt="Character Portrait"
            className="w-full h-full object-cover"
          />
        ) : (
          <CharacterPlaceholderIcon />
        )}
      </div>

      {/* Character Info */}
      <h3 className="font-display text-3xl text-nuaibria-gold tracking-wider text-center">
        {name || 'Nameless Hero'}
      </h3>

      {(race || characterClass) && (
        <p className="text-nuaibria-text-accent font-semibold mt-2">
          {[race, characterClass].filter(Boolean).join(' ')}
        </p>
      )}

      {alignment && (
        <p className="text-nuaibria-text-secondary mt-1 text-sm">
          {alignment}
        </p>
      )}
    </div>
  );
};

export default CharacterPreview;
