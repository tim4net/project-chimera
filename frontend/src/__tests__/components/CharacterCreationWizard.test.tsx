/**
 * @file CharacterCreationWizard.test.tsx
 * @description Comprehensive tests for the CharacterCreationWizard orchestrator
 */

import React from 'react';
import { describe, it, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CharacterCreationWizard } from '../../components/character-creation/CharacterCreationWizard';
import { CharacterDraftProvider } from '../../context/CharacterDraftContext';
import type { PageComponentProps } from '../../components/character-creation/types';
import type { CharacterDraft } from '../../types/wizard';

// Mock page components
const MockPage1: React.FC<PageComponentProps> = ({ draft, updateDraft, errors }) => (
  <div data-testid="page-1">
    <h2>Page 1</h2>
    <input
      data-testid="name-input"
      value={draft.name || ''}
      onChange={(e) => updateDraft({ name: e.target.value })}
    />
    <input
      data-testid="race-input"
      value={draft.race || ''}
      onChange={(e) => updateDraft({ race: e.target.value as any })}
    />
    <input
      data-testid="class-input"
      value={draft.class || ''}
      onChange={(e) => updateDraft({ class: e.target.value as any })}
    />
    <input
      data-testid="background-input"
      value={draft.background || ''}
      onChange={(e) => updateDraft({ background: e.target.value as any })}
    />
    <input
      data-testid="alignment-input"
      value={draft.alignment || ''}
      onChange={(e) => updateDraft({ alignment: e.target.value as any })}
    />
    {errors.length > 0 && <div data-testid="page-1-errors">{errors.join(', ')}</div>}
  </div>
);

const MockPage2: React.FC<PageComponentProps> = ({ draft, updateDraft, errors }) => (
  <div data-testid="page-2">
    <h2>Page 2</h2>
    <div data-testid="ability-scores-display">
      {draft.abilityScores ? 'Ability scores set' : 'No ability scores'}
    </div>
    <button
      data-testid="set-ability-scores"
      onClick={() =>
        updateDraft({
          abilityScores: {
            STR: 15,
            DEX: 14,
            CON: 13,
            INT: 12,
            WIS: 10,
            CHA: 8,
          },
        })
      }
    >
      Set Ability Scores
    </button>
    <button
      data-testid="add-skill"
      onClick={() => updateDraft({ proficientSkills: ['Athletics'] })}
    >
      Add Skill
    </button>
    {errors.length > 0 && <div data-testid="page-2-errors">{errors.join(', ')}</div>}
  </div>
);

const MockPage3: React.FC<PageComponentProps> = ({ draft, updateDraft, errors }) => (
  <div data-testid="page-3">
    <h2>Page 3</h2>
    <div data-testid="equipment-display">
      {draft.equipment && draft.equipment.length > 0
        ? `Equipment: ${draft.equipment.join(', ')}`
        : 'No equipment'}
    </div>
    <button
      data-testid="add-equipment"
      onClick={() => updateDraft({ equipment: ['Sword', 'Shield'] })}
    >
      Add Equipment
    </button>
    {errors.length > 0 && <div data-testid="page-3-errors">{errors.join(', ')}</div>}
  </div>
);

// Helper to render wizard with provider
const renderWizard = (props: Partial<React.ComponentProps<typeof CharacterCreationWizard>> = {}) => {
  return render(
    <CharacterDraftProvider>
      <CharacterCreationWizard
        pages={[MockPage1, MockPage2, MockPage3]}
        {...props}
      />
    </CharacterDraftProvider>
  );
};

describe('CharacterCreationWizard', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  test('renders wizard with initial page', () => {
    renderWizard();
    expect(screen.getByText('Create Your Hero')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByTestId('page-1')).toBeInTheDocument();
  });

  test('renders page indicator with 3 dots', () => {
    renderWizard();
    const dots = screen.getAllByRole('button', { name: /Page \d/ });
    expect(dots).toHaveLength(3);
  });

  test('renders footer with navigation buttons', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: /Go to previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to next page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save current progress/i })).toBeInTheDocument();
  });

  test('does not render Create Character button on page 1', () => {
    renderWizard();
    expect(screen.queryByRole('button', { name: /Create character/i })).not.toBeInTheDocument();
  });

  test('renders all three pages when navigating', async () => {
    renderWizard();

    // Start on page 1
    expect(screen.getByTestId('page-1')).toBeInTheDocument();

    // Fill in page 1 fields to enable navigation
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });

    // Go to page 2
    const nextButton = screen.getByRole('button', { name: /Go to next page/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });

    // Set up page 2 data
    fireEvent.click(screen.getByTestId('set-ability-scores'));
    fireEvent.click(screen.getByTestId('add-skill'));

    // Go to page 3
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Navigation Tests
  // ============================================================================

  test('Back button is disabled on page 1', () => {
    renderWizard();
    const backButton = screen.getByRole('button', { name: /Go to previous page/i });
    expect(backButton).toBeDisabled();
  });

  test('Next button is disabled when page 1 is invalid', () => {
    renderWizard();
    const nextButton = screen.getByRole('button', { name: /Go to next page/i });
    expect(nextButton).toBeDisabled();
  });

  test('Next button is enabled when page 1 is valid', () => {
    renderWizard();

    // Fill in required fields
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });

    const nextButton = screen.getByRole('button', { name: /Go to next page/i });
    expect(nextButton).toBeEnabled();
  });

  test('can navigate from page 1 to page 2', async () => {
    renderWizard();

    // Fill in page 1
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });

    // Navigate to page 2
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });
  });

  test('can navigate back from page 2 to page 1', async () => {
    renderWizard();

    // Navigate to page 2
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    // Navigate back
    fireEvent.click(screen.getByRole('button', { name: /Go to previous page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-1')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });
  });

  test('cannot navigate to page 2 if page 1 validation fails', () => {
    renderWizard();

    // Try to navigate without filling required fields
    const nextButton = screen.getByRole('button', { name: /Go to next page/i });
    expect(nextButton).toBeDisabled();

    // Page should remain page 1
    expect(screen.getByTestId('page-1')).toBeInTheDocument();
  });

  test('cannot navigate to page 3 if page 2 validation fails', async () => {
    renderWizard();

    // Navigate to page 2
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    // Try to navigate without filling page 2 fields
    const nextButton = screen.getByRole('button', { name: /Go to next page/i });
    expect(nextButton).toBeDisabled();
  });

  // ============================================================================
  // Page Indicator Tests
  // ============================================================================

  test('page indicator shows current page', () => {
    renderWizard();
    const currentDot = screen.getByRole('button', { name: /Page 1 \(current\)/i });
    expect(currentDot).toBeInTheDocument();
  });

  test('page indicator updates when navigating', async () => {
    renderWizard();

    // Navigate to page 2
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Page 2 \(current\)/i })).toBeInTheDocument();
    });
  });

  test('can click page indicator to navigate to previous page', async () => {
    renderWizard();

    // Navigate to page 2
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    // Click page 1 dot
    const page1Dot = screen.getByRole('button', { name: /Page 1/i });
    fireEvent.click(page1Dot);

    await waitFor(() => {
      expect(screen.getByTestId('page-1')).toBeInTheDocument();
    });
  });

  test('cannot click page indicator to navigate to unvalidated page', async () => {
    renderWizard();

    // Page 2 dot should be disabled
    const page2Dot = screen.getByRole('button', { name: /Page 2/i });
    expect(page2Dot).toBeDisabled();

    // Clicking should not navigate
    fireEvent.click(page2Dot);
    expect(screen.getByTestId('page-1')).toBeInTheDocument();
  });

  // ============================================================================
  // Draft Saving Tests
  // ============================================================================

  test('shows unsaved changes indicator when draft is modified', () => {
    renderWizard();

    // Make a change
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });

    // Should show unsaved indicator
    expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
  });

  test('save draft button saves current state', async () => {
    renderWizard();

    // Make changes
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });

    // Save draft
    const saveDraftButton = screen.getByRole('button', { name: /Save current progress/i });
    fireEvent.click(saveDraftButton);

    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText(/Draft saved!/i)).toBeInTheDocument();
    });
  });

  test('draft saves on navigation between pages', async () => {
    renderWizard();

    // Fill in page 1
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });

    // Navigate (implicitly saves)
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    // Data should persist
    expect(localStorage.getItem('nuaibria_character_draft')).toBeTruthy();
  });

  // ============================================================================
  // Character Creation Tests
  // ============================================================================

  test('shows Create Character button on page 3', async () => {
    renderWizard();

    // Navigate to page 3
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('set-ability-scores'));
    fireEvent.click(screen.getByTestId('add-skill'));
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('add-equipment'));

    // Should show Create Character button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create character/i })).toBeInTheDocument();
    });
  });

  test('Create Character button is disabled when page 3 is invalid', async () => {
    renderWizard();

    // Navigate to page 3
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('set-ability-scores'));
    fireEvent.click(screen.getByTestId('add-skill'));
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
    });

    // Don't add equipment - page should be invalid
    const createButton = screen.getByRole('button', { name: /Create character/i });
    expect(createButton).toBeDisabled();
  });

  test('calls onComplete when Create Character is clicked', async () => {
    const onComplete = vi.fn();
    renderWizard({ onComplete });

    // Complete all pages
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'TestHero' } });
    fireEvent.change(screen.getByTestId('race-input'), { target: { value: 'Human' } });
    fireEvent.change(screen.getByTestId('class-input'), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByTestId('background-input'), { target: { value: 'Soldier' } });
    fireEvent.change(screen.getByTestId('alignment-input'), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('set-ability-scores'));
    fireEvent.click(screen.getByTestId('add-skill'));
    fireEvent.click(screen.getByRole('button', { name: /Go to next page/i }));

    await waitFor(() => {
      expect(screen.getByTestId('page-3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('add-equipment'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create character/i })).toBeEnabled();
    });

    // Create character
    fireEvent.click(screen.getByRole('button', { name: /Create character/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TestHero',
          race: 'Human',
          class: 'Fighter',
        })
      );
    });
  });

  // ============================================================================
  // Cancel Tests
  // ============================================================================

  test('shows cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    renderWizard({ onCancel });

    expect(screen.getByText(/Cancel Character Creation/i)).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderWizard({ onCancel });

    fireEvent.click(screen.getByText(/Cancel Character Creation/i));
    expect(onCancel).toHaveBeenCalled();
  });

  test('does not show cancel button when onCancel is not provided', () => {
    renderWizard();

    expect(screen.queryByText(/Cancel Character Creation/i)).not.toBeInTheDocument();
  });
});
