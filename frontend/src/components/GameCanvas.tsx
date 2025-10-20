import React, { useCallback, useMemo, useState } from 'react';
import Phaser from 'phaser';
import usePhaserGame from '../hooks/usePhaserGame';
import {
  MAP_SCENE_KEY,
  type MapZoneDefinition,
} from '../game/types';
import MapScene from '../game/scenes/MapScene';
import { usePhaserBridge } from '../contexts/PhaserBridgeProvider';

const defaultLoadingIndicator = (
  <span style={{ color: '#c5d1ff', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
    Loading map…
  </span>
);

export interface GameCanvasProps {
  initialZone?: MapZoneDefinition | null;
  config?:
    | Phaser.Types.Core.GameConfig
    | ((context: { container: HTMLDivElement }) => Phaser.Types.Core.GameConfig);
  className?: string;
  style?: React.CSSProperties;
  loadingIndicator?: React.ReactNode;
  onSceneReady?: (sceneKey: string) => void;
  onGameReady?: (game: Phaser.Game) => void;
  onZoomChange?: (zoom: number) => void;
}

const createDefaultConfig = (): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  backgroundColor: '#0f1224',
  parent: undefined,
  scene: [MapScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

const GameCanvas: React.FC<GameCanvasProps> = ({
  initialZone,
  config,
  className,
  style,
  loadingIndicator = defaultLoadingIndicator,
  onSceneReady,
  onGameReady,
  onZoomChange,
}) => {
  const { bridge, emitToPhaser, onPhaserEvent } = usePhaserBridge();

  const phaserConfig = useMemo(
    () => config ?? createDefaultConfig(),
    [config]
  );

  const [sceneReady, setSceneReady] = useState(false);
  const [sceneKey, setSceneKey] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const lastZoneIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onPhaserEvent('scene/ready', ({ sceneKey: readyScene }) => {
      setSceneReady(true);
      setSceneKey(readyScene);
      onSceneReady?.(readyScene);
    });
    return unsubscribe;
  }, [onPhaserEvent, onSceneReady]);

  React.useEffect(() => {
    const unsubscribe = onPhaserEvent('zone/loaded', ({ zoneId }) => {
      lastZoneIdRef.current = zoneId;
    });
    return unsubscribe;
  }, [onPhaserEvent]);

  React.useEffect(() => {
    if (!sceneReady || !initialZone) {
      return;
    }
    if (lastZoneIdRef.current === initialZone.id && bridge.getGameState().currentZoneId === initialZone.id) {
      return;
    }

    // Delay zone loading to ensure Phaser is fully initialized
    const timer = setTimeout(() => {
      emitToPhaser('zone/load', {
        zone: initialZone,
        focusPlayer: true,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [sceneReady, initialZone, emitToPhaser, bridge]);

  React.useEffect(
    () => () => {
      if (lastZoneIdRef.current) {
        emitToPhaser('zone/unload', { zoneId: lastZoneIdRef.current });
      }
    },
    [emitToPhaser]
  );

  const handleResize = useCallback((size: { width: number; height: number }) => {
    setCanvasSize(size);
  }, []);

  const { containerRef } = usePhaserGame({
    config: phaserConfig,
    bridge,
    onResize: handleResize,
    onGameReady,
    dependencies: [phaserConfig],
  });

  const rootClassName = useMemo(() => {
    const classes = ['game-canvas__root'];
    if (className) {
      classes.push(className);
    }
    return classes.join(' ');
  }, [className]);

  return (
    <div
      className={rootClassName}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0a0c18',
        ...style,
      }}
      data-scene-key={sceneKey ?? 'pending'}
      data-zone-id={lastZoneIdRef.current ?? initialZone?.id ?? 'unloaded'}
    >
      <div
        ref={containerRef}
        data-testid="phaser-root"
        data-scene={sceneKey ?? MAP_SCENE_KEY}
        style={{ width: '100%', height: '100%' }}
      />
      {!sceneReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background:
              'linear-gradient(135deg, rgba(10,12,24,0.72) 0%, rgba(16,21,43,0.82) 100%)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {loadingIndicator}
        </div>
      )}
      {canvasSize && (
        <span
          style={{
            position: 'absolute',
            right: 12,
            bottom: 8,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            color: '#616a9e',
            background: 'rgba(6, 8, 18, 0.64)',
            padding: '2px 6px',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        >
          {Math.round(canvasSize.width)}×{Math.round(canvasSize.height)}
        </span>
      )}
    </div>
  );
};

export default GameCanvas;
