/**
 * @file CharacterCreationWizard.tsx
 * @description Main orchestrator component for the multi-step character creation wizard
 * Manages page navigation, state flow, and layout
 */

import React, { useState, useCallback } from 'react';
import { useCharacterDraft } from '../../hooks/useCharacterDraft';
import { PageIndicator } from './PageIndicator';
import { WizardFooter } from './WizardFooter';
import type { PageNumber, PageComponentProps } from './types';
import type { CharacterDraft } from '../../types/wizard';

interface CharacterCreationWizardProps {
  /**
   * Called when character creation is complete
   */
  onComplete?: (character: CharacterDraft) => void;

  /**
   * Called when user cancels character creation
   */
  onCancel?: () => void;

  /**
   * Page components to render
   * Array of exactly 3 components (Page1, Page2, Page3)
   */
  pages: [
    React.ComponentType<PageComponentProps>,
    React.ComponentType<PageComponentProps>,
    React.ComponentType<PageComponentProps>
  ];
}

/**
 * CharacterCreationWizard Component
 * Main orchestrator for the character creation wizard
 *
 * Layout:
 * - Header (title, page number)
 * - Main container with 3-column layout on desktop
 * - Page display (Page 1, 2, or 3)
 * - Footer with Back/Next/Create buttons
 * - PageIndicator (3 dots)
 *
 * Features:
 * - Track currentPage (1, 2, or 3)
 * - State management via useCharacterDraft hook
 * - Validates before navigation
 * - Saves draft on navigation
 * - Fully accessible
 */
export const CharacterCreationWizard: React.FC<CharacterCreationWizardProps> = ({
  onComplete,
  onCancel,
  pages,
}) => {
  const {
    draft,
    currentPage,
    isModified,
    lastSaved,
    updateStep,
    nextPage,
    prevPage,
    goToPage,
    saveDraft,
    isPageValid,
    getValidationErrors,
    resetDraft,
  } = useCharacterDraft();

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validPages, setValidPages] = useState<Set<PageNumber>>(new Set([1]));

  // Get current page component
  const PageComponent = pages[currentPage - 1];

  /**
   * Handle page validation and update valid pages set
   */
  const checkPageValidity = useCallback(() => {
    const valid = isPageValid();
    if (valid) {
      setValidPages((prev) => new Set([...prev, currentPage]));
    }
    return valid;
  }, [isPageValid, currentPage]);

  /**
   * Handle navigation to next page
   */
  const handleNext = useCallback(() => {
    if (!checkPageValidity()) {
      return;
    }
    nextPage();
  }, [checkPageValidity, nextPage]);

  /**
   * Handle navigation to previous page
   */
  const handleBack = useCallback(() => {
    prevPage();
  }, [prevPage]);

  /**
   * Handle page indicator navigation
   */
  const handlePageIndicatorNavigate = useCallback(
    (page: PageNumber) => {
      // Only allow navigation to page 1 or previously validated pages
      if (page === 1 || validPages.has(page)) {
        goToPage(page);
      }
    },
    [validPages, goToPage]
  );

  /**
   * Handle save draft
   */
  const handleSaveDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      // Simulate async save (in case we add server persistence later)
      await new Promise((resolve) => setTimeout(resolve, 500));
      saveDraft();
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  }, [saveDraft]);

  /**
   * Handle character creation
   */
  const handleCreate = useCallback(async () => {
    if (!checkPageValidity()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate async character creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call onComplete callback with the final draft
      if (onComplete) {
        onComplete(draft as CharacterDraft);
      }

      // Reset the draft after successful creation
      resetDraft();
    } catch (error) {
      console.error('Failed to create character:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [checkPageValidity, draft, onComplete, resetDraft]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  /**
   * Update draft helper for page components
   */
  const updateDraft = useCallback(
    (updates: Partial<CharacterDraft>) => {
      // Determine which step to update based on the fields
      if ('name' in updates || 'age' in updates || 'description' in updates) {
        updateStep('identity', updates);
      }
      if ('race' in updates || 'class' in updates || 'background' in updates) {
        updateStep('coreAttributes', updates);
      }
      if ('alignment' in updates || 'personalityTraits' in updates) {
        updateStep('alignment', updates);
      }
      if ('abilityScores' in updates) {
        updateStep('abilityScores', { finalScores: updates.abilityScores });
      }
      if ('proficientSkills' in updates) {
        updateStep('skills', updates);
      }
      if ('equipment' in updates || 'startingGold' in updates) {
        updateStep('equipment', { selectedEquipment: updates.equipment, startingGold: updates.startingGold });
      }
    },
    [updateStep]
  );

  const validationErrors = getValidationErrors();
  const pageErrors = Object.values(validationErrors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg text-white font-body">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="font-display text-5xl text-nuaibria-gold tracking-widest drop-shadow-lg mb-2">
            Create Your Hero
          </h1>
          <p className="text-nuaibria-text-secondary text-lg">
            Step {currentPage} of 3
          </p>

          {/* Page Indicator */}
          <div className="mt-6">
            <PageIndicator
              currentPage={currentPage}
              totalPages={3}
              validPages={validPages}
              onNavigate={handlePageIndicatorNavigate}
            />
          </div>

          {/* Last Saved Indicator */}
          {lastSaved && (
            <p className="text-nuaibria-text-muted text-sm mt-4">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </p>
          )}

          {/* Modified Indicator */}
          {isModified && (
            <p className="text-nuaibria-ember text-sm mt-2">
              ⚠ Unsaved changes
            </p>
          )}
        </header>

        {/* Main Content */}
        <main className="mb-8">
          <div className="bg-nuaibria-surface/50 border-2 border-nuaibria-gold/20 rounded-lg shadow-card-hover p-6 min-h-[500px]">
            {/* Page Content */}
            <PageComponent
              draft={draft}
              updateDraft={updateDraft}
              errors={pageErrors}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        </main>

        {/* Footer */}
        <WizardFooter
          currentPage={currentPage}
          isCurrentPageValid={isPageValid()}
          isSubmitting={isSubmitting}
          isSavingDraft={isSavingDraft}
          onBack={handleBack}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onCreate={handleCreate}
          className="mt-6"
        />

        {/* Cancel Button */}
        {onCancel && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-nuaibria-text-muted hover:text-nuaibria-text-secondary transition-colors underline"
            >
              Cancel Character Creation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreationWizard;
