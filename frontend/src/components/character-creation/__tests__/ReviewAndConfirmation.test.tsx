/**
 * @file ReviewAndConfirmation.test.tsx
 * @description Tests for ReviewAndConfirmation page component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewAndConfirmation } from '../pages/ReviewAndConfirmation';
import * as characterSubmitModule from '../../../services/characterSubmit';

// Mock the character submit service
vi.mock('../../../services/characterSubmit', () => ({
  submitCharacter: vi.fn(),
}));

const mockCharacterDraft = {
  name: 'Elara Moonwhisper',
  race: 'Elf',
  class: 'Wizard',
  background: 'Sage',
  alignment: 'Neutral Good',
  gender: 'Female',
  abilityScores: {
    STR: 8,
    DEX: 14,
    CON: 13,
    INT: 16,
    WIS: 12,
    CHA: 10,
  },
  skills: ['Arcana', 'History', 'Investigation', 'Insight'],
  backstory: {
    ideal: 'Knowledge is the path to power and domination.',
    bond: 'I have an ancient text that holds terrible secrets.',
    flaw: 'I am easily distracted by the promise of information.',
  },
  equipment: ['Robes', 'Quarterstaff', 'Component Pouch', 'Spellbook', 'Scholar\'s Pack'],
  gold: 50,
  portraitUrl: 'https://example.com/elf-wizard.jpg',
  appearance: 'Slender elf with silver hair and piercing blue eyes.',
};

const mockCreatedCharacter = {
  id: 'char-123',
  user_id: 'user-456',
  name: 'Elara Moonwhisper',
  race: 'Elf',
  class: 'Wizard',
  background: 'Sage',
  alignment: 'Neutral Good',
  level: 1,
  xp: 0,
  gold: 50,
  ability_scores: mockCharacterDraft.abilityScores,
  hp_max: 8,
  hp_current: 8,
  temporary_hp: 0,
  armor_class: 12,
  speed: 30,
  position_x: 500,
  position_y: 500,
  campaign_seed: 'nuaibria-shared-world-v1',
  game_time_minutes: 0,
  world_date_day: 1,
  world_date_month: 1,
  world_date_year: 0,
  spell_slots: { '1': 2 },
  backstory: JSON.stringify(mockCharacterDraft.backstory),
  skills: JSON.stringify(mockCharacterDraft.skills),
  portrait_url: mockCharacterDraft.portraitUrl,
  proficiency_bonus: 2,
  tutorial_state: 'needs_spells',
  subclass: null,
};

describe('ReviewAndConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders character preview sidebar', () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    // Check character name appears (may be in preview and/or summary)
    expect(screen.getAllByText('Elara Moonwhisper').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Elf Wizard')).toBeInTheDocument();
    // Sage appears in both preview and summary sections
    expect(screen.getAllByText('Sage').length).toBeGreaterThan(0);
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  it('displays character portrait when provided', () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const portrait = screen.getByAltText('Elara Moonwhisper') as HTMLImageElement;
    expect(portrait).toBeInTheDocument();
    expect(portrait.src).toContain('elf-wizard.jpg');
  });

  it('displays placeholder when no portrait is provided', () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    const draftWithoutPortrait = {
      ...mockCharacterDraft,
      portraitUrl: null,
    };

    const { container } = render(
      <ReviewAndConfirmation
        characterDraft={draftWithoutPortrait}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    // SVG placeholder should be rendered
    const svgPlaceholder = container.querySelector('svg');
    expect(svgPlaceholder).toBeInTheDocument();
  });

  it('calls onBack when Back button is clicked', () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const backButton = screen.getByText('Back to Edit');
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('passes edit callbacks to CharacterSummary', () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    // Find and click an edit button in the Identity section
    const identitySection = screen.getByText('Identity').closest('div');
    const editButton = identitySection?.querySelector('button');

    fireEvent.click(editButton!);
    expect(onEditBasicInfo).toHaveBeenCalledTimes(1);
  });

  it('submits character when Create button is clicked', async () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(characterSubmitModule.submitCharacter).mockResolvedValue(mockCreatedCharacter);

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const createButton = screen.getByText('Create Character');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(characterSubmitModule.submitCharacter).toHaveBeenCalledWith(mockCharacterDraft, '');
      expect(onComplete).toHaveBeenCalledWith(mockCreatedCharacter);
    });
  });

  it('shows loading state during submission', async () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    // Delay the submission to see loading state
    vi.mocked(characterSubmitModule.submitCharacter).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCreatedCharacter), 100))
    );

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const createButton = screen.getByRole('button', { name: /create character/i });
    const backButton = screen.getByRole('button', { name: /back to edit/i });

    fireEvent.click(createButton);

    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText('Creating Character...')).toBeInTheDocument();
    });

    // Buttons should be disabled during submission
    expect(createButton).toBeDisabled();
    expect(backButton).toBeDisabled();
  });

  it('displays error message when submission fails', async () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    const errorMessage = 'Server error: Database connection failed';
    vi.mocked(characterSubmitModule.submitCharacter).mockRejectedValue(new Error(errorMessage));

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const createButton = screen.getByText('Create Character');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('re-enables buttons after submission error', async () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    vi.mocked(characterSubmitModule.submitCharacter).mockRejectedValue(new Error('Test error'));

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const createButton = screen.getByText('Create Character');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
    });

    // Buttons should be enabled again
    expect(createButton).not.toBeDisabled();
    expect(screen.getByText('Back to Edit')).not.toBeDisabled();
  });

  it('clears previous error when submitting again', async () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    // First submission fails
    vi.mocked(characterSubmitModule.submitCharacter).mockRejectedValueOnce(new Error('First error'));

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    const createButton = screen.getByRole('button', { name: /create character/i });
    fireEvent.click(createButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second submission succeeds
    vi.mocked(characterSubmitModule.submitCharacter).mockResolvedValueOnce(mockCreatedCharacter);

    fireEvent.click(createButton);

    // Error should disappear immediately when button is clicked again
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    }, { timeout: 100 });

    // Then onComplete should be called
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockCreatedCharacter);
    });
  });

  it('displays help text about character permanence', () => {
    const onBack = vi.fn();
    const onEditBasicInfo = vi.fn();
    const onEditAbilities = vi.fn();
    const onComplete = vi.fn();

    render(
      <ReviewAndConfirmation
        characterDraft={mockCharacterDraft}
        onBack={onBack}
        onEditBasicInfo={onEditBasicInfo}
        onEditAbilities={onEditAbilities}
        onComplete={onComplete}
      />
    );

    expect(
      screen.getByText(/race and class are permanent choices/i)
    ).toBeInTheDocument();
  });
});
