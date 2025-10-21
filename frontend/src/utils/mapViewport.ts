/**
 * Map Viewport Utilities
 * Calculate visible tile ranges for viewport-based fetching
 */

export interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface MapBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculate viewport bounds for tile fetching based on canvas size, zoom, and pan
 * Returns the tile coordinate range that should be fetched from the server
 *
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param tileSize - Size of each tile in pixels (after zoom applied)
 * @param panOffset - Current pan offset in pixels
 * @param mapBounds - Overall campaign bounds
 * @param bufferMultiplier - Multiplier for buffer zone (default 2x viewport = smooth panning)
 */
export function calculateViewportBounds(
  canvasWidth: number,
  canvasHeight: number,
  tileSize: number,
  panOffset: { x: number; y: number },
  mapBounds: MapBounds,
  bufferMultiplier = 2
): ViewportBounds {
  const worldWidth = (mapBounds.maxX - mapBounds.minX + 1) * tileSize;
  const worldHeight = (mapBounds.maxY - mapBounds.minY + 1) * tileSize;
  const offsetX = (canvasWidth - worldWidth) / 2 + panOffset.x;
  const offsetY = (canvasHeight - worldHeight) / 2 + panOffset.y;

  // Calculate visible tile range with buffer
  const visibleTilesX = Math.ceil(canvasWidth / tileSize) * bufferMultiplier;
  const visibleTilesY = Math.ceil(canvasHeight / tileSize) * bufferMultiplier;

  // Calculate center tile based on pan offset
  const centerTileX = Math.floor((canvasWidth / 2 - offsetX) / tileSize) + mapBounds.minX;
  const centerTileY = Math.floor((canvasHeight / 2 - offsetY) / tileSize) + mapBounds.minY;

  return {
    minX: Math.max(mapBounds.minX, centerTileX - Math.floor(visibleTilesX / 2)),
    maxX: Math.min(mapBounds.maxX, centerTileX + Math.ceil(visibleTilesX / 2)),
    minY: Math.max(mapBounds.minY, centerTileY - Math.floor(visibleTilesY / 2)),
    maxY: Math.min(mapBounds.maxY, centerTileY + Math.ceil(visibleTilesY / 2)),
  };
}

/**
 * Build API URL with viewport query parameters
 */
export function buildViewportUrl(
  baseUrl: string,
  viewport: ViewportBounds
): string {
  return `${baseUrl}?minX=${viewport.minX}&maxX=${viewport.maxX}&minY=${viewport.minY}&maxY=${viewport.maxY}`;
}
