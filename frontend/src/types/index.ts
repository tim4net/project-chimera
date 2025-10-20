/**
 * @fileoverview Shared type definitions for the frontend application.
 */

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export type ChatMessageRole = 'player' | 'dm';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  // Optional: Add timestamp or ID if needed later
  // id?: string;
  // createdAt?: string;
}

// State change from the new secure backend architecture
export interface StateChange {
  entityType: 'character' | 'npc' | 'enemy';
  entityId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  source: {
    actionId: string;
    actionType: string;
  };
}

// Action result from the new secure backend architecture
export interface ActionResult {
  actionId: string;
  success: boolean;
  outcome: string;
  rolls?: Record<string, unknown>;
  stateChanges: StateChange[];
  narrativeContext: {
    summary: string;
    location?: string;
    enemyDefeated?: boolean;
    enemyCR?: number;
  };
  createJournalEntry: boolean;
  triggerActivePhase: boolean;
}

export interface DmApiResponse {
  response: string;
  actionResults?: ActionResult[]; // New secure architecture
  stateChanges?: StateChange[];   // New: array of state changes
  triggerActivePhase?: boolean;

  // Legacy fields for backward compatibility (not used by dmChatSecure)
  journalEntry?: {
    id: string;
    type: string;
    content: string;
    created_at: string;
  };
}

