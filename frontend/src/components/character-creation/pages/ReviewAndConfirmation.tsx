/**
 * @file ReviewAndConfirmation.tsx
 * @description Page 3 of character creation - Review all details and submit
 */

import React, { useState } from 'react';
import { CharacterSummary } from '../components/CharacterSummary';
import { submitCharacter, type CharacterDraft, type Character } from '../../../services/characterSubmit';

interface ReviewAndConfirmationProps {
  characterDraft: CharacterDraft;
  onBack: () => void;
  onEditBasicInfo: () => void;
  onEditAbilities: () => void;
  onComplete: (character: Character) => void;
}

// Loading spinner component
const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Character placeholder icon
const CharacterPlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-nuaibria-gold/20">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ReviewAndConfirmation: React.FC<ReviewAndConfirmationProps> = ({
  characterDraft,
  onBack,
  onEditBasicInfo,
  onEditAbilities,
  onComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get user ID from auth (will be handled by the service)
      const character = await submitCharacter(characterDraft, '');

      // Notify parent component of successful creation
      onComplete(character);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create character';
      setError(errorMessage);
      console.error('[ReviewAndConfirmation] Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar - Character Preview */}
      <div className="lg:col-span-1">
        <div className="bg-nuaibria-surface/50 border-2 border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover sticky top-8">
          {/* Portrait */}
          <div className="w-full aspect-square rounded-lg bg-nuaibria-bg border-2 border-nuaibria-border flex items-center justify-center overflow-hidden mb-6">
            {characterDraft.portraitUrl ? (
              <img
                src={characterDraft.portraitUrl}
                alt={characterDraft.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <CharacterPlaceholderIcon />
            )}
          </div>

          {/* Character Name & Details */}
          <div className="text-center space-y-2">
            <h3 className="font-display text-3xl text-nuaibria-gold tracking-wider">
              {characterDraft.name}
            </h3>
            <p className="text-nuaibria-text-accent font-semibold text-lg">
              {characterDraft.race} {characterDraft.class}
            </p>
            <p className="text-nuaibria-text-secondary text-sm">
              {characterDraft.background}
            </p>
            <p className="text-nuaibria-text-muted text-xs">
              {characterDraft.alignment}
            </p>
          </div>

          {/* Level Badge */}
          <div className="mt-6 flex justify-center">
            <div className="bg-nuaibria-gold/20 border-2 border-nuaibria-gold rounded-full px-6 py-2">
              <span className="text-nuaibria-gold font-display text-lg font-bold">Level 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Character Summary */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <header className="text-center lg:text-left">
          <h1 className="font-display text-4xl text-nuaibria-gold tracking-widest drop-shadow-lg">
            Review Your Character
          </h1>
          <p className="text-nuaibria-text-secondary mt-2 text-lg">
            Check your details before embarking on your journey
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-300 font-semibold mb-1">Creation Failed</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Character Summary */}
        <CharacterSummary
          character={characterDraft}
          onEditBasicInfo={onEditBasicInfo}
          onEditAbilities={onEditAbilities}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-nuaibria-gold/20">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 font-body text-lg bg-nuaibria-surface text-nuaibria-text-primary px-8 py-4 rounded-lg border-2 border-nuaibria-border hover:border-nuaibria-gold/50 hover:bg-nuaibria-elevated transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 font-display text-xl bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember text-white px-8 py-4 rounded-lg hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 hover:shadow-glow-lg transition-all hover:-translate-y-0.5 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="w-6 h-6" />
                <span>Creating Character...</span>
              </>
            ) : (
              <span>Create Character</span>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4">
          <p className="text-nuaibria-text-secondary text-sm leading-relaxed text-center">
            Once created, you can begin your adventure in Nuaibria. Some character details can be
            modified later, but your race and class are permanent choices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndConfirmation;
