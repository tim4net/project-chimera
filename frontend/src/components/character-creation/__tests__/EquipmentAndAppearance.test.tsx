/**
 * @file EquipmentAndAppearance.test.tsx
 * @description Comprehensive tests for Page 2 of character creation wizard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EquipmentAndAppearance from '../pages/EquipmentAndAppearance';
import type { Character } from '../../../types/wizard';

// Mock the portrait service
vi.mock('../../../services/portraitService', () => ({
  generatePortrait: vi.fn(() =>
    Promise.resolve({
      imageUrl: 'https://example.com/generated-portrait.jpg',
      prompt: 'Test portrait prompt',
    })
  ),
}));

const mockCharacter: Partial<Character> = {
  name: 'Test Hero',
  race: 'Elf',
  class: 'Fighter',
  background: 'Soldier',
  alignment: 'Lawful Good',
};

describe('EquipmentAndAppearance', () => {
  const mockOnComplete = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Layout and Structure', () => {
    it('renders the page title correctly', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Equipment & Appearance')).toBeInTheDocument();
      expect(
        screen.getByText('Choose your starting gear and create your portrait')
      ).toBeInTheDocument();
    });

    it('renders character preview sidebar', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Test Hero')).toBeInTheDocument();
      expect(screen.getByText('Elf Fighter')).toBeInTheDocument();
    });

    it('renders equipment section title', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Starting Equipment')).toBeInTheDocument();
    });

    it('renders appearance section title', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders back button when onBack is provided', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByText('Back');
      expect(backButton).toBeInTheDocument();
    });

    it('does not render back button when onBack is not provided', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
        />
      );

      const backButton = screen.queryByText('Back');
      expect(backButton).not.toBeInTheDocument();
    });

    it('calls onBack when back button is clicked', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('renders continue button', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('calls onComplete when form is submitted', () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Character Preview Integration', () => {
    it('updates preview when portrait is generated', async () => {
      render(
        <EquipmentAndAppearance
          character={mockCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      const generateButton = screen.getByText('Generate Portrait');
      fireEvent.click(generateButton);

      await waitFor(() => {
        const img = screen.getAllByAltText(/Portrait|Generated Portrait/i)[0];
        expect(img).toHaveAttribute('src', 'https://example.com/generated-portrait.jpg');
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when character class is missing', () => {
      const incompleteCharacter: Partial<Character> = {
        name: 'Test Hero',
        race: 'Elf',
      };

      render(
        <EquipmentAndAppearance
          character={incompleteCharacter}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Please select a character class first')).toBeInTheDocument();
    });
  });
});
