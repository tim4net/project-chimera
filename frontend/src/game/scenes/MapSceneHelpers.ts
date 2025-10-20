import Phaser from 'phaser';
import type { Vector2Like, PlayerState } from '../types';

const PLAYER_STOP_THRESHOLD = 6;

export function ensurePlayer(
  scene: Phaser.Scene,
  spawnPoint: Vector2Like,
  playerTexture: string,
  depthBase: number
): Phaser.Physics.Arcade.Sprite {
  const player = scene.physics.add.sprite(
    spawnPoint.x,
    spawnPoint.y,
    playerTexture
  );
  player.setOrigin(0.5, 1);
  player.setDepth(depthBase + 100);
  player.body?.setCollideWorldBounds(true);
  return player;
}

export function updatePlayerMovement(
  player: Phaser.Physics.Arcade.Sprite,
  playerTarget: Phaser.Math.Vector2 | undefined,
  playerState: PlayerState
): { newTarget: Phaser.Math.Vector2 | undefined; reachedDestination: boolean } {
  if (playerTarget) {
    const distance = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      playerTarget.x,
      playerTarget.y
    );
    if (distance <= PLAYER_STOP_THRESHOLD) {
      player.setVelocity(0, 0);
      player.body?.reset(player.x, player.y);
      return { newTarget: undefined, reachedDestination: true };
    }
  } else {
    player.setVelocity(0, 0);
  }

  const body = player.body as Phaser.Physics.Arcade.Body;
  playerState.position = { x: player.x, y: player.y };
  playerState.velocity = { x: body.velocity.x, y: body.velocity.y };
  playerState.facing = resolveFacing(body.velocity, playerState.facing);
  playerState.isMoving = playerTarget !== undefined;

  return { newTarget: playerTarget, reachedDestination: false };
}

export function resolveFacing(
  velocity: Phaser.Math.Vector2,
  currentFacing?: PlayerState['facing']
): PlayerState['facing'] {
  if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
    return velocity.x >= 0 ? 'right' : 'left';
  }
  if (Math.abs(velocity.y) > 1) {
    return velocity.y >= 0 ? 'down' : 'up';
  }
  return currentFacing ?? 'down';
}

export function createPlayerTexture(scene: Phaser.Scene, textureKey: string): void {
  if (scene.textures.exists(textureKey)) {
    return;
  }
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0x56b8ff, 1);
  graphics.fillEllipse(16, 20, 22, 32);
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokeEllipse(16, 20, 22, 32);
  graphics.generateTexture(textureKey, 32, 40);
  graphics.destroy();
}

export function updateDepthSorting(
  entities: Set<Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Depth &
    Phaser.GameObjects.Components.Transform>
): void {
  entities.forEach((entity) => {
    if (!entity || !entity.scene || !entity.active) {
      entities.delete(entity);
      return;
    }
    const offset = (entity.getData('depthOffset') as number) ?? 0;
    const depth = entity.y + offset;
    if (entity.depth !== depth) {
      entity.setDepth(depth);
    }
  });
}

export function renderCollisionDebug(
  scene: Phaser.Scene,
  collisionLayers: Phaser.Tilemaps.TilemapLayer[]
): Phaser.GameObjects.Graphics | undefined {
  if (!collisionLayers.length) {
    return undefined;
  }

  const graphics = scene.add.graphics();
  graphics.lineStyle(1, 0xffa500, 0.75);

  collisionLayers.forEach((layer) => {
    layer.renderDebug(graphics, {
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
      faceColor: new Phaser.Display.Color(255, 255, 255, 128),
    });
  });

  return graphics;
}
