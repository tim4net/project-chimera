/**
 * @file Unit tests for the D&D 5e Inspiration system.
 */

import {
  awardInspiration,
  useInspiration,
  hasInspiration,
  getInspirationDescription,
} from '../../game/inspiration';
import { CharacterRecord } from '../../types/index';

describe('Inspiration System', () => {
  let mockCharacter: Partial<CharacterRecord>;

  beforeEach(() => {
    mockCharacter = {
      id: 'test-char-1',
      name: 'Test Hero',
      inspiration: false,
    };
  });

  describe('awardInspiration', () => {
    it('should set inspiration to true', () => {
      awardInspiration(mockCharacter as CharacterRecord);
      expect(mockCharacter.inspiration).toBe(true);
    });

    it('should work even if character already has inspiration', () => {
      mockCharacter.inspiration = true;
      awardInspiration(mockCharacter as CharacterRecord);
      expect(mockCharacter.inspiration).toBe(true);
    });

    it('should work with undefined inspiration field', () => {
      delete mockCharacter.inspiration;
      awardInspiration(mockCharacter as CharacterRecord);
      expect(mockCharacter.inspiration).toBe(true);
    });
  });

  describe('useInspiration', () => {
    it('should consume inspiration and return true when available', () => {
      mockCharacter.inspiration = true;
      const result = useInspiration(mockCharacter as CharacterRecord);
      expect(result.hadInspiration).toBe(true);
      expect(mockCharacter.inspiration).toBe(false);
    });

    it('should return false when no inspiration available', () => {
      mockCharacter.inspiration = false;
      const result = useInspiration(mockCharacter as CharacterRecord);
      expect(result.hadInspiration).toBe(false);
      expect(mockCharacter.inspiration).toBe(false);
    });

    it('should handle undefined inspiration field', () => {
      delete mockCharacter.inspiration;
      const result = useInspiration(mockCharacter as CharacterRecord);
      expect(result.hadInspiration).toBe(false);
      expect(mockCharacter.inspiration).toBe(false);
    });
  });

  describe('hasInspiration', () => {
    it('should return true when character has inspiration', () => {
      mockCharacter.inspiration = true;
      expect(hasInspiration(mockCharacter as CharacterRecord)).toBe(true);
    });

    it('should return false when character has no inspiration', () => {
      mockCharacter.inspiration = false;
      expect(hasInspiration(mockCharacter as CharacterRecord)).toBe(false);
    });

    it('should return false when inspiration is undefined', () => {
      delete mockCharacter.inspiration;
      expect(hasInspiration(mockCharacter as CharacterRecord)).toBe(false);
    });
  });

  describe('getInspirationDescription', () => {
    it('should return a non-empty description', () => {
      const description = getInspirationDescription();
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(50);
    });

    it('should mention key concepts', () => {
      const description = getInspirationDescription();
      expect(description.toLowerCase()).toContain('advantage');
      expect(description.toLowerCase()).toContain('roleplay');
    });
  });

  describe('Inspiration workflow', () => {
    it('should follow complete award -> use cycle', () => {
      // Start with no inspiration
      expect(hasInspiration(mockCharacter as CharacterRecord)).toBe(false);

      // Award inspiration
      awardInspiration(mockCharacter as CharacterRecord);
      expect(hasInspiration(mockCharacter as CharacterRecord)).toBe(true);

      // Use inspiration
      const result = useInspiration(mockCharacter as CharacterRecord);
      expect(result.hadInspiration).toBe(true);
      expect(hasInspiration(mockCharacter as CharacterRecord)).toBe(false);

      // Try to use again (should fail)
      const result2 = useInspiration(mockCharacter as CharacterRecord);
      expect(result2.hadInspiration).toBe(false);
    });
  });
});
