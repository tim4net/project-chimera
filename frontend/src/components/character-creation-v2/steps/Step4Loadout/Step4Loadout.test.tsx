/**
 * @fileoverview Tests for Step 4: Loadout (Equipment & Portrait)
 * TDD RED Phase: 22 tests defining expected behavior
 * Tests FIRST, implementation LATER
 *
 * Test Categories:
 * - Equipment Preset Tests (5 tests)
 * - Equipment Preview Tests (3 tests)
 * - Appearance Input Tests (5 tests)
 * - Portrait Generation Tests (6 tests)
 * - Portrait Upload Tests (2 tests)
 * - Navigation Tests (1 test)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step4Loadout } from './Step4Loadout';
import type { CharacterDraft } from '@/context/CharacterDraftContextV2';
import { generateValidCharacter } from '@/test/testUtils';
import * as portraitService from '@/services/portraitService';

describe('Step4Loadout', () => {
  let mockDraft: CharacterDraft;
  let mockUpdateDraft: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDraft = {
      ...generateValidCharacter(),
      class: 'Fighter',
      race: 'Human',
      background: 'Soldier',
    } as CharacterDraft;
    mockUpdateDraft = vi.fn();

    // Mock portrait service
    vi.spyOn(portraitService, 'generatePortrait');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== EQUIPMENT PRESET TESTS (5 tests) =====
  describe('Equipment Preset Tests', () => {
    it('renders 3-4 equipment presets based on character class', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Fighter should have presets like "Sword & Shield", "Two-Handed Weapon", "Ranged", etc.
      const presets = screen.getAllByTestId(/equipment-preset/i);
      expect(presets.length).toBeGreaterThanOrEqual(3);
      expect(presets.length).toBeLessThanOrEqual(4);
    });

    it('shows preset name, description, and icon for each preset', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Example: "Sword & Shield" preset for Fighter
      expect(screen.getByText(/sword.*shield/i)).toBeInTheDocument();

      // Should have description
      expect(screen.getByText(/balanced defense/i)).toBeInTheDocument();

      // Should have icon/image for each preset
      const presetIcons = screen.getAllByTestId(/preset-icon/i);
      expect(presetIcons.length).toBeGreaterThan(0);
    });

    it('selects preset and shows selected state with gold highlight', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const firstPreset = screen.getAllByTestId(/equipment-preset/i)[0];
      fireEvent.click(firstPreset);

      await waitFor(() => {
        // Should have gold highlight or selected class
        expect(firstPreset).toHaveClass(/selected|active|gold/i);
      });
    });

    it('can change preset selection (deselects previous, selects new)', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const presets = screen.getAllByTestId(/equipment-preset/i);
      const firstPreset = presets[0];
      const secondPreset = presets[1];

      // Select first preset
      fireEvent.click(firstPreset);

      await waitFor(() => {
        expect(firstPreset).toHaveClass(/selected|active|gold/i);
      });

      // Select second preset
      fireEvent.click(secondPreset);

      await waitFor(() => {
        // First should be deselected
        expect(firstPreset).not.toHaveClass(/selected|active|gold/i);
        // Second should be selected
        expect(secondPreset).toHaveClass(/selected|active|gold/i);
      });
    });

    it('displays selected equipment in preview when preset is chosen', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const firstPreset = screen.getAllByTestId(/equipment-preset/i)[0];
      fireEvent.click(firstPreset);

      await waitFor(() => {
        // Should show equipment items in preview section
        expect(mockUpdateDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedEquipment: expect.any(Array)
          })
        );
      });
    });
  });

  // ===== EQUIPMENT PREVIEW TESTS (3 tests) =====
  describe('Equipment Preview Tests', () => {
    it('shows visual representation of selected gear', () => {
      const draftWithEquipment = {
        ...mockDraft,
        selectedEquipment: ['Longsword', 'Shield', 'Chain Mail']
      };

      render(<Step4Loadout draft={draftWithEquipment} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should display equipment preview section
      expect(screen.getByTestId('equipment-preview')).toBeInTheDocument();

      // Should show each item
      expect(screen.getByText('Longsword')).toBeInTheDocument();
      expect(screen.getByText('Shield')).toBeInTheDocument();
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();
    });

    it('updates preview when preset changes', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const firstPreset = screen.getAllByTestId(/equipment-preset/i)[0];
      fireEvent.click(firstPreset);

      await waitFor(() => {
        // Preview should update with new equipment
        const preview = screen.getByTestId('equipment-preview');
        expect(preview).toBeInTheDocument();
      });
    });

    it('shows equipment name and type (Weapon, Armor, Shield, etc.)', () => {
      const draftWithEquipment = {
        ...mockDraft,
        selectedEquipment: ['Longsword', 'Shield', 'Chain Mail']
      };

      render(<Step4Loadout draft={draftWithEquipment} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should show item types
      expect(screen.getByText(/weapon/i)).toBeInTheDocument();
      expect(screen.getByText(/armor/i)).toBeInTheDocument();
      expect(screen.getByText(/shield/i)).toBeInTheDocument();
    });
  });

  // ===== APPEARANCE INPUT TESTS (5 tests) =====
  describe('Appearance Input Tests', () => {
    it('renders text area with placeholder text', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const textarea = screen.getByPlaceholderText(/tall dwarf with red beard|describe your character/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('accepts max 150 characters and rejects longer input', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const textarea = screen.getByPlaceholderText(/describe your character/i);

      // Type 150 chars - should be accepted
      const validText = 'a'.repeat(150);
      fireEvent.change(textarea, { target: { value: validText } });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe(validText);
      });

      // Try to type 151 chars - should be rejected or truncated
      const tooLongText = 'a'.repeat(151);
      fireEvent.change(textarea, { target: { value: tooLongText } });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(150);
      });
    });

    it('shows character counter (X/150)', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should show counter (0/150 initially)
      expect(screen.getByText(/0\s*\/\s*150/)).toBeInTheDocument();
    });

    it('allows multiline input', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const textarea = screen.getByPlaceholderText(/describe your character/i);
      const multilineText = 'Tall dwarf\nwith a red beard\nand battle scars';

      fireEvent.change(textarea, { target: { value: multilineText } });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe(multilineText);
      });
    });

    it('next button disabled if appearance is less than 5 characters', () => {
      const draftWithShortAppearance = {
        ...mockDraft,
        selectedEquipment: ['Longsword'],
        appearance: 'abc'
      };

      render(<Step4Loadout draft={draftWithShortAppearance} updateDraft={mockUpdateDraft} errors={{}} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  // ===== PORTRAIT GENERATION TESTS (6 tests) =====
  describe('Portrait Generation Tests', () => {
    it('renders portrait canvas or image placeholder', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should have portrait display area
      const portraitCanvas = screen.getByTestId('portrait-canvas');
      expect(portraitCanvas).toBeInTheDocument();
    });

    it('"Generate Portrait" button is visible', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const generateButton = screen.getByRole('button', { name: /generate portrait/i });
      expect(generateButton).toBeInTheDocument();
    });

    it('clicking "Generate Portrait" calls portraitService', async () => {
      const mockGeneratePortrait = vi.mocked(portraitService.generatePortrait);
      mockGeneratePortrait.mockResolvedValue({
        imageUrl: 'https://example.com/portrait.png',
        prompt: 'Test prompt'
      });

      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const generateButton = screen.getByRole('button', { name: /generate portrait/i });
      fireEvent.click(generateButton);

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
    });

    it('shows loading spinner during portrait generation', async () => {
      const mockGeneratePortrait = vi.mocked(portraitService.generatePortrait);

      // Mock with delay
      mockGeneratePortrait.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          imageUrl: 'https://example.com/portrait.png',
          prompt: 'Test prompt'
        }), 100))
      );

      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const generateButton = screen.getByRole('button', { name: /generate portrait/i });
      fireEvent.click(generateButton);

      // Should show loading spinner immediately
      expect(screen.getByTestId('portrait-loading')).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByTestId('portrait-loading')).not.toBeInTheDocument();
      });
    });

    it('displays generated portrait in preview after generation', async () => {
      const mockGeneratePortrait = vi.mocked(portraitService.generatePortrait);
      mockGeneratePortrait.mockResolvedValue({
        imageUrl: 'https://example.com/portrait.png',
        prompt: 'Human Fighter from Soldier background'
      });

      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const generateButton = screen.getByRole('button', { name: /generate portrait/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        // Should display the generated image
        const portraitImage = screen.getByAltText(/character portrait/i) as HTMLImageElement;
        expect(portraitImage.src).toContain('portrait.png');
      });
    });

    it('"Upload Custom" button allows using existing portrait', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const uploadButton = screen.getByRole('button', { name: /upload custom/i });
      expect(uploadButton).toBeInTheDocument();
    });
  });

  // ===== PORTRAIT UPLOAD TESTS (2 tests) =====
  describe('Portrait Upload Tests', () => {
    it('has file input for custom portrait upload', () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // File input should exist (may be hidden)
      const fileInput = screen.getByTestId('portrait-upload-input');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('validates file is an image (JPG/PNG) and loads custom portrait', async () => {
      render(<Step4Loadout draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const fileInput = screen.getByTestId('portrait-upload-input') as HTMLInputElement;

      // Create mock image file
      const imageFile = new File(['dummy content'], 'portrait.png', { type: 'image/png' });

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [imageFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        // Should accept the image file
        expect(mockUpdateDraft).toHaveBeenCalled();
      });

      // Test invalid file type
      const invalidFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        // Should show error for invalid file type
        expect(screen.getByText(/invalid file type|only images/i)).toBeInTheDocument();
      });
    });
  });

  // ===== NAVIGATION TESTS (1 test) =====
  describe('Navigation Tests', () => {
    it('"Previous" button goes back to Step 3, "Next" enabled when equipment + appearance filled', () => {
      const validDraft = {
        ...mockDraft,
        selectedEquipment: ['Longsword', 'Shield'],
        appearance: 'A tall human fighter with battle scars'
      };

      render(<Step4Loadout draft={validDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Previous button should exist
      const prevButton = screen.getByRole('button', { name: /previous|back/i });
      expect(prevButton).toBeInTheDocument();
      expect(prevButton).not.toBeDisabled();

      // Next button should be enabled when valid
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });
});
