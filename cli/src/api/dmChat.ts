/**
 * DM Chat API Integration
 * Handles communication with The Chronicler (AI Dungeon Master)
 */

import axios, { type AxiosInstance } from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  role: 'player' | 'dm' | 'system';
  content: string;
}

export interface ActionResult {
  actionType: string;
  rolls?: Array<{
    type: string;
    result: number;
    details: string;
  }>;
  success?: boolean;
  details: string;
}

export interface StateChange {
  entityType: string;
  entityId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface ChatResponse {
  response: string; // Narrative from The Chronicler
  actionResults: ActionResult[]; // Dice rolls, success/failure
  stateChanges: StateChange[]; // HP changes, position updates, etc.
  triggerActivePhase: boolean; // Should we enter combat mode?
}

export interface SendMessageOptions {
  characterId: string;
  message: string;
  conversationHistory?: ChatMessage[];
  authToken?: string;
}

// ============================================================================
// DM CHAT CLIENT
// ============================================================================

export class DmChatClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 60000, // 60 second timeout for AI responses
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Send a message to The Chronicler and get a response
   */
  async sendMessage(options: SendMessageOptions): Promise<ChatResponse> {
    const { characterId, message, conversationHistory = [] } = options;

    try {
      const response = await this.client.post('/api/chat/dm', {
        characterId,
        message,
        conversationHistory,
      });

      return response.data as ChatResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (error.response?.status === 404) {
          throw new Error('Character not found.');
        } else if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
      }
      throw new Error('Failed to communicate with The Chronicler. Please try again.');
    }
  }

  /**
   * Stream a message to The Chronicler with real-time updates
   * Uses Server-Sent Events (SSE) for streaming responses
   */
  async streamMessage(
    options: SendMessageOptions,
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const { characterId, message, conversationHistory = [] } = options;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}/api/chat/dm/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          characterId,
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (response.status === 404) {
          throw new Error('Character not found.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let metadata: Partial<ChatResponse> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete({
                response: fullResponse,
                actionResults: metadata.actionResults || [],
                stateChanges: metadata.stateChanges || [],
                triggerActivePhase: metadata.triggerActivePhase || false,
              });
              return;
            }

            // Check if this is metadata (JSON)
            if (data.startsWith('{')) {
              try {
                const json = JSON.parse(data);
                if (json.actionResults) metadata.actionResults = json.actionResults;
                if (json.stateChanges) metadata.stateChanges = json.stateChanges;
                if (json.triggerActivePhase !== undefined) metadata.triggerActivePhase = json.triggerActivePhase;
              } catch {
                // Not JSON, treat as text
                fullResponse += data;
                onChunk(data);
              }
            } else {
              fullResponse += data;
              onChunk(data);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Get character data for context
   */
  async getCharacter(characterId: string): Promise<unknown> {
    try {
      const response = await this.client.get(`/api/characters/${characterId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Character not found.');
      }
      throw new Error('Failed to load character data.');
    }
  }
}

export default DmChatClient;
