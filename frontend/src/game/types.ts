export type Vector2Like = {
  x: number;
  y: number;
};

export interface TilesetDefinition {
  /**
   * Unique key used to reference the tileset within Phaser.
   */
  key: string;
  /**
   * URL or data URI for the image backing this tileset.
   */
  imageUrl: string;
  /**
   * Optional overrides when the tileset uses non-uniform tile dimensions.
   */
  tileWidth?: number;
  tileHeight?: number;
  tileMargin?: number;
  tileSpacing?: number;
}

export interface CollisionConfig {
  /**
   * Explicit tile indices that should collide.
   */
  indexes?: number[];
  /**
   * Tile property names that, when truthy, mark the tile as collidable.
   */
  properties?: string[];
  /**
   * Convenience flag to mark the entire layer as collidable.
   */
  defaultCollides?: boolean;
}

export interface TilemapLayerDefinition {
  id: string;
  tilesetKey: string;
  data: number[][];
  depth?: number;
  alpha?: number;
  visible?: boolean;
  cullPadding?: {
    x?: number;
    y?: number;
  };
  collision?: CollisionConfig;
}

export interface ObjectDefinition {
  id: string;
  x: number;
  y: number;
  textureKey: string;
  frame?: string | number;
  assetUrl?: string;
  depthOffset?: number;
  scale?: number;
  flipX?: boolean;
  flipY?: boolean;
}

export interface ObjectLayerDefinition {
  id: string;
  depth?: number;
  objects: ObjectDefinition[];
}

export interface FogLayerDefinition extends TilemapLayerDefinition {
  tint?: number;
  blendMode?: number;
}

export interface MapZoneDefinition {
  id: string;
  name?: string;
  tileWidth: number;
  tileHeight: number;
  size: {
    width: number;
    height: number;
  };
  tilesets: TilesetDefinition[];
  layers: {
    ground: TilemapLayerDefinition[];
    collision?: TilemapLayerDefinition[];
    objects?: ObjectLayerDefinition[];
    fow?: FogLayerDefinition[];
  };
  spawnPoint: Vector2Like;
  meta?: Record<string, unknown>;
}

export interface PlayerState {
  position: Vector2Like;
  velocity: Vector2Like;
  facing?: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
}

export interface GameStateSnapshot {
  currentZoneId: string | null;
  playerPosition: Vector2Like | null;
  isReady: boolean;
  zonesLoaded: Record<string, boolean>;
  playerState?: PlayerState | null;
  metadata?: Record<string, unknown>;
}

export type GameStatePatch =
  | Partial<GameStateSnapshot>
  | ((previous: GameStateSnapshot) => Partial<GameStateSnapshot>);

export interface ReactToPhaserEvents {
  'zone/load': {
    zone: MapZoneDefinition;
    focusPlayer?: boolean;
  };
  'zone/unload': {
    zoneId?: string;
  };
  'player/set-target': {
    x: number;
    y: number;
    speed?: number;
  };
  'player/teleport': {
    x: number;
    y: number;
    zoneId?: string;
  };
  'debug/toggle-collision': {
    enabled: boolean;
  };
}

export interface PhaserToReactEvents {
  'scene/ready': {
    sceneKey: string;
  };
  'zone/loaded': {
    zoneId: string;
    size: {
      width: number;
      height: number;
    };
  };
  'zone/unloaded': {
    zoneId: string | null;
  };
  'player/moved': {
    position: Vector2Like;
    tilePosition: Vector2Like;
    velocity: Vector2Like;
  };
  'player/destination-reached': {
    position: Vector2Like;
  };
  error: {
    message: string;
    context?: Record<string, unknown>;
  };
}

export interface PhaserBridge {
  emitToReact<K extends keyof PhaserToReactEvents>(
    event: K,
    payload: PhaserToReactEvents[K]
  ): void;
  onReactEvent<K extends keyof ReactToPhaserEvents>(
    event: K,
    handler: (payload: ReactToPhaserEvents[K]) => void
  ): () => void;
  getGameState(): GameStateSnapshot;
  updateGameState(patch: GameStatePatch): void;
}

export interface PhaserBridgeContextValue {
  bridge: PhaserBridge;
  emitToPhaser<K extends keyof ReactToPhaserEvents>(
    event: K,
    payload: ReactToPhaserEvents[K]
  ): void;
  onPhaserEvent<K extends keyof PhaserToReactEvents>(
    event: K,
    handler: (payload: PhaserToReactEvents[K]) => void
  ): () => void;
  gameState: GameStateSnapshot;
  updateGameState(patch: GameStatePatch): void;
}

export const MAP_SCENE_KEY = 'MapScene';
export const DEFAULT_PLAYER_TEXTURE_KEY = 'pc-player-default';
