import { useState, useCallback, useRef, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import MapControls from './MapControls';
import type { MapZoneDefinition } from '../game/types';

export interface ZoomableGameCanvasProps {
  initialZone?: MapZoneDefinition | null;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
}

export default function ZoomableGameCanvas({ initialZone, onFullscreenToggle }: ZoomableGameCanvasProps) {
  const [zoom, setZoom] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameRef = useRef<Phaser.Game | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const newState = !prev;
      onFullscreenToggle?.(newState);
      return newState;
    });
  }, [onFullscreenToggle]);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    gameRef.current = game;
  }, []);

  // Apply zoom to Phaser camera (only if scene is active)
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MapScene');
      if (scene && scene.cameras && scene.sys && scene.sys.isActive()) {
        scene.cameras.main.setZoom(zoom);
      }
    }
  }, [zoom]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleZoomIn, handleZoomOut]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 right-2 z-10">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onToggleFullscreen={handleToggleFullscreen}
          currentZoom={zoom}
          isFullscreen={isFullscreen}
        />
      </div>
      <GameCanvas
        initialZone={initialZone}
        onGameReady={handleGameReady}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
      />
    </div>
  );
}
