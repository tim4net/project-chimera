/**
 * Nuaibria Design System - Color Tokens
 *
 * Centralized color definitions for consistent theming across the application.
 * All colors follow dark fantasy aesthetics with deep purples and gold accents.
 */

export const colors = {
  // Primary Purple (Dark Fantasy)
  purple: {
    0: '#2D1B69', // Darkest - Deep backgrounds, base layer
    1: '#3D2B7D', // Darker - Card backgrounds, elevated surfaces
    2: '#4D3B8D', // Mid - Interactive surfaces, hovers
    3: '#5D4B9D', // Lighter - Hover states, highlights
  },

  // Gold Accent (Nuaibria Brand)
  gold: {
    standard: '#D4AF37', // Primary accent, buttons, highlights
    light: '#F0E68C',    // Light highlights, glows
    dark: '#B8860B',     // Dark shadows, pressed states
  },

  // Secondary Teal/Blue
  teal: {
    0: '#1B4D5C', // Dark teal - Secondary backgrounds
    1: '#2B6D7C', // Mid teal - Secondary surfaces
    2: '#3B8D9C', // Light teal - Secondary highlights
  },

  // Status Colors (Semantic)
  status: {
    success: '#10B981', // Green - Positive actions, success states
    error: '#EF4444',   // Red - Errors, validation failures
    warning: '#F59E0B', // Amber/Yellow - Warnings, cautions
    info: '#3B82F6',    // Blue - Informational messages
  },

  // Text Colors
  text: {
    primary: '#F3F4F6',   // Near white - Main text
    secondary: '#D1D5DB', // Light gray - Secondary text
    muted: '#9CA3AF',     // Medium gray - Muted text, labels
  },

  // Background & Borders
  background: '#111827',  // Very dark - Page background
  border: '#374151',      // Dark gray - Borders, dividers

  // Additional Utility Colors
  utility: {
    transparent: 'transparent',
    current: 'currentColor',
    black: '#000000',
    white: '#FFFFFF',
  },
} as const;

/**
 * Color helper functions
 */

/**
 * Convert hex color to rgba with opacity
 * @param hex - Hex color string (e.g., "#D4AF37")
 * @param alpha - Opacity value (0-1)
 * @returns rgba color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get color by path (e.g., "purple.1" or "gold.standard")
 * @param path - Dot-separated color path
 * @returns Hex color string or undefined
 */
export function getColor(path: string): string | undefined {
  const keys = path.split('.');
  let value: any = colors;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

/**
 * Type-safe color paths for autocomplete
 */
export type ColorPath =
  | 'purple.0' | 'purple.1' | 'purple.2' | 'purple.3'
  | 'gold.standard' | 'gold.light' | 'gold.dark'
  | 'teal.0' | 'teal.1' | 'teal.2'
  | 'status.success' | 'status.error' | 'status.warning' | 'status.info'
  | 'text.primary' | 'text.secondary' | 'text.muted'
  | 'background' | 'border';

// Export default for convenience
export default colors;
