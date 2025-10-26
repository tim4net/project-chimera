/**
 * @file types.tsx
 * @description Type definitions for character creation wizard components
 */

import type { CharacterDraft } from '../../types/wizard';

/**
 * Page numbers for the wizard
 */
export type PageNumber = 1 | 2 | 3;

/**
 * Props passed to each page component
 */
export interface PageComponentProps {
  /**
   * Current draft state of the character
   */
  draft: Partial<CharacterDraft>;

  /**
   * Update the draft with new data
   */
  updateDraft: (updates: Partial<CharacterDraft>) => void;

  /**
   * Validation errors for the current page
   */
  errors: string[];

  /**
   * Called when the user wants to advance to the next page
   */
  onNext: () => void;

  /**
   * Called when the user wants to go back to the previous page
   */
  onBack: () => void;
}

/**
 * Overall wizard state
 */
export interface WizardState {
  /**
   * Current page number (1, 2, or 3)
   */
  currentPage: PageNumber;

  /**
   * Draft character data
   */
  draft: Partial<CharacterDraft>;

  /**
   * Validation errors by page
   */
  validationErrors: Record<PageNumber, string[]>;

  /**
   * Whether the form is currently being submitted
   */
  isSubmitting: boolean;

  /**
   * Whether a draft save is in progress
   */
  isSavingDraft: boolean;
}
