import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  type GameStatePatch,
  type GameStateSnapshot,
  type PhaserBridge,
  type PhaserBridgeContextValue,
  type PhaserToReactEvents,
  type ReactToPhaserEvents,
} from '../game/types';

type UnknownListener = (payload: any) => void;

interface Emitter<Events> {
  emit<K extends keyof Events>(event: K, payload: Events[K]): void;
  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void
  ): () => void;
  clear(): void;
}

const createEmitter = <Events,>(): Emitter<Events> => {
  const listeners = new Map<keyof Events, Set<UnknownListener>>();

  return {
    emit(event, payload) {
      const handlers = listeners.get(event);
      if (!handlers?.size) {
        return;
      }
      handlers.forEach((listener) => {
        try {
          (listener as (data: Events[keyof Events]) => void)(payload);
        } catch (error) {
          console.error(`[PhaserBridge] Listener for "${String(event)}" failed`, error);
        }
      });
    },
    on(event, handler) {
      const entry = listeners.get(event) ?? new Set<UnknownListener>();
      entry.add(handler as UnknownListener);
      listeners.set(event, entry);
      return () => {
        entry.delete(handler as UnknownListener);
        if (entry.size === 0) {
          listeners.delete(event);
        }
      };
    },
    clear() {
      listeners.clear();
    },
  };
};

export interface PhaserBridgeProviderProps {
  children: ReactNode;
  initialState?: Partial<GameStateSnapshot>;
}

const defaultState: GameStateSnapshot = {
  currentZoneId: null,
  playerPosition: null,
  isReady: false,
  zonesLoaded: {},
  playerState: null,
  metadata: {},
};

const PhaserBridgeContext = createContext<PhaserBridgeContextValue | null>(null);

export const PhaserBridgeProvider: React.FC<PhaserBridgeProviderProps> = ({
  children,
  initialState,
}) => {
  const [gameState, setGameState] = useState<GameStateSnapshot>({
    ...defaultState,
    ...initialState,
    zonesLoaded: { ...defaultState.zonesLoaded, ...initialState?.zonesLoaded },
  });

  const gameStateRef = useRef<GameStateSnapshot>(gameState);
  gameStateRef.current = gameState;

  const reactToPhaserEmitterRef = useRef(createEmitter<ReactToPhaserEvents>());
  const phaserToReactEmitterRef = useRef(createEmitter<PhaserToReactEvents>());

  const applyGameStatePatch = useCallback(
    (patch: GameStatePatch) => {
      setGameState((previous) => {
        const partial = typeof patch === 'function' ? patch(previous) : patch;
        const next = {
          ...previous,
          ...partial,
          zonesLoaded: {
            ...previous.zonesLoaded,
            ...(partial as Partial<GameStateSnapshot>)?.zonesLoaded,
          },
        };
        gameStateRef.current = next;
        return next;
      });
    },
    [setGameState]
  );

  const emitToPhaser = useCallback(
    <K extends keyof ReactToPhaserEvents>(event: K, payload: ReactToPhaserEvents[K]) => {
      reactToPhaserEmitterRef.current.emit(event, payload);
    },
    []
  );

  const onPhaserEvent = useCallback(
    <K extends keyof PhaserToReactEvents>(
      event: K,
      handler: (payload: PhaserToReactEvents[K]) => void
    ) => phaserToReactEmitterRef.current.on(event, handler),
    []
  );

  const bridge: PhaserBridge = useMemo(
    () => ({
      emitToReact: <K extends keyof PhaserToReactEvents>(
        event: K,
        payload: PhaserToReactEvents[K]
      ) => {
        phaserToReactEmitterRef.current.emit(event, payload);
      },
      onReactEvent: <K extends keyof ReactToPhaserEvents>(
        event: K,
        handler: (payload: ReactToPhaserEvents[K]) => void
      ) => reactToPhaserEmitterRef.current.on(event, handler),
      getGameState: () => gameStateRef.current,
      updateGameState: applyGameStatePatch,
    }),
    [applyGameStatePatch]
  );

  const contextValue = useMemo<PhaserBridgeContextValue>(
    () => ({
      bridge,
      emitToPhaser,
      onPhaserEvent,
      gameState,
      updateGameState: applyGameStatePatch,
    }),
    [applyGameStatePatch, bridge, emitToPhaser, gameState, onPhaserEvent]
  );

  return (
    <PhaserBridgeContext.Provider value={contextValue}>
      {children}
    </PhaserBridgeContext.Provider>
  );
};

export const usePhaserBridge = (): PhaserBridgeContextValue => {
  const context = useContext(PhaserBridgeContext);
  if (!context) {
    throw new Error('usePhaserBridge must be used within a PhaserBridgeProvider');
  }
  return context;
};

export { PhaserBridgeContext };
export default PhaserBridgeProvider;
