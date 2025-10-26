/**
 * @fileoverview Step2CoreIdentity - STUB for TDD RED Phase
 * This is a minimal stub to allow tests to run and fail properly.
 * DO NOT IMPLEMENT - This is intentionally incomplete for TDD.
 */

import React from 'react';
import type { CharacterDraft } from '../../../../context/characterDraftV2/validation';

interface Step2CoreIdentityProps {
  draft: Partial<CharacterDraft>;
  updateDraft: (data: Partial<CharacterDraft>) => void;
}

const Step2CoreIdentity: React.FC<Step2CoreIdentityProps> = () => {
  // Minimal stub - tests should FAIL
  // draft and updateDraft props will be used in implementation
  return (
    <div data-testid="step2-core-identity">
      <h2>Step 2: Core Identity</h2>
      <p>NOT IMPLEMENTED - Tests are in RED phase</p>
    </div>
  );
};

export default Step2CoreIdentity;
