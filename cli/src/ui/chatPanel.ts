/**
 * Chat Panel - Right column of TUI
 * Conversational interface with The Chronicler (AI DM)
 */

import blessed from 'blessed';
import { Colors, Symbols, BoxStyle } from './theme.js';
import type { ChatMessage } from '../types/index.js';

export class ChatPanel {
  private container: blessed.Widgets.BoxElement;
  private messageList: blessed.Widgets.BoxElement;
  private inputBox: blessed.Widgets.TextboxElement;
  private messages: ChatMessage[] = [];
  private onMessage: (message: string) => void;

  constructor(screen: blessed.Widgets.Screen, onMessage: (message: string) => void) {
    this.onMessage = onMessage;

    // Container for chat panel
    this.container = blessed.box({
      parent: screen,
      top: 0,
      left: '75%',
      width: '25%',
      height: '100%',
      label: ` ${Symbols.sparkles} THE CHRONICLER ${Symbols.sparkles} `,
      tags: true,
      ...BoxStyle.chat,
    });

    // Scrollable message list
    this.messageList = blessed.box({
      parent: this.container,
      top: 1,
      left: 1,
      right: 1,
      height: 'shrink',
      bottom: 4,
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        style: {
          bg: Colors.border,
        },
      },
      style: {
        scrollbar: {
          bg: Colors.border,
        },
      },
    });

    // Input box at bottom
    this.inputBox = blessed.textbox({
      parent: this.container,
      bottom: 1,
      left: 1,
      right: 1,
      height: 3,
      inputOnFocus: true,
      style: {
        fg: Colors.player,
        bg: 'black',
        focus: {
          fg: Colors.player,
          bg: 'black',
        },
      },
    });

    // Setup input handlers
    this.setupInputHandlers(screen);
  }

  /**
   * Setup input event handlers
   */
  private setupInputHandlers(screen: blessed.Widgets.Screen): void {
    // Submit message on Enter
    this.inputBox.on('submit', (value: string) => {
      const message = value.trim();
      if (message) {
        this.onMessage(message);
        this.inputBox.clearValue();
      }
      this.inputBox.focus();
      screen.render();
    });

    // Cancel input on Escape
    this.inputBox.on('cancel', () => {
      this.inputBox.clearValue();
      screen.render();
    });

    // Focus input box by default
    this.inputBox.focus();
  }

  /**
   * Add a message to the chat history
   */
  public addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.render();
  }

  /**
   * Format a single message with color and sender prefix
   */
  private formatMessage(message: ChatMessage): string {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    let color: string;
    let prefix: string;

    switch (message.sender) {
      case 'chronicler':
        color = Colors.chronicler;
        prefix = `${Symbols.sparkles} Chronicler`;
        break;
      case 'player':
        color = Colors.player;
        prefix = `${Symbols.arrow} You`;
        break;
      case 'system':
        color = Colors.system;
        prefix = `${Symbols.dot} System`;
        break;
      default:
        color = Colors.label;
        prefix = message.sender;
    }

    return (
      `{${color}-fg}{bold}${prefix}{/} {${Colors.border}-fg}[${timestamp}]{/}\n` +
      `{${Colors.label}-fg}${message.content}{/}\n`
    );
  }

  /**
   * Render all messages
   */
  private render(): void {
    const formattedMessages = this.messages.map(msg => this.formatMessage(msg));
    this.messageList.setContent('\n' + formattedMessages.join('\n'));

    // Auto-scroll to bottom
    this.messageList.setScrollPerc(100);
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.messages = [];
    this.render();
  }

  /**
   * Focus the input box
   */
  public focusInput(): void {
    this.inputBox.focus();
  }

  /**
   * Get the blessed container widget
   */
  public getContainer(): blessed.Widgets.BoxElement {
    return this.container;
  }
}
