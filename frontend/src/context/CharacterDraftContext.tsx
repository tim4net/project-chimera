/**
 * @fileoverview Re-export of character draft context for backward compatibility.
 * The actual implementation has been split into modular files under
 * context/characterDraft/ to maintain the 300-line file size limit.
 */

export { CharacterDraftProvider, useCharacterDraft } from './characterDraft';
export type { DraftState, DraftAction } from './characterDraft';
