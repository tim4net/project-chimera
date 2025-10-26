/**
 * @file CharacterPreview.tsx
 * @description Sticky sidebar preview of the character being created
 */

import React from 'react';
import type { CharacterDraft } from '../../../types/wizard';

interface CharacterPreviewProps {
  draft: Partial<CharacterDraft>;
  portraitUrl?: string;
}

const CharacterPlaceholderIcon = () => (
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

export function CharacterPreview({ draft, portraitUrl }: CharacterPreviewProps) {
  const displayName = draft.name || 'Nameless Hero';
  const displayRace = draft.race || '---';
  const displayClass = draft.class || '---';
  const displayBackground = draft.background || '---';
  const displayAlignment = draft.alignment || '---';

  return (
    <div className="bg-nuaibria-surface/50 border-2 border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover min-h-[400px] flex flex-col items-center justify-center">
      <div className="w-64 h-64 rounded-lg bg-nuaibria-bg border-2 border-nuaibria-border flex items-center justify-center overflow-hidden mb-6">
        {portraitUrl ? (
          <img src={portraitUrl} alt="Character Portrait" className="w-full h-full object-cover" />
        ) : (
          <CharacterPlaceholderIcon />
        )}
      </div>

      <h3 className="font-display text-3xl text-nuaibria-gold tracking-wider text-center">
        {displayName}
      </h3>

      <p className="text-nuaibria-text-accent font-semibold mt-2">
        {displayRace} {displayClass}
      </p>

      <p className="text-nuaibria-text-secondary mt-1 text-sm">
        {displayBackground} / {displayAlignment}
      </p>

      {draft.abilityScores && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {Object.entries(draft.abilityScores).map(([ability, score]) => {
            const modifier = Math.floor((score - 10) / 2);
            return (
              <div key={ability} className="bg-nuaibria-bg/50 rounded px-2 py-1">
                <div className="text-xs text-nuaibria-text-muted">{ability}</div>
                <div className="text-sm font-bold text-nuaibria-gold">
                  {score} ({modifier >= 0 ? '+' : ''}{modifier})
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
