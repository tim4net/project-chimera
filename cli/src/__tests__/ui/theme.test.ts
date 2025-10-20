/**
 * Tests for TUI theme system
 * Validates colors, symbols, and bar generation
 */

import { describe, test, expect } from '@jest/globals';
import {
  Colors,
  Symbols,
  createHealthBar,
  createXpBar,
  formatModifier,
  getBiomeDisplay,
} from '../../ui/theme.js';

describe('Theme System', () => {
  describe('Colors', () => {
    test('should define all required color constants', () => {
      expect(Colors.health).toBe('red');
      expect(Colors.chronicler).toBe('bright-magenta');
      expect(Colors.player).toBe('bright-green');
      expect(Colors.border).toBe('cyan');
    });
  });

  describe('Symbols', () => {
    test('should define all required Unicode symbols', () => {
      expect(Symbols.heart).toBe('❤️');
      expect(Symbols.sword).toBe('⚔️');
      expect(Symbols.player).toBe('🧙');
      expect(Symbols.forest).toBe('🌲');
    });
  });

  describe('createHealthBar', () => {
    test('should create full health bar', () => {
      const bar = createHealthBar(100, 100, 10);
      expect(bar).toContain('█'.repeat(10));
      expect(bar).not.toContain('░');
    });

    test('should create half health bar', () => {
      const bar = createHealthBar(50, 100, 10);
      expect(bar).toContain('█'.repeat(5));
      expect(bar).toContain('░'.repeat(5));
    });

    test('should create empty health bar', () => {
      const bar = createHealthBar(0, 100, 10);
      expect(bar).toContain('░'.repeat(10));
    });

    test('should handle edge cases', () => {
      expect(createHealthBar(1, 100, 10)).toBeTruthy();
      expect(createHealthBar(99, 100, 10)).toBeTruthy();
      expect(createHealthBar(-10, 100, 10)).toBeTruthy(); // Should clamp to 0
      expect(createHealthBar(150, 100, 10)).toBeTruthy(); // Should clamp to 100%
    });
  });

  describe('createXpBar', () => {
    test('should create XP progress bar', () => {
      const bar = createXpBar(250, 1000, 10);
      expect(bar).toContain('█'.repeat(2)); // 25% of 10
      expect(bar).toContain('░');
    });
  });

  describe('formatModifier', () => {
    test('should format positive modifiers', () => {
      expect(formatModifier(3)).toContain('+3');
      expect(formatModifier(1)).toContain('+1');
    });

    test('should format zero modifier', () => {
      expect(formatModifier(0)).toContain('+0');
    });

    test('should format negative modifiers', () => {
      expect(formatModifier(-1)).toContain('-1');
      expect(formatModifier(-3)).toContain('-3');
    });
  });

  describe('getBiomeDisplay', () => {
    test('should return correct symbols for known biomes', () => {
      expect(getBiomeDisplay('forest')).toEqual({
        symbol: Symbols.forest,
        color: Colors.forest,
      });
      expect(getBiomeDisplay('water')).toEqual({
        symbol: Symbols.water,
        color: Colors.water,
      });
    });

    test('should return default for unknown biomes', () => {
      const result = getBiomeDisplay('unknown-biome');
      expect(result.symbol).toBe('?');
      expect(result.color).toBe('white');
    });
  });
});
