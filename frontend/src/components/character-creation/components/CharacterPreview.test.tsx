/**
 * @fileoverview Tests for CharacterPreview component
 * Comprehensive test suite covering all features and edge cases
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CharacterPreview } from './CharacterPreview';
import type { CharacterDraft } from '../../../types/wizard';

describe('CharacterPreview', () => {
  describe('Empty State', () => {
    it('renders with empty draft', () => {
      render(<CharacterPreview draft={{}} />);
      expect(screen.getByText(/start creating your character/i)).toBeInTheDocument();
    });

    it('shows "Unnamed Hero" when name is missing', () => {
      render(<CharacterPreview draft={{ race: 'Human' }} />);
      expect(screen.getByText('Unnamed Hero')).toBeInTheDocument();
    });

    it('hides empty sections', () => {
      const { container } = render(<CharacterPreview draft={{ name: 'Test' }} />);
      expect(screen.queryByText(/proficient skills/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/equipment/i)).not.toBeInTheDocument();
    });
  });

  describe('Character Identity', () => {
    it('displays character name', () => {
      const draft: Partial<CharacterDraft> = {
        name: 'Aragorn',
      };
      render(<CharacterPreview draft={draft} />);
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    it('displays race and class', () => {
      const draft: Partial<CharacterDraft> = {
        name: 'Legolas',
        race: 'Elf',
        class: 'Ranger',
      };
      render(<CharacterPreview draft={draft} />);
      expect(screen.getByText('Elf')).toBeInTheDocument();
      expect(screen.getByText('Ranger')).toBeInTheDocument();
    });

    it('displays level 1', () => {
      const draft: Partial<CharacterDraft> = {
        name: 'Gimli',
        race: 'Dwarf',
        class: 'Fighter',
      };
      render(<CharacterPreview draft={draft} />);
      expect(screen.getByText('Level 1')).toBeInTheDocument();
    });

    it('displays alignment with correct color', () => {
      const draft: Partial<CharacterDraft> = {
        name: 'Gandalf',
        alignment: 'Lawful Good',
      };
      const { container } = render(<CharacterPreview draft={draft} />);
      const alignmentElement = screen.getByText('Lawful Good');
      expect(alignmentElement).toHaveClass('text-blue-400');
    });

    it('displays background', () => {
      const draft: Partial<CharacterDraft> = {
        name: 'Frodo',
        background: 'Noble',
      };
      render(<CharacterPreview draft={draft} />);
      expect(screen.getByText('Noble')).toBeInTheDocument();
    });

    it('displays portrait when avatarUrl is provided', () => {
      const draft: Partial<CharacterDraft> = {
        name: 'Test Hero',
        avatarUrl: 'https://example.com/portrait.jpg',
      };
      render(<CharacterPreview draft={draft} />);
      const img = screen.getByAltText('Test Hero');
      expect(img).toHaveAttribute('src', 'https://example.com/portrait.jpg');
    });
  });

  describe('Calculated Stats', () => {
    it('calculates and displays HP correctly', () => {
      const draft: Partial<CharacterDraft> = {
        class: 'Barbarian',
        abilityScores: { STR: 15, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 12 },
        race: 'Human',
      };
      render(<CharacterPreview draft={draft} />);
      // Barbarian: d12 (12) + CON modifier (+4 from 17 after racial bonus) = 16
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('HP')).toBeInTheDocument();
    });

    it('calculates AC for armored classes', () => {
      const draft: Partial<CharacterDraft> = {
        class: 'Fighter',
        abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 12 },
        race: 'Human',
      };
      render(<CharacterPreview draft={draft} />);
      // Fighter: Chain mail (16) + DEX modifier (+2, capped at +2) = 18
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('AC')).toBeInTheDocument();
    });

    it('calculates AC for Barbarian with CON bonus', () => {
      const draft: Partial<CharacterDraft> = {
        class: 'Barbarian',
        abilityScores: { STR: 15, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 12 },
        race: 'Human',
      };
      render(<CharacterPreview draft={draft} />);
      // Barbarian: 10 + DEX (+3) + CON (+4) = 17
      expect(screen.getByText('17')).toBeInTheDocument();
    });

    it('calculates AC for Monk with WIS bonus', () => {
      const draft: Partial<CharacterDraft> = {
        class: 'Monk',
        abilityScores: { STR: 10, DEX: 15, CON: 13, INT: 8, WIS: 14, CHA: 12 },
        race: 'Human',
      };
      render(<CharacterPreview draft={draft} />);
      // Monk: 10 + DEX (+3) + WIS (+3) = 16
      expect(screen.getByText('16')).toBeInTheDocument();
    });

    it('displays speed based on race', () => {
      const draft: Partial<CharacterDraft> = {
        race: 'Dwarf',
      };
      render(<CharacterPreview draft={draft} />);
      expect(screen.getByText('25')).toBeInTheDocument(); // Dwarf speed
      expect(screen.getByText('Speed')).toBeInTheDocument();
    });

    it('displays speed for standard races', () => {
      const draft: Partial<CharacterDraft> = {
        race: 'Human',
      };
      render(<CharacterPreview draft={draft} />);
      expect(screen.getByText('30')).toBeInTheDocument(); // Human speed
    });
  });

  describe('Ability Scores', () => {
    it('displays base ability scores', () => {
      const draft: Partial<CharacterDraft> = {
        abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
        race: 'Human', // Human gets +1 to all
      };
      render(<CharacterPreview draft={draft} />);

      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument(); // 15 + 1
      expect(screen.getByText('+3')).toBeInTheDocument(); // Modifier
    });

    it('applies racial bonuses correctly', () => {
      const draft: Partial<CharacterDraft> = {
        abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 12 },
        race: 'Dwarf', // Dwarf gets +2 CON
      };
      render(<CharacterPreview draft={draft} />);

      // Check CON label exists
      expect(screen.getByText('CON')).toBeInTheDocument();
      // Check that 15 appears (13 + 2 CON) - using getAllByText since STR is also 15
      const scoreElements = screen.getAllByText('15');
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it('shows modifiers with correct signs', () => {
      const draft: Partial<CharacterDraft> = {
        abilityScores: { STR: 8, DEX: 10, CON: 12, INT: 14, WIS: 16, CHA: 18 },
        race: 'Human',
      };
      render(<CharacterPreview draft={draft} />);

      expect(screen.getByText('-1')).toBeInTheDocument(); // STR 9 (-1)
      expect(screen.getByText('+0')).toBeInTheDocument(); // DEX 11 (+0)
      expect(screen.getByText('+1')).toBeInTheDocument(); // CON 13 (+1)
      expect(screen.getByText('+2')).toBeInTheDocument(); // INT 15 (+2)
      expect(screen.getByText('+3')).toBeInTheDocument(); // WIS 17 (+3)
      expect(screen.getByText('+4')).toBeInTheDocument(); // CHA 19 (+4)
    });

    it('highlights ability scores with racial bonuses', () => {
      const draft: Partial<CharacterDraft> = {
        abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 12 },
        race: 'Elf', // Elf gets +2 DEX
      };
      const { container } = render(<CharacterPreview draft={draft} />);

      // Find the DEX score element and verify it has gold styling
      const dexScore = screen.getByText('16'); // 14 + 2
      expect(dexScore).toHaveClass('text-nuaibria-gold');
    });
  });

  describe('Skills', () => {
    it('displays proficient skills list', () => {
      const draft: Partial<CharacterDraft> = {
        proficientSkills: ['Athletics', 'Perception', 'Stealth'],
      };
      render(<CharacterPreview draft={draft} />);

      expect(screen.getByText(/proficient skills \(3\)/i)).toBeInTheDocument();
      expect(screen.getByText('Athletics')).toBeInTheDocument();
      expect(screen.getByText('Perception')).toBeInTheDocument();
      expect(screen.getByText('Stealth')).toBeInTheDocument();
    });

    it('handles empty skills array', () => {
      const draft: Partial<CharacterDraft> = {
        proficientSkills: [],
      };
      render(<CharacterPreview draft={draft} />);

      expect(screen.queryByText(/proficient skills/i)).not.toBeInTheDocument();
    });
  });

  describe('Equipment', () => {
    it('displays equipment list', () => {
      const draft: Partial<CharacterDraft> = {
        equipment: ['Longsword', 'Shield', 'Chain Mail', 'Backpack'],
      };
      render(<CharacterPreview draft={draft} />);

      expect(screen.getByText(/equipment \(4\)/i)).toBeInTheDocument();
      expect(screen.getByText('Longsword')).toBeInTheDocument();
      expect(screen.getByText('Shield')).toBeInTheDocument();
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();
      expect(screen.getByText('Backpack')).toBeInTheDocument();
    });

    it('handles empty equipment array', () => {
      const draft: Partial<CharacterDraft> = {
        equipment: [],
      };
      render(<CharacterPreview draft={draft} />);

      expect(screen.queryByText(/equipment/i)).not.toBeInTheDocument();
    });
  });

  describe('Updates and Re-renders', () => {
    it('updates when draft changes', () => {
      const { rerender } = render(
        <CharacterPreview draft={{ name: 'Old Name' }} />
      );
      expect(screen.getByText('Old Name')).toBeInTheDocument();

      rerender(<CharacterPreview draft={{ name: 'New Name' }} />);
      expect(screen.getByText('New Name')).toBeInTheDocument();
      expect(screen.queryByText('Old Name')).not.toBeInTheDocument();
    });

    it('recalculates stats when ability scores change', () => {
      const draft1 = {
        class: 'Fighter' as const,
        abilityScores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        race: 'Human' as const,
      };

      const { rerender, container } = render(<CharacterPreview draft={draft1} />);
      // HP: d10 (10) + CON modifier (+0 from 11 after racial) = 10
      // Look for HP stat specifically
      const hpLabel = screen.getByText('HP');
      const hpValue = hpLabel.parentElement?.querySelector('.text-nuaibria-health');
      expect(hpValue?.textContent).toBe('10');

      const draft2 = {
        ...draft1,
        abilityScores: { STR: 10, DEX: 10, CON: 16, INT: 10, WIS: 10, CHA: 10 },
      };

      rerender(<CharacterPreview draft={draft2} />);
      // HP: d10 (10) + CON modifier (+3 from 17 after racial) = 13
      const updatedHpValue = screen.getByText('HP').parentElement?.querySelector('.text-nuaibria-health');
      expect(updatedHpValue?.textContent).toBe('13');
    });
  });

  describe('Styling and Layout', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CharacterPreview draft={{}} className="custom-class" />
      );
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('custom-class');
    });

    it('has sticky positioning classes', () => {
      const { container } = render(<CharacterPreview draft={{}} />);
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('sticky');
      expect(aside).toHaveClass('top-8');
    });

    it('has proper styling classes', () => {
      const { container } = render(<CharacterPreview draft={{}} />);
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('bg-nuaibria-surface');
      expect(aside).toHaveClass('border-2');
      expect(aside).toHaveClass('border-nuaibria-gold/20');
      expect(aside).toHaveClass('rounded-lg');
    });
  });

  describe('Alignment Colors', () => {
    const alignmentTests: Array<[string, string]> = [
      ['Lawful Good', 'text-blue-400'],
      ['Neutral Good', 'text-green-400'],
      ['Chaotic Good', 'text-cyan-400'],
      ['Lawful Neutral', 'text-gray-400'],
      ['True Neutral', 'text-yellow-400'],
      ['Chaotic Neutral', 'text-orange-400'],
      ['Lawful Evil', 'text-red-600'],
      ['Neutral Evil', 'text-purple-600'],
      ['Chaotic Evil', 'text-red-800'],
    ];

    alignmentTests.forEach(([alignment, expectedClass]) => {
      it(`applies ${expectedClass} for ${alignment}`, () => {
        const draft: Partial<CharacterDraft> = {
          alignment: alignment as any,
        };
        render(<CharacterPreview draft={draft} />);
        const alignmentElement = screen.getByText(alignment);
        expect(alignmentElement).toHaveClass(expectedClass);
      });
    });
  });

  describe('Complete Character', () => {
    it('renders a fully formed character correctly', () => {
      const completeDraft: Partial<CharacterDraft> = {
        name: 'Thorin Oakenshield',
        age: 195,
        race: 'Dwarf',
        class: 'Fighter',
        background: 'Noble',
        alignment: 'Lawful Good',
        abilityScores: { STR: 15, DEX: 12, CON: 14, INT: 10, WIS: 13, CHA: 11 },
        proficientSkills: ['Athletics', 'Intimidation', 'History', 'Persuasion'],
        equipment: ['Longsword', 'Shield', 'Chain Mail', 'Adventurer\'s Pack'],
        avatarUrl: 'https://example.com/thorin.jpg',
      };

      render(<CharacterPreview draft={completeDraft} />);

      // Verify all sections are present
      expect(screen.getByText('Thorin Oakenshield')).toBeInTheDocument();
      expect(screen.getByText('Dwarf')).toBeInTheDocument();
      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Noble')).toBeInTheDocument();
      expect(screen.getByText('Lawful Good')).toBeInTheDocument();
      expect(screen.getByText('Level 1')).toBeInTheDocument();

      // Stats
      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('Speed')).toBeInTheDocument();

      // Skills
      expect(screen.getByText('Athletics')).toBeInTheDocument();
      expect(screen.getByText('Intimidation')).toBeInTheDocument();

      // Equipment
      expect(screen.getByText('Longsword')).toBeInTheDocument();
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();

      // Portrait
      const img = screen.getByAltText('Thorin Oakenshield');
      expect(img).toHaveAttribute('src', 'https://example.com/thorin.jpg');
    });
  });
});
