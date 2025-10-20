import { useMemo, useState } from 'react';
import { PhaserBridgeProvider } from '../contexts/PhaserBridgeProvider';
import GameCanvas from '../components/GameCanvas';
import { DungeonGenerator } from '../game/generation/DungeonGenerator';
import { BiomeGenerator } from '../game/generation/BiomeGenerator';
import { TileType } from '../game/generation/types';
import type { MapZoneDefinition } from '../game/types';

// Simple tileset placeholder - you can replace with actual tile images
const createPlaceholderTileset = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 16 * 16; // 16 tiles wide
  canvas.height = 16; // 1 tile high
  const ctx = canvas.getContext('2d')!;

  // EMPTY (0)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 16, 16);

  // FLOOR (1)
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(16, 0, 16, 16);

  // WALL (2)
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(32, 0, 16, 16);

  // DOOR (3)
  ctx.fillStyle = '#d2691e';
  ctx.fillRect(48, 0, 16, 16);

  // GRASS (10)
  ctx.fillStyle = '#228b22';
  ctx.fillRect(160, 0, 16, 16);

  // TREE (11)
  ctx.fillStyle = '#006400';
  ctx.fillRect(176, 0, 16, 16);

  return canvas.toDataURL();
};

function convertProcGenToZone(
  genMap: ReturnType<DungeonGenerator['generate']> | ReturnType<BiomeGenerator['generate']>,
  id: string,
  name: string
): MapZoneDefinition {
  const tilesetImage = createPlaceholderTileset();

  return {
    id,
    name,
    tileWidth: 16,
    tileHeight: 16,
    size: {
      width: genMap.width,
      height: genMap.height,
    },
    tilesets: [
      {
        key: 'basic-tiles',
        imageUrl: tilesetImage,
        tileWidth: 16,
        tileHeight: 16,
      },
    ],
    layers: {
      ground: [
        {
          id: 'ground-layer',
          tilesetKey: 'basic-tiles',
          data: genMap.tiles,
          depth: 0,
        },
      ],
      collision: [
        {
          id: 'collision-layer',
          tilesetKey: 'basic-tiles',
          data: genMap.tiles.map(row =>
            row.map(tile => (tile === TileType.WALL || tile === TileType.TREE) ? tile : 0)
          ),
          visible: false,
          collision: {
            indexes: [TileType.WALL, TileType.TREE],
          },
        },
      ],
    },
    spawnPoint: {
      x: genMap.spawnPoint.x * 16 + 8,
      y: genMap.spawnPoint.y * 16 + 8,
    },
  };
}

export default function MapPreviewPage() {
  const [mapType, setMapType] = useState<'dungeon' | 'forest'>('dungeon');
  const [seed, setSeed] = useState<number>(Date.now());

  const currentZone = useMemo(() => {
    if (mapType === 'dungeon') {
      const generator = new DungeonGenerator({
        width: 80,
        height: 50,
        seed,
        roomWidth: [5, 12],
        roomHeight: [5, 10],
      });
      const map = generator.generate();
      return convertProcGenToZone(map, 'dungeon-01', 'Procedural Dungeon');
    } else {
      const generator = new BiomeGenerator({
        width: 100,
        height: 75,
        seed,
        randomizationFactor: 0.47,
        smoothingCycles: 5,
      });
      const map = generator.generate();
      return convertProcGenToZone(map, 'forest-01', 'Procedural Forest');
    }
  }, [mapType, seed]);

  const regenerate = () => {
    setSeed(Date.now());
  };

  return (
    <PhaserBridgeProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#eee',
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#16213e',
          borderBottom: '2px solid #0f3460',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Phaser 3 + rot.js Map PoC</h1>
          <button
            onClick={() => setMapType('dungeon')}
            style={{
              padding: '0.5rem 1rem',
              background: mapType === 'dungeon' ? '#0f3460' : '#16213e',
              color: '#eee',
              border: '1px solid #0f3460',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Dungeon
          </button>
          <button
            onClick={() => setMapType('forest')}
            style={{
              padding: '0.5rem 1rem',
              background: mapType === 'forest' ? '#0f3460' : '#16213e',
              color: '#eee',
              border: '1px solid #0f3460',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Forest Biome
          </button>
          <button
            onClick={regenerate}
            style={{
              padding: '0.5rem 1rem',
              background: '#0f3460',
              color: '#eee',
              border: '1px solid #0f3460',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Regenerate (New Seed)
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.7 }}>
            Seed: {seed}
          </span>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <GameCanvas
            key={`${mapType}-${seed}`}
            initialZone={currentZone}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#16213e',
          fontSize: '0.85rem',
          borderTop: '1px solid #0f3460',
        }}>
          <strong>Controls:</strong> Click map to move player | Blue dot = player |
          {mapType === 'dungeon' ? ' Brown = walls, Gray = floor, Orange = doors/corridors' : ' Green = grass, Dark green = trees'}
        </div>
      </div>
    </PhaserBridgeProvider>
  );
}
