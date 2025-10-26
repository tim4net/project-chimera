/**
 * @file WizardFooter.tsx
 * @description Footer navigation bar with Back/Next/Save Draft/Create Character buttons
 */

import React, { useState } from 'react';
import type { PageNumber } from './types';

interface WizardFooterProps {
  /**
   * Current active page
   */
  currentPage: PageNumber;

  /**
   * Whether the current page is valid
   */
  isCurrentPageValid: boolean;

  /**
   * Whether form submission is in progress
   */
  isSubmitting: boolean;

  /**
   * Whether draft save is in progress
   */
  isSavingDraft: boolean;

  /**
   * Called when user clicks Back
   */
  onBack: () => void;

  /**
   * Called when user clicks Next
   */
  onNext: () => void;

  /**
   * Called when user clicks Save Draft
   */
  onSaveDraft: () => void;

  /**
   * Called when user clicks Create Character
   */
  onCreate: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * WizardFooter Component
 * Button bar for wizard navigation:
 * - Back: Disabled on page 1
 * - Next: Disabled if current page invalid
 * - Save Draft: Shows confirmation toast
 * - Create Character: Only visible on page 3
 * All buttons are fully accessible
 */
export const WizardFooter: React.FC<WizardFooterProps> = ({
  currentPage,
  isCurrentPageValid,
  isSubmitting,
  isSavingDraft,
  onBack,
  onNext,
  onSaveDraft,
  onCreate,
  className = '',
}) => {
  const [showDraftConfirmation, setShowDraftConfirmation] = useState(false);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === 3;

  const handleSaveDraft = () => {
    onSaveDraft();
    setShowDraftConfirmation(true);
    // Hide confirmation after 3 seconds
    setTimeout(() => setShowDraftConfirmation(false), 3000);
  };

  return (
    <footer
      className={`relative flex items-center justify-between gap-4 ${className}`}
      role="contentinfo"
    >
      {/* Save Draft Confirmation Toast */}
      {showDraftConfirmation && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-nuaibria-gold/90 text-nuaibria-bg rounded-lg shadow-glow animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span className="font-semibold">Draft saved!</span>
          </div>
        </div>
      )}

      {/* Left: Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstPage || isSubmitting}
        className="
          px-6 py-3 rounded-lg font-semibold transition-all
          border-2 border-nuaibria-border
          text-nuaibria-text-secondary
          hover:enabled:border-nuaibria-gold/50
          hover:enabled:text-nuaibria-gold
          hover:enabled:bg-nuaibria-gold/10
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-nuaibria-gold/50 focus:ring-offset-2 focus:ring-offset-nuaibria-bg
        "
        aria-label="Go to previous page"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </span>
      </button>

      {/* Center: Save Draft Button */}
      <button
        type="button"
        onClick={handleSaveDraft}
        disabled={isSavingDraft || isSubmitting}
        className="
          px-6 py-3 rounded-lg font-semibold transition-all
          border-2 border-nuaibria-gold/40
          text-nuaibria-gold
          bg-nuaibria-gold/10
          hover:enabled:border-nuaibria-gold
          hover:enabled:bg-nuaibria-gold/20
          hover:enabled:shadow-glow
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-nuaibria-gold/50 focus:ring-offset-2 focus:ring-offset-nuaibria-bg
        "
        aria-label="Save current progress as draft"
      >
        {isSavingDraft ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </span>
        )}
      </button>

      {/* Right: Next or Create Character Button */}
      {!isLastPage ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!isCurrentPageValid || isSubmitting}
          className="
            px-6 py-3 rounded-lg font-semibold transition-all
            border-2 border-nuaibria-gold
            bg-nuaibria-gold text-nuaibria-bg
            hover:enabled:bg-nuaibria-gold/90
            hover:enabled:shadow-glow
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-nuaibria-gold/50 focus:ring-offset-2 focus:ring-offset-nuaibria-bg
          "
          aria-label="Go to next page"
        >
          <span className="flex items-center gap-2">
            Next
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          disabled={!isCurrentPageValid || isSubmitting}
          className="
            px-8 py-3 rounded-lg font-display text-lg font-bold transition-all
            bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember
            text-white
            hover:enabled:from-nuaibria-gold/90 hover:enabled:to-nuaibria-ember/90
            hover:enabled:shadow-glow-lg
            hover:enabled:-translate-y-0.5
            disabled:from-gray-600 disabled:to-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-nuaibria-gold/50 focus:ring-offset-2 focus:ring-offset-nuaibria-bg
          "
          aria-label="Create character and begin adventure"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Character'
          )}
        </button>
      )}
    </footer>
  );
};

export default WizardFooter;
