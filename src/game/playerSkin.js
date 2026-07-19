import Phaser from 'phaser';

const FRAME_WIDTH = 192;
const FRAME_HEIGHT = 208;
const BASE_SCALE = 70 / 198;

export const PLAYER_SKIN = Object.freeze({
  textureKey: 'player-emilia',
  assetPath: 'assets/player/spritesheet.webp',
  frameWidth: FRAME_WIDTH,
  frameHeight: FRAME_HEIGHT,
  idleFrame: 0,
  runAnimationKey: 'emilia-run',
  runFrames: { start: 8, end: 15 },
  jumpAnimationKey: 'emilia-jump',
  jumpFrames: { start: 32, end: 36 },
  baseScale: BASE_SCALE,
  crouchScaleX: 1.05,
  crouchScaleY: 0.58,
});

export function loadPlayerSkin(scene) {
  scene.load.spritesheet(
    PLAYER_SKIN.textureKey,
    `${import.meta.env.BASE_URL}${PLAYER_SKIN.assetPath}`,
    {
      frameWidth: PLAYER_SKIN.frameWidth,
      frameHeight: PLAYER_SKIN.frameHeight,
    },
  );
}

export function preparePlayerSkin(scene) {
  scene.textures
    .get(PLAYER_SKIN.textureKey)
    .setFilter(Phaser.Textures.FilterMode.NEAREST);

  if (!scene.anims.exists(PLAYER_SKIN.runAnimationKey)) {
    scene.anims.create({
      key: PLAYER_SKIN.runAnimationKey,
      frames: scene.anims.generateFrameNumbers(PLAYER_SKIN.textureKey, {
        start: PLAYER_SKIN.runFrames.start,
        end: PLAYER_SKIN.runFrames.end,
      }),
      frameRate: 9,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(PLAYER_SKIN.jumpAnimationKey)) {
    scene.anims.create({
      key: PLAYER_SKIN.jumpAnimationKey,
      frames: scene.anims.generateFrameNumbers(PLAYER_SKIN.textureKey, {
        start: PLAYER_SKIN.jumpFrames.start,
        end: PLAYER_SKIN.jumpFrames.end,
      }),
      frameRate: 7,
      repeat: 0,
    });
  }
}

function setWorldBodySize(
  player,
  worldWidth,
  worldHeight,
  { syncImmediately = false } = {},
) {
  const sourceWidth = worldWidth / Math.abs(player.scaleX);
  const sourceHeight = worldHeight / Math.abs(player.scaleY);

  player.body.setSize(sourceWidth, sourceHeight, false);
  player.body.setOffset(
    (PLAYER_SKIN.frameWidth - sourceWidth) / 2,
    PLAYER_SKIN.frameHeight - sourceHeight,
  );
  if (syncImmediately) {
    player.body.updateFromGameObject();
  }
}

export function applyNormalPlayerShape(player) {
  player.setScale(PLAYER_SKIN.baseScale);
  setWorldBodySize(player, 34, 54);
}

export function applyCrouchingPlayerShape(
  player,
  { syncImmediately = false } = {},
) {
  player.setScale(
    PLAYER_SKIN.baseScale * PLAYER_SKIN.crouchScaleX,
    PLAYER_SKIN.baseScale * PLAYER_SKIN.crouchScaleY,
  );
  setWorldBodySize(player, 40, 30, { syncImmediately });
}
