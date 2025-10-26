/**
 * @fileoverview TDD Tests for Step 5: Review & Confirm Component
 * Task 2.5a - Character Review Tests (18 tests, RED phase)
 *
 * Test Coverage:
 * - Character Card Display (5 tests)
 * - Edit Section Tests (4 tests)
 * - Modification Tests (3 tests)
 * - Submit Tests (4 tests)
 * - Error Handling Tests (2 tests)
 *
 * TOTAL: 18 tests
 *
 * RED PHASE: All tests SHOULD FAIL initially - implementation comes after.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CharacterDraftProvider } from '../../../../context/CharacterDraftContextV2';
import type {
  Race,
  CharacterClass,
  Background,
  Alignment,
  SkillName,
} from '../../../../types/wizard';
import type { AbilityScores } from '../../../../types';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test fixtures - Complete character draft
const completeCharacterDraft = {
  // Step 1: Hero Concept
  name: 'Thorin Oakenshield',
  race: 'Dwarf' as Race,
  class: 'Fighter' as CharacterClass,
  background: 'Soldier' as Background,

  // Step 2: Core Identity
  alignment: 'Lawful Good' as Alignment,
  gender: 'Male',
  personalityTraits: ['Brave', 'Loyal', 'Determined'],
  ideals: ['Honor', 'Courage'],
  bonds: ['Protect my clan', 'Reclaim my homeland'],
  flaws: ['Stubborn', 'Distrustful of magic'],

  // Step 3: Abilities & Skills
  abilityScores: {
    STR: 15, // +2 modifier
    DEX: 14, // +2 modifier
    CON: 13, // +1 modifier
    INT: 12, // +1 modifier
    WIS: 10, // +0 modifier
    CHA: 8,  // -1 modifier
  } as AbilityScores,
  proficientSkills: ['Athletics', 'Intimidation'] as SkillName[],

  // Step 4: Loadout
  equipment: ['Chain Mail', 'Longsword', 'Shield', 'Backpack'],
  startingGold: 125,
  avatarUrl: '/avatars/thorin.png',
};

// Mock component (will fail until implemented)
let Step5Review: any;

try {
  // Try importing the actual component
  Step5Review = (await import('./Step5Review')).default;
} catch (error) {
  // Expected to fail in RED phase - provide mock
  Step5Review = () => (
    <div data-testid="step5-review-mock">Step5Review not implemented yet</div>
  );
}

// ============================================================================
// CHARACTER CARD DISPLAY TESTS (5 tests)
// ============================================================================

describe('Step5Review - Character Card Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should display hero info: name, race, class, background', () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Should display all hero concept fields
    expect(screen.getByText('Thorin Oakenshield')).toBeInTheDocument();
    expect(screen.getByText(/Dwarf/i)).toBeInTheDocument();
    expect(screen.getByText(/Fighter/i)).toBeInTheDocument();
    expect(screen.getByText(/Soldier/i)).toBeInTheDocument();
  });

  it('should display identity info: alignment, backstory, gender, portrait', () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Alignment
    expect(screen.getByText(/Lawful Good/i)).toBeInTheDocument();

    // Gender
    expect(screen.getByText(/Male/i)).toBeInTheDocument();

    // Backstory elements
    expect(screen.getByText(/Brave/i)).toBeInTheDocument();
    expect(screen.getByText(/Honor/i)).toBeInTheDocument();
    expect(screen.getByText(/Protect my clan/i)).toBeInTheDocument();
    expect(screen.getByText(/Stubborn/i)).toBeInTheDocument();

    // Portrait image
    const portrait = screen.getByRole('img', { name: /character portrait/i });
    expect(portrait).toHaveAttribute('src', '/avatars/thorin.png');
  });

  it('should display abilities: STR, DEX, CON, INT, WIS, CHA with modifiers', () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Check ability scores are displayed
    expect(screen.getByText(/STR/i)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument(); // STR score
    expect(screen.getByText(/\+2/)).toBeInTheDocument(); // STR modifier

    expect(screen.getByText(/DEX/i)).toBeInTheDocument();
    expect(screen.getByText(/14/)).toBeInTheDocument(); // DEX score

    expect(screen.getByText(/CON/i)).toBeInTheDocument();
    expect(screen.getByText(/13/)).toBeInTheDocument(); // CON score

    expect(screen.getByText(/INT/i)).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument(); // INT score

    expect(screen.getByText(/WIS/i)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument(); // WIS score

    expect(screen.getByText(/CHA/i)).toBeInTheDocument();
    expect(screen.getByText(/8/)).toBeInTheDocument(); // CHA score
    expect(screen.getByText(/-1/)).toBeInTheDocument(); // CHA modifier
  });

  it('should display equipment: selected gear + appearance description', () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Check equipment items are listed
    expect(screen.getByText(/Chain Mail/i)).toBeInTheDocument();
    expect(screen.getByText(/Longsword/i)).toBeInTheDocument();
    expect(screen.getByText(/Shield/i)).toBeInTheDocument();
    expect(screen.getByText(/Backpack/i)).toBeInTheDocument();

    // Check starting gold
    expect(screen.getByText(/125/)).toBeInTheDocument();
    expect(screen.getByText(/gold/i)).toBeInTheDocument();
  });

  it('should display proficiency bonus and HP calculation', () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Proficiency bonus at level 1 is +2
    expect(screen.getByText(/Proficiency Bonus/i)).toBeInTheDocument();
    expect(screen.getByText(/\+2/)).toBeInTheDocument();

    // HP calculation: Fighter hit die (d10) + CON modifier (+1)
    // At level 1: 10 + 1 = 11 HP
    expect(screen.getByText(/Hit Points/i)).toBeInTheDocument();
    expect(screen.getByText(/11/)).toBeInTheDocument();

    // Also check proficient skills
    expect(screen.getByText(/Athletics/i)).toBeInTheDocument();
    expect(screen.getByText(/Intimidation/i)).toBeInTheDocument();
  });
});

// ============================================================================
// EDIT SECTION TESTS (4 tests)
// ============================================================================

describe('Step5Review - Edit Section Expansion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render "Edit Hero" button that expands Step 1 fields', async () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Find and click "Edit Hero" button
    const editHeroBtn = screen.getByRole('button', { name: /edit hero/i });
    expect(editHeroBtn).toBeInTheDocument();

    fireEvent.click(editHeroBtn);

    // Should expand to show editable Step 1 fields
    await waitFor(() => {
      expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/race/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/background/i)).toBeInTheDocument();
    });
  });

  it('should render "Edit Identity" button that expands Step 2 fields', async () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Find and click "Edit Identity" button
    const editIdentityBtn = screen.getByRole('button', { name: /edit identity/i });
    expect(editIdentityBtn).toBeInTheDocument();

    fireEvent.click(editIdentityBtn);

    // Should expand to show editable Step 2 fields
    await waitFor(() => {
      expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/personality traits/i)).toBeInTheDocument();
    });
  });

  it('should render "Edit Abilities" button that expands Step 3 fields', async () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Find and click "Edit Abilities" button
    const editAbilitiesBtn = screen.getByRole('button', { name: /edit abilities/i });
    expect(editAbilitiesBtn).toBeInTheDocument();

    fireEvent.click(editAbilitiesBtn);

    // Should expand to show ability score inputs
    await waitFor(() => {
      expect(screen.getByLabelText(/Strength/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dexterity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Constitution/i)).toBeInTheDocument();
      // Should also show skill selection
      expect(screen.getByText(/Select Skills/i)).toBeInTheDocument();
    });
  });

  it('should render "Edit Loadout" button that expands Step 4 fields', async () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Find and click "Edit Loadout" button
    const editLoadoutBtn = screen.getByRole('button', { name: /edit loadout/i });
    expect(editLoadoutBtn).toBeInTheDocument();

    fireEvent.click(editLoadoutBtn);

    // Should expand to show equipment selection
    await waitFor(() => {
      expect(screen.getByText(/Select Equipment/i)).toBeInTheDocument();
      expect(screen.getByText(/Starting Gold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/portrait/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// MODIFICATION TESTS (3 tests)
// ============================================================================

describe('Step5Review - Field Modifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow modifying field in expanded section', async () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Expand Hero section
    const editHeroBtn = screen.getByRole('button', { name: /edit hero/i });
    fireEvent.click(editHeroBtn);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/character name/i);
      expect(nameInput).toBeInTheDocument();

      // Modify the name
      fireEvent.change(nameInput, { target: { value: 'Gimli Gloinsson' } });

      // Input should reflect new value
      expect(nameInput).toHaveValue('Gimli Gloinsson');
    });
  });

  it('should update context with new value when field modified', async () => {
    const { container } = render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Expand Identity section
    const editIdentityBtn = screen.getByRole('button', { name: /edit identity/i });
    fireEvent.click(editIdentityBtn);

    await waitFor(() => {
      const genderInput = screen.getByLabelText(/gender/i);

      // Change gender
      fireEvent.change(genderInput, { target: { value: 'Female' } });

      // Verify context was updated by checking if it persists
      expect(genderInput).toHaveValue('Female');
    });
  });

  it('should show updated value in collapsed view after modification', async () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    // Expand Abilities section
    const editAbilitiesBtn = screen.getByRole('button', { name: /edit abilities/i });
    fireEvent.click(editAbilitiesBtn);

    await waitFor(async () => {
      const strInput = screen.getByLabelText(/Strength/i);

      // Modify STR from 15 to 14
      fireEvent.change(strInput, { target: { value: '14' } });

      // Collapse section (click edit button again or click "Save")
      const saveBtn = screen.getByRole('button', { name: /save|collapse/i });
      fireEvent.click(saveBtn);

      // Wait for collapse and verify updated value is shown
      await waitFor(() => {
        // STR should now show 14 instead of 15
        const strDisplay = screen.getAllByText(/14/);
        expect(strDisplay.length).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================================
// SUBMIT TESTS (4 tests)
// ============================================================================

describe('Step5Review - Character Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it('should render "Create Character" button', () => {
    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create character/i });
    expect(createBtn).toBeInTheDocument();
    expect(createBtn).not.toBeDisabled();
  });

  it('should call POST /api/characters with complete character data when submitted', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'char_12345',
        name: 'Thorin Oakenshield',
        message: 'Character created successfully',
      }),
    });

    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create character/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/characters',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Thorin Oakenshield'),
        })
      );

      // Verify body contains all required fields
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toHaveProperty('name', 'Thorin Oakenshield');
      expect(body).toHaveProperty('race', 'Dwarf');
      expect(body).toHaveProperty('class', 'Fighter');
      expect(body).toHaveProperty('background', 'Soldier');
      expect(body).toHaveProperty('alignment', 'Lawful Good');
      expect(body).toHaveProperty('ability_scores');
      expect(body).toHaveProperty('proficient_skills');
      expect(body).toHaveProperty('equipment');
    });
  });

  it('should show loading spinner during submission', async () => {
    // Mock slow API response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ id: 'char_12345', name: 'Thorin' }),
              }),
            1000
          )
        )
    );

    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create character/i });
    fireEvent.click(createBtn);

    // Should show loading state immediately
    await waitFor(() => {
      expect(screen.getByText(/creating character/i)).toBeInTheDocument();
      // Or loading spinner
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    // Button should be disabled during submission
    expect(createBtn).toBeDisabled();
  });

  it('should show success message with character ID after submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'char_12345',
        name: 'Thorin Oakenshield',
        message: 'Character created successfully',
      }),
    });

    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create character/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      // Should show success message
      expect(screen.getByText(/character created successfully/i)).toBeInTheDocument();

      // Should show character ID
      expect(screen.getByText(/char_12345/i)).toBeInTheDocument();

      // Should show link or button to view character
      expect(screen.getByRole('link', { name: /view character|go to character/i })).toBeInTheDocument();
    });
  });
});

// ============================================================================
// ERROR HANDLING TESTS (2 tests)
// ============================================================================

describe('Step5Review - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should show error message if API call fails', async () => {
    mockFetch.mockRejectedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Internal server error',
        message: 'Failed to create character',
      }),
    });

    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create character/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      // Should show error message
      expect(screen.getByText(/failed to create character/i)).toBeInTheDocument();

      // Should show error details
      expect(screen.getByText(/internal server error|something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should show "Retry" button after error to resubmit', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });

    render(
      <CharacterDraftProvider>
        <Step5Review />
      </CharacterDraftProvider>
    );

    const createBtn = screen.getByRole('button', { name: /create character/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText(/failed to create character/i)).toBeInTheDocument();
    });

    // Should show retry button
    const retryBtn = screen.getByRole('button', { name: /retry|try again/i });
    expect(retryBtn).toBeInTheDocument();

    // Mock success on retry
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'char_67890',
        name: 'Thorin Oakenshield',
      }),
    });

    // Click retry
    fireEvent.click(retryBtn);

    await waitFor(() => {
      // Should show success message after retry
      expect(screen.getByText(/character created successfully/i)).toBeInTheDocument();
    });
  });
});
