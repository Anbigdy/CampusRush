import Phaser from 'phaser';
import { syncBackgroundMusic } from '../backgroundMusic.js';
import {
  COLORS,
  GAMEPLAY,
  ISEKAI_OBSTACLES,
  OBSTACLES,
} from '../constants.js';
import {
  createCampusBackdrop,
  createIsekaiBackdrop,
  scrollCampusBackdrop,
  scrollIsekaiBackdrop,
} from '../sceneVisuals.js';
import {
  PLAYER_SKIN,
  applyCrouchingPlayerShape,
  applyNormalPlayerShape,
} from '../playerSkin.js';
import { PowerUpManager } from '../powerUps.js';
import { PlatformRouteManager } from '../platformRoutes.js';
import { PICKUP_ENTRY_CLEARANCE } from '../pickupPatterns.js';
import { readHighScore, writeHighScore } from '../storage.js';
import {
  isSoundEnabled,
  playSound,
  toggleSound,
} from '../soundEffects.js';

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';

export class GameScene extends Phaser.Scene {
  constructor(sceneKey = 'GameScene', worldMode = 'campus') {
    super(sceneKey);
    this.worldMode = worldMode;
    this.isIsekaiWorld = worldMode === 'isekai';
  }

  init(data = {}) {
    this.runState = 'playing';
    this.elapsedSeconds = data.elapsedSeconds ?? 0;
    this.scoreAccumulator = data.scoreAccumulator ?? 0;
    this.score = Math.floor(this.scoreAccumulator);
    this.highScore = Math.max(data.highScore ?? 0, readHighScore());
    this.currentSpeed = Math.min(
      GAMEPLAY.maxSpeed,
      data.currentSpeed ??
        GAMEPLAY.initialSpeed +
          this.elapsedSeconds * GAMEPLAY.speedIncreasePerSecond,
    );
    this.effectiveSpeed = this.currentSpeed;
    this.distanceToNextObstacle = GAMEPLAY.initialSpawnDistance;
    this.pointerJumpHandler = null;
    this.isNewRecord = false;
    this.isCrouching = false;
    this.isFastFalling = false;
    this.jumpCount = 0;
    this.lastObstacleKey = null;
    this.lastScoreMilestone = Math.floor(this.score / 100);
    this.storyTriggered = this.isIsekaiWorld;
    this.obstacleDefinitions = this.isIsekaiWorld
      ? ISEKAI_OBSTACLES
      : OBSTACLES;
  }

  create() {
    this.backdrop = this.isIsekaiWorld
      ? createIsekaiBackdrop(this)
      : createCampusBackdrop(this);
    this.createGround();
    this.createPlayer();
    this.createObstacles();
    this.createHud();
    this.createPowerUps();
    this.createPlatformRoutes();
    this.createInput();

    if (this.isIsekaiWorld) {
      this.showIsekaiArrival();
    }

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
      reserveObstacleGap: (distance) => this.reserveObstacleGap(distance),
    });
  }

  createPlatformRoutes() {
    this.platformRoutes = new PlatformRouteManager(this, {
      player: this.player,
      powerUps: this.powerUps,
      canSpawnRoute: () => this.isRouteSpawnSafe(),
      reserveObstacleGap: (distance) => this.reserveObstacleGap(distance),
      onLand: (x, y) => this.handlePlatformLanding(x, y),
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
      .rectangle(938, 40, 520, 44, COLORS.navyDark, 0.86)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, COLORS.white, 0.8)
      .setDepth(20);
    this.add
      .text(919, 40, 'SPACE / ↑ / 点击：二段跳  ·  ↓ / S：下蹲 / 下坠  ·  M：声音', {
        fontFamily: FONT_FAMILY,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);

    this.add
      .rectangle(938, 83, 250, 28, COLORS.cream, 0.95)
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
    this.add
      .rectangle(938, 121, 190, 28, this.isIsekaiWorld ? 0x493877 : COLORS.navy, 0.94)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, this.isIsekaiWorld ? 0xb9a5ff : COLORS.white, 0.78)
      .setDepth(20);
    this.add
      .text(
        925,
        121,
        this.isIsekaiWorld ? 'CHAPTER II · 异世界' : '主线目标 · 1000 分',
        {
          fontFamily: FONT_FAMILY,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#fff7e3',
        },
      )
      .setOrigin(1, 0.5)
      .setDepth(21);
    this.updatePlayerStatus();
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
      this.isCrouching ||
      this.isFastFalling
    ) {
      return;
    }

    const isOnGround = this.isPlayerGrounded();
    if (isOnGround) {
      this.jumpCount = 0;
    }
    if (this.jumpCount >= GAMEPLAY.maxJumps) {
      return;
    }

    this.jumpCount += 1;
    const isDoubleJump = this.jumpCount === GAMEPLAY.maxJumps;
    this.player.play(PLAYER_SKIN.jumpAnimationKey, true);
    this.player.setAngle(0);
    this.player.setVelocityY(
      isDoubleJump ? GAMEPLAY.doubleJumpVelocity : GAMEPLAY.jumpVelocity,
    );
    playSound(this, isDoubleJump ? 'doubleJump' : 'jump');
    this.updatePlayerStatus();
  }

  startCrouch() {
    if (this.runState !== 'playing' || this.isCrouching) {
      return;
    }

    const isOnGround = this.isPlayerGrounded();
    if (!isOnGround) {
      return;
    }

    this.isCrouching = true;
    this.isFastFalling = false;
    this.player.anims.pause();
    this.player.setAngle(0);
    applyCrouchingPlayerShape(this.player);
    playSound(this, 'crouch');
  }

  startFastFall() {
    if (
      this.runState !== 'playing' ||
      this.isFastFalling ||
      !this.player?.active
    ) {
      return;
    }

    const isOnGround = this.isPlayerGrounded();
    if (isOnGround) {
      return;
    }

    this.isFastFalling = true;
    this.isCrouching = false;
    this.jumpCount = GAMEPLAY.maxJumps;
    this.player.anims.pause();
    this.player.setAngle(0);
    applyCrouchingPlayerShape(this.player);
    this.player.setVelocityY(
      Math.max(this.player.body.velocity.y, GAMEPLAY.fastFallVelocity),
    );
    playSound(this, 'fastFall');
    this.updatePlayerStatus();
  }

  stopFastFall() {
    if (!this.isFastFalling) {
      return;
    }

    this.isFastFalling = false;
    applyNormalPlayerShape(this.player);
  }

  stopCrouch() {
    if (!this.isCrouching) {
      return;
    }

    this.isCrouching = false;
    applyNormalPlayerShape(this.player);

    const isOnGround = this.isPlayerGrounded();
    if (isOnGround && this.runState === 'playing') {
      this.player.play(PLAYER_SKIN.runAnimationKey, true);
    }
  }

  updateCrouchInput() {
    const wantsToCrouch = this.cursors.down.isDown || this.sKey.isDown;
    const isOnGround = this.isPlayerGrounded();

    if (isOnGround) {
      const shouldRefreshStatus =
        this.jumpCount !== 0 || this.isFastFalling;
      this.jumpCount = 0;

      if (wantsToCrouch) {
        this.isFastFalling = false;
        this.startCrouch();
      } else {
        this.stopFastFall();
        this.stopCrouch();
      }

      if (shouldRefreshStatus) {
        this.updatePlayerStatus();
      }
      return;
    }

    this.stopCrouch();
    if (wantsToCrouch) {
      this.startFastFall();
    }
  }

  spawnObstacle() {
    const availableObstacles = this.obstacleDefinitions.filter(
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
    if (this.platformRoutes?.blocksIndependentPickups()) {
      return false;
    }

    let isSafe = true;
    this.obstacles.children.iterate((obstacle) => {
      if (
        obstacle?.active &&
        !obstacle.getData('resolved') &&
        obstacle.body.right > GAMEPLAY.width - PICKUP_ENTRY_CLEARANCE
      ) {
        isSafe = false;
      }
    });
    return isSafe;
  }

  isRouteSpawnSafe() {
    if (
      this.runState !== 'playing' ||
      (!this.isIsekaiWorld && this.score >= GAMEPLAY.storyTransitionScore - 140) ||
      !this.powerUps?.isPickupEntryClear()
    ) {
      return false;
    }

    let isSafe = true;
    this.obstacles.children.iterate((obstacle) => {
      if (
        obstacle?.active &&
        !obstacle.getData('resolved') &&
        obstacle.body.right > GAMEPLAY.width - 280
      ) {
        isSafe = false;
      }
    });
    return isSafe;
  }

  reserveObstacleGap(distance) {
    this.distanceToNextObstacle = Math.max(
      this.distanceToNextObstacle,
      distance,
    );
  }

  addBonusScore(points, x, y, label = `+${points}`) {
    this.scoreAccumulator += points;
    this.score = Math.floor(this.scoreAccumulator);
    this.scoreText.setText(String(this.score));
    this.powerUps?.showScorePopup(x, y, label);
  }

  isPlayerGrounded() {
    return Boolean(
      this.player?.body?.blocked.down ||
      this.player?.body?.touching.down ||
      this.platformRoutes?.isPlayerSupported(),
    );
  }

  handlePlatformLanding(x, y) {
    playSound(this, 'platformLand');
    const dustColor = this.isIsekaiWorld ? 0xb9a5ff : 0xfff7e3;
    [-16, 0, 16].forEach((offset, index) => {
      const dust = this.add
        .circle(x + offset, y - 3, 4 + index, dustColor, 0.66)
        .setDepth(9);
      this.tweens.add({
        targets: dust,
        x: dust.x + offset * 0.55,
        y: dust.y - 14 - index * 3,
        scale: 1.5,
        alpha: 0,
        duration: 260,
        ease: 'Sine.Out',
        onComplete: () => dust.destroy(),
      });
    });
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

  beginStoryTransition() {
    if (
      this.isIsekaiWorld ||
      this.storyTriggered ||
      this.runState !== 'playing'
    ) {
      return;
    }

    this.storyTriggered = true;
    this.runState = 'storyTransition';
    this.platformRoutes.clearForTransition();
    this.powerUps.clearForTransition();
    this.stopCrouch();
    this.stopFastFall();
    this.jumpCount = 0;
    applyNormalPlayerShape(this.player);
    this.player.setPosition(GAMEPLAY.playerX, GAMEPLAY.groundY);
    this.player.body.updateFromGameObject();
    this.player.setVelocity(0, 0);
    this.player.setAngle(0);
    this.player.play(PLAYER_SKIN.runAnimationKey, true);

    this.obstacles.children.iterate((obstacle) => {
      if (!obstacle?.active) {
        return;
      }
      obstacle.body.enable = false;
      this.tweens.add({
        targets: obstacle,
        x: obstacle.x - 220,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.In',
        onComplete: () => obstacle.destroy(),
      });
    });

    const topBar = this.add
      .rectangle(480, -26, GAMEPLAY.width, 52, 0x080b16, 0.96)
      .setDepth(90);
    const bottomBar = this.add
      .rectangle(480, GAMEPLAY.height + 26, GAMEPLAY.width, 52, 0x080b16, 0.96)
      .setDepth(90);
    this.tweens.add({ targets: topBar, y: 26, duration: 360, ease: 'Sine.Out' });
    this.tweens.add({
      targets: bottomBar,
      y: GAMEPLAY.height - 26,
      duration: 360,
      ease: 'Sine.Out',
    });

    const chapterTag = this.add
      .text(480, 78, '主线事件 · 命运的岔路口', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#fff7e3',
        stroke: '#173c59',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(95)
      .setAlpha(0);
    this.tweens.add({
      targets: chapterTag,
      alpha: 1,
      y: 88,
      duration: 340,
      ease: 'Sine.Out',
    });

    playSound(this, 'storyWarning');
    this.time.delayedCall(520, () => this.runTruckCutscene());
  }

  runTruckCutscene() {
    if (this.runState !== 'storyTransition') {
      return;
    }

    const portal = this.add
      .image(GAMEPLAY.playerX, 238, 'story-portal')
      .setScale(0.05)
      .setAlpha(0)
      .setDepth(32);
    const truck = this.add
      .image(GAMEPLAY.width + 210, GAMEPLAY.groundY, 'story-truck')
      .setOrigin(0.5, 1)
      .setDepth(34);
    const speedLines = [0, 1, 2, 3].map((index) =>
      this.add
        .rectangle(
          GAMEPLAY.width + 62 + index * 58,
          334 + index * 24,
          96 - index * 10,
          4,
          0xeafaff,
          0.62 - index * 0.08,
        )
        .setOrigin(0, 0.5)
        .setDepth(33),
    );

    playSound(this, 'truckHorn');
    this.cameras.main.shake(180, 0.0025);
    this.tweens.add({
      targets: [...speedLines, truck],
      x: `-=${GAMEPLAY.width - 25}`,
      duration: 920,
      ease: 'Quart.In',
      onComplete: () => this.playTruckImpact(truck, portal, speedLines),
    });
  }

  playTruckImpact(truck, portal, speedLines) {
    if (this.runState !== 'storyTransition') {
      return;
    }

    playSound(this, 'truckImpact');
    this.cameras.main.shake(380, 0.018);
    this.cameras.main.flash(180, 255, 238, 207);
    speedLines.forEach((line) => line.destroy());

    this.player.body.enable = false;
    this.player.anims.stop();
    this.player.setDepth(40);
    portal.setAlpha(1);
    this.tweens.add({
      targets: portal,
      scale: 1.2,
      angle: 190,
      duration: 720,
      ease: 'Back.Out',
    });
    this.tweens.add({
      targets: truck,
      x: -230,
      duration: 580,
      ease: 'Cubic.Out',
    });
    this.tweens.add({
      targets: this.player,
      x: GAMEPLAY.playerX,
      y: 238,
      angle: -720,
      scale: PLAYER_SKIN.baseScale * 0.2,
      alpha: 0.2,
      duration: 820,
      ease: 'Cubic.Out',
    });

    const impactText = this.add
      .text(335, 250, '命运转弯！', {
        fontFamily: FONT_FAMILY,
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#7e3155',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScale(0.25)
      .setAngle(-8)
      .setDepth(96);
    this.tweens.add({
      targets: impactText,
      scale: 1,
      angle: 4,
      duration: 260,
      ease: 'Back.Out',
    });

    this.time.delayedCall(780, () => {
      playSound(this, 'portal');
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IsekaiScene', {
          elapsedSeconds: this.elapsedSeconds,
          scoreAccumulator: this.scoreAccumulator,
          currentSpeed: this.currentSpeed,
          highScore: this.highScore,
        });
      });
      this.cameras.main.fadeOut(760, 246, 240, 255);
    });
  }

  showIsekaiArrival() {
    this.distanceToNextObstacle = 620;
    this.cameras.main.fadeIn(900, 246, 240, 255);
    playSound(this, 'isekaiArrival', { delay: 0.1 });

    const aura = this.add
      .circle(GAMEPLAY.playerX, GAMEPLAY.groundY - 34, 54, 0xb9a5ff, 0.26)
      .setStrokeStyle(3, 0x8fffe0, 0.82)
      .setDepth(7);
    this.tweens.add({
      targets: aura,
      scale: 1.55,
      alpha: 0,
      duration: 1100,
      ease: 'Sine.Out',
      onComplete: () => aura.destroy(),
    });

    const panel = this.add
      .rectangle(480, 179, 520, 98, 0x17122f, 0.86)
      .setStrokeStyle(3, 0xb9a5ff, 0.9)
      .setDepth(70);
    const title = this.add
      .text(480, 160, 'CHAPTER II · 银月异世界', {
        fontFamily: FONT_FAMILY,
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#f7f2ff',
      })
      .setOrigin(0.5)
      .setDepth(71);
    const subtitle = this.add
      .text(480, 199, '新的旅程，从零开始', {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#8fffe0',
      })
      .setOrigin(0.5)
      .setDepth(71);

    this.tweens.add({
      targets: [panel, title, subtitle],
      y: '-=18',
      alpha: 0,
      delay: 1700,
      duration: 650,
      ease: 'Sine.In',
      onComplete: () => {
        panel.destroy();
        title.destroy();
        subtitle.destroy();
      },
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
      if (this.isIsekaiWorld) {
        this.scene.start('GameScene');
      } else {
        this.scene.restart();
      }
    });
  }

  updatePlayerStatus() {
    const jumpsRemaining = Math.max(
      0,
      GAMEPLAY.maxJumps - this.jumpCount,
    );
    this.soundStatusText?.setText(
      `剩余跳跃 ${jumpsRemaining}/${GAMEPLAY.maxJumps} · M 声音 ${isSoundEnabled() ? '开' : '关'}`,
    );
  }

  updatePlayerVisuals() {
    const isOnGround = this.isPlayerGrounded();
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
    const shadowY = this.platformRoutes?.getSupportY() ?? GAMEPLAY.groundY;
    this.playerShadow.setPosition(this.player.x, shadowY - 3);
    this.playerShadow.setScale(shadowScale, shadowScale);
    this.playerShadow.setAlpha(0.2 * shadowScale + 0.04);
  }

  update(_time, delta) {
    const safeDeltaSeconds = Math.min(delta, 50) / 1000;
    if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
      const enabled = toggleSound(this);
      syncBackgroundMusic(this, enabled);
      this.updatePlayerStatus();
    }

    if (this.runState !== 'playing') {
      if (this.runState === 'storyTransition') {
        scrollCampusBackdrop(
          this.backdrop,
          this.currentSpeed * 0.42,
          safeDeltaSeconds,
        );
      }
      return;
    }

    this.powerUps.updateTimers(safeDeltaSeconds);

    this.platformRoutes.update(
      safeDeltaSeconds,
      this.effectiveSpeed,
      this.score,
    );

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
    if (
      !this.isIsekaiWorld &&
      !this.storyTriggered &&
      this.score >= GAMEPLAY.storyTransitionScore
    ) {
      this.beginStoryTransition();
      return;
    }
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

    const scrollBackdrop = this.isIsekaiWorld
      ? scrollIsekaiBackdrop
      : scrollCampusBackdrop;
    scrollBackdrop(this.backdrop, this.effectiveSpeed, safeDeltaSeconds);

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
        const isLowObstacleDodge =
          this.isCrouching || this.isFastFalling;
        if (reachesPlayer && !isLowObstacleDodge) {
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
    this.platformRoutes?.destroy();
    if (this.pointerJumpHandler) {
      this.input.off('pointerdown', this.pointerJumpHandler);
      this.pointerJumpHandler = null;
    }
  }
}
