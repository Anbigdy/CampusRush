import Phaser from 'phaser';
import { COLORS, GAMEPLAY, OBSTACLES } from '../constants.js';
import {
  createCampusBackdrop,
  scrollCampusBackdrop,
} from '../sceneVisuals.js';
import { readHighScore, writeHighScore } from '../storage.js';

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.runState = 'playing';
    this.elapsedSeconds = 0;
    this.score = 0;
    this.highScore = readHighScore();
    this.currentSpeed = GAMEPLAY.initialSpeed;
    this.distanceToNextObstacle = GAMEPLAY.initialSpawnDistance;
    this.pointerJumpHandler = null;
    this.isNewRecord = false;
  }

  create() {
    this.backdrop = createCampusBackdrop(this);
    this.createGround();
    this.createPlayer();
    this.createObstacles();
    this.createHud();
    this.createInput();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  createGround() {
    this.ground = this.add.rectangle(480, 495, 960, 90, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
  }

  createPlayer() {
    if (!this.anims.exists('student-run')) {
      this.anims.create({
        key: 'student-run',
        frames: [{ key: 'player-run-1' }, { key: 'player-run-2' }],
        frameRate: 8,
        repeat: -1,
      });
    }

    const playerY = GAMEPLAY.groundY - GAMEPLAY.playerHeight / 2;
    this.playerShadow = this.add
      .ellipse(GAMEPLAY.playerX, GAMEPLAY.groundY - 3, 56, 12, COLORS.navyDark, 0.2)
      .setDepth(6);
    this.player = this.physics.add.sprite(
      GAMEPLAY.playerX,
      playerY,
      'player-run-1',
    );
    this.player.setDepth(8);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(34, 54);
    this.player.body.setOffset(13, 16);
    this.player.play('student-run');
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
      this.endGame,
      undefined,
      this,
    );
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
      .rectangle(938, 40, 274, 44, COLORS.navyDark, 0.86)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, COLORS.white, 0.8)
      .setDepth(20);
    this.add
      .text(919, 40, 'SPACE   ↑   点击画面  ·  跳跃', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(1, 0.5)
      .setDepth(21);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pointerJumpHandler = () => this.tryJump();
    this.input.on('pointerdown', this.pointerJumpHandler);
  }

  tryJump() {
    if (this.runState !== 'playing' || !this.player?.active) {
      return;
    }

    const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (!isOnGround) {
      return;
    }

    this.player.anims.stop();
    this.player.setTexture('player-jump');
    this.player.setAngle(-4);
    this.player.setVelocityY(GAMEPLAY.jumpVelocity);
  }

  spawnObstacle() {
    const definition = Phaser.Utils.Array.GetRandom(OBSTACLES);
    const x = GAMEPLAY.width + 20 + definition.width / 2;
    const y = GAMEPLAY.groundY - definition.height / 2;
    const obstacle = this.obstacles.create(x, y, definition.key);

    obstacle.setDepth(7);
    obstacle.setImmovable(true);
    obstacle.body.allowGravity = false;
    obstacle.body.setSize(definition.body.width, definition.body.height);
    obstacle.body.setOffset(definition.body.offsetX, definition.body.offsetY);
    obstacle.setVelocityX(-this.currentSpeed);
    obstacle.setData('label', definition.label);

    const safeGap = Phaser.Math.Between(
      GAMEPLAY.obstacleGapMin,
      GAMEPLAY.obstacleGapMax,
    );
    this.distanceToNextObstacle = definition.width + safeGap;
  }

  endGame() {
    if (this.runState !== 'playing') {
      return;
    }

    this.runState = 'gameOver';
    const previousHighScore = this.highScore;
    this.highScore = writeHighScore(this.score);
    this.isNewRecord = this.score > previousHighScore;
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
      this.scene.restart();
    });
  }

  updatePlayerVisuals() {
    const isOnGround = this.player.body.blocked.down || this.player.body.touching.down;
    if (isOnGround && !this.player.anims.isPlaying) {
      this.player.setAngle(0);
      this.player.play('student-run');
    }

    const rise = Math.max(
      0,
      GAMEPLAY.groundY - (this.player.y + GAMEPLAY.playerHeight / 2),
    );
    const shadowScale = Phaser.Math.Clamp(1 - rise / 230, 0.52, 1);
    this.playerShadow.setScale(shadowScale, shadowScale);
    this.playerShadow.setAlpha(0.2 * shadowScale + 0.04);
  }

  update(_time, delta) {
    if (this.runState !== 'playing') {
      return;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up)
    ) {
      this.tryJump();
    }

    this.updatePlayerVisuals();

    const safeDeltaSeconds = Math.min(delta, 50) / 1000;
    this.elapsedSeconds += safeDeltaSeconds;
    this.score = Math.floor(this.elapsedSeconds * GAMEPLAY.scorePerSecond);
    this.currentSpeed = Math.min(
      GAMEPLAY.maxSpeed,
      GAMEPLAY.initialSpeed +
        this.elapsedSeconds * GAMEPLAY.speedIncreasePerSecond,
    );

    this.scoreText.setText(String(this.score));
    this.highScoreText.setText(`最高\n${Math.max(this.highScore, this.score)}`);
    const speedProgress =
      (this.currentSpeed - GAMEPLAY.initialSpeed) /
      (GAMEPLAY.maxSpeed - GAMEPLAY.initialSpeed);
    this.speedFill.setDisplaySize(Math.max(3, 190 * speedProgress), 8);

    scrollCampusBackdrop(
      this.backdrop,
      this.currentSpeed,
      safeDeltaSeconds,
    );

    this.distanceToNextObstacle -= this.currentSpeed * safeDeltaSeconds;
    if (this.distanceToNextObstacle <= 0) {
      this.spawnObstacle();
    }

    this.obstacles.children.iterate((obstacle) => {
      if (!obstacle?.active) {
        return;
      }

      obstacle.setVelocityX(-this.currentSpeed);
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
