/**
 * @fileoverview Step2CoreIdentity Tests (TDD - RED Phase)
 * 22 tests for Core Identity step (alignment, backstory, gender, portrait)
 * Tests written BEFORE implementation following TDD best practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step2CoreIdentity from './Step2CoreIdentity';
import * as portraitService from '../../../../services/portraitService';
import type { CharacterDraft } from '../../../../context/characterDraftV2/validation';

// Mock portrait service
vi.mock('../../../../services/portraitService', () => ({
  generatePortrait: vi.fn(),
  generatePortraitMock: vi.fn(),
}));

describe('Step2CoreIdentity', () => {
  let mockDraft: Partial<CharacterDraft>;
  let mockUpdateDraft: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Initialize with Step 1 completed
    mockDraft = {
      name: 'Test Hero',
      race: 'Human',
      class: 'Fighter',
      background: 'Soldier',
      // Step 2 fields initially empty
      alignment: undefined,
      gender: undefined,
      personalityTraits: undefined,
      avatarUrl: undefined,
    };
    mockUpdateDraft = vi.fn();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ====================================================================
  // ALIGNMENT TESTS (4 tests)
  // ====================================================================
  describe('Alignment Grid', () => {
    it('renders all 9 alignments in 3x3 grid', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      // Check all 9 alignment codes are present
      const alignments = ['LG', 'NG', 'CG', 'LN', 'TN', 'CN', 'LE', 'NE', 'CE'];
      alignments.forEach(alignment => {
        expect(screen.getByText(alignment)).toBeInTheDocument();
      });

      // Verify grid structure (3 columns)
      const grid = screen.getByTestId('alignment-grid');
      expect(grid).toHaveClass('grid-cols-3');
    });

    it('selects alignment and shows selected state with gold border', () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      // Click Lawful Good
      const lgButton = screen.getByTestId('alignment-button-LG');
      fireEvent.click(lgButton);

      // Verify updateDraft was called
      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ alignment: 'Lawful Good' })
      );

      // Rerender with selected alignment
      const updatedDraft = { ...mockDraft, alignment: 'Lawful Good' };
      rerender(<Step2CoreIdentity draft={updatedDraft} updateDraft={mockUpdateDraft} />);

      // Verify selected state (gold border)
      const selectedButton = screen.getByTestId('alignment-button-LG');
      expect(selectedButton).toHaveClass('border-nuaibria-gold');
      expect(selectedButton).toHaveClass('bg-nuaibria-gold/10');
    });

    it('can change alignment (deselect old, select new)', () => {
      const draftWithAlignment = { ...mockDraft, alignment: 'Lawful Good' };
      const { rerender } = render(
        <Step2CoreIdentity draft={draftWithAlignment} updateDraft={mockUpdateDraft} />
      );

      // Verify LG is selected
      const lgButton = screen.getByTestId('alignment-button-LG');
      expect(lgButton).toHaveClass('border-nuaibria-gold');

      // Click Chaotic Evil
      const ceButton = screen.getByTestId('alignment-button-CE');
      fireEvent.click(ceButton);

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ alignment: 'Chaotic Evil' })
      );

      // Rerender with new alignment
      rerender(
        <Step2CoreIdentity
          draft={{ ...mockDraft, alignment: 'Chaotic Evil' }}
          updateDraft={mockUpdateDraft}
        />
      );

      // Verify CE is now selected, LG is not
      const updatedCeButton = screen.getByTestId('alignment-button-CE');
      const updatedLgButton = screen.getByTestId('alignment-button-LG');
      expect(updatedCeButton).toHaveClass('border-nuaibria-gold');
      expect(updatedLgButton).not.toHaveClass('border-nuaibria-gold');
    });

    it('next button disabled until alignment selected', () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      // Next button should be disabled (no alignment)
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Fill all required fields
      const completeDraft = {
        ...mockDraft,
        alignment: 'Neutral Good',
        gender: 'Male',
        personalityTraits: ['Valid backstory with enough characters to pass validation'],
      };
      rerender(<Step2CoreIdentity draft={completeDraft} updateDraft={mockUpdateDraft} />);

      // Next button should now be enabled
      const enabledNextButton = screen.getByRole('button', { name: /next/i });
      expect(enabledNextButton).toBeEnabled();
    });
  });

  // ====================================================================
  // BACKSTORY TESTS (6 tests)
  // ====================================================================
  describe('Backstory Input', () => {
    it('renders text area with placeholder', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const backstoryInput = screen.getByPlaceholderText(/describe your character's backstory/i);
      expect(backstoryInput).toBeInTheDocument();
      expect(backstoryInput.tagName).toBe('TEXTAREA');
    });

    it('accepts max 300 characters and rejects longer input', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const backstoryInput = screen.getByPlaceholderText(/describe your character's backstory/i);

      // Type exactly 300 characters
      const validText = 'A'.repeat(300);
      fireEvent.change(backstoryInput, { target: { value: validText } });

      // Should accept
      expect(mockUpdateDraft).toHaveBeenCalled();
      expect(screen.queryByText(/backstory cannot exceed 300 characters/i)).not.toBeInTheDocument();

      // Type 301 characters
      const tooLongText = 'A'.repeat(301);
      fireEvent.change(backstoryInput, { target: { value: tooLongText } });

      // Should show error
      waitFor(() => {
        expect(screen.getByText(/backstory cannot exceed 300 characters/i)).toBeInTheDocument();
      });
    });

    it('requires minimum 10 characters and shows error if less', async () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      const backstoryInput = screen.getByPlaceholderText(/describe your character's backstory/i);

      // Type 9 characters
      fireEvent.change(backstoryInput, { target: { value: 'Too short' } });

      // Rerender to show validation error
      const shortDraft = {
        ...mockDraft,
        personalityTraits: ['Too short']
      };
      rerender(<Step2CoreIdentity draft={shortDraft} updateDraft={mockUpdateDraft} />);

      await waitFor(() => {
        expect(screen.getByText(/backstory must be at least 10 characters/i)).toBeInTheDocument();
      });

      // Type 10 characters
      fireEvent.change(backstoryInput, { target: { value: 'Valid text' } });

      const validDraft = {
        ...mockDraft,
        personalityTraits: ['Valid text']
      };
      rerender(<Step2CoreIdentity draft={validDraft} updateDraft={mockUpdateDraft} />);

      await waitFor(() => {
        expect(screen.queryByText(/backstory must be at least 10 characters/i)).not.toBeInTheDocument();
      });
    });

    it('displays real-time character counter (X/300)', () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      // Initial state
      expect(screen.getByText('0/300')).toBeInTheDocument();

      // Type 25 characters
      const draftWith25Chars = {
        ...mockDraft,
        personalityTraits: ['This is twenty-five chars']
      };
      rerender(<Step2CoreIdentity draft={draftWith25Chars} updateDraft={mockUpdateDraft} />);

      expect(screen.getByText('25/300')).toBeInTheDocument();

      // Type 150 characters
      const draftWith150Chars = {
        ...mockDraft,
        personalityTraits: ['A'.repeat(150)]
      };
      rerender(<Step2CoreIdentity draft={draftWith150Chars} updateDraft={mockUpdateDraft} />);

      expect(screen.getByText('150/300')).toBeInTheDocument();
    });

    it('allows multiline input', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const backstoryInput = screen.getByPlaceholderText(/describe your character's backstory/i);

      const multilineText = `Line 1
Line 2
Line 3`;

      fireEvent.change(backstoryInput, { target: { value: multilineText } });

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          personalityTraits: [multilineText]
        })
      );
    });

    it('next button disabled if backstory less than 10 characters', () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      // Fill alignment and gender but short backstory
      const incompleteDraft = {
        ...mockDraft,
        alignment: 'Neutral Good',
        gender: 'Female',
        personalityTraits: ['Short'] // Only 5 chars
      };
      rerender(<Step2CoreIdentity draft={incompleteDraft} updateDraft={mockUpdateDraft} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Fix backstory length
      const completeDraft = {
        ...mockDraft,
        alignment: 'Neutral Good',
        gender: 'Female',
        personalityTraits: ['Valid backstory text']
      };
      rerender(<Step2CoreIdentity draft={completeDraft} updateDraft={mockUpdateDraft} />);

      const enabledNextButton = screen.getByRole('button', { name: /next/i });
      expect(enabledNextButton).toBeEnabled();
    });
  });

  // ====================================================================
  // GENDER TESTS (4 tests)
  // ====================================================================
  describe('Gender Selector', () => {
    it('renders dropdown with 4 options', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const genderSelect = screen.getByTestId('gender-select');
      expect(genderSelect).toBeInTheDocument();

      // Open dropdown and verify options
      fireEvent.click(genderSelect);

      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('Non-binary')).toBeInTheDocument();
      expect(screen.getByText('Prefer not to say')).toBeInTheDocument();
    });

    it('selects gender option', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const genderSelect = screen.getByTestId('gender-select');
      fireEvent.click(genderSelect);

      const femaleOption = screen.getByText('Female');
      fireEvent.click(femaleOption);

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ gender: 'Female' })
      );
    });

    it('can change gender selection', () => {
      const draftWithGender = { ...mockDraft, gender: 'Male' };
      const { rerender } = render(
        <Step2CoreIdentity draft={draftWithGender} updateDraft={mockUpdateDraft} />
      );

      // Verify Male is selected
      const genderSelect = screen.getByTestId('gender-select');
      expect(genderSelect).toHaveTextContent('Male');

      // Change to Non-binary
      fireEvent.click(genderSelect);
      const nonBinaryOption = screen.getByText('Non-binary');
      fireEvent.click(nonBinaryOption);

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ gender: 'Non-binary' })
      );

      // Rerender with new selection
      rerender(
        <Step2CoreIdentity
          draft={{ ...mockDraft, gender: 'Non-binary' }}
          updateDraft={mockUpdateDraft}
        />
      );

      const updatedSelect = screen.getByTestId('gender-select');
      expect(updatedSelect).toHaveTextContent('Non-binary');
    });

    it('next button disabled until gender selected', () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      // Fill alignment and backstory but no gender
      const incompleteDraft = {
        ...mockDraft,
        alignment: 'Lawful Good',
        personalityTraits: ['Valid backstory with enough characters']
      };
      rerender(<Step2CoreIdentity draft={incompleteDraft} updateDraft={mockUpdateDraft} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Add gender
      const completeDraft = {
        ...incompleteDraft,
        gender: 'Male'
      };
      rerender(<Step2CoreIdentity draft={completeDraft} updateDraft={mockUpdateDraft} />);

      const enabledNextButton = screen.getByRole('button', { name: /next/i });
      expect(enabledNextButton).toBeEnabled();
    });
  });

  // ====================================================================
  // PORTRAIT TESTS (4 tests)
  // ====================================================================
  describe('Portrait Display', () => {
    it('displays portrait image from context or placeholder', () => {
      const draftWithPortrait = {
        ...mockDraft,
        avatarUrl: 'https://example.com/portrait.jpg'
      };
      render(<Step2CoreIdentity draft={draftWithPortrait} updateDraft={mockUpdateDraft} />);

      const portraitImage = screen.getByTestId('portrait-image');
      expect(portraitImage).toBeInTheDocument();
      expect(portraitImage).toHaveAttribute('src', 'https://example.com/portrait.jpg');
    });

    it('shows "Regenerate Portrait" button', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const regenerateButton = screen.getByRole('button', { name: /regenerate portrait/i });
      expect(regenerateButton).toBeInTheDocument();
    });

    it('clicking regenerate calls portraitService', async () => {
      const mockGeneratePortrait = vi.mocked(portraitService.generatePortrait);
      mockGeneratePortrait.mockResolvedValue({
        imageUrl: 'https://example.com/new-portrait.jpg',
        prompt: 'Test prompt'
      });

      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const regenerateButton = screen.getByRole('button', { name: /regenerate portrait/i });
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(mockGeneratePortrait).toHaveBeenCalledWith(
          expect.objectContaining({
            character: expect.objectContaining({
              race: 'Human',
              class: 'Fighter',
              background: 'Soldier'
            })
          })
        );
      });

      // Verify updateDraft was called with new portrait URL
      await waitFor(() => {
        expect(mockUpdateDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            avatarUrl: 'https://example.com/new-portrait.jpg'
          })
        );
      });
    });

    it('shows loading state while regenerating portrait', async () => {
      const mockGeneratePortrait = vi.mocked(portraitService.generatePortrait);

      // Create a promise that we can control
      let resolveGenerate: (value: any) => void;
      const generatePromise = new Promise(resolve => {
        resolveGenerate = resolve;
      });
      mockGeneratePortrait.mockReturnValue(generatePromise as any);

      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const regenerateButton = screen.getByRole('button', { name: /regenerate portrait/i });
      fireEvent.click(regenerateButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/generating/i)).toBeInTheDocument();
      });

      // Button should be disabled during loading
      expect(regenerateButton).toBeDisabled();

      // Resolve the promise
      resolveGenerate!({
        imageUrl: 'https://example.com/portrait.jpg',
        prompt: 'Test prompt'
      });

      // Loading state should disappear
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
      });
    });
  });

  // ====================================================================
  // NAVIGATION TESTS (2 tests)
  // ====================================================================
  describe('Navigation', () => {
    it('renders "Previous" button that goes back to Step 1', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toBeEnabled();

      // Click should trigger navigation (implementation will handle)
      fireEvent.click(prevButton);
      // Note: Navigation logic tested in parent wizard component
    });

    it('next button only enabled when all required fields filled', () => {
      const { rerender } = render(
        <Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />
      );

      // Initially disabled (no fields)
      let nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Add alignment only
      rerender(
        <Step2CoreIdentity
          draft={{ ...mockDraft, alignment: 'Neutral Good' }}
          updateDraft={mockUpdateDraft}
        />
      );
      nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Add gender only (no alignment)
      rerender(
        <Step2CoreIdentity
          draft={{ ...mockDraft, gender: 'Male' }}
          updateDraft={mockUpdateDraft}
        />
      );
      nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Add backstory only
      rerender(
        <Step2CoreIdentity
          draft={{ ...mockDraft, personalityTraits: ['Valid backstory text'] }}
          updateDraft={mockUpdateDraft}
        />
      );
      nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      // Fill all required fields
      const completeDraft = {
        ...mockDraft,
        alignment: 'Neutral Good',
        gender: 'Female',
        personalityTraits: ['Valid backstory with enough characters']
      };
      rerender(<Step2CoreIdentity draft={completeDraft} updateDraft={mockUpdateDraft} />);

      nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();
    });
  });

  // ====================================================================
  // INTEGRATION TESTS (2 tests)
  // ====================================================================
  describe('Integration', () => {
    it('loads data from localStorage if draft persists', () => {
      const persistedDraft = {
        ...mockDraft,
        alignment: 'Chaotic Good',
        gender: 'Non-binary',
        personalityTraits: ['A persisted backstory from localStorage'],
        avatarUrl: 'https://example.com/saved-portrait.jpg'
      };

      render(<Step2CoreIdentity draft={persistedDraft} updateDraft={mockUpdateDraft} />);

      // Verify persisted alignment is selected
      const cgButton = screen.getByTestId('alignment-button-CG');
      expect(cgButton).toHaveClass('border-nuaibria-gold');

      // Verify persisted gender is selected
      const genderSelect = screen.getByTestId('gender-select');
      expect(genderSelect).toHaveTextContent('Non-binary');

      // Verify persisted backstory is displayed
      const backstoryInput = screen.getByPlaceholderText(/describe your character's backstory/i);
      expect(backstoryInput).toHaveValue('A persisted backstory from localStorage');

      // Verify persisted portrait is displayed
      const portraitImage = screen.getByTestId('portrait-image');
      expect(portraitImage).toHaveAttribute('src', 'https://example.com/saved-portrait.jpg');
    });

    it('saves to context on every change', () => {
      render(<Step2CoreIdentity draft={mockDraft} updateDraft={mockUpdateDraft} />);

      // Clear previous calls
      mockUpdateDraft.mockClear();

      // Change alignment
      const lgButton = screen.getByTestId('alignment-button-LG');
      fireEvent.click(lgButton);
      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ alignment: 'Lawful Good' })
      );

      mockUpdateDraft.mockClear();

      // Change gender
      const genderSelect = screen.getByTestId('gender-select');
      fireEvent.click(genderSelect);
      const maleOption = screen.getByText('Male');
      fireEvent.click(maleOption);
      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ gender: 'Male' })
      );

      mockUpdateDraft.mockClear();

      // Change backstory
      const backstoryInput = screen.getByPlaceholderText(/describe your character's backstory/i);
      fireEvent.change(backstoryInput, { target: { value: 'New backstory text' } });
      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ personalityTraits: ['New backstory text'] })
      );
    });
  });
});
