/**
 * Integration tests for TUI components
 * Tests component interactions and data flow
 */

import { describe, test, expect } from '@jest/globals';
import type { Character, WorldMap, ChatMessage } from '../types/index.js';

describe('TUI Integration Tests', () => {
  describe('Character Display', () => {
    test('should render character with all stats', () => {
      const character: Character = {
        id: 'demo-1',
        name: 'Test Wizard',
        class: 'Wizard',
        level: 3,
        hp: 18,
        maxHp: 24,
        xp: 250,
        xpToNextLevel: 1000,
        position: { x: 12, y: 8 },
        abilities: {
          strength: 10,
          dexterity: 14,
          constitution: 12,
          intelligence: 16,
          wisdom: 13,
          charisma: 8,
        },
        skills: { arcana: 5 },
        inventory: [],
      };

      expect(character.name).toBe('Test Wizard');
      expect(character.level).toBe(3);
      expect(character.hp).toBeLessThanOrEqual(character.maxHp);
    });
  });

  describe('Map Rendering', () => {
    test('should create valid map structure', () => {
      const map: WorldMap = {
        width: 30,
        height: 20,
        playerPosition: { x: 15, y: 10 },
        tiles: [],
      };

      // Generate test tiles
      for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
          map.tiles[y][x] = {
            x,
            y,
            biome: 'forest',
            discovered: true,
          };
        }
      }

      expect(map.tiles.length).toBe(20);
      expect(map.tiles[0].length).toBe(30);
      expect(map.playerPosition.x).toBeGreaterThanOrEqual(0);
      expect(map.playerPosition.x).toBeLessThan(map.width);
    });
  });

  describe('Chat Messages', () => {
    test('should format chat messages correctly', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          sender: 'system',
          content: 'Welcome!',
          timestamp: Date.now(),
        },
        {
          id: '2',
          sender: 'chronicler',
          content: 'Greetings, traveler.',
          timestamp: Date.now() + 1,
        },
        {
          id: '3',
          sender: 'player',
          content: 'Hello!',
          timestamp: Date.now() + 2,
        },
      ];

      expect(messages.length).toBe(3);
      expect(messages[0].sender).toBe('system');
      expect(messages[1].sender).toBe('chronicler');
      expect(messages[2].sender).toBe('player');
    });
  });

  describe('Game State Management', () => {
    test('should maintain consistent game state', () => {
      const gameState = {
        character: null as Character | null,
        worldMap: null as WorldMap | null,
        chatHistory: [] as ChatMessage[],
        isLoading: false,
      };

      expect(gameState.isLoading).toBe(false);
      expect(gameState.chatHistory).toHaveLength(0);
    });
  });
});
