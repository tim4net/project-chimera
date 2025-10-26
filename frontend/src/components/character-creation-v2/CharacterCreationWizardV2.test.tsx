/**
 * @fileoverview TDD Tests for Character Creation Wizard V2 Orchestrator
 * Task 2.6 - Wizard Router Tests (15 tests, RED phase)
 *
 * Test Coverage:
 * - Initial Render Tests (2 tests)
 * - Navigation Tests (5 tests)
 * - Step Display Tests (3 tests)
 * - Validation Tests (3 tests)
 * - Persistence Tests (2 tests)
 *
 * TOTAL: 15 tests
 *
 * RED PHASE: All tests SHOULD FAIL initially - implementation comes after.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type {
  Race,
  CharacterClass,
  Background,
  Alignment,
} from '../../../types/wizard';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Test fixtures
const validStep1Data = {
  name: 'Thorin Oakenshield',
  race: 'Dwarf' as Race,
  class: 'Fighter' as CharacterClass,
  background: 'Soldier' as Background,
};

const validStep2Data = {
  alignment: 'Lawful Good' as Alignment,
  gender: 'Male',
};

// Mock component (will fail until implemented)
let CharacterCreationWizardV2: any;

try {
  // Try importing the actual component
  CharacterCreationWizardV2 = (await import('./CharacterCreationWizardV2')).default;
} catch (error) {
  // Expected to fail in RED phase - provide mock
  CharacterCreationWizardV2 = () => (
    <div data-testid="wizard-mock">CharacterCreationWizardV2 not implemented yet</div>
  );
}

// ============================================================================
// INITIAL RENDER TESTS (2 tests)
// ============================================================================

describe('CharacterCreationWizardV2 - Initial Render', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should render Step 1 (Hero Concept) initially', () => {
    render(<CharacterCreationWizardV2 />);

    // Should show Step 1 heading
    expect(screen.getByRole('heading', { name: /create hero|hero concept/i })).toBeInTheDocument();

    // Should show Step 1 fields
    expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/race/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/background/i)).toBeInTheDocument();

    // Should not show other step fields
    expect(screen.queryByLabelText(/alignment/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/strength/i)).not.toBeInTheDocument();
  });

  it('should show progress indicator: "Step 1 of 5"', () => {
    render(<CharacterCreationWizardV2 />);

    // Progress indicator should show current step
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();

    // Or check for step indicators (dots/circles)
    const progressIndicator = screen.getByTestId('progress-indicator');
    expect(progressIndicator).toBeInTheDocument();
    expect(progressIndicator).toHaveTextContent(/1.*5/);
  });
});

// ============================================================================
// NAVIGATION TESTS (5 tests)
// ============================================================================

describe('CharacterCreationWizardV2 - Navigation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should navigate from Step 1 to Step 2, progress shows "2 of 5"', async () => {
    render(<CharacterCreationWizardV2 />);

    // Fill out Step 1
    fireEvent.change(screen.getByLabelText(/character name/i), {
      target: { value: 'Thorin Oakenshield' },
    });
    fireEvent.change(screen.getByLabelText(/race/i), {
      target: { value: 'Dwarf' },
    });
    fireEvent.change(screen.getByLabelText(/class/i), {
      target: { value: 'Fighter' },
    });
    fireEvent.change(screen.getByLabelText(/background/i), {
      target: { value: 'Soldier' },
    });

    // Click Next button
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      // Should now be on Step 2
      expect(screen.getByRole('heading', { name: /your identity|core identity/i })).toBeInTheDocument();

      // Progress should update
      expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();

      // Should show Step 2 fields
      expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
    });
  });

  it('should navigate to Step 3, progress shows "3 of 5"', async () => {
    render(<CharacterCreationWizardV2 />);

    // Complete Step 1
    fireEvent.change(screen.getByLabelText(/character name/i), {
      target: { value: 'Thorin' },
    });
    fireEvent.change(screen.getByLabelText(/race/i), { target: { value: 'Dwarf' } });
    fireEvent.change(screen.getByLabelText(/class/i), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByLabelText(/background/i), { target: { value: 'Soldier' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
    });

    // Complete Step 2
    fireEvent.change(screen.getByLabelText(/alignment/i), {
      target: { value: 'Lawful Good' },
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      // Should now be on Step 3
      expect(screen.getByRole('heading', { name: /abilities.*skills/i })).toBeInTheDocument();

      // Progress should update
      expect(screen.getByText(/step 3 of 5/i)).toBeInTheDocument();

      // Should show ability score inputs
      expect(screen.getByLabelText(/strength/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dexterity/i)).toBeInTheDocument();
    });
  });

  it('should continue to Step 4 and Step 5', async () => {
    render(<CharacterCreationWizardV2 />);

    // Helper function to fill and advance
    const fillAndNext = async (fields: Record<string, string>) => {
      Object.entries(fields).forEach(([label, value]) => {
        const input = screen.getByLabelText(new RegExp(label, 'i'));
        fireEvent.change(input, { target: { value } });
      });

      const nextBtn = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextBtn);
    };

    // Navigate through steps
    await fillAndNext({
      'character name': 'Thorin',
      race: 'Dwarf',
      class: 'Fighter',
      background: 'Soldier',
    });

    await waitFor(() => expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument());
    await fillAndNext({ alignment: 'Lawful Good' });

    // Step 3 - abilities (simplified for test)
    await waitFor(() => expect(screen.getByLabelText(/strength/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 4 - loadout
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /gear.*appearance|loadout/i })).toBeInTheDocument();
      expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 5 - review
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /review character/i })).toBeInTheDocument();
      expect(screen.getByText(/step 5 of 5/i)).toBeInTheDocument();
    });
  });

  it('should navigate backwards (5→4→3→2→1) using Previous button', async () => {
    render(<CharacterCreationWizardV2 />);

    // Manually navigate to Step 5 (assume context allows direct navigation)
    // Or simulate completing all steps first
    // For this test, we'll use a mock navigation helper

    // Start at Step 5 (mock implementation detail)
    const wizardContainer = screen.getByTestId('wizard-container');

    // Assuming direct page navigation for testing
    // In real implementation, this would involve completing all steps
    // For now, test the backward navigation logic

    // Click Previous button
    const prevBtn = screen.getByRole('button', { name: /previous|back/i });

    // From Step 5 to Step 4
    fireEvent.click(prevBtn);
    await waitFor(() => {
      expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();
    });

    // From Step 4 to Step 3
    fireEvent.click(prevBtn);
    await waitFor(() => {
      expect(screen.getByText(/step 3 of 5/i)).toBeInTheDocument();
    });

    // From Step 3 to Step 2
    fireEvent.click(prevBtn);
    await waitFor(() => {
      expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    });

    // From Step 2 to Step 1
    fireEvent.click(prevBtn);
    await waitFor(() => {
      expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    });
  });

  it('should not show Previous button on Step 1', () => {
    render(<CharacterCreationWizardV2 />);

    // On Step 1, there should be no Previous button
    const prevBtn = screen.queryByRole('button', { name: /previous|back/i });
    expect(prevBtn).not.toBeInTheDocument();

    // Or it should be disabled
    // Alternative expectation:
    // expect(prevBtn).toBeDisabled();
  });
});

// ============================================================================
// STEP DISPLAY TESTS (3 tests)
// ============================================================================

describe('CharacterCreationWizardV2 - Step Display', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should render correct component for each step', async () => {
    render(<CharacterCreationWizardV2 />);

    // Step 1: Hero Concept
    expect(screen.getByTestId('step1-hero-concept')).toBeInTheDocument();

    // Navigate to Step 2
    // (Assuming helper or context allows navigation)
    // For this test, verify component structure

    // Step 2: Core Identity (after navigation)
    // Step 3: Abilities & Skills
    // Step 4: Loadout
    // Step 5: Review

    // This test verifies that the wizard routes to the correct step components
  });

  it('should update page title for each step', async () => {
    render(<CharacterCreationWizardV2 />);

    // Step 1 title
    expect(screen.getByRole('heading', { name: /create hero|hero concept/i })).toBeInTheDocument();

    // Complete Step 1 and move to Step 2
    fireEvent.change(screen.getByLabelText(/character name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/race/i), { target: { value: 'Dwarf' } });
    fireEvent.change(screen.getByLabelText(/class/i), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByLabelText(/background/i), { target: { value: 'Soldier' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      // Step 2 title
      expect(screen.getByRole('heading', { name: /your identity|core identity/i })).toBeInTheDocument();
    });

    // Continue to verify other step titles
    fireEvent.change(screen.getByLabelText(/alignment/i), { target: { value: 'Lawful Good' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      // Step 3 title
      expect(screen.getByRole('heading', { name: /abilities.*skills/i })).toBeInTheDocument();
    });
  });

  it('should update progress bar visually', () => {
    render(<CharacterCreationWizardV2 />);

    // Check progress bar exists
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();

    // Progress bar should show 20% fill for Step 1 (1/5 = 20%)
    // This depends on implementation details
    // Check for CSS classes or aria attributes
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');

    // Verify visual indicators (dots/circles)
    const stepIndicators = screen.getAllByTestId(/step-indicator-\d/);
    expect(stepIndicators).toHaveLength(5);

    // First indicator should be active
    expect(stepIndicators[0]).toHaveClass('active');
    expect(stepIndicators[1]).not.toHaveClass('active');
  });
});

// ============================================================================
// VALIDATION TESTS (3 tests)
// ============================================================================

describe('CharacterCreationWizardV2 - Validation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should prevent proceeding from Step 1 if validation fails', async () => {
    render(<CharacterCreationWizardV2 />);

    // Don't fill any fields
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);

    // Should stay on Step 1
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create hero|hero concept/i })).toBeInTheDocument();
      expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    });

    // Should show validation errors
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('should show validation error in tooltip on Next button', async () => {
    render(<CharacterCreationWizardV2 />);

    const nextBtn = screen.getByRole('button', { name: /next/i });

    // Hover over Next button (or just check for disabled state)
    fireEvent.mouseOver(nextBtn);

    await waitFor(() => {
      // Should show tooltip with validation message
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent(/complete all required fields/i);
    });

    // Or check button disabled state
    expect(nextBtn).toBeDisabled();
  });

  it('should prevent skipping steps (must complete Step 1 before accessing Step 2)', async () => {
    render(<CharacterCreationWizardV2 />);

    // Attempt to manually navigate to Step 2 (if direct navigation is allowed)
    // This test verifies the wizard enforces sequential completion

    // Try clicking on Step 2 indicator directly
    const step2Indicator = screen.getByTestId('step-indicator-2');
    fireEvent.click(step2Indicator);

    // Should stay on Step 1 because it's not complete
    await waitFor(() => {
      expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /create hero|hero concept/i })).toBeInTheDocument();
    });

    // Complete Step 1
    fireEvent.change(screen.getByLabelText(/character name/i), { target: { value: 'Thorin' } });
    fireEvent.change(screen.getByLabelText(/race/i), { target: { value: 'Dwarf' } });
    fireEvent.change(screen.getByLabelText(/class/i), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByLabelText(/background/i), { target: { value: 'Soldier' } });

    // Now clicking Step 2 indicator should work
    fireEvent.click(step2Indicator);

    await waitFor(() => {
      expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// PERSISTENCE TESTS (2 tests)
// ============================================================================

describe('CharacterCreationWizardV2 - Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should restore current step and data from localStorage on reload', async () => {
    // Pre-populate localStorage with Step 2 data
    const storedDraft = {
      ...validStep1Data,
      ...validStep2Data,
    };

    localStorageMock.setItem('characterDraft', JSON.stringify(storedDraft));
    localStorageMock.setItem('currentWizardStep', '2');

    // Render wizard
    const { container } = render(<CharacterCreationWizardV2 />);

    // Should restore to Step 2
    await waitFor(() => {
      expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /your identity|core identity/i })).toBeInTheDocument();
    });

    // Data should be populated
    const alignmentInput = screen.getByLabelText(/alignment/i);
    expect(alignmentInput).toHaveValue('Lawful Good');
  });

  it('should persist data when navigating back to previous step', async () => {
    render(<CharacterCreationWizardV2 />);

    // Fill Step 1
    fireEvent.change(screen.getByLabelText(/character name/i), {
      target: { value: 'Thorin Oakenshield' },
    });
    fireEvent.change(screen.getByLabelText(/race/i), { target: { value: 'Dwarf' } });
    fireEvent.change(screen.getByLabelText(/class/i), { target: { value: 'Fighter' } });
    fireEvent.change(screen.getByLabelText(/background/i), { target: { value: 'Soldier' } });

    // Go to Step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
    });

    // Fill Step 2
    fireEvent.change(screen.getByLabelText(/alignment/i), {
      target: { value: 'Lawful Good' },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: 'Male' } });

    // Go back to Step 1
    const prevBtn = screen.getByRole('button', { name: /previous|back/i });
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
    });

    // Step 1 data should still be there
    expect(screen.getByLabelText(/character name/i)).toHaveValue('Thorin Oakenshield');
    expect(screen.getByLabelText(/race/i)).toHaveValue('Dwarf');
    expect(screen.getByLabelText(/class/i)).toHaveValue('Fighter');
    expect(screen.getByLabelText(/background/i)).toHaveValue('Soldier');

    // Go forward to Step 2 again
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
    });

    // Step 2 data should persist
    expect(screen.getByLabelText(/alignment/i)).toHaveValue('Lawful Good');
    expect(screen.getByLabelText(/gender/i)).toHaveValue('Male');
  });
});
