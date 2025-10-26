/**
 * @file AppearancePanel.test.tsx
 * @description Tests for appearance and portrait generation panel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppearancePanel from '../components/AppearancePanel';
import * as portraitService from '../../../services/portraitService';
import type { Character } from '../../../types/wizard';

// Mock the portrait service
vi.mock('../../../services/portraitService');

const mockCharacter: Partial<Character> = {
  name: 'Test Hero',
  race: 'Elf',
  class: 'Wizard',
  background: 'Sage',
  alignment: 'Neutral Good',
};

describe('AppearancePanel', () => {
  const mockOnPortraitGenerated = vi.fn();
  const mockOnDescriptionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(portraitService.generatePortrait).mockResolvedValue({
      imageUrl: 'https://example.com/portrait.jpg',
      prompt: 'Test prompt',
    });
  });

  describe('Appearance Textarea', () => {
    it('renders appearance description textarea', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const textarea = screen.getByPlaceholderText(
        /Braided red hair, stoic expression/i
      );
      expect(textarea).toBeInTheDocument();
    });

    it('accepts custom appearance input', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
          onDescriptionChange={mockOnDescriptionChange}
        />
      );

      const textarea = screen.getByPlaceholderText(
        /Braided red hair, stoic expression/i
      );
      fireEvent.change(textarea, {
        target: { value: 'Long silver hair with battle scars' },
      });

      expect(mockOnDescriptionChange).toHaveBeenCalledWith(
        'Long silver hair with battle scars'
      );
    });

    it('displays existing custom description', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
          customDescription="Existing description"
        />
      );

      const textarea = screen.getByDisplayValue('Existing description');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Portrait Generation', () => {
    it('renders generate portrait button', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      expect(button).toBeInTheDocument();
    });

    it('calls portrait generation API when button is clicked', async () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      await waitFor(() => {
        expect(portraitService.generatePortrait).toHaveBeenCalledWith({
          character: mockCharacter,
          customDescription: undefined,
        });
      });
    });

    it('includes custom description in API call', async () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
          customDescription="Custom description"
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      await waitFor(() => {
        expect(portraitService.generatePortrait).toHaveBeenCalledWith({
          character: mockCharacter,
          customDescription: 'Custom description',
        });
      });
    });

    it('shows loading state during generation', async () => {
      vi.mocked(portraitService.generatePortrait).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
      expect(screen.getByText('Generating your portrait...')).toBeInTheDocument();
    });

    it('calls onPortraitGenerated with URL on success', async () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnPortraitGenerated).toHaveBeenCalledWith(
          'https://example.com/portrait.jpg'
        );
      });
    });

    it('disables button during generation', async () => {
      vi.mocked(portraitService.generatePortrait).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      expect(button).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner during generation', async () => {
      vi.mocked(portraitService.generatePortrait).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      const loadingText = screen.getByText('Generating your portrait...');
      expect(loadingText).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message if generation fails', async () => {
      vi.mocked(portraitService.generatePortrait).mockRejectedValue(
        new Error('Generation failed')
      );

      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Generation failed')).toBeInTheDocument();
      });
    });

    it('shows error if required character fields are missing', async () => {
      const incompleteCharacter: Partial<Character> = {
        name: 'Test',
      };

      render(
        <AppearancePanel
          character={incompleteCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Generate Portrait');
      fireEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Please complete race, class, and background/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Portrait Preview', () => {
    it('shows placeholder when no portrait', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      expect(screen.getByText('No portrait generated yet')).toBeInTheDocument();
    });

    it('displays generated portrait image', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl="https://example.com/portrait.jpg"
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const img = screen.getByAltText('Generated Portrait');
      expect(img).toHaveAttribute('src', 'https://example.com/portrait.jpg');
    });

    it('shows success message after generation', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl="https://example.com/portrait.jpg"
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      expect(
        screen.getByText(/Portrait generated successfully/i)
      ).toBeInTheDocument();
    });
  });

  describe('Regenerate Button', () => {
    it('shows regenerate button when portrait exists', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl="https://example.com/portrait.jpg"
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Regenerate');
      expect(button).toBeInTheDocument();
    });

    it('does not show regenerate button when no portrait', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.queryByText('Regenerate');
      expect(button).not.toBeInTheDocument();
    });

    it('calls generation API when regenerate is clicked', async () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl="https://example.com/old-portrait.jpg"
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      const button = screen.getByText('Regenerate');
      fireEvent.click(button);

      await waitFor(() => {
        expect(portraitService.generatePortrait).toHaveBeenCalled();
      });
    });
  });

  describe('Integration', () => {
    it('integrates all sections properly', () => {
      render(
        <AppearancePanel
          character={mockCharacter}
          portraitUrl={null}
          onPortraitGenerated={mockOnPortraitGenerated}
        />
      );

      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Braided red hair/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Generate Portrait')).toBeInTheDocument();
      expect(screen.getByText('Portrait Preview')).toBeInTheDocument();
    });
  });
});
