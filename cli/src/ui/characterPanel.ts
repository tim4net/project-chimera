/**
 * Character Stats Panel - Left column of TUI
 * Displays character information with vibrant colors and symbols
 */

import blessed from 'blessed';
import { Colors, Symbols, createHealthBar, createXpBar, formatModifier, BoxStyle } from './theme.js';
import type { Character } from '../types/index.js';

export class CharacterPanel {
  private box: blessed.Widgets.BoxElement;
  private character: Character | null = null;

  constructor(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      parent: screen,
      top: 0,
      left: 0,
      width: '25%',
      height: '100%',
      label: ` ${Symbols.sword} CHARACTER ${Symbols.shield} `,
      tags: true,
      ...BoxStyle.character,
    });
  }

  /**
   * Update character data and refresh display
   */
  public updateCharacter(character: Character): void {
    this.character = character;
    this.render();
  }

  /**
   * Calculate ability modifier from ability score
   */
  private calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Render character stats
   */
  private render(): void {
    if (!this.character) {
      this.box.setContent(
        '\n\n' +
        `  {center}{${Colors.label}-fg}No character loaded{/}{/center}\n` +
        '\n' +
        `  {center}{${Colors.system}-fg}Create a character to begin{/}{/center}`
      );
      return;
    }

    const char = this.character;
    const hpBar = createHealthBar(char.hp, char.maxHp, 12);
    const xpBar = createXpBar(char.xp, char.xpToNextLevel, 12);

    const content = [
      '', // Top padding
      `  {${Colors.title}-fg}{bold}${char.name}{/}`,
      `  {${Colors.label}-fg}Level ${char.level} ${char.class}{/}`,
      '',
      // Health
      `  ${Symbols.heart} {${Colors.label}-fg}HP:{/} {${Colors.value}-fg}${char.hp}/${char.maxHp}{/}`,
      `  ${hpBar}`,
      '',
      // Experience
      `  ${Symbols.star} {${Colors.label}-fg}XP:{/} {${Colors.value}-fg}${char.xp}/${char.xpToNextLevel}{/}`,
      `  ${xpBar}`,
      '',
      // Position
      `  ${Symbols.scroll} {${Colors.label}-fg}Position:{/} {${Colors.value}-fg}(${char.position.x}, ${char.position.y}){/}`,
      '',
      `  {${Colors.title}-fg}{bold}Abilities{/}`,
      `  {${Colors.border}-fg}${Symbols.horizontal.repeat(18)}{/}`,
      '',
      // Abilities
      `  {${Colors.label}-fg}STR:{/} {${Colors.value}-fg}${char.abilities.strength}{/} ${formatModifier(this.calculateModifier(char.abilities.strength))}`,
      `  {${Colors.label}-fg}DEX:{/} {${Colors.value}-fg}${char.abilities.dexterity}{/} ${formatModifier(this.calculateModifier(char.abilities.dexterity))}`,
      `  {${Colors.label}-fg}CON:{/} {${Colors.value}-fg}${char.abilities.constitution}{/} ${formatModifier(this.calculateModifier(char.abilities.constitution))}`,
      `  {${Colors.label}-fg}INT:{/} {${Colors.value}-fg}${char.abilities.intelligence}{/} ${formatModifier(this.calculateModifier(char.abilities.intelligence))}`,
      `  {${Colors.label}-fg}WIS:{/} {${Colors.value}-fg}${char.abilities.wisdom}{/} ${formatModifier(this.calculateModifier(char.abilities.wisdom))}`,
      `  {${Colors.label}-fg}CHA:{/} {${Colors.value}-fg}${char.abilities.charisma}{/} ${formatModifier(this.calculateModifier(char.abilities.charisma))}`,
      '',
      // Inventory count
      `  ${Symbols.crystal} {${Colors.label}-fg}Inventory:{/} {${Colors.value}-fg}${char.inventory.length} items{/}`,
    ];

    this.box.setContent(content.join('\n'));
  }

  /**
   * Get the blessed box widget
   */
  public getBox(): blessed.Widgets.BoxElement {
    return this.box;
  }
}
