/**
 * API Client for Nuaibria Backend
 * Connects TUI to Express backend server
 */

import axios, { AxiosInstance } from 'axios';
import type { Character, WorldMap, ChatMessage } from '../types/index.js';

export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000, // 5 second timeout for connection checks
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get the base URL for the API client
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get all characters for a user by email
   */
  async getUserCharacters(email: string): Promise<Character[]> {
    try {
      const response = await this.client.get(`/api/characters/user/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get character data
   */
  async getCharacter(characterId: string): Promise<Character> {
    const response = await this.client.get(`/api/characters/${characterId}`);
    return response.data;
  }

  /**
   * Get world map data
   */
  async getWorldMap(): Promise<WorldMap> {
    const response = await this.client.get('/api/map');
    return response.data;
  }

  /**
   * Send chat message to The Chronicler (AI DM)
   */
  async sendChatMessage(characterId: string, message: string): Promise<ChatMessage> {
    const response = await this.client.post('/api/chat', {
      characterId,
      message,
    });
    return response.data;
  }

  /**
   * Stream chat response from The Chronicler
   * Uses Server-Sent Events (SSE) for real-time streaming
   */
  async streamChatMessage(
    characterId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullMessage: ChatMessage) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullMessage = '';

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
                id: Date.now().toString(),
                sender: 'chronicler',
                content: fullMessage,
                timestamp: Date.now(),
              });
              return;
            }
            fullMessage += data;
            onChunk(data);
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Create a new character
   */
  async createCharacter(characterData: Partial<Character>): Promise<Character> {
    const response = await this.client.post('/api/characters', characterData);
    return response.data;
  }

  /**
   * Update character data
   */
  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character> {
    const response = await this.client.patch(`/api/characters/${characterId}`, updates);
    return response.data;
  }

  /**
   * Health check - verifies backend is running and accessible
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      // Log the specific error for debugging
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.error(`\nConnection refused: Backend not listening on ${this.baseUrl}`);
        } else if (error.code === 'ETIMEDOUT') {
          console.error(`\nConnection timeout: Backend at ${this.baseUrl} not responding`);
        } else {
          console.error(`\nConnection error: ${error.message}`);
        }
      }
      return false;
    }
  }
}
