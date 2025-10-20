#!/usr/bin/env node
/**
 * Nuaibria - Terminal UI Entry Point
 * Semi-Idle RPG with AI Dungeon Master
 */

import { LayoutManager } from './ui/layout.js';
import { ApiClient } from './api/client.js';
import type { Character } from './types/index.js';

/**
 * CLI Arguments
 */
interface CliArgs {
  user?: string;
  help?: boolean;
}

/**
 * Parse command-line arguments
 */
function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--user' && i + 1 < argv.length) {
      args.user = argv[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Nuaibria - AI Dungeon Master Terminal Interface

Usage:
  nuaibria [options]

Options:
  --user <email>    Load characters for the specified user email
  --help, -h        Show this help message

Examples:
  nuaibria --user player@example.com
  nuaibria

Note: Backend must be running at http://localhost:3001 (configurable via BACKEND_URL env var)
`);
}

/**
 * Main application class
 */
class NuaibriaCLI {
  private layout: LayoutManager;
  private api: ApiClient;
  private characterId: string | null = null;
  private userEmail: string | null = null;

  constructor(userEmail?: string) {
    this.userEmail = userEmail || null;

    // Get backend URL from environment or use production default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.api = new ApiClient(backendUrl);

    // Initialize layout with backend URL
    this.layout = new LayoutManager(backendUrl);

    // Start application
    this.start();
  }

  /**
   * Start the application
   */
  private async start(): Promise<void> {
    // Show welcome message
    this.layout.showWelcome();

    // Check backend connection
    const connected = await this.checkConnection();
    if (!connected) {
      console.error('\n❌ ERROR: Cannot connect to Nuaibria backend server');
      console.error(`\nExpected backend at: ${this.api.getBaseUrl()}`);
      console.error('\nPlease ensure the production instance is running:');
      console.error('  podman compose up -d');
      console.error('\nThen check status:');
      console.error('  podman compose ps');
      process.exit(1);
    }

    // Load character based on user email or demo
    if (this.userEmail) {
      await this.loadUserCharacters(this.userEmail);
    } else {
      await this.loadDemoCharacter();
    }
  }

  /**
   * Load characters for a specific user
   */
  private async loadUserCharacters(email: string): Promise<void> {
    try {
      console.log(`\n🔍 Loading characters for ${email}...`);

      const characters = await this.api.getUserCharacters(email);

      if (!characters || characters.length === 0) {
        console.error(`\n❌ No characters found for user: ${email}`);
        console.error('\nPlease create a character first via the web interface.');
        process.exit(1);
      }

      // If only one character, load it automatically
      if (characters.length === 1) {
        console.log(`\n✅ Found 1 character: ${characters[0].name}`);
        await this.loadCharacter(characters[0]);
        return;
      }

      // Multiple characters - show selection menu
      console.log(`\n✅ Found ${characters.length} characters:\n`);
      characters.forEach((char, index) => {
        console.log(`  [${index + 1}] ${char.name} - Level ${char.level} ${char.class}`);
      });

      // Wait for user selection
      const selectedIndex = await this.promptCharacterSelection(characters.length);
      if (selectedIndex >= 0 && selectedIndex < characters.length) {
        await this.loadCharacter(characters[selectedIndex]);
      } else {
        console.error('\n❌ Invalid selection');
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Error loading characters: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  }

  /**
   * Prompt user to select a character
   */
  private promptCharacterSelection(count: number): Promise<number> {
    return new Promise((resolve) => {
      process.stdout.write(`\nSelect character (1-${count}): `);

      process.stdin.once('data', (data) => {
        const input = data.toString().trim();
        const selection = parseInt(input, 10);
        resolve(selection - 1); // Convert to 0-based index
      });
    });
  }

  /**
   * Load a specific character
   */
  private async loadCharacter(character: Character): Promise<void> {
    console.log(`\n✅ Loading ${character.name}...`);

    // Load full character data with map
    const fullCharacter = await this.api.getCharacter(character.id);

    // Generate demo map (in real impl, load from backend)
    const demoMap = {
      width: 30,
      height: 20,
      playerPosition: { x: character.position.x, y: character.position.y },
      tiles: this.generateDemoMap(30, 20, character.position.x, character.position.y),
    };

    // Update layout with character data
    this.layout.updateGameState({
      character: fullCharacter,
      worldMap: demoMap,
      chatHistory: [],
      isLoading: false,
    });

    this.characterId = character.id;

    console.log('\n✨ Ready to play! Press Tab to navigate, Esc/q to quit.\n');
  }

  /**
   * Check connection to backend
   */
  private async checkConnection(): Promise<boolean> {
    try {
      return await this.api.ping();
    } catch (error) {
      return false;
    }
  }

  /**
   * Load a demo character for testing
   * In production, this would authenticate and load the user's character
   */
  private async loadDemoCharacter(): Promise<void> {
    // Create demo character data
    const demoCharacter: Character = {
      id: 'demo-1',
      name: 'Aric the Wanderer',
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
      skills: {
        arcana: 5,
        investigation: 5,
        history: 3,
      },
      inventory: [
        { id: '1', name: 'Staff of Power', type: 'weapon', quantity: 1, equipped: true },
        { id: '2', name: 'Spellbook', type: 'tool', quantity: 1, equipped: false },
        { id: '3', name: 'Health Potion', type: 'consumable', quantity: 3, equipped: false },
      ],
    };

    // Create demo map data
    const demoMap = {
      width: 30,
      height: 20,
      playerPosition: { x: 12, y: 8 },
      tiles: this.generateDemoMap(30, 20, 12, 8),
    };

    // Update layout with demo data
    this.layout.updateGameState({
      character: demoCharacter,
      worldMap: demoMap,
      chatHistory: [],
      isLoading: false,
    });

    this.characterId = demoCharacter.id;
  }

  /**
   * Generate a demo map with various biomes
   */
  private generateDemoMap(width: number, height: number, playerX: number, playerY: number): any[][] {
    const tiles: any[][] = [];
    const biomes = ['forest', 'water', 'mountain', 'desert', 'town'];

    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        // Calculate distance from player for discovered radius
        const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
        const discovered = distance <= 5;

        // Determine biome based on position
        let biome: string;
        if (y < 3) {
          biome = 'water'; // Top is water
        } else if (y > 15) {
          biome = 'desert'; // Bottom is desert
        } else if (x < 5 || x > 25) {
          biome = 'mountain'; // Sides are mountains
        } else if (x === 12 && y === 10) {
          biome = 'town'; // Town near player
        } else {
          biome = 'forest'; // Default is forest
        }

        tiles[y][x] = {
          x,
          y,
          biome,
          discovered,
        };
      }
    }

    return tiles;
  }
}

// Parse CLI arguments and start the application
const args = parseArgs();

if (args.help) {
  showHelp();
  process.exit(0);
}

new NuaibriaCLI(args.user);
