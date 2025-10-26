import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step3AbilitiesSkills } from './Step3AbilitiesSkills';
import { CharacterDraft } from '@/types/wizard';
import { generateValidCharacter } from '@/test/testUtils';

describe('Step3AbilitiesSkills', () => {
  let mockDraft: CharacterDraft;
  let mockUpdateDraft: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDraft = generateValidCharacter();
    mockUpdateDraft = vi.fn();
  });

  // ===== ABILITY SLIDERS (8 tests) =====
  describe('Ability Sliders', () => {
    it('renders 6 ability sliders (STR, DEX, CON, INT, WIS, CHA)', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      expect(screen.getByLabelText(/strength/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dexterity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/constitution/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/intelligence/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/wisdom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/charisma/i)).toBeInTheDocument();
    });

    it('each slider has range 8-15', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const strSlider = screen.getByLabelText(/strength/i) as HTMLInputElement;
      expect(strSlider.min).toBe('8');
      expect(strSlider.max).toBe('15');
    });

    it('shows base score, racial bonus, final score', () => {
      const draftWithBonuses = {
        ...mockDraft,
        race: { id: 'dwarf', name: 'Dwarf', racialBonuses: { con: 2 } },
        abilityScores: { str: 10, dex: 10, con: 13, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={draftWithBonuses} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should show Constitution: base 13, +2 racial, = 15 final
      expect(screen.getByText(/base:\s*13/i)).toBeInTheDocument();
      expect(screen.getByText(/\+2\s*racial/i)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('calculates modifier correctly: (score - 10) // 2', () => {
      const draftWithScores = {
        ...mockDraft,
        abilityScores: { str: 8, dex: 14, con: 12, int: 10, wis: 15, cha: 9 }
      };

      render(<Step3AbilitiesSkills draft={draftWithScores} updateDraft={mockUpdateDraft} errors={{}} />);

      // STR 8 = -1, DEX 14 = +2, CON 12 = +1, INT 10 = 0, WIS 15 = +2, CHA 9 = -1
      const modifiers = screen.getAllByText('-1');
      expect(modifiers.length).toBeGreaterThan(0);
      expect(screen.getAllByText('+2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('+1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('+0').length).toBeGreaterThan(0);
    });

    it('updates points remaining as you move sliders', async () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const strSlider = screen.getByLabelText(/strength/i);

      // Start with all 10s = 12 points spent (6 abilities × 2 points each), 15 remaining
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();

      // Change STR to 14 (7 points instead of 2 = 5 more points)
      fireEvent.change(strSlider, { target: { value: '14' } });

      await waitFor(() => {
        // Points should have decreased
        expect(mockUpdateDraft).toHaveBeenCalled();
      });
    });

    it('enforces 27-point budget total', async () => {
      const draftHighScores = {
        ...mockDraft,
        abilityScores: { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 }
      };

      render(<Step3AbilitiesSkills draft={draftHighScores} updateDraft={mockUpdateDraft} errors={{}} />);

      // 3×9 points (for 15s) = 27 points, budget should be exactly 0
      const budgetElements = screen.getAllByText('0');
      expect(budgetElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
    });

    it('prevents exceeding budget (slider stops moving)', async () => {
      const draftMaxed = {
        ...mockDraft,
        abilityScores: { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 }
      };

      render(<Step3AbilitiesSkills draft={draftMaxed} updateDraft={mockUpdateDraft} errors={{}} />);

      const intSlider = screen.getByLabelText(/intelligence/i) as HTMLInputElement;

      // Try to increase INT from 8 to 9 (would need 1 more point, but budget is 0)
      fireEvent.change(intSlider, { target: { value: '9' } });

      // Should prevent change (slider value should remain 8)
      await waitFor(() => {
        expect(intSlider.value).toBe('8');
      });
    });

    it('reset button sets all back to 10', async () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockUpdateDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
          })
        );
      });
    });
  });

  // ===== RACIAL BONUSES (4 tests) =====
  describe('Racial Bonuses', () => {
    it('applies +2 to CON for Dwarf', () => {
      const dwarfDraft = {
        ...mockDraft,
        race: { id: 'dwarf', name: 'Dwarf', racialBonuses: { con: 2 } },
        abilityScores: { str: 10, dex: 10, con: 12, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={dwarfDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // CON should show 12 + 2 = 14
      expect(screen.getByText(/constitution/i)).toBeInTheDocument();
      expect(screen.getByText(/\+2.*racial/i)).toBeInTheDocument();
    });

    it('applies +1 to all abilities for Human', () => {
      const humanDraft = {
        ...mockDraft,
        race: {
          id: 'human',
          name: 'Human',
          racialBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }
        },
        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={humanDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // All abilities should show +1
      const bonuses = screen.getAllByText(/\+1/);
      expect(bonuses.length).toBeGreaterThanOrEqual(6);
    });

    it('applies +2 DEX, +2 INT for Elf', () => {
      const elfDraft = {
        ...mockDraft,
        race: { id: 'elf', name: 'Elf', racialBonuses: { dex: 2, int: 2 } },
        abilityScores: { str: 10, dex: 12, con: 10, int: 13, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={elfDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // DEX: 12 + 2 = 14, INT: 13 + 2 = 15
      const bonuses = screen.getAllByText(/\+2/);
      expect(bonuses.length).toBeGreaterThanOrEqual(2);
    });

    it('displays bonus clearly in UI next to score', () => {
      const draftWithBonus = {
        ...mockDraft,
        race: { id: 'dwarf', name: 'Dwarf', racialBonuses: { con: 2 } },
        abilityScores: { str: 10, dex: 10, con: 13, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={draftWithBonus} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should clearly show: 13 + 2 = 15 (or similar format)
      expect(screen.getByText(/base:\s*13/i)).toBeInTheDocument();
      expect(screen.getByText(/\+2\s*racial/i)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  // ===== SKILLS GRID (6 tests) =====
  describe('Skills Grid', () => {
    it('renders all 18 skills', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const skills = [
        'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
        'Deception', 'History', 'Insight', 'Intimidation',
        'Investigation', 'Medicine', 'Nature', 'Perception',
        'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
        'Stealth', 'Survival'
      ];

      skills.forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
    });

    it('highlights proficient skills (gold color, maybe check mark)', () => {
      const draftWithSkills = {
        ...mockDraft,
        skills: ['athletics', 'perception']
      };

      render(<Step3AbilitiesSkills draft={draftWithSkills} updateDraft={mockUpdateDraft} errors={{}} />);

      const athleticsCheckbox = screen.getByLabelText(/athletics/i) as HTMLInputElement;
      expect(athleticsCheckbox.checked).toBe(true);
    });

    it('shows skill modifier: ability modifier + proficiency bonus', () => {
      const draftWithSkills = {
        ...mockDraft,
        abilityScores: { str: 14, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        skills: ['athletics'] // STR-based skill
      };

      render(<Step3AbilitiesSkills draft={draftWithSkills} updateDraft={mockUpdateDraft} errors={{}} />);

      // Athletics: STR modifier (+2 for 14) + proficiency (+2) = +4
      expect(screen.getByText(/\+4/)).toBeInTheDocument();
    });

    it('can toggle skills (checkbox or click)', async () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const athleticsCheckbox = screen.getByLabelText(/athletics/i);
      fireEvent.click(athleticsCheckbox);

      await waitFor(() => {
        expect(mockUpdateDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: expect.arrayContaining(['athletics'])
          })
        );
      });
    });

    it('count matches class limit (e.g., Fighter = 2, Rogue = 4)', async () => {
      const fighterDraft = {
        ...mockDraft,
        class: { id: 'fighter', name: 'Fighter', skillLimit: 2 },
        skills: ['athletics', 'perception']
      };

      render(<Step3AbilitiesSkills draft={fighterDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Try to add a 3rd skill
      const acrobaticsCheckbox = screen.getByLabelText(/acrobatics/i);
      fireEvent.click(acrobaticsCheckbox);

      await waitFor(() => {
        // Should show warning or prevent selection
        expect(screen.getByText(/maximum.*skills/i)).toBeInTheDocument();
      });
    });

    it('background skills auto-selected (cannot deselect)', () => {
      const soldierDraft = {
        ...mockDraft,
        background: {
          id: 'soldier',
          name: 'Soldier',
          skills: ['athletics', 'intimidation']
        },
        skills: ['athletics', 'intimidation']
      };

      render(<Step3AbilitiesSkills draft={soldierDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const athleticsCheckbox = screen.getByLabelText(/athletics/i) as HTMLInputElement;

      // Should be checked and disabled (or show "BG" tag)
      expect(athleticsCheckbox.checked).toBe(true);
      const bgTags = screen.getAllByText('BG');
      expect(bgTags.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===== STATS PREVIEW (3 tests) =====
  describe('Stats Preview', () => {
    it('shows proficiency bonus (+2 at level 1)', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      expect(screen.getByText(/proficiency bonus/i)).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('calculates HP: hit die + CON modifier', () => {
      const draftWithCon = {
        ...mockDraft,
        class: { id: 'fighter', name: 'Fighter', hitDie: 10, skillLimit: 2 },
        abilityScores: { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={draftWithCon} updateDraft={mockUpdateDraft} errors={{}} />);

      // HP = 10 (hit die) + 2 (CON modifier for 14) = 12
      expect(screen.getByText(/hit points/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('shows AC if armor available (placeholder 10 for now)', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      expect(screen.getByText(/armor class/i)).toBeInTheDocument();
      const acElements = screen.getAllByText('10');
      expect(acElements.length).toBeGreaterThan(0);
    });
  });

  // ===== POINT BUDGET SYSTEM (5 tests) =====
  describe('Point Budget System', () => {
    it('starting budget is 27 points', () => {
      const freshDraft = {
        ...mockDraft,
        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={freshDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // All 10s = 12 points spent, 15 remaining
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('costs increase per point (8-9 = 1 point cost, 13-14 = 3 points, 15 = 4 points total)', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // Should display cost table or show costs per ability
      const costElements = screen.getAllByText(/cost/i);
      expect(costElements.length).toBeGreaterThanOrEqual(6); // One per ability
    });

    it('budget display updates in real-time', async () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const strSlider = screen.getByLabelText(/strength/i);

      // Initial: 15 points remaining
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();

      // Change STR to 15 (9 points)
      fireEvent.change(strSlider, { target: { value: '15' } });

      await waitFor(() => {
        // Should now show 8 points remaining (15 - 7 extra points)
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });

    it('red warning when budget exceeded', () => {
      const overBudgetDraft = {
        ...mockDraft,
        abilityScores: { str: 15, dex: 15, con: 15, int: 15, wis: 8, cha: 8 }
      };

      render(<Step3AbilitiesSkills draft={overBudgetDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // 4×9 + 2×0 = 36 points (exceeds 27)
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/exceeded/i)).toBeInTheDocument();
    });

    it('green success when budget exactly 27', () => {
      const exactBudgetDraft = {
        ...mockDraft,
        abilityScores: { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 }
      };

      render(<Step3AbilitiesSkills draft={exactBudgetDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      // 3×9 = 27 points exactly
      expect(screen.getByText(/points remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/perfect.*budget/i)).toBeInTheDocument();
    });
  });

  // ===== REAL-TIME CALCULATIONS (4 tests) =====
  describe('Real-Time Calculations', () => {
    it('modifier updates instantly as slider moves', async () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const strSlider = screen.getByLabelText(/strength/i);

      // Change STR to 15, modifier +2
      fireEvent.change(strSlider, { target: { value: '15' } });

      await waitFor(() => {
        const modifiers = screen.getAllByText('+2');
        expect(modifiers.length).toBeGreaterThan(0);
      });
    });

    it('stats preview updates instantly', async () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const conSlider = screen.getByLabelText(/constitution/i);

      // Increase CON (should update HP)
      fireEvent.change(conSlider, { target: { value: '14' } });

      await waitFor(() => {
        // HP should increase by CON modifier
        expect(screen.getByText(/hit points/i)).toBeInTheDocument();
      });
    });

    it('racial bonus calculated correctly', () => {
      const draftWithBonus = {
        ...mockDraft,
        race: { id: 'dwarf', name: 'Dwarf', racialBonuses: { con: 2 } },
        abilityScores: { str: 10, dex: 10, con: 13, int: 10, wis: 10, cha: 10 }
      };

      render(<Step3AbilitiesSkills draft={draftWithBonus} updateDraft={mockUpdateDraft} errors={{}} />);

      // CON: 13 base + 2 racial = 15 final, modifier +2
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText(/\+2\s*racial/i)).toBeInTheDocument();
    });

    it('proficiency bonus shows correctly', () => {
      render(<Step3AbilitiesSkills draft={mockDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      expect(screen.getByText(/proficiency bonus/i)).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });

  // ===== NAVIGATION (2 tests) =====
  describe('Navigation', () => {
    it('next button disabled if budget exceeded', () => {
      const overBudgetDraft = {
        ...mockDraft,
        abilityScores: { str: 15, dex: 15, con: 15, int: 15, wis: 8, cha: 8 }
      };

      render(<Step3AbilitiesSkills draft={overBudgetDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('next button enabled if budget valid (exactly 27) and skills selected', () => {
      const validDraft = {
        ...mockDraft,
        abilityScores: { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 },
        skills: ['athletics', 'perception'],
        class: { id: 'fighter', name: 'Fighter', skillLimit: 2 }
      };

      render(<Step3AbilitiesSkills draft={validDraft} updateDraft={mockUpdateDraft} errors={{}} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });
});
