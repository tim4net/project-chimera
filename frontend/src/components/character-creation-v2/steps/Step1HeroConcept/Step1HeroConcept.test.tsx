import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step1HeroConcept from './Step1HeroConcept';
import { Step1Draft, generateValidCharacter } from '../../../../test/testUtils';

describe('Step1HeroConcept', () => {
  let mockDraft: Step1Draft;
  let mockUpdateDraft: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDraft = {
      name: '',
      race: '',
      class: '',
      background: ''
    };
    mockUpdateDraft = vi.fn();
  });

  // NAME INPUT TESTS (5 tests)
  describe('Name Input', () => {
    it('renders name input field with placeholder', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const nameInput = screen.getByPlaceholderText(/enter your character name/i);
      expect(nameInput).toBeInTheDocument();
    });

    it('validates name 2-50 characters (shows error for "A", accepts "Ab")', async () => {
      const { rerender } = render(
        <Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />
      );

      const nameInput = screen.getByPlaceholderText(/enter your character name/i);

      // Test single character - should show error
      fireEvent.change(nameInput, { target: { value: 'A' } });
      // Simulate parent updating draft
      rerender(<Step1HeroConcept draft={{ ...mockDraft, name: 'A' }} updateDraft={mockUpdateDraft} errors={[]} />);
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });

      // Test 2 characters - should be valid
      fireEvent.change(nameInput, { target: { value: 'Ab' } });
      rerender(<Step1HeroConcept draft={{ ...mockDraft, name: 'Ab' }} updateDraft={mockUpdateDraft} errors={[]} />);
      await waitFor(() => {
        expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument();
      });
    });

    it('rejects special characters (@ # $ %)', async () => {
      const { rerender } = render(
        <Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />
      );

      const nameInput = screen.getByPlaceholderText(/enter your character name/i);

      fireEvent.change(nameInput, { target: { value: 'Test@Name' } });
      // Simulate parent updating draft
      rerender(<Step1HeroConcept draft={{ ...mockDraft, name: 'Test@Name' }} updateDraft={mockUpdateDraft} errors={[]} />);
      await waitFor(() => {
        expect(screen.getByText(/name can only contain letters/i)).toBeInTheDocument();
      });
    });

    it('shows error message for invalid names', async () => {
      const errors = ['Name is required'];
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={errors} />);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('calls updateDraft callback when user types', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const nameInput = screen.getByPlaceholderText(/enter your character name/i);
      fireEvent.change(nameInput, { target: { value: 'Aragorn' } });

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Aragorn' })
      );
    });
  });

  // AI NAME GENERATOR (3 tests)
  describe('AI Name Generator', () => {
    it('renders "Generate Name" button', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const generateButton = screen.getByRole('button', { name: /generate name/i });
      expect(generateButton).toBeInTheDocument();
    });

    it('button disabled until race/class/background selected', () => {
      const { rerender } = render(
        <Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />
      );

      const generateButton = screen.getByRole('button', { name: /generate name/i });
      expect(generateButton).toBeDisabled();

      // Render with all fields filled
      const validDraft: Step1Draft = {
        name: 'Test Character',
        race: 'Human',
        class: 'Fighter',
        background: 'Soldier'
      };
      rerender(<Step1HeroConcept draft={validDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const enabledButton = screen.getByRole('button', { name: /generate name/i });
      expect(enabledButton).toBeEnabled();
    });

    it('clicking button generates and inserts random name', async () => {
      const validDraft: Step1Draft = {
        name: '',
        race: 'Human',
        class: 'Fighter',
        background: 'Soldier'
      };
      render(<Step1HeroConcept draft={validDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const generateButton = screen.getByRole('button', { name: /generate name/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockUpdateDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            name: expect.any(String)
          })
        );
      });
    });
  });

  // RACE SELECTOR (4 tests)
  describe('Race Selector', () => {
    it('renders all 10 race cards', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const races = ['Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'];

      races.forEach(race => {
        expect(screen.getByText(race)).toBeInTheDocument();
      });
    });

    it('highlights selected race with gold border', () => {
      const draftWithRace = { ...mockDraft, race: 'Elf' };
      render(<Step1HeroConcept draft={draftWithRace} updateDraft={mockUpdateDraft} errors={[]} />);

      const elfCard = screen.getByTestId('race-card-Elf');
      expect(elfCard).toHaveClass('selected');
    });

    it('updates hero preview when race selected', () => {
      const { rerender } = render(
        <Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />
      );

      const dwarfCard = screen.getByText('Dwarf');
      fireEvent.click(dwarfCard);

      // Rerender with updated draft
      const updatedDraft = { ...mockDraft, race: 'Dwarf' };
      rerender(<Step1HeroConcept draft={updatedDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const preview = screen.getByTestId('hero-preview');
      expect(preview).toHaveAttribute('data-race', 'Dwarf');
    });

    it('calls updateDraft callback when race selected', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const humanCard = screen.getByText('Human');
      fireEvent.click(humanCard);

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ race: 'Human' })
      );
    });
  });

  // CLASS SELECTOR (4 tests)
  describe('Class Selector', () => {
    it('renders all 12 class cards', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const classes = [
        'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
        'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
      ];

      classes.forEach(className => {
        expect(screen.getByText(className)).toBeInTheDocument();
      });
    });

    it('highlights selected class with gold border', () => {
      const draftWithClass = { ...mockDraft, class: 'Wizard' };
      render(<Step1HeroConcept draft={draftWithClass} updateDraft={mockUpdateDraft} errors={[]} />);

      const wizardCard = screen.getByTestId('class-card-Wizard');
      expect(wizardCard).toHaveClass('selected');
    });

    it('updates hero preview when class selected', () => {
      const { rerender } = render(
        <Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />
      );

      const fighterCard = screen.getByText('Fighter');
      fireEvent.click(fighterCard);

      // Rerender with updated draft
      const updatedDraft = { ...mockDraft, class: 'Fighter' };
      rerender(<Step1HeroConcept draft={updatedDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const preview = screen.getByTestId('hero-preview');
      expect(preview).toHaveAttribute('data-class', 'Fighter');
    });

    it('calls updateDraft callback when class selected', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const rogueCard = screen.getByText('Rogue');
      fireEvent.click(rogueCard);

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ class: 'Rogue' })
      );
    });
  });

  // BACKGROUND SELECTOR (3 tests)
  describe('Background Selector', () => {
    it('renders all 6 background cards', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const backgrounds = ['Acolyte', 'Criminal', 'Folk Hero', 'Sage', 'Soldier', 'Urchin'];

      backgrounds.forEach(background => {
        expect(screen.getByText(background)).toBeInTheDocument();
      });
    });

    it('highlights selected background', () => {
      const draftWithBackground = { ...mockDraft, background: 'Sage' };
      render(<Step1HeroConcept draft={draftWithBackground} updateDraft={mockUpdateDraft} errors={[]} />);

      const sageCard = screen.getByTestId('background-card-Sage');
      expect(sageCard).toHaveClass('selected');
    });

    it('calls updateDraft callback when background selected', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const soldierCard = screen.getByText('Soldier');
      fireEvent.click(soldierCard);

      expect(mockUpdateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ background: 'Soldier' })
      );
    });
  });

  // HERO PREVIEW (3 tests)
  describe('Hero Preview', () => {
    it('displays hero silhouette placeholder', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const preview = screen.getByTestId('hero-preview');
      expect(preview).toBeInTheDocument();
    });

    it('updates preview with race/class visually', () => {
      const draftWithSelections = {
        ...mockDraft,
        race: 'Elf',
        class: 'Wizard'
      };
      render(<Step1HeroConcept draft={draftWithSelections} updateDraft={mockUpdateDraft} errors={[]} />);

      const preview = screen.getByTestId('hero-preview');
      expect(preview).toHaveAttribute('data-race', 'Elf');
      expect(preview).toHaveAttribute('data-class', 'Wizard');
    });

    it('shows "Choose your hero concept" text when empty', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      expect(screen.getByText(/choose your hero concept/i)).toBeInTheDocument();
    });
  });

  // NAVIGATION & FORM INTEGRATION (3 tests)
  describe('Navigation & Form Integration', () => {
    it('"Next" button disabled until all fields filled', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('"Next" button enabled when name, race, class, background all filled', () => {
      const validDraft: Step1Draft = {
        name: 'Test Character',
        race: 'Human',
        class: 'Fighter',
        background: 'Soldier'
      };
      render(<Step1HeroConcept draft={validDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();
    });

    it('all data saves to draft context', () => {
      render(<Step1HeroConcept draft={mockDraft} updateDraft={mockUpdateDraft} errors={[]} />);

      // Fill name
      const nameInput = screen.getByPlaceholderText(/enter your character name/i);
      fireEvent.change(nameInput, { target: { value: 'Legolas' } });

      // Select race
      const elfCard = screen.getByText('Elf');
      fireEvent.click(elfCard);

      // Select class
      const rangerCard = screen.getByText('Ranger');
      fireEvent.click(rangerCard);

      // Select background
      const folkHeroCard = screen.getByText('Folk Hero');
      fireEvent.click(folkHeroCard);

      // Check individual calls
      expect(mockUpdateDraft).toHaveBeenCalledWith({ name: 'Legolas' });
      expect(mockUpdateDraft).toHaveBeenCalledWith({ race: 'Elf' });
      expect(mockUpdateDraft).toHaveBeenCalledWith({ class: 'Ranger' });
      expect(mockUpdateDraft).toHaveBeenCalledWith({ background: 'Folk Hero' });
    });
  });
});
