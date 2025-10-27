/**
 * @fileoverview Step 5: Review & Confirm Component
 * Displays complete character summary with inline editing and submission
 */

import React, { useState } from 'react';
import { useCharacterDraft } from '../../../../context/CharacterDraftContextV2';
import CharacterCard from './components/CharacterCard';
import EditableSection from './components/EditableSection';
import { submitCharacter } from '../../../../services/characterSubmit';
import { supabase } from '../../../../lib/supabase';
import './Step5Review.css';

interface SubmissionState {
  isSubmitting: boolean;
  success: boolean;
  error: string | null;
  characterId: string | null;
}

const Step5Review: React.FC = () => {
  const { draft } = useCharacterDraft();
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    success: false,
    error: null,
    characterId: null,
  });

  const handleSubmit = async () => {
    setSubmissionState({
      isSubmitting: true,
      success: false,
      error: null,
      characterId: null,
    });

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('You must be logged in to create a character');
      }

      // Transform draft to submission format
      const characterData = {
        name: draft.name || '',
        race: draft.race || '',
        class: draft.class || '',
        background: draft.background || '',
        alignment: draft.alignment || '',
        gender: draft.gender || '',
        abilityScores: draft.abilityScores || {
          STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
        },
        skills: draft.proficientSkills || [],
        backstory: {
          ideal: draft.ideals?.[0] || '',
          bond: draft.bonds?.[0] || '',
          flaw: draft.flaws?.[0] || '',
        },
        equipment: draft.equipment || [],
        gold: draft.startingGold || 0,
        portraitUrl: draft.avatarUrl || null,
        appearance: draft.appearance || '',
      };

      // Submit character
      const newCharacter = await submitCharacter(characterData, session.user.id);

      setSubmissionState({
        isSubmitting: false,
        success: true,
        error: null,
        characterId: newCharacter.id,
      });

      // Clear draft from localStorage
      localStorage.removeItem('characterDraft');
    } catch (error) {
      console.error('Character submission failed:', error);
      setSubmissionState({
        isSubmitting: false,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create character',
        characterId: null,
      });
    }
  };

  const handleRetry = () => {
    setSubmissionState({
      isSubmitting: false,
      success: false,
      error: null,
      characterId: null,
    });
  };

  // Show success message
  if (submissionState.success && submissionState.characterId) {
    return (
      <div className="step5-review" data-testid="step5-success">
        <div className="success-message">
          <h2>Character Created Successfully!</h2>
          <p>Your character has been created with ID: {submissionState.characterId}</p>
          <a
            href={`/characters/${submissionState.characterId}`}
            role="link"
            aria-label="View Character"
          >
            View Character
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="step5-review" data-testid="step5-review">
      <h2>Review Your Character</h2>

      {/* Character Summary Card */}
      <CharacterCard draft={draft} />

      {/* Editable Sections */}
      <div className="editable-sections">
        <EditableSection sectionName="hero" draft={draft} />
        <EditableSection sectionName="identity" draft={draft} />
        <EditableSection sectionName="abilities" draft={draft} />
        <EditableSection sectionName="loadout" draft={draft} />
      </div>

      {/* Error Display */}
      {submissionState.error && (
        <div className="error-message" role="alert">
          <p>Failed to create character</p>
          <p>{submissionState.error}</p>
          <button
            onClick={handleRetry}
            type="button"
            aria-label="Retry"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Submit Button */}
      {!submissionState.error && (
        <div className="submit-container">
          {submissionState.isSubmitting ? (
            <div className="loading-state">
              <div data-testid="loading-spinner" className="spinner" />
              <p>Creating Character...</p>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submissionState.isSubmitting}
              className="create-character-button"
              type="button"
              aria-label="Create Character"
            >
              Create Character
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Step5Review;
