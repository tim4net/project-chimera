/**
 * @fileoverview Defines types related to the chat and DM interaction API.
 */

export interface ChatMessage {
  role: 'player' | 'dm' | 'system';
  content: string;
}

export interface DmApiResponse {
  response: string;
  stateChanges?: {
    position?: { x: number; y: number };
    hp?: number;
    xp?: number;
  };
  journalEntry?: {
    type: string;
    content: string;
  };
  triggerActivePhase?: boolean;
}

export interface DmApiRequestBody {
  characterId: string;
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ParsedDmResponse {
  narrative: string;
  jsonPayload: Omit<DmApiResponse, 'response'> | null;
}
