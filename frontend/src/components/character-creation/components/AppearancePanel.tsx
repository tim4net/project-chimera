/**
 * @file AppearancePanel.tsx
 * @description Portrait generation panel with custom description and regeneration
 * Integrates with portraitService for AI-generated character portraits
 */

import React, { useState } from 'react';
import type { Character } from '../../../types/wizard';
import { generatePortrait } from '../../../services/portraitService';

export interface AppearancePanelProps {
  character: Partial<Character>;
  portraitUrl: string | null;
  onPortraitGenerated: (url: string) => void;
  customDescription?: string;
  onDescriptionChange?: (description: string) => void;
  className?: string;
}

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const AppearancePanel: React.FC<AppearancePanelProps> = ({
  character,
  portraitUrl,
  onPortraitGenerated,
  customDescription = '',
  onDescriptionChange,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState(customDescription);

  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value);
    onDescriptionChange?.(value);
  };

  const handleGeneratePortrait = async () => {
    // Validate character has required fields
    if (!character.race || !character.class) {
      setError('Please complete race and class selection first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generatePortrait({
        character,
        customDescription: localDescription || undefined,
      });

      onPortraitGenerated(result.imageUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate portrait';
      setError(errorMessage);
      console.error('[AppearancePanel] Portrait generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePortrait = () => {
    handleGeneratePortrait();
  };

  return (
    <div className={className}>
      <h3 className="font-display text-xl text-nuaibria-gold mb-4 tracking-wider">
        Appearance
      </h3>

      {/* Custom Description Input */}
      <div className="mb-6">
        <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">
          Custom Appearance Description (Optional)
        </label>
        <textarea
          value={localDescription}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="e.g., Braided red hair, stoic expression, battle scar over left eye..."
          rows={3}
          className="w-full bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg px-4 py-3 font-body text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark custom-scrollbar resize-none"
        />
        <p className="text-nuaibria-text-muted text-xs mt-2">
          Add specific details to customize your portrait (hair, scars, expression, etc.)
        </p>
      </div>

      {/* Generate Button */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={handleGeneratePortrait}
          disabled={isGenerating}
          className="flex-1 font-display bg-nuaibria-gold/80 text-white px-6 py-3 rounded-lg hover:bg-nuaibria-gold hover:shadow-glow-lg transition-all disabled:bg-nuaibria-text-muted disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Portrait'}
        </button>

        {portraitUrl && !isGenerating && (
          <button
            type="button"
            onClick={handleRegeneratePortrait}
            className="px-6 py-3 bg-nuaibria-elevated border-2 border-nuaibria-gold/50 text-nuaibria-gold font-semibold rounded-lg hover:bg-nuaibria-gold/10 hover:border-nuaibria-gold transition-all"
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm font-semibold">Error</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Portrait Preview */}
      <div className="bg-nuaibria-elevated/50 border border-nuaibria-gold/30 rounded-lg p-6">
        <h4 className="font-semibold text-nuaibria-text-primary mb-4">
          Portrait Preview
        </h4>

        <div className="aspect-square rounded-lg bg-nuaibria-bg border-2 border-nuaibria-border flex items-center justify-center overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <LoadingSpinner className="w-16 h-16 text-nuaibria-gold" />
              <p className="text-nuaibria-text-secondary text-sm animate-pulse">
                Generating your portrait...
              </p>
            </div>
          ) : portraitUrl ? (
            <img
              src={portraitUrl}
              alt="Generated Portrait"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-nuaibria-gold/20 mx-auto mb-4"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-nuaibria-text-muted text-sm">
                No portrait generated yet
              </p>
            </div>
          )}
        </div>

        {portraitUrl && !isGenerating && (
          <p className="text-nuaibria-text-secondary text-xs mt-4 text-center">
            Portrait generated successfully. You can regenerate for a different result.
          </p>
        )}
      </div>
    </div>
  );
};

export default AppearancePanel;
