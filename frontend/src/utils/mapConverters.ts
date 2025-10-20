import { TileType } from '../game/generation/types';
import type { MapZoneDefinition } from '../game/types';

// Create detailed atmospheric tileset for overworld (32x32, pixel art style)
const createAtmosphericTileset = () => {
  const canvas = document.createElement('canvas');
  const tileSize = 32;
  // Create a 16-wide tileset (power of 2, Phaser-friendly)
  canvas.width = tileSize * 16;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d')!;

  const drawTile = (index: number, drawer: (x: number) => void) => {
    const x = index * tileSize;
    ctx.save();
    ctx.translate(x, 0);
    drawer(0);
    ctx.restore();
  };

  // 0: EMPTY (void/black)
  drawTile(0, (x) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, tileSize, tileSize);
  });

  // 1: FLOOR (stone path with detail)
  drawTile(1, (x) => {
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Stone tiles pattern
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const sx = i * 8;
        const sy = j * 8;
        ctx.strokeRect(sx + 0.5, sy + 0.5, 8, 8);
      }
    }

    // Weathering/cracks
    ctx.fillStyle = '#3b4553';
    ctx.fillRect(5, 12, 3, 1);
    ctx.fillRect(18, 8, 2, 1);
    ctx.fillRect(24, 20, 4, 1);
  });

  // 2: WALL (stone wall with bricks)
  drawTile(2, (x) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, tileSize);
    gradient.addColorStop(0, '#4a3520');
    gradient.addColorStop(1, '#3d2817');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Brick pattern
    ctx.strokeStyle = '#2d1f12';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 4; row++) {
      const yPos = row * 8;
      const offset = (row % 2) * 8;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(tileSize, yPos);
      ctx.stroke();

      if (offset > 0) {
        ctx.beginPath();
        ctx.moveTo(offset, yPos);
        ctx.lineTo(offset, yPos + 8);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(offset + 16, yPos);
      ctx.lineTo(offset + 16, yPos + 8);
      ctx.stroke();
    }
  });

  // 3: DOOR (wooden door with details)
  drawTile(3, (x) => {
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Wood planks
    ctx.fillStyle = '#8b5a3c';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(4, 4 + i * 6, 24, 5);
    }

    // Door frame
    ctx.strokeStyle = '#4a2f1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 28, 28);

    // Handle
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(22, 16, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // 10: GRASS (lush green with varied tones)
  drawTile(10, (x) => {
    // Base grass
    ctx.fillStyle = '#4a7c4e';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Grass blade clusters
    ctx.fillStyle = '#5a8c5e';
    for (let i = 0; i < 8; i++) {
      const gx = (i * 11) % tileSize;
      const gy = ((i * 7) % 24) + 4;
      ctx.fillRect(gx, gy, 2, 3);
      ctx.fillRect(gx + 2, gy - 1, 2, 3);
    }

    // Darker grass patches for depth
    ctx.fillStyle = '#3a6c3e';
    ctx.fillRect(4, 8, 6, 6);
    ctx.fillRect(20, 18, 8, 7);

    // Light highlights
    ctx.fillStyle = '#6a9c6e';
    for (let i = 0; i < 4; i++) {
      const hx = (i * 13 + 2) % 28;
      const hy = (i * 9 + 3) % 28;
      ctx.fillRect(hx, hy, 1, 2);
    }
  });

  // 11: TREE (detailed tree with canopy)
  drawTile(11, (x) => {
    // Background (grass behind tree)
    ctx.fillStyle = '#3a6c3e';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Tree shadow
    ctx.fillStyle = '#1a3a1e';
    ctx.beginPath();
    ctx.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(13, 18, 6, 12);
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(14, 18, 2, 12); // Highlight on trunk

    // Canopy (multiple layers for depth)
    ctx.fillStyle = '#2d5a2d';
    ctx.beginPath();
    ctx.arc(16, 14, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d6a3d';
    ctx.beginPath();
    ctx.arc(13, 12, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a7c4e';
    ctx.beginPath();
    ctx.arc(18, 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // Light spots on leaves
    ctx.fillStyle = '#5a8c5e';
    ctx.fillRect(12, 8, 2, 2);
    ctx.fillRect(20, 12, 2, 2);
  });

  // 12: WATER (animated-looking water with ripples)
  drawTile(12, (x) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, tileSize);
    gradient.addColorStop(0, '#2e6a8a');
    gradient.addColorStop(0.5, '#1e5a7a');
    gradient.addColorStop(1, '#0e4a6a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Ripple effects
    ctx.strokeStyle = '#3e7a9a';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(8, 12, 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(24, 20, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Light reflections
    ctx.fillStyle = '#5eaaca';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(6, 8, 3, 2);
    ctx.fillRect(22, 16, 2, 2);
    ctx.globalAlpha = 1.0;
  });

  // 13: ROAD (dirt/stone path)
  drawTile(13, (x) => {
    // Base dirt color
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Darker dirt patches for texture
    ctx.fillStyle = '#6b5345';
    ctx.fillRect(4, 6, 8, 6);
    ctx.fillRect(18, 12, 6, 8);
    ctx.fillRect(8, 22, 10, 5);

    // Light dirt/sand patches
    ctx.fillStyle = '#9b8365';
    ctx.fillRect(12, 4, 6, 4);
    ctx.fillRect(24, 18, 5, 6);
    ctx.fillRect(2, 24, 8, 4);

    // Small stones/pebbles
    ctx.fillStyle = '#7b6355';
    ctx.fillRect(6, 10, 2, 2);
    ctx.fillRect(16, 8, 2, 2);
    ctx.fillRect(22, 14, 2, 2);
    ctx.fillRect(10, 18, 2, 2);
    ctx.fillRect(28, 26, 2, 2);

    // Wheel ruts (two parallel lines)
    ctx.strokeStyle = '#5b4335';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(8, tileSize);
    ctx.moveTo(24, 0);
    ctx.lineTo(24, tileSize);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  });

  // 14: SAND (beach/desert)
  drawTile(14, (x) => {
    // Base sand color
    ctx.fillStyle = '#ddc57e';
    ctx.fillRect(0, 0, tileSize, tileSize);

    // Darker sand variations
    ctx.fillStyle = '#cdb56e';
    ctx.fillRect(6, 8, 10, 6);
    ctx.fillRect(20, 18, 8, 8);

    // Lighter highlights
    ctx.fillStyle = '#edce8e';
    ctx.fillRect(4, 4, 6, 4);
    ctx.fillRect(24, 12, 6, 6);
    ctx.fillRect(10, 22, 8, 6);

    // Small grain texture
    ctx.fillStyle = '#bda55e';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 30; i++) {
      const px = (i * 7) % tileSize;
      const py = (i * 11) % tileSize;
      ctx.fillRect(px, py, 1, 1);
    }
    ctx.globalAlpha = 1.0;
  });

  return canvas.toDataURL();
};

export function convertProcGenToZone(
  genMap: any, // Accept any generator result
  id: string,
  name: string
): MapZoneDefinition {
  const tilesetImage = createAtmosphericTileset();
  const tileSize = 32; // Good size for overworld tiles

  return {
    id,
    name,
    tileWidth: tileSize,
    tileHeight: tileSize,
    size: {
      width: genMap.width,
      height: genMap.height,
    },
    tilesets: [
      {
        key: 'overworld-tiles',
        imageUrl: tilesetImage,
        tileWidth: tileSize,
        tileHeight: tileSize,
      },
    ],
    layers: {
      ground: [
        {
          id: 'ground-layer',
          tilesetKey: 'overworld-tiles',
          data: genMap.tiles,
          depth: 0,
        },
      ],
      collision: [
        {
          id: 'collision-layer',
          tilesetKey: 'overworld-tiles',
          data: genMap.tiles.map((row: number[]) =>
            row.map((tile: number) => (tile === TileType.WALL || tile === TileType.TREE) ? tile : 0)
          ),
          visible: false,
          collision: {
            indexes: [TileType.WALL, TileType.TREE],
          },
        },
      ],
    },
    spawnPoint: {
      x: genMap.spawnPoint.x * tileSize + (tileSize / 2),
      y: genMap.spawnPoint.y * tileSize + (tileSize / 2),
    },
    meta: {
      description: genMap.rooms
        ? 'A mysterious dungeon with winding passages'
        : genMap.interestingPoints?.village_center
        ? 'A small village nestled in the wilderness'
        : 'An open wilderness waiting to be explored',
      tileSize,
      biomeType: genMap.rooms ? 'dungeon' : 'overworld',
      roomCount: genMap.rooms?.length,
      pois: genMap.interestingPoints,
    },
  };
}
