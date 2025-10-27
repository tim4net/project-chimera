import { useEffect, useRef, useCallback, type DependencyList } from 'react';
import Phaser from 'phaser';
import type { PhaserBridge } from '../game/types';

export interface UsePhaserGameOptions {
  config:
    | Phaser.Types.Core.GameConfig
    | ((context: { container: HTMLDivElement }) => Phaser.Types.Core.GameConfig);
  bridge?: PhaserBridge;
  onGameReady?: (game: Phaser.Game) => void;
  onResize?: (size: { width: number; height: number }) => void;
  autoResize?: boolean;
  dependencies?: DependencyList;
}

export interface UsePhaserGameResult {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  gameRef: React.MutableRefObject<Phaser.Game | null>;
}

export const usePhaserGame = ({
  config,
  bridge,
  onGameReady,
  onResize,
  autoResize = true,
  dependencies = [],
}: UsePhaserGameOptions): UsePhaserGameResult => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const destroyGame = useCallback((game: Phaser.Game | null) => {
    if (!game) {
      return;
    }
    try {
      game.destroy(true);
    } catch (e) {
      // Game already destroyed
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const baseConfig =
      typeof config === 'function' ? config({ container }) : config;

    const fallbackWidth = Math.max(1, Math.floor(container.clientWidth || window.innerWidth));
    const fallbackHeight = Math.max(1, Math.floor(container.clientHeight || window.innerHeight));

    const mergedScale: Phaser.Types.Core.ScaleConfig = {
      mode: Phaser.Scale.ScaleModes.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      ...baseConfig.scale,
      parent: container,
    };

    const originalPreBoot = baseConfig.callbacks?.preBoot;

    const resolvedConfig: Phaser.Types.Core.GameConfig = {
      ...baseConfig,
      parent: container,
      scale: mergedScale,
      width: baseConfig.width ?? fallbackWidth,
      height: baseConfig.height ?? fallbackHeight,
      callbacks: {
        ...baseConfig.callbacks,
        preBoot: (game: Phaser.Game) => {
          if (bridge) {
            game.registry.set('phaserBridge', bridge);
          }
          originalPreBoot?.(game);
        },
      },
    };

    const phaserGame = new Phaser.Game(resolvedConfig);
    gameRef.current = phaserGame;

    const applySize = (width: number, height: number) => {
      if (!phaserGame || !phaserGame.canvas) {
        return;
      }
      // Check if game is being destroyed
      if ((phaserGame as any).isDestroyed || !phaserGame.scale) {
        return;
      }
      const targetWidth = Math.max(1, Math.floor(width));
      const targetHeight = Math.max(1, Math.floor(height));
      if (targetWidth === 0 || targetHeight === 0) {
        return;
      }
      try {
        if (phaserGame.scale.width !== targetWidth || phaserGame.scale.height !== targetHeight) {
          phaserGame.scale.resize(targetWidth, targetHeight);
          phaserGame.scale.refresh();
        }
        if (phaserGame.canvas) {
          phaserGame.canvas.style.width = '100%';
          phaserGame.canvas.style.height = '100%';
        }
        onResize?.({ width: targetWidth, height: targetHeight });
      } catch (e) {
        // Game is being destroyed, ignore resize errors
      }
    };

    const scheduleResize = (width: number, height: number) => {
      let rafId: number | null = null;
      const run = () => {
        applySize(width, height);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(run);
      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
    };

    const teardownResize = autoResize
      ? (() => {
          const observer = new ResizeObserver((entries) => {
            const entry = entries[entries.length - 1];
            if (!entry) {
              return;
            }
            const cancel = scheduleResize(entry.contentRect.width, entry.contentRect.height);
            return () => cancel();
          });
          observer.observe(container);
          return () => observer.disconnect();
        })()
      : undefined;

    const handleWindowResize = () => {
      const rect = container.getBoundingClientRect();
      applySize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleWindowResize);

    const onBoot = () => {
      const rect = container.getBoundingClientRect();
      applySize(rect.width || fallbackWidth, rect.height || fallbackHeight);
      onGameReady?.(phaserGame);
    };

    if (phaserGame.isBooted) {
      onBoot();
    } else {
      phaserGame.events.once('ready', onBoot);
    }

    return () => {
      teardownResize?.();
      window.removeEventListener('resize', handleWindowResize);
      destroyGame(phaserGame);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bridge,
    autoResize,
    onGameReady,
    onResize,
    destroyGame,
    // maintain explicit dependency spread for consumer-provided deps
    ...dependencies,
  ]);

  return { containerRef, gameRef };
};

export default usePhaserGame;
