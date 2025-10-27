/**
 * @fileoverview PortraitDisplay - Character portrait display with regeneration
 * Integrates with portraitService to generate AI-powered character portraits
 */

import React, { useState } from 'react';
import { generatePortrait } from '../../../../../services/portraitService';
import type { CharacterDraft } from '../../../../../context/characterDraftV2/validation';

interface PortraitDisplayProps {
  draft: Partial<CharacterDraft>;
  onPortraitUpdate: (url: string) => void;
}

const PLACEHOLDER_URL = 'https://via.placeholder.com/256x256/1a1a2e/d4af37?text=No+Portrait';

const PortraitDisplay: React.FC<PortraitDisplayProps> = ({
  draft,
  onPortraitUpdate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = draft.avatarUrl || PLACEHOLDER_URL;

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a properly typed character object for portrait generation
      const characterForPortrait = {
        name: draft.name,
        race: draft.race,
        class: draft.class,
        background: draft.background,
        alignment: draft.alignment,
      };

      const result = await generatePortrait({
        character: characterForPortrait as any,
      });

      onPortraitUpdate(result.imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate portrait';
      setError(errorMessage);
      console.error('[PortraitDisplay] Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Character Portrait
      </label>

      <div className="flex flex-col items-center space-y-4">
        <div className="w-64 h-64 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-800">
          <img
            src={imageUrl}
            alt="Character portrait"
            data-testid="portrait-image"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isGenerating}
          data-testid="regenerate-button"
          className={`
            px-4 py-2 rounded-md font-medium transition-all
            ${
              isGenerating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-nuaibria-purple text-white hover:bg-purple-700'
            }
          `}
        >
          {isGenerating ? 'Generating...' : 'Regenerate Portrait'}
        </button>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default PortraitDisplay;
