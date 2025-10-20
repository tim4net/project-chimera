import Phaser from 'phaser';
import {
  DEFAULT_PLAYER_TEXTURE_KEY,
  MAP_SCENE_KEY,
  type FogLayerDefinition,
  type MapZoneDefinition,
  type ObjectLayerDefinition,
  type PhaserBridge,
  type PlayerState,
  type ReactToPhaserEvents,
  type TilemapLayerDefinition,
  type Vector2Like,
} from '../types';

type DepthEntity = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Depth &
  Phaser.GameObjects.Components.Transform;

const CAMERA_LERP = 0.18;
const PLAYER_BASE_SPEED = 180;
const PLAYER_STOP_THRESHOLD = 6;
const GROUND_DEPTH_BASE = 0;
const COLLISION_DEPTH_BASE = 100;
const OBJECT_DEPTH_BASE = 300;
const FOG_DEPTH_BASE = 900;

export default class MapScene extends Phaser.Scene {
  private bridge?: PhaserBridge;
  private activeZone?: MapZoneDefinition;
  private tilemap?: Phaser.Tilemaps.Tilemap;
  private tilesetLookup = new Map<string, Phaser.Tilemaps.Tileset>();

  private groundLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private fogLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private objectContainer?: Phaser.GameObjects.Container;
  private colliders: Phaser.Physics.Arcade.Collider[] = [];

  private player?: Phaser.Physics.Arcade.Sprite;
  private depthEntities = new Set<DepthEntity>();
  private playerTarget?: Phaser.Math.Vector2;

  private playerState: PlayerState = {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: 'down',
    isMoving: false,
  };

  private lastPlayerBroadcast = 0;
  private readonly broadcastInterval = 100;

  private collisionDebugGraphics?: Phaser.GameObjects.Graphics;
  private showCollisionDebug = false;
  private unsubscribers: Array<() => void> = [];

  // Path visualization
  private pathGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super(MAP_SCENE_KEY);
  }

  create(): void {
    this.bridge = this.registry.get('phaserBridge') as PhaserBridge | undefined;
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleDestroy, this);

    this.ensurePlayerTexture();

    if (this.bridge) {
      this.unsubscribers.push(
        this.bridge.onReactEvent('zone/load', (payload) => this.handleZoneLoad(payload))
      );
      this.unsubscribers.push(
        this.bridge.onReactEvent('zone/unload', (payload) => this.handleZoneUnload(payload))
      );
      this.unsubscribers.push(
        this.bridge.onReactEvent('player/set-target', (payload) =>
          this.handlePlayerSetTarget(payload)
        )
      );
      this.unsubscribers.push(
        this.bridge.onReactEvent('player/teleport', (payload) =>
          this.handlePlayerTeleport(payload)
        )
      );
      this.unsubscribers.push(
        this.bridge.onReactEvent('debug/toggle-collision', (payload) =>
          this.toggleCollisionDebug(payload.enabled)
        )
      );
    }

    this.bridge?.emitToReact('scene/ready', { sceneKey: this.scene.key });
  }

  update(time: number): void {
    if (!this.player) {
      return;
    }

    this.updatePlayerMovement();
    this.updateDepthSorting();
    this.broadcastPlayerState(time);
  }

  private handleZoneLoad = async (payload: ReactToPhaserEvents['zone/load']) => {
    const { zone, focusPlayer = true } = payload;

    try {
      await this.loadZone(zone, focusPlayer);
    } catch (error) {
      console.error('[MapScene] Failed to load zone', zone.id, error);
      this.bridge?.emitToReact('error', {
        message: (error as Error).message,
        context: { zoneId: zone.id },
      });
    }
  };

  private handleZoneUnload = (payload: ReactToPhaserEvents['zone/unload']) => {
    const { zoneId } = payload;
    if (zoneId && this.activeZone?.id !== zoneId) {
      return;
    }
    this.unloadZone();
  };

  private handlePlayerSetTarget = (payload: ReactToPhaserEvents['player/set-target']) => {
    if (!this.player) {
      return;
    }
    const { x, y, speed } = payload;
    this.playerTarget = new Phaser.Math.Vector2(x, y);
    const velocity = this.physics.velocityFromRotation(
      Phaser.Math.Angle.Between(this.player.x, this.player.y, x, y),
      speed ?? PLAYER_BASE_SPEED
    );
    this.player.setVelocity(velocity.x, velocity.y);
    this.playerState.isMoving = true;

    // Draw path visualization
    this.drawPath(this.player.x, this.player.y, x, y);
  };

  private handlePlayerTeleport = (payload: ReactToPhaserEvents['player/teleport']) => {
    if (!this.player) {
      return;
    }
    const { zoneId, x, y } = payload;
    if (zoneId && zoneId !== this.activeZone?.id) {
      console.warn('[MapScene] Teleport to non-active zone requested; ignoring');
      return;
    }
    this.playerTarget = undefined;
    this.clearPath(); // Clear path visualization on teleport
    this.player.body?.reset(x, y);
    this.player.setPosition(x, y);
    this.player.setVelocity(0, 0);
    this.playerState = {
      ...this.playerState,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      isMoving: false,
    };
  };

  private async loadZone(zone: MapZoneDefinition, focusPlayer: boolean) {
    if (this.activeZone?.id === zone.id) {
      this.unloadZone(false);
    } else {
      this.unloadZone();
    }

    await this.ensureTilesets(zone);
    await this.ensureObjectTextures(zone);

    this.tilemap = this.make.tilemap({
      tileWidth: zone.tileWidth,
      tileHeight: zone.tileHeight,
      width: zone.size.width,
      height: zone.size.height,
    });

    this.tilesetLookup.clear();
    zone.tilesets.forEach((tilesetDefinition) => {
      const tileset = this.tilemap!.addTilesetImage(
        tilesetDefinition.key,
        tilesetDefinition.key,
        tilesetDefinition.tileWidth ?? zone.tileWidth,
        tilesetDefinition.tileHeight ?? zone.tileHeight,
        tilesetDefinition.tileMargin ?? 0,
        tilesetDefinition.tileSpacing ?? 0
      );
      if (!tileset) {
        throw new Error(`Unable to create tileset "${tilesetDefinition.key}"`);
      }
      this.tilesetLookup.set(tilesetDefinition.key, tileset);
    });

    this.groundLayers = zone.layers.ground.map((layer, index) =>
      this.createTileLayer(layer, GROUND_DEPTH_BASE + index)
    );
    this.collisionLayers =
      zone.layers.collision?.map((layer, index) =>
        this.createTileLayer(layer, COLLISION_DEPTH_BASE + index, true)
      ) ?? [];
    this.fogLayers =
      zone.layers.fow?.map((layer, index) =>
        this.createFogLayer(layer, FOG_DEPTH_BASE + index)
      ) ?? [];

    this.buildObjectLayers(zone.layers.objects);

    this.activeZone = zone;
    this.configurePhysics(zone);
    this.ensurePlayer(zone.spawnPoint, focusPlayer);

    this.bridge?.emitToReact('zone/loaded', {
      zoneId: zone.id,
      size: { width: zone.size.width, height: zone.size.height },
    });
    this.bridge?.updateGameState((previous) => ({
      currentZoneId: zone.id,
      isReady: true,
      zonesLoaded: { ...previous.zonesLoaded, [zone.id]: true },
      playerPosition: this.playerState.position,
      playerState: this.playerState,
    }));

    if (this.showCollisionDebug) {
      this.renderCollisionDebug();
    }
  }

  // Additional methods will be added in part 2
  // (createTileLayer, createFogLayer, buildObjectLayers, player management, etc.)
  // This is continued in scene helpers...

  private createTileLayer(
    layerDefinition: TilemapLayerDefinition,
    baseDepth: number,
    enableCollision = false
  ): Phaser.Tilemaps.TilemapLayer {
    if (!this.tilemap) {
      throw new Error('Tilemap not initialised');
    }
    const tileset = this.tilesetLookup.get(layerDefinition.tilesetKey);
    if (!tileset) {
      throw new Error(`Tileset "${layerDefinition.tilesetKey}" missing for layer ${layerDefinition.id}`);
    }

    const layer = this.tilemap.createBlankLayer(layerDefinition.id, tileset, 0, 0);
    if (!layer) {
      throw new Error(`Failed to create layer "${layerDefinition.id}"`);
    }
    layer.putTilesAt(layerDefinition.data, 0, 0);
    layer.setDepth(layerDefinition.depth ?? baseDepth);
    layer.setAlpha(layerDefinition.alpha ?? 1);
    layer.setCullPadding(
      layerDefinition.cullPadding?.x ?? 2,
      layerDefinition.cullPadding?.y ?? 2
    );
    layer.setVisible(layerDefinition.visible ?? true);

    if (enableCollision) {
      const { collision } = layerDefinition;
      if (collision?.indexes?.length) {
        layer.setCollision(collision.indexes);
      }
      if (collision?.defaultCollides) {
        layer.setCollisionByExclusion([-1]);
      }
      if (collision?.properties?.length) {
        layer.forEachTile((tile) => {
          const properties = tile.properties as Record<string, unknown> | undefined;
          if (!properties) {
            return;
          }
          if (collision.properties!.some((key) => Boolean(properties[key]))) {
            tile.setCollision(true, true, true, true);
          }
        });
      }
    }

    return layer;
  }

  private createFogLayer(layerDefinition: FogLayerDefinition, baseDepth: number) {
    const fogLayer = this.createTileLayer(layerDefinition, baseDepth, false);
    fogLayer.setBlendMode(layerDefinition.blendMode ?? Phaser.BlendModes.MULTIPLY);
    if (typeof layerDefinition.tint === 'number') {
      fogLayer.setTint(layerDefinition.tint);
    }
    fogLayer.setAlpha(layerDefinition.alpha ?? 0.75);
    return fogLayer;
  }

  // Scene helpers file continues...
  private buildObjectLayers(layers?: ObjectLayerDefinition[]) {
    this.objectContainer?.destroy(true);
    this.objectContainer = undefined;

    if (!layers?.length) {
      return;
    }

    const container = this.add.container(0, 0);
    container.setDepth(OBJECT_DEPTH_BASE);

    this.depthEntities.clear();
    if (this.player) {
      this.depthEntities.add(this.player as DepthEntity);
    }

    layers.forEach((layer, layerIndex) => {
      const depthBase = layer.depth ?? OBJECT_DEPTH_BASE + layerIndex * 10;
      layer.objects.forEach((objectConfig) => {
        const textureExists = this.textures.exists(objectConfig.textureKey);
        const gameObject = textureExists
          ? this.add.sprite(objectConfig.x, objectConfig.y, objectConfig.textureKey, objectConfig.frame)
          : this.add.rectangle(
              objectConfig.x,
              objectConfig.y,
              this.activeZone?.tileWidth ?? 32,
              this.activeZone?.tileHeight ?? 32,
              0xff00ff,
              0.6
            );

        gameObject.setOrigin(0.5, 1);
        if ('setScale' in gameObject && typeof objectConfig.scale === 'number') {
          (gameObject as Phaser.GameObjects.Sprite).setScale(objectConfig.scale);
        }
        if ('setFlip' in gameObject) {
          (gameObject as Phaser.GameObjects.Sprite).setFlip(
            objectConfig.flipX ?? false,
            objectConfig.flipY ?? false
          );
        }

        gameObject.setData('depthOffset', objectConfig.depthOffset ?? depthBase);
        container.add(gameObject);
        this.depthEntities.add(gameObject as DepthEntity);
      });
    });

    this.objectContainer = container;
  }

  // Continued in next part...
// Append these to MapScene.ts after line 348

  private ensurePlayer(spawnPoint: Vector2Like, focusCamera: boolean) {
    if (!this.player) {
      this.player = this.physics.add.sprite(
        spawnPoint.x,
        spawnPoint.y,
        DEFAULT_PLAYER_TEXTURE_KEY
      );
      this.player.setOrigin(0.5, 1);
      this.player.setDepth(OBJECT_DEPTH_BASE + 100);
      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
      }
    } else {
      this.player.body?.reset(spawnPoint.x, spawnPoint.y);
      this.player.setVelocity(0, 0);
    }

    this.depthEntities.add(this.player as DepthEntity);

    if (focusCamera) {
      this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
    }

    this.player.setPosition(spawnPoint.x, spawnPoint.y);
    this.playerState.position = { ...spawnPoint };
    this.playerState.velocity = { x: 0, y: 0 };
    this.playerState.isMoving = false;

    this.setupCollision();
  }

  private configurePhysics(zone: MapZoneDefinition) {
    const pixelWidth = zone.size.width * zone.tileWidth;
    const pixelHeight = zone.size.height * zone.tileHeight;

    this.physics.world.setBounds(0, 0, pixelWidth, pixelHeight);
    this.cameras.main.setBounds(0, 0, pixelWidth, pixelHeight);
    this.cameras.main.setRoundPixels(false);
  }

  private updatePlayerMovement() {
    if (!this.player) {
      return;
    }

    if (this.playerTarget) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.playerTarget.x,
        this.playerTarget.y
      );
      if (distance <= PLAYER_STOP_THRESHOLD) {
        this.playerTarget = undefined;
        this.player.setVelocity(0, 0);
        this.player.body?.reset(this.player.x, this.player.y);
        this.playerState.isMoving = false;
        this.clearPath(); // Clear path visualization when destination reached
        this.bridge?.emitToReact('player/destination-reached', {
          position: { x: this.player.x, y: this.player.y },
        });
      }
    } else {
      this.player.setVelocity(0, 0);
      this.playerState.isMoving = false;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerState.position = { x: this.player.x, y: this.player.y };
    this.playerState.velocity = { x: body.velocity.x, y: body.velocity.y };
    this.playerState.facing = this.resolveFacing(body.velocity);
  }

  private resolveFacing(velocity: Phaser.Math.Vector2): PlayerState['facing'] {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      return velocity.x >= 0 ? 'right' : 'left';
    }
    if (Math.abs(velocity.y) > 1) {
      return velocity.y >= 0 ? 'down' : 'up';
    }
    return this.playerState.facing ?? 'down';
  }

  private updateDepthSorting() {
    this.depthEntities.forEach((entity) => {
      if (!entity || !entity.scene || !entity.active) {
        this.depthEntities.delete(entity);
        return;
      }
      const offset = (entity.getData('depthOffset') as number) ?? 0;
      const depth = entity.y + offset;
      if (entity.depth !== depth) {
        entity.setDepth(depth);
      }
    });
  }

  private broadcastPlayerState(time: number) {
    if (!this.player) {
      return;
    }
    if (time - this.lastPlayerBroadcast < this.broadcastInterval) {
      return;
    }
    this.lastPlayerBroadcast = time;

    const payload = {
      position: { x: this.player.x, y: this.player.y },
      tilePosition: this.tilemap
        ? {
            x: this.tilemap.worldToTileX(this.player.x) ?? 0,
            y: this.tilemap.worldToTileY(this.player.y) ?? 0,
          }
        : {
            x: Math.floor(this.player.x / (this.activeZone?.tileWidth ?? 32)),
            y: Math.floor(this.player.y / (this.activeZone?.tileHeight ?? 32)),
          },
      velocity: {
        x: this.player.body?.velocity.x ?? 0,
        y: this.player.body?.velocity.y ?? 0,
      },
    };

    this.bridge?.emitToReact('player/moved', payload);
    this.bridge?.updateGameState({
      playerPosition: payload.position,
      playerState: this.playerState,
    });
  }

  private async ensureTilesets(zone: MapZoneDefinition) {
    const missing = zone.tilesets.filter(
      (tileset) => !this.textures.exists(tileset.key)
    );
    if (!missing.length) {
      return;
    }

    // Load all tilesets using Phaser's loader (works with data URIs)
    return new Promise<void>((resolve, reject) => {
      let hasError = false;

      missing.forEach((tileset) => {
        this.load.image(tileset.key, tileset.imageUrl);
      });

      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        if (!hasError) resolve();
      });

      this.load.on('loaderror', (file: Phaser.Loader.File) => {
        hasError = true;
        console.error(`Failed to load tileset "${file.key}"`);
        reject(new Error(`Failed to load tileset "${file.key}"`));
      });

      if (!this.load.isLoading()) {
        this.load.start();
      }
    });
  }

  private async ensureObjectTextures(zone: MapZoneDefinition) {
    const layers = zone.layers.objects ?? [];
    const missing: Array<{ key: string; url: string }> = [];
    layers.forEach((layer) =>
      layer.objects.forEach((object) => {
        if (object.assetUrl && !this.textures.exists(object.textureKey)) {
          missing.push({ key: object.textureKey, url: object.assetUrl });
        }
      })
    );

    if (!missing.length) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      missing.forEach((asset) => {
        this.load.image(asset.key, asset.url);
      });
      this.load.once(Phaser.Loader.Events.COMPLETE, () => resolve());
      this.load.once('loaderror', (file: Phaser.Loader.File) => {
        reject(new Error(`Failed to load object asset "${file.key}"`));
      });
      this.load.start();
    });
  }

  private setupCollision() {
    this.colliders.forEach((collider) => collider.destroy());
    this.colliders = [];

    if (!this.player) {
      return;
    }

    this.collisionLayers.forEach((layer) => {
      const collider = this.physics.add.collider(this.player!, layer);
      this.colliders.push(collider);
    });
  }

  private toggleCollisionDebug(enabled: boolean) {
    this.showCollisionDebug = enabled;
    if (enabled) {
      this.renderCollisionDebug();
    } else {
      this.collisionDebugGraphics?.destroy();
      this.collisionDebugGraphics = undefined;
    }
  }

  private renderCollisionDebug() {
    this.collisionDebugGraphics?.destroy();
    if (!this.collisionLayers.length) {
      return;
    }

    this.collisionDebugGraphics = this.add.graphics();
    this.collisionDebugGraphics.lineStyle(1, 0xffa500, 0.75);

    this.collisionLayers.forEach((layer) => {
      layer.renderDebug(this.collisionDebugGraphics!, {
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
        faceColor: new Phaser.Display.Color(255, 255, 255, 128),
      });
    });
  }

  private unloadZone(updateGameState = true) {
    this.groundLayers.forEach((layer) => layer.destroy());
    this.collisionLayers.forEach((layer) => layer.destroy());
    this.fogLayers.forEach((layer) => layer.destroy());
    this.objectContainer?.destroy(true);

    this.groundLayers = [];
    this.collisionLayers = [];
    this.fogLayers = [];
    this.objectContainer = undefined;

    this.tilesetLookup.clear();
    this.tilemap?.destroy();
    this.tilemap = undefined;

    this.colliders.forEach((collider) => collider.destroy());
    this.colliders = [];

    if (updateGameState) {
      this.bridge?.emitToReact('zone/unloaded', {
        zoneId: this.activeZone?.id ?? null,
      });
      this.bridge?.updateGameState({
        currentZoneId: null,
        isReady: false,
      });
    }

    this.activeZone = undefined;
    this.depthEntities.clear();
    if (this.player) {
      this.depthEntities.add(this.player as DepthEntity);
    }
  }

  private ensurePlayerTexture() {
    if (this.textures.exists(DEFAULT_PLAYER_TEXTURE_KEY)) {
      return;
    }
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Body (blue tunic)
    graphics.fillStyle(0x3b82f6, 1);
    graphics.fillRect(10, 18, 12, 14);

    // Head (skin tone)
    graphics.fillStyle(0xffd7a8, 1);
    graphics.beginPath();
    graphics.arc(16, 14, 6, 0, Math.PI * 2);
    graphics.fillPath();

    // Hair (dark)
    graphics.fillStyle(0x4a3520, 1);
    graphics.fillRect(11, 8, 10, 6);

    // Arms
    graphics.fillStyle(0xffd7a8, 1);
    graphics.fillRect(8, 20, 3, 8);
    graphics.fillRect(21, 20, 3, 8);

    // Legs
    graphics.fillStyle(0x1e40af, 1);
    graphics.fillRect(11, 30, 4, 8);
    graphics.fillRect(17, 30, 4, 8);

    // Boots
    graphics.fillStyle(0x3d2817, 1);
    graphics.fillRect(11, 36, 4, 3);
    graphics.fillRect(17, 36, 4, 3);

    // Belt
    graphics.fillStyle(0x6b4423, 1);
    graphics.fillRect(10, 26, 12, 2);

    // Outline
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokeRect(10, 18, 12, 14);

    graphics.generateTexture(DEFAULT_PLAYER_TEXTURE_KEY, 32, 40);
    graphics.destroy();
  }

  /**
   * Draw a visual path from start to end position
   */
  private drawPath(startX: number, startY: number, endX: number, endY: number) {
    // Create graphics object if it doesn't exist
    if (!this.pathGraphics) {
      this.pathGraphics = this.add.graphics();
      this.pathGraphics.setDepth(50); // Above ground, below player
    }

    // Clear previous path
    this.pathGraphics.clear();

    // Draw line from start to end
    this.pathGraphics.lineStyle(3, 0xffaa00, 0.7); // Orange/amber color
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(startX, startY);
    this.pathGraphics.lineTo(endX, endY);
    this.pathGraphics.strokePath();

    // Draw destination marker (circle)
    this.pathGraphics.fillStyle(0xffaa00, 0.5);
    this.pathGraphics.fillCircle(endX, endY, 8);

    // Draw destination marker outline
    this.pathGraphics.lineStyle(2, 0xffdd00, 0.9);
    this.pathGraphics.strokeCircle(endX, endY, 8);
  }

  /**
   * Clear the path visualization
   */
  private clearPath() {
    if (this.pathGraphics) {
      this.pathGraphics.clear();
    }
  }

  private handleScaleResize(gameSize: Phaser.Structs.Size) {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
  }

  private handleShutdown() {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
  }

  private handleDestroy() {
    // CRITICAL: Unsubscribe bridge listeners to prevent destroyed scene from receiving events
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    this.unsubscribers = [];

    this.collisionDebugGraphics?.destroy();
    this.collisionDebugGraphics = undefined;
    this.pathGraphics?.destroy();
    this.pathGraphics = undefined;
    this.unloadZone(false);
    this.player?.destroy();
    this.player = undefined;
    this.depthEntities.clear();
  }
}
