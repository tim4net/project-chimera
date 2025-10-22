/**
 * Strategic World Map Component
 * Displays entire discovered world with fog of war
 * Uses Canvas2D for high-performance rendering of large areas
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
// Viewport utilities for future optimization (uncomment when needed for large campaigns)
// import { calculateViewportBounds, buildViewportUrl } from '../utils/mapViewport';

interface StrategicMapProps {
  characterId: string;
  campaignSeed: string;
  isFullscreen?: boolean; // Show full controls only in fullscreen mode
  onTileClick?: (position: { x: number; y: number }) => void; // Callback when user clicks a tile
}

interface MapTile {
  x: number;
  y: number;
  biome: string;
  fogState: 'unexplored' | 'explored' | 'visible';
}

interface MapData {
  playerPosition: { x: number; y: number };
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  tiles: MapTile[];
  tilesDiscovered: number;
  roads: RoadSegment[];
}

interface RoadSegment {
  id: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
  polyline: { x: number; y: number }[];
}

// Biome colors (muted for strategic view)
const BIOME_COLORS: Record<string, string> = {
  water: '#4A90E2',
  plains: '#7EC850',
  forest: '#228B22',
  mountains: '#8B7355',
  desert: '#EDC9AF',
};

const TILE_SIZE = 4; // pixels per tile (strategic zoom)
const MIN_TILE_SIZE = 2;
const MAX_TILE_SIZE = 16;

export default function StrategicMap({ characterId, campaignSeed, isFullscreen = false, onTileClick }: StrategicMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [viewMode, setViewMode] = useState<'world' | 'region'>('world');
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch map data from API
  // Initial load fetches all tiles; large campaigns should use viewport on initial load too
  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        let url = `/api/strategic-map/${campaignSeed}`;

        // For viewport-based fetching (optional, uncomment for large campaigns):
        // if (canvasRef.current && mapData) {
        //   const tileSize = TILE_SIZE * zoom;
        //   const viewport = calculateViewportBounds(
        //     canvasRef.current.width,
        //     canvasRef.current.height,
        //     tileSize,
        //     panOffset,
        //     mapData.bounds
        //   );
        //   url = buildViewportUrl(url, viewport);
        //   console.log('[StrategicMap] Fetching viewport:', viewport);
        // }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to load map data (${response.status})`);
        }

        const data = await response.json();
        const normalized: MapData = {
          ...data,
          roads: Array.isArray(data.roads) ? data.roads : []
        };
        setMapData(normalized);

        // Log warning for large datasets
        if (data.tilesDiscovered > 5000) {
          console.warn(
            `[StrategicMap] Large dataset: ${data.tilesDiscovered} tiles. ` +
            `Consider enabling viewport-based fetching for performance.`
          );
        }
      } catch (err) {
        console.error('[StrategicMap] Failed to fetch map:', err);
        const message = err instanceof Error ? err.message : 'Failed to load world map';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [characterId, campaignSeed]);

  // Render map on canvas
  useEffect(() => {
    if (!mapData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to container
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.fillStyle = '#0a0a0f'; // Dark background (unexplored void)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mapData.tiles.length === 0) {
      // No tiles discovered yet
      ctx.fillStyle = '#888';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No areas discovered yet', canvas.width / 2, canvas.height / 2);
      ctx.fillText('Travel or Scout to reveal the world', canvas.width / 2, canvas.height / 2 + 30);
      return;
    }

    // Calculate render scale
    const tileSize = TILE_SIZE * zoom;
    const worldWidth = mapData.bounds.width * tileSize;
    const worldHeight = mapData.bounds.height * tileSize;

    // Center world in viewport with pan offset
    const offsetX = (canvas.width - worldWidth) / 2 + panOffset.x;
    const offsetY = (canvas.height - worldHeight) / 2 + panOffset.y;

    // Create tile lookup for fast rendering
    const tileMap = new Map<string, MapTile>();
    mapData.tiles.forEach(tile => {
      tileMap.set(`${tile.x},${tile.y}`, tile);
    });

    // Render all tiles in bounds
    for (let tileY = mapData.bounds.minY; tileY <= mapData.bounds.maxY; tileY++) {
      for (let tileX = mapData.bounds.minX; tileX <= mapData.bounds.maxX; tileX++) {
        const tile = tileMap.get(`${tileX},${tileY}`);

        const screenX = offsetX + (tileX - mapData.bounds.minX) * tileSize;
        const screenY = offsetY + (tileY - mapData.bounds.minY) * tileSize;

        if (!tile) {
          // Unexplored (dark gray)
          ctx.fillStyle = '#1a1a1f';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        } else {
          // Get biome color
          const baseColor = BIOME_COLORS[tile.biome] || '#666';

          if (tile.fogState === 'explored') {
            // Explored but not currently visible (muted)
            ctx.fillStyle = darkenColor(baseColor, 0.4);
          } else {
            // Visible (full color)
            ctx.fillStyle = baseColor;
          }

          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        }
      }
    }

    // Draw grid (only if zoomed in enough)
    if (tileSize >= 8) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= mapData.bounds.width; x++) {
        const screenX = offsetX + x * tileSize;
        ctx.beginPath();
        ctx.moveTo(screenX, offsetY);
        ctx.lineTo(screenX, offsetY + worldHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= mapData.bounds.height; y++) {
        const screenY = offsetY + y * tileSize;
        ctx.beginPath();
        ctx.moveTo(offsetX, screenY);
        ctx.lineTo(offsetX + worldWidth, screenY);
        ctx.stroke();
      }
    }

    // Draw roads after overlays for visibility
    if (mapData.roads.length > 0) {
      ctx.save();
      ctx.lineWidth = Math.max(1, tileSize * 0.35);
      ctx.strokeStyle = 'rgba(214, 188, 104, 0.85)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(214, 188, 104, 0.35)';
      ctx.shadowBlur = Math.max(2, tileSize * 0.6);

      for (const road of mapData.roads) {
        if (!road.polyline || road.polyline.length < 2) continue;

        ctx.beginPath();
        road.polyline.forEach((point, index) => {
          const screenX = offsetX + (point.x - mapData.bounds.minX) * tileSize;
          const screenY = offsetY + (point.y - mapData.bounds.minY) * tileSize;
          if (index === 0) {
            ctx.moveTo(screenX, screenY);
          } else {
            ctx.lineTo(screenX, screenY);
          }
        });
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw player position marker
    const playerScreenX = offsetX + (mapData.playerPosition.x - mapData.bounds.minX) * tileSize;
    const playerScreenY = offsetY + (mapData.playerPosition.y - mapData.bounds.minY) * tileSize;

    // Player marker (glowing circle)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#d4af37';
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(
      playerScreenX + tileSize / 2,
      playerScreenY + tileSize / 2,
      Math.max(4, tileSize * 0.8),
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player label
    if (tileSize >= 4) {
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(10, tileSize * 2)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'YOU',
        playerScreenX + tileSize / 2,
        playerScreenY - tileSize * 1.5
      );
    }

    // Cleanup function to clear canvas on unmount
    return () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [mapData, zoom, panOffset]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(4.0, prev * delta)));
  };

  // Mouse pan (drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle tile click for travel destination
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mapData || !canvasRef.current || isDragging || !onTileClick) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tileSize = TILE_SIZE * zoom;
    const worldWidth = mapData.bounds.width * tileSize;
    const worldHeight = mapData.bounds.height * tileSize;
    const offsetX = (canvas.width - worldWidth) / 2 + panOffset.x;
    const offsetY = (canvas.height - worldHeight) / 2 + panOffset.y;

    // Convert click coordinates to tile coordinates
    const tileX = Math.floor((clickX - offsetX) / tileSize) + mapData.bounds.minX;
    const tileY = Math.floor((clickY - offsetY) / tileSize) + mapData.bounds.minY;

    // Verify the click is within bounds
    if (
      tileX >= mapData.bounds.minX &&
      tileX <= mapData.bounds.maxX &&
      tileY >= mapData.bounds.minY &&
      tileY <= mapData.bounds.maxY
    ) {
      onTileClick({ x: tileX, y: tileY });
    }
  };

  // View mode toggle
  const toggleViewMode = () => {
    if (viewMode === 'world') {
      setViewMode('region');
      setZoom(2.0); // Zoom in for region view
    } else {
      setViewMode('world');
      setZoom(1.0); // Zoom out for world view
      setPanOffset({ x: 0, y: 0 }); // Reset pan
    }
  };

  // Center on player
  const centerOnPlayer = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(2.0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading world map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ {error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{ ...styles.button, marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Minimal controls for minimap, full controls for fullscreen */}
      {isFullscreen && (
        <div style={styles.controls}>
          <button onClick={toggleViewMode} style={styles.button}>
            {viewMode === 'world' ? '🌍 World View' : '🗺️ Region View'}
          </button>
          <button onClick={centerOnPlayer} style={styles.button}>
            📍 Center on Player
          </button>
          <button onClick={() => setZoom(z => Math.min(4.0, z * 1.2))} style={styles.button}>
            ➕ Zoom In
          </button>
          <button onClick={() => setZoom(z => Math.max(0.5, z * 0.8))} style={styles.button}>
            ➖ Zoom Out
          </button>
          <span style={styles.info}>
            Tiles Discovered: {mapData?.tilesDiscovered ?? 0} | Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      />
    </div>
  );
}

// Utility: Darken color for fog effect
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.floor(r * factor);
  const newG = Math.floor(g * factor);
  const newB = Math.floor(b * factor);

  return `rgb(${newR}, ${newG}, ${newB})`;
}

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    background: '#0a0a0f',
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute' as const,
    top: '0.25rem',
    left: '0.25rem',
    zIndex: 10,
    display: 'flex',
    gap: '0.25rem',
    alignItems: 'center',
    background: 'rgba(20, 20, 30, 0.8)',
    padding: '0.25rem',
    borderRadius: '4px',
    border: '1px solid #444',
  },
  button: {
    padding: '0.25rem 0.5rem',
    background: '#d4af37',
    color: '#000',
    border: 'none',
    borderRadius: '3px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    fontSize: '0.7rem',
  },
  info: {
    color: '#aaa',
    fontSize: '0.65rem',
    marginLeft: '0.5rem',
  },
  canvas: {
    width: '100%',
    height: '100%',
    cursor: 'grab',
  },
  loading: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#aaa',
    fontSize: '0.9rem',
  },
};
