/**
 * @file CharacterPreview.test.tsx
 * @description Tests for character preview sidebar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CharacterPreview from '../CharacterPreview';
import type { Character } from '../../../types/wizard';

describe('CharacterPreview', () => {
  const mockCharacter: Partial<Character> = {
    name: 'Aragorn',
    race: 'Human',
    class: 'Ranger',
    background: 'Outlander',
    alignment: 'Neutral Good',
  };

  describe('Portrait Display', () => {
    it('shows placeholder icon when no portrait URL', () => {
      render(<CharacterPreview character={mockCharacter} portraitUrl={null} />);

      const placeholder = document.querySelector('svg');
      expect(placeholder).toBeInTheDocument();
    });

    it('displays portrait image when URL is provided', () => {
      render(
        <CharacterPreview
          character={mockCharacter}
          portraitUrl="https://example.com/portrait.jpg"
        />
      );

      const img = screen.getByAltText('Character Portrait');
      expect(img).toHaveAttribute('src', 'https://example.com/portrait.jpg');
    });

    it('portrait has correct styling', () => {
      render(
        <CharacterPreview
          character={mockCharacter}
          portraitUrl="https://example.com/portrait.jpg"
        />
      );

      const img = screen.getByAltText('Character Portrait');
      expect(img).toHaveClass('w-full', 'h-full', 'object-cover');
    });
  });

  describe('Character Name', () => {
    it('displays character name', () => {
      render(<CharacterPreview character={mockCharacter} portraitUrl={null} />);

      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    it('shows default name when not provided', () => {
      const characterWithoutName = { ...mockCharacter, name: undefined };
      render(<CharacterPreview character={characterWithoutName} portraitUrl={null} />);

      expect(screen.getByText('Nameless Hero')).toBeInTheDocument();
    });

    it('shows default name for empty string', () => {
      const characterWithEmptyName = { ...mockCharacter, name: '' };
      render(<CharacterPreview character={characterWithEmptyName} portraitUrl={null} />);

      expect(screen.getByText('Nameless Hero')).toBeInTheDocument();
    });
  });

  describe('Race and Class Display', () => {
    it('displays race and class together', () => {
      render(<CharacterPreview character={mockCharacter} portraitUrl={null} />);

      expect(screen.getByText('Human Ranger')).toBeInTheDocument();
    });

    it('displays only race when class is missing', () => {
      const characterWithoutClass = {
        ...mockCharacter,
        class: undefined,
      };
      render(<CharacterPreview character={characterWithoutClass} portraitUrl={null} />);

      expect(screen.getByText('Human')).toBeInTheDocument();
      expect(screen.queryByText('Ranger')).not.toBeInTheDocument();
    });

    it('displays only class when race is missing', () => {
      const characterWithoutRace = {
        ...mockCharacter,
        race: undefined,
      };
      render(<CharacterPreview character={characterWithoutRace} portraitUrl={null} />);

      expect(screen.getByText('Ranger')).toBeInTheDocument();
      expect(screen.queryByText('Human')).not.toBeInTheDocument();
    });

    it('hides race/class line when both are missing', () => {
      const characterWithoutRaceAndClass = {
        name: 'Test',
      };
      render(
        <CharacterPreview character={characterWithoutRaceAndClass} portraitUrl={null} />
      );

      const raceClassElement = screen.queryByText('Human Ranger');
      expect(raceClassElement).not.toBeInTheDocument();
    });
  });

  describe('Background and Alignment Display', () => {
    it('displays background and alignment together', () => {
      render(<CharacterPreview character={mockCharacter} portraitUrl={null} />);

      expect(screen.getByText('Outlander / Neutral Good')).toBeInTheDocument();
    });

    it('displays only background when alignment is missing', () => {
      const characterWithoutAlignment = {
        ...mockCharacter,
        alignment: undefined,
      };
      render(<CharacterPreview character={characterWithoutAlignment} portraitUrl={null} />);

      expect(screen.getByText('Outlander')).toBeInTheDocument();
    });

    it('displays only alignment when background is missing', () => {
      const characterWithoutBackground = {
        ...mockCharacter,
        background: undefined,
      };
      render(<CharacterPreview character={characterWithoutBackground} portraitUrl={null} />);

      expect(screen.getByText('Neutral Good')).toBeInTheDocument();
    });

    it('hides background/alignment line when both are missing', () => {
      const characterWithoutBackgroundAndAlignment = {
        name: 'Test',
        race: 'Human',
        class: 'Ranger',
      };
      render(
        <CharacterPreview
          character={characterWithoutBackgroundAndAlignment}
          portraitUrl={null}
        />
      );

      const bgAlignmentElement = screen.queryByText(/Outlander|Neutral Good/);
      expect(bgAlignmentElement).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CharacterPreview
          character={mockCharacter}
          portraitUrl={null}
          className="custom-class"
        />
      );

      const previewElement = container.firstChild;
      expect(previewElement).toHaveClass('custom-class');
    });

    it('has default styling classes', () => {
      const { container } = render(
        <CharacterPreview character={mockCharacter} portraitUrl={null} />
      );

      const previewElement = container.firstChild;
      expect(previewElement).toHaveClass('bg-nuaibria-surface/50');
      expect(previewElement).toHaveClass('border-2');
      expect(previewElement).toHaveClass('border-nuaibria-gold/20');
    });
  });

  describe('Complete Character Display', () => {
    it('displays all character information when fully populated', () => {
      const completeCharacter: Partial<Character> = {
        name: 'Gandalf the Grey',
        race: 'Human',
        class: 'Wizard',
        background: 'Sage',
        alignment: 'Neutral Good',
      };

      render(
        <CharacterPreview
          character={completeCharacter}
          portraitUrl="https://example.com/gandalf.jpg"
        />
      );

      expect(screen.getByText('Gandalf the Grey')).toBeInTheDocument();
      expect(screen.getByText('Human Wizard')).toBeInTheDocument();
      expect(screen.getByText('Sage / Neutral Good')).toBeInTheDocument();

      const img = screen.getByAltText('Character Portrait');
      expect(img).toHaveAttribute('src', 'https://example.com/gandalf.jpg');
    });

    it('handles minimal character data gracefully', () => {
      const minimalCharacter: Partial<Character> = {};

      render(<CharacterPreview character={minimalCharacter} portraitUrl={null} />);

      expect(screen.getByText('Nameless Hero')).toBeInTheDocument();
      const placeholder = document.querySelector('svg');
      expect(placeholder).toBeInTheDocument();
    });
  });
});
