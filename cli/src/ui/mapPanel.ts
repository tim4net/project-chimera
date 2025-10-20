/**
 * Map Panel - Center column of TUI
 * Displays interactive world map with biomes and player position
 */

import blessed from 'blessed';
import { Symbols, getBiomeDisplay, Colors, BoxStyle } from './theme.js';
import type { WorldMap } from '../types/index.js';

export class MapPanel {
  private box: blessed.Widgets.BoxElement;
  private worldMap: WorldMap | null = null;
  private viewportSize = { width: 21, height: 15 }; // Odd numbers for centered player

  constructor(screen: blessed.Widgets.Screen) {
    this.box = blessed.box({
      parent: screen,
      top: 0,
      left: '25%',
      width: '50%',
      height: '100%',
      label: ` ${Symbols.scroll} WORLD MAP ${Symbols.scroll} `,
      tags: true,
      scrollable: false,
      ...BoxStyle.map,
    });
  }

  /**
   * Update map data and refresh display
   */
  public updateMap(worldMap: WorldMap): void {
    this.worldMap = worldMap;
    this.render();
  }

  /**
   * Render the map centered on player position
   */
  private render(): void {
    if (!this.worldMap) {
      this.box.setContent(
        '\n\n' +
        `  {center}{${Colors.label}-fg}No map data available{/}{/center}\n` +
        '\n' +
        `  {center}{${Colors.system}-fg}Exploring the world...{/}{/center}`
      );
      return;
    }

    const map = this.worldMap;
    const playerX = map.playerPosition.x;
    const playerY = map.playerPosition.y;

    // Calculate viewport bounds (centered on player)
    const halfWidth = Math.floor(this.viewportSize.width / 2);
    const halfHeight = Math.floor(this.viewportSize.height / 2);

    const startX = Math.max(0, playerX - halfWidth);
    const endX = Math.min(map.width, playerX + halfWidth + 1);
    const startY = Math.max(0, playerY - halfHeight);
    const endY = Math.min(map.height, playerY + halfHeight + 1);

    const lines: string[] = ['', '']; // Top padding

    // Add legend
    lines.push(`  {${Colors.label}-fg}Legend: ${Symbols.forest}Forest ${Symbols.water}Water ${Symbols.mountain}Mountain ${Symbols.desert}Desert ${Symbols.town}Town{/}`);
    lines.push(`  {${Colors.border}-fg}${Symbols.horizontal.repeat(45)}{/}`);
    lines.push('');

    // Render map viewport
    for (let y = startY; y < endY; y++) {
      let line = '  ';
      for (let x = startX; x < endX; x++) {
        // Check if this is player position
        if (x === playerX && y === playerY) {
          line += `{${Colors.value}-fg}${Symbols.player}{/} `;
          continue;
        }

        // Get tile at this position
        const tile = map.tiles[y]?.[x];
        if (!tile) {
          line += '  ';
          continue;
        }

        // If tile is not discovered, show fog
        if (!tile.discovered) {
          line += `{${Colors.border}-fg}?{/} `;
          continue;
        }

        // Show biome symbol
        const biomeDisplay = getBiomeDisplay(tile.biome);
        line += `{${biomeDisplay.color}-fg}${biomeDisplay.symbol}{/} `;
      }
      lines.push(line);
    }

    lines.push('');
    lines.push(`  {${Colors.border}-fg}${Symbols.horizontal.repeat(45)}{/}`);
    lines.push(`  {${Colors.label}-fg}Position:{/} {${Colors.value}-fg}(${playerX}, ${playerY}){/}`);

    this.box.setContent(lines.join('\n'));
  }

  /**
   * Get the blessed box widget
   */
  public getBox(): blessed.Widgets.BoxElement {
    return this.box;
  }
}
