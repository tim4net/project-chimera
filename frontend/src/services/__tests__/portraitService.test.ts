/**
 * @file portraitService.test.ts
 * @description Tests for portrait generation service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePortrait, generatePortraitMock } from '../portraitService';
import type { Character } from '../../types/wizard';

// Mock fetch globally
global.fetch = vi.fn();

describe('portraitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generatePortrait', () => {
    const mockCharacter: Partial<Character> = {
      name: 'Test Hero',
      race: 'Elf',
      class: 'Wizard',
      background: 'Sage',
      alignment: 'Neutral Good',
    };

    it('throws error if race is missing', async () => {
      const incompleteCharacter = {
        name: 'Test',
        class: 'Wizard',
        background: 'Sage',
      };

      await expect(
        generatePortrait({ character: incompleteCharacter })
      ).rejects.toThrow('Character must have race, class, and background');
    });

    it('throws error if class is missing', async () => {
      const incompleteCharacter = {
        name: 'Test',
        race: 'Elf',
        background: 'Sage',
      };

      await expect(
        generatePortrait({ character: incompleteCharacter })
      ).rejects.toThrow('Character must have race, class, and background');
    });

    it('throws error if background is missing', async () => {
      const incompleteCharacter = {
        name: 'Test',
        race: 'Elf',
        class: 'Wizard',
      };

      await expect(
        generatePortrait({ character: incompleteCharacter })
      ).rejects.toThrow('Character must have race, class, and background');
    });

    it('calls API with correct character data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          imageUrl: 'https://example.com/portrait.jpg',
          prompt: 'Test prompt',
        }),
      } as Response);

      await generatePortrait({ character: mockCharacter });

      expect(fetch).toHaveBeenCalledWith(
        '/api/character-portrait/generate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            race: 'Elf',
            class: 'Wizard',
            background: 'Sage',
            alignment: 'Neutral Good',
            name: 'Test Hero',
            customDescription: undefined,
          }),
        })
      );
    });

    it('includes custom description in API call', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          imageUrl: 'https://example.com/portrait.jpg',
          prompt: 'Test prompt',
        }),
      } as Response);

      await generatePortrait({
        character: mockCharacter,
        customDescription: 'Long silver hair',
      });

      const callBody = JSON.parse(
        (fetch as any).mock.calls[0][1].body
      );
      expect(callBody.customDescription).toBe('Long silver hair');
    });

    it('returns image URL and prompt on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          imageUrl: 'https://example.com/portrait.jpg',
          prompt: 'Elf wizard portrait',
        }),
      } as Response);

      const result = await generatePortrait({ character: mockCharacter });

      expect(result).toEqual({
        imageUrl: 'https://example.com/portrait.jpg',
        prompt: 'Elf wizard portrait',
      });
    });

    it('throws error on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response);

      await expect(
        generatePortrait({ character: mockCharacter })
      ).rejects.toThrow('Server error');
    });

    it('handles non-JSON error responses', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as Response);

      await expect(
        generatePortrait({ character: mockCharacter })
      ).rejects.toThrow(/Portrait generation failed: 500/);
    });

    it('handles network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        generatePortrait({ character: mockCharacter })
      ).rejects.toThrow('Network error');
    });
  });

  describe('generatePortraitMock', () => {
    it('returns placeholder URL', async () => {
      const character: Partial<Character> = {
        race: 'Elf',
        class: 'Wizard',
      };

      const result = await generatePortraitMock({ character });

      expect(result.imageUrl).toContain('placeholder');
      expect(result.imageUrl).toContain('Elf');
      expect(result.imageUrl).toContain('Wizard');
    });

    it('includes character name in prompt', async () => {
      const character: Partial<Character> = {
        name: 'Gandalf',
        race: 'Human',
        class: 'Wizard',
      };

      const result = await generatePortraitMock({ character });

      expect(result.prompt).toContain('Gandalf');
    });

    it('uses default name when not provided', async () => {
      const character: Partial<Character> = {
        race: 'Elf',
        class: 'Wizard',
      };

      const result = await generatePortraitMock({ character });

      expect(result.prompt).toContain('Hero');
    });

    it('simulates async behavior', async () => {
      const startTime = Date.now();
      await generatePortraitMock({ character: { race: 'Elf', class: 'Wizard' } });
      const endTime = Date.now();

      // Should take at least 1000ms due to simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(900);
    });
  });
});
