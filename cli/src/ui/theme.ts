/**
 * Theme Configuration for Nuaibria TUI
 * Defines vibrant ANSI colors and Unicode symbols for visual appeal
 */

export const Colors = {
  // Character Stats
  health: 'red',
  healthBar: 'bright-red',
  mana: 'blue',
  manaBar: 'bright-blue',
  stamina: 'yellow',
  xpBar: 'bright-green',

  // UI Elements
  border: 'cyan',
  borderActive: 'bright-cyan',
  title: 'bright-white',
  label: 'white',
  value: 'bright-yellow',

  // Chat Messages
  chronicler: 'bright-magenta',
  player: 'bright-green',
  system: 'bright-cyan',
  error: 'bright-red',
  success: 'green',
  warning: 'yellow',

  // Map Biomes
  water: 'blue',
  forest: 'green',
  mountain: 'white',
  desert: 'yellow',
  dungeon: 'red',
  town: 'cyan',

  // Combat
  damage: 'red',
  healing: 'green',
  buff: 'cyan',
  debuff: 'magenta',
} as const;

export const Symbols = {
  // Character Stats
  heart: '❤️',
  shield: '🛡️',
  sword: '⚔️',
  star: '⭐',
  sparkles: '✨',
  crystal: '💎',
  scroll: '📜',
  potion: '🧪',

  // Map Elements
  player: '🧙',
  water: '🌊',
  forest: '🌲',
  mountain: '🏔️',
  desert: '🏜️',
  dungeon: '⚔️',
  town: '🏰',
  cave: '🕳️',
  temple: '🏛️',

  // Creatures
  dragon: '🐉',
  wolf: '🐺',
  bear: '🐻',
  spider: '🕷️',
  skeleton: '💀',
  ghost: '👻',

  // Status Indicators
  checkmark: '✓',
  cross: '✗',
  arrow: '→',
  arrowUp: '↑',
  arrowDown: '↓',
  dot: '•',

  // UI Elements
  corner: '╭╮╰╯',
  horizontal: '─',
  vertical: '│',
  boxFull: '█',
  boxEmpty: '░',
  boxHalf: '▒',
} as const;

export const BoxStyle = {
  default: {
    border: {
      type: 'line',
    },
    style: {
      border: {
        fg: Colors.border,
      },
      focus: {
        border: {
          fg: Colors.borderActive,
        },
      },
    },
  },
  character: {
    border: {
      type: 'line',
    },
    style: {
      border: {
        fg: 'green',
      },
    },
  },
  map: {
    border: {
      type: 'line',
    },
    style: {
      border: {
        fg: 'cyan',
      },
    },
  },
  chat: {
    border: {
      type: 'line',
    },
    style: {
      border: {
        fg: 'magenta',
      },
    },
  },
} as const;

/**
 * Create a colored health bar with symbols
 */
export function createHealthBar(current: number, max: number, width: number = 10): string {
  const percentage = Math.max(0, Math.min(1, current / max));
  const filled = Math.floor(percentage * width);
  const empty = width - filled;

  return `{${Colors.healthBar}-fg}${Symbols.boxFull.repeat(filled)}{/}${Symbols.boxEmpty.repeat(empty)}`;
}

/**
 * Create a colored XP bar
 */
export function createXpBar(current: number, max: number, width: number = 10): string {
  const percentage = Math.max(0, Math.min(1, current / max));
  const filled = Math.floor(percentage * width);
  const empty = width - filled;

  return `{${Colors.xpBar}-fg}${Symbols.boxFull.repeat(filled)}{/}${Symbols.boxEmpty.repeat(empty)}`;
}

/**
 * Format a stat modifier (e.g., +2, -1, +0)
 */
export function formatModifier(modifier: number): string {
  const sign = modifier >= 0 ? '+' : '';
  return `{${Colors.value}-fg}${sign}${modifier}{/}`;
}

/**
 * Get biome symbol and color
 */
export function getBiomeDisplay(biome: string): { symbol: string; color: string } {
  const biomeMap: Record<string, { symbol: string; color: string }> = {
    water: { symbol: Symbols.water, color: Colors.water },
    forest: { symbol: Symbols.forest, color: Colors.forest },
    mountain: { symbol: Symbols.mountain, color: Colors.mountain },
    desert: { symbol: Symbols.desert, color: Colors.desert },
    dungeon: { symbol: Symbols.dungeon, color: Colors.dungeon },
    town: { symbol: Symbols.town, color: Colors.town },
  };

  return biomeMap[biome] || { symbol: '?', color: 'white' };
}
