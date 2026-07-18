import Phaser from 'phaser';
import { COLORS, GAMEPLAY, OBSTACLES } from '../constants.js';
import {
  createCampusBackdrop,
  scrollCampusBackdrop,
} from '../sceneVisuals.js';
import {
  PLAYER_SKIN,
  applyCrouchingPlayerShape,
  applyNormalPlayerShape,
} from '../playerSkin.js';
import { PowerUpManager } from '../powerUps.js';
import { readHighScore, writeHighScore } from '../storage.js';
import {
  isSoundEnabled,
  playSound,
  toggleSound,
} from '../soundEffects.js';

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.runState = 'playing';
    this.elapsedSeconds = 0;
    this.score = 0;
    this.scoreAccumulator = 0;
    this.highScore = readHighScore();
    this.currentSpeed = GAMEPLAY.initialSpeed;
    this.effectiveSpeed = GAMEPLAY.initialSpeed;
    this.distanceToNextObstacle = GAMEPLAY.initialSpawnDistance;
    this.pointerJumpHandler = null;
    this.isNewRecord = false;
    this.isCrouching = false;
    this.airJumpsUsed = 0;
    this.lastObstacleKey = null;
    this.lastScoreMilestone = 0;
  }

  create() {
    this.backdrop = createCampusBackdrop(this);
    this.createGround();
    this.createPlayer();
    this.createObstacles();
    this.createHud();
    this.createPowerUps();
    this.createInput();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  createGround() {
    this.ground = this.add.rectangle(480, 495, 960, 90, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
  }

  createPlayer() {
    this.playerShadow = this.add
      .ellipse(GAMEPLAY.playerX, GAMEPLAY.groundY - 3, 56, 12, COLORS.navyDark, 0.2)
      .setDepth(6);
    this.player = this.physics.add.sprite(
      GAMEPLAY.playerX,
      GAMEPLAY.groundY,
      PLAYER_SKIN.textureKey,
      PLAYER_SKIN.runFrames.start,
    );
    this.player.setOrigin(0.5, 1);
    this.player.setDepth(8);
    this.player.setCollideWorldBounds(true);
    applyNormalPlayerShape(this.player);
    this.player.play(PLAYER_SKIN.runAnimationKey);
    this.physics.add.collider(this.player, this.ground);
  }

  createObstacles() {
    this.obstacles = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.handleObstacleCollision,
      undefined,
      this,
    );
  }

  createPowerUps() {
    this.powerUps = new PowerUpManager(this, {
      player: this.player,
      addScore: (points, x, y, label) =>
        this.addBonusScore(points, x, y, label),
      isSpawnSafe: () => this.isPickupSpawnSafe(),
    });
  }

  createHud() {
    this.add
      .rectangle(25, 23, 304, 104, COLORS.navyDark, 0.22)
      .setOrigin(0)
      .setDepth(19);
    this.add
      .rectangle(20, 18, 304, 104, COLORS.cream, 0.96)
      .setOrigin(0)
      .setStrokeStyle(3, COLORS.navy, 0.88)
      .setDepth(20);

    this.add
      .text(40, 29, 'RUN SCORE', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#68869a',
        letterSpacing: 2,
      })
      .setDepth(21);
    this.scoreText = this.add
      .text(39, 48, '0', {
        fontFamily: FONT_FAMILY,
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#173c59',
      })
      .setDepth(21);

    this.add.circle(204, 61, 15, COLORS.orange, 1).setDepth(21);
    this.add
      .text(204, 61, '★', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(22);
    this.highScoreText = this.add
      .text(226, 49, `最高\n${this.highScore}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#3d6178',
        lineSpacing: 3,
      })
      .setDepth(21);

    this.add
      .text(40, 92, '冲刺节奏', {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#68869a',
      })
      .setDepth(21);
    this.add
      .rectangle(108, 100, 190, 8, 0xd5dfdf, 1)
      .setOrigin(0, 0.5)
      .setDepth(21);
    this.speedFill = this.add
      .rectangle(108, 100, 1, 8, COLORS.mint, 1)
      .setOrigin(0, 0.5)
      .setDepth(22);

    this.add
      .rectangle(938, 40, 354, 44, COLORS.navyDark, 0.86)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, COLORS.white, 0.8)
      .setDepth(20);
    this.add
      .text(919, 40, 'SPACE / ↑ 跳跃  ·  ↓ / S 下蹲  ·  M 音效', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);

    this.add
      .rectangle(938, 83, 104, 28, COLORS.cream, 0.95)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, COLORS.navy, 0.72)
      .setDepth(20);
    this.soundStatusText = this.add
      .text(925, 83, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#315870',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);
    this.updateSoundStatus();
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.pointerJumpHandler = () => this.tryJump();
    this.input.on('pointerdown', this.pointerJumpHandler);
  }

  tryJump() {
    if (
      this.runState !== 'playing' ||
      !this.player?.active ||
      this.isCrouching
    ) {
      return;
    }

    const isOnGround =
      this.player.body.blocked.down || this.player.body.touching.down;
    const canUseAirJump =
      !isOnGround &&
      this.powerUps.canDoubleJump() &&
      this.airJumpsUsed < 1;

    if (!isOnGround && !canUseAirJump) {
      return;
    }

    if (canUseAirJump) {
      this.airJumpsUsed += 1;
      this.powerUps.showToast('二段跳！');
    } else {
      this.airJumpsUsed = 0;
    }

    this.player.play(PLAYER_SKIN.jumpAnimationKey, true);
    this.player.setAngle(0);
    this.player.setVelocityY(
      canUseAirJump ? GAMEPLAY.jumpVelocity * 0.92 : GAMEPLAY.jumpVelocity,
    );
    playSound(this, 'jump');
  }

  startCrouch() {
    if (this.runState !== 'playing' || this.isCrouching) {
      return;
    }

    const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (!isOnGround) {
      return;
    }

    this.isCrouching = true;
    this.player.anims.pause();
    this.player.setAngle(0);
    applyCrouchingPlayerShape(this.player);
    playSound(this, 'crouch');
  }

  stopCrouch() {
    if (!this.isCrouching) {
      return;
    }

    this.isCrouching = false;
    applyNormalPlayerShape(this.player);

    const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (isOnGround && this.runState === 'playing') {
      this.player.play(PLAYER_SKIN.runAnimationKey, true);
    }
  }

  updateCrouchInput() {
    const wantsToCrouch = this.cursors.down.isDown || this.sKey.isDown;
    const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;

    if (wantsToCrouch && isOnGround) {
      this.startCrouch();
    } else if (!wantsToCrouch || !isOnGround) {
      this.stopCrouch();
    }
  }

  spawnObstacle() {
    const availableObstacles = OBSTACLES.filter(
      ({ key }) => key !== this.lastObstacleKey,
    );
    const definition = Phaser.Utils.Array.GetRandom(availableObstacles);
    this.lastObstacleKey = definition.key;
    const x = GAMEPLAY.width + 20 + definition.width / 2;
    const y =
      definition.placement === 'air'
        ? definition.y
        : GAMEPLAY.groundY - definition.height / 2;
    const obstacle = this.obstacles.create(x, y, definition.key);

    obstacle.setDepth(7);
    obstacle.setImmovable(true);
    obstacle.body.allowGravity = false;
    obstacle.body.setSize(definition.body.width, definition.body.height);
    obstacle.body.setOffset(definition.body.offsetX, definition.body.offsetY);
    obstacle.setVelocityX(-this.effectiveSpeed);
    obstacle.setData('label', definition.label);
    obstacle.setData('requiredAction', definition.action);
    obstacle.setData('passed', false);

    const safeGap = Phaser.Math.Between(
      GAMEPLAY.obstacleGapMin,
      GAMEPLAY.obstacleGapMax,
    );
    this.distanceToNextObstacle = definition.width + safeGap;
  }

  isPickupSpawnSafe() {
    let isSafe = true;
    this.obstacles.children.iterate((obstacle) => {
      if (
        obstacle?.active &&
        !obstacle.getData('resolved') &&
        obstacle.x > GAMEPLAY.width - 270
      ) {
        isSafe = false;
      }
    });
    return isSafe;
  }

  addBonusScore(points, x, y, label = `+${points}`) {
    this.scoreAccumulator += points;
    this.score = Math.floor(this.scoreAccumulator);
    this.scoreText.setText(String(this.score));
    this.powerUps?.showScorePopup(x, y, label);
  }

  handleObstacleCollision(_player, obstacle) {
    if (
      this.runState !== 'playing' ||
      !obstacle?.active ||
      obstacle.getData('resolved')
    ) {
      return;
    }

    if (this.powerUps.isRushProtected()) {
      const isScoringRush = this.powerUps.isActive('rush');
      this.deflectObstacle(obstacle, true);
      if (isScoringRush) {
        const points = 5 * this.powerUps.getScoreMultiplier();
        this.addBonusScore(points, obstacle.x, obstacle.y, `撞飞 +${points}`);
      }
      return;
    }

    if (this.powerUps.consumeShield()) {
      this.deflectObstacle(obstacle, false);
      return;
    }

    this.endGame();
  }

  deflectObstacle(obstacle, isRush) {
    obstacle.setData('resolved', true);
    obstacle.body.enable = false;
    obstacle.setVelocity(0, 0);
    this.cameras.main.shake(isRush ? 95 : 70, isRush ? 0.006 : 0.0035);

    this.tweens.add({
      targets: obstacle,
      x: obstacle.x + (isRush ? 110 : 70),
      y: obstacle.y - (isRush ? 105 : 70),
      angle: obstacle.angle + (isRush ? 220 : 130),
      alpha: 0,
      duration: isRush ? 360 : 300,
      ease: 'Cubic.Out',
      onComplete: () => obstacle.destroy(),
    });
  }

  endGame() {
    if (this.runState !== 'playing') {
      return;
    }

    this.runState = 'gameOver';
    this.powerUps.stop();
    const previousHighScore = this.highScore;
    this.highScore = writeHighScore(this.score);
    this.isNewRecord = this.score > previousHighScore;
    playSound(this, 'gameOver');
    if (this.isNewRecord) {
      playSound(this, 'record', { delay: 0.4 });
    }
    this.physics.pause();
    this.player.anims.stop();
    this.player.setTint(0xd7dce0);
    this.showGameOverOverlay();
  }

  showGameOverOverlay() {
    this.add
      .rectangle(480, 270, 960, 540, COLORS.navyDark, 0.56)
      .setInteractive()
      .setDepth(100);

    this.add
      .rectangle(487, 279, 510, 330, 0x071b2a, 0.28)
      .setDepth(101);
    this.add
      .rectangle(480, 270, 510, 330, COLORS.cream, 0.99)
      .setStrokeStyle(4, COLORS.white, 1)
      .setDepth(102);
    this.add
      .rectangle(480, 119, 156, 32, COLORS.coral, 1)
      .setDepth(103);
    this.add
      .text(480, 119, this.isNewRecord ? '全新纪录！' : '本次冲刺', {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(104);

    this.add
      .text(480, 164, '差一点就赶上了！', {
        fontFamily: FONT_FAMILY,
        fontSize: '31px',
        fontStyle: 'bold',
        color: '#173c59',
      })
      .setOrigin(0.5)
      .setDepth(104);
    this.add
      .text(480, 213, String(this.score), {
        fontFamily: FONT_FAMILY,
        fontSize: '58px',
        fontStyle: 'bold',
        color: '#ff6f61',
      })
      .setOrigin(0.5)
      .setDepth(104);
    this.add
      .text(480, 254, '本局分数', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#698294',
      })
      .setOrigin(0.5)
      .setDepth(104);

    this.add
      .rectangle(480, 288, 344, 2, 0xcbd5d8, 1)
      .setDepth(103);
    this.add.circle(403, 315, 13, COLORS.orange, 1).setDepth(103);
    this.add
      .text(403, 315, '★', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(104);
    this.add
      .text(493, 315, `历史最高  ${this.highScore}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#315870',
      })
      .setOrigin(0.5)
      .setDepth(104);

    const buttonShadow = this.add
      .rectangle(484, 379, 230, 58, 0x9d3f3b, 0.34)
      .setDepth(103);
    const restartButton = this.add
      .rectangle(480, 374, 230, 58, COLORS.coral, 1)
      .setStrokeStyle(3, COLORS.white, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(104);
    const restartLabel = this.add
      .text(480, 374, '再来一次  →', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(105);

    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0xff8375).setScale(1.03);
      restartLabel.setScale(1.03);
      buttonShadow.setScale(1.03);
    });
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(COLORS.coral).setScale(1);
      restartLabel.setScale(1);
      buttonShadow.setScale(1);
    });
    restartButton.once('pointerdown', () => {
      playSound(this, 'start');
      this.scene.restart();
    });
  }

  updateSoundStatus() {
    this.soundStatusText?.setText(isSoundEnabled() ? '音效  开' : '音效  关');
  }

  updatePlayerVisuals() {
    const isOnGround =
      this.player.body.blocked.down || this.player.body.touching.down;
    if (isOnGround) {
      this.airJumpsUsed = 0;
    }
    if (
      isOnGround &&
      !this.isCrouching &&
      (this.player.anims.currentAnim?.key !== PLAYER_SKIN.runAnimationKey ||
        !this.player.anims.isPlaying)
    ) {
      this.player.setAngle(0);
      this.player.play(PLAYER_SKIN.runAnimationKey, true);
    }

    const rise = Math.max(0, GAMEPLAY.groundY - this.player.y);
    const shadowScale = Phaser.Math.Clamp(1 - rise / 230, 0.52, 1);
    this.playerShadow.setScale(shadowScale, shadowScale);
    this.playerShadow.setAlpha(0.2 * shadowScale + 0.04);
  }

  update(_time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
      toggleSound(this);
      this.updateSoundStatus();
    }

    if (this.runState !== 'playing') {
      return;
    }

    const safeDeltaSeconds = Math.min(delta, 50) / 1000;
    this.powerUps.updateTimers(safeDeltaSeconds);

    this.updateCrouchInput();

    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up)
    ) {
      this.tryJump();
    }

    this.updatePlayerVisuals();

    this.elapsedSeconds += safeDeltaSeconds;
    this.currentSpeed = Math.min(
      GAMEPLAY.maxSpeed,
      GAMEPLAY.initialSpeed +
        this.elapsedSeconds * GAMEPLAY.speedIncreasePerSecond,
    );
    this.effectiveSpeed =
      this.currentSpeed * this.powerUps.getWorldSpeedMultiplier();
    this.scoreAccumulator +=
      GAMEPLAY.scorePerSecond *
      safeDeltaSeconds *
      this.powerUps.getScoreMultiplier();
    this.score = Math.floor(this.scoreAccumulator);

    this.scoreText.setText(String(this.score));
    this.highScoreText.setText(`最高\n${Math.max(this.highScore, this.score)}`);
    const scoreMilestone = Math.floor(this.score / 100);
    if (scoreMilestone > this.lastScoreMilestone) {
      this.lastScoreMilestone = scoreMilestone;
      if (scoreMilestone > 0) {
        playSound(this, 'milestone');
      }
    }
    const speedProgress = Phaser.Math.Clamp(
      (this.effectiveSpeed - GAMEPLAY.initialSpeed) /
        (GAMEPLAY.maxSpeed - GAMEPLAY.initialSpeed),
      0,
      1,
    );
    this.speedFill
      .setFillStyle(this.powerUps.isActive('rush') ? COLORS.orange : COLORS.mint)
      .setDisplaySize(Math.max(3, 190 * speedProgress), 8);

    scrollCampusBackdrop(
      this.backdrop,
      this.effectiveSpeed,
      safeDeltaSeconds,
    );

    this.distanceToNextObstacle -= this.effectiveSpeed * safeDeltaSeconds;
    if (this.distanceToNextObstacle <= 0) {
      this.spawnObstacle();
    }

    this.powerUps.updatePickups(safeDeltaSeconds, this.effectiveSpeed);

    this.obstacles.children.iterate((obstacle) => {
      if (
        !obstacle?.active ||
        obstacle.getData('resolved') ||
        this.runState !== 'playing'
      ) {
        return;
      }

      if (obstacle.getData('requiredAction') === 'crouch') {
        const reachesPlayer =
          obstacle.body.left < this.player.body.right &&
          obstacle.body.right > this.player.body.left;
        if (reachesPlayer && !this.isCrouching) {
          this.handleObstacleCollision(this.player, obstacle);
          return;
        }
      }

      if (
        !obstacle.getData('passed') &&
        obstacle.body.right < this.player.body.left
      ) {
        obstacle.setData('passed', true);
        playSound(this, 'pass');
      }

      obstacle.setVelocityX(-this.effectiveSpeed);
      if (obstacle.x + obstacle.displayWidth / 2 < GAMEPLAY.obstacleDestroyX) {
        obstacle.destroy();
      }
    });
  }

  shutdown() {
    if (this.pointerJumpHandler) {
      this.input.off('pointerdown', this.pointerJumpHandler);
      this.pointerJumpHandler = null;
    }
  }
}
