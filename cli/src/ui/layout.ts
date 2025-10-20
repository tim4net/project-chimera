/**
 * Main Layout Manager for Nuaibria TUI
 * Creates the 3-column layout: Character Stats | Map | Chat
 */

import blessed from 'blessed';
import { BoxStyle } from './theme.js';
import { CharacterPanel } from './characterPanel.js';
import { MapPanel } from './mapPanel.js';
import { ChatPanel } from './chatPanel.js';
import { DmChatClient, type ChatResponse, type ChatMessage as DmChatMessage } from '../api/dmChat.js';
import type { GameState } from '../types/index.js';

export class LayoutManager {
  private screen: blessed.Widgets.Screen;
  private characterPanel: CharacterPanel;
  private mapPanel: MapPanel;
  private chatPanel: ChatPanel;
  private gameState: GameState;
  private dmChatClient: DmChatClient;
  private conversationHistory: DmChatMessage[] = [];

  constructor(backendUrl: string = 'http://localhost:3001') {
    // Initialize DM chat client
    this.dmChatClient = new DmChatClient(backendUrl);
    // Create blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Nuaibria - AI Dungeon Master',
      fullUnicode: true,
    });

    // Initialize game state
    this.gameState = {
      character: null,
      worldMap: null,
      chatHistory: [],
      isLoading: false,
    };

    // Create panels
    this.characterPanel = new CharacterPanel(this.screen);
    this.mapPanel = new MapPanel(this.screen);
    this.chatPanel = new ChatPanel(this.screen, (message: string) => {
      this.handleUserMessage(message);
    });

    // Setup key handlers
    this.setupKeyHandlers();

    // Render screen
    this.screen.render();
  }

  /**
   * Setup global key handlers
   */
  private setupKeyHandlers(): void {
    // Quit on Escape, q, or Ctrl-C
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    // Tab to cycle focus between panels
    this.screen.key(['tab'], () => {
      this.screen.focusNext();
      this.screen.render();
    });

    // Shift-Tab to cycle focus backwards
    this.screen.key(['S-tab'], () => {
      this.screen.focusPrevious();
      this.screen.render();
    });
  }

  /**
   * Handle user message from chat input
   */
  private async handleUserMessage(message: string): Promise<void> {
    if (!this.gameState.character) {
      this.chatPanel.addMessage({
        id: Date.now().toString(),
        sender: 'system',
        content: 'No character loaded. Please create or load a character first.',
        timestamp: Date.now(),
      });
      this.screen.render();
      return;
    }

    // Add user message to chat history
    const userMsg = {
      id: Date.now().toString(),
      sender: 'player' as const,
      content: message,
      timestamp: Date.now(),
    };
    this.chatPanel.addMessage(userMsg);
    this.conversationHistory.push({ role: 'player', content: message });
    this.screen.render();

    try {
      // Show loading indicator
      const loadingMsgId = `loading-${Date.now()}`;
      this.chatPanel.addMessage({
        id: loadingMsgId,
        sender: 'system',
        content: 'The Chronicler considers your words...',
        timestamp: Date.now(),
      });
      this.screen.render();

      // Send message to AI DM
      const response: ChatResponse = await this.dmChatClient.sendMessage({
        characterId: this.gameState.character.id,
        message,
        conversationHistory: this.conversationHistory,
      });

      // Remove loading message
      // Note: ChatPanel would need a removeMessage method - for now just add response

      // Add DM response to chat
      this.chatPanel.addMessage({
        id: Date.now().toString(),
        sender: 'chronicler',
        content: response.response,
        timestamp: Date.now(),
      });
      this.conversationHistory.push({ role: 'dm', content: response.response });

      // Apply state changes
      await this.applyStateChanges(response.stateChanges);

      // Check for combat trigger
      if (response.triggerActivePhase) {
        this.chatPanel.addMessage({
          id: Date.now().toString(),
          sender: 'system',
          content: '⚔️  Combat has begun! (Combat UI coming soon)',
          timestamp: Date.now(),
        });
      }

      this.screen.render();
    } catch (error) {
      this.chatPanel.addMessage({
        id: Date.now().toString(),
        sender: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      });
      this.screen.render();
    }
  }

  /**
   * Apply state changes from DM response
   */
  private async applyStateChanges(stateChanges: Array<{
    entityType: string;
    entityId: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>): Promise<void> {
    if (!this.gameState.character) return;

    for (const change of stateChanges) {
      if (change.entityType === 'character' && change.entityId === this.gameState.character.id) {
        // Update local character state
        switch (change.field) {
          case 'hp_current':
            this.gameState.character.hp = Number(change.newValue);
            break;
          case 'position_x':
            this.gameState.character.position.x = Number(change.newValue);
            break;
          case 'position_y':
            this.gameState.character.position.y = Number(change.newValue);
            break;
          case 'xp':
            this.gameState.character.xp = Number(change.newValue);
            break;
        }
      }
    }

    // Refresh character panel
    if (this.gameState.character) {
      this.characterPanel.updateCharacter(this.gameState.character);
    }
  }

  /**
   * Update game state and refresh all panels
   */
  public updateGameState(newState: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...newState };

    // Update panels
    if (newState.character) {
      this.characterPanel.updateCharacter(newState.character);
    }
    if (newState.worldMap) {
      this.mapPanel.updateMap(newState.worldMap);
    }
    if (newState.chatHistory) {
      newState.chatHistory.forEach(msg => this.chatPanel.addMessage(msg));
    }

    this.screen.render();
  }

  /**
   * Show welcome message
   */
  public showWelcome(): void {
    this.chatPanel.addMessage({
      id: 'welcome',
      sender: 'system',
      content: 'Welcome to Nuaibria! Type your message and press Enter to interact with The Chronicler.',
      timestamp: Date.now(),
    });

    this.chatPanel.addMessage({
      id: 'chronicler-intro',
      sender: 'chronicler',
      content: 'Greetings, traveler. I am The Chronicler, your guide through this realm. What brings you to these lands?',
      timestamp: Date.now() + 1,
    });

    this.screen.render();
  }

  /**
   * Get the blessed screen instance
   */
  public getScreen(): blessed.Widgets.Screen {
    return this.screen;
  }
}
