/**
 * @fileoverview Step 4: Loadout (Equipment & Portrait)
 * STUB IMPLEMENTATION - Tests are written, implementation TODO
 *
 * This file is intentionally minimal to allow tests to run in RED phase.
 * Implementation will be completed in the next phase of TDD.
 */

import React from 'react';
import type { CharacterDraft } from '../../../../context/CharacterDraftContextV2';

interface Step4LoadoutProps {
  draft: Partial<CharacterDraft>;
  updateDraft: (data: Partial<CharacterDraft>) => void;
  errors: Record<string, string>;
}

/**
 * Step 4: Equipment & Portrait Selection
 * TODO: Implement based on passing tests
 */
export const Step4Loadout: React.FC<Step4LoadoutProps> = () => {
  // Suppress unused vars - this is intentional for stub
  // draft, updateDraft, and errors will be used in full implementation

  return (
    <div data-testid="step4-loadout">
      {/* TODO: Implement equipment presets */}
      {/* TODO: Implement equipment preview */}
      {/* TODO: Implement appearance input */}
      {/* TODO: Implement portrait generation */}
      {/* TODO: Implement portrait upload */}
      {/* TODO: Implement navigation buttons */}
      <p>Step 4: Loadout - Implementation pending</p>
    </div>
  );
};
