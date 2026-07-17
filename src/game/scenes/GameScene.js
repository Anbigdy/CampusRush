import Phaser from 'phaser';
import { COLORS, GAMEPLAY, OBSTACLES } from '../constants.js';
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
  }

  create() {
    this.createBackground();
    this.createGround();
    this.createPlayer();
    this.createObstacles();
    this.createHud();
    this.createInput();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  createBackground() {
    this.add.rectangle(480, 270, 960, 540, COLORS.sky).setDepth(0);
    this.add.circle(790, 85, 42, 0xffdf72, 0.92).setDepth(1);
    this.farBackground = this.add
      .tileSprite(480, 260, GAMEPLAY.width, 210, 'far-scenery')
      .setDepth(2);
    this.campusBackground = this.add
      .tileSprite(480, 325, GAMEPLAY.width, 250, 'campus-scenery')
      .setDepth(3);
    this.groundVisual = this.add
      .tileSprite(480, 495, GAMEPLAY.width, 90, 'ground-tile')
      .setDepth(5);
  }

  createGround() {
    this.ground = this.add.rectangle(480, 495, 960, 90, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
  }

  createPlayer() {
    const playerY = GAMEPLAY.groundY - GAMEPLAY.playerHeight / 2;
    this.player = this.physics.add.sprite(
      GAMEPLAY.playerX,
      playerY,
      'player-student',
    );
    this.player.setDepth(8);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 52);
    this.player.body.setOffset(6, 6);
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
      .rectangle(20, 18, 250, 82, COLORS.navyDark, 0.86)
      .setOrigin(0)
      .setStrokeStyle(2, COLORS.white, 0.72)
      .setDepth(20);

    this.scoreText = this.add
      .text(38, 30, '分数  0', {
        fontFamily: FONT_FAMILY,
        fontSize: '25px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setDepth(21);

    this.highScoreText = this.add
      .text(38, 67, `最高  ${this.highScore}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#89e9be',
      })
      .setDepth(21);

    this.add
      .text(930, 26, 'SPACE / ↑ / 点击', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#173b57',
        backgroundColor: 'rgba(255,255,255,0.75)',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 0)
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
    this.highScore = writeHighScore(this.score);
    this.physics.pause();
    this.player.setTint(0xd4d8dc);
    this.showGameOverOverlay();
  }

  showGameOverOverlay() {
    this.add
      .rectangle(480, 270, 960, 540, COLORS.navyDark, 0.58)
      .setInteractive()
      .setDepth(100);

    this.add
      .rectangle(480, 270, 470, 300, 0x102f47, 0.97)
      .setStrokeStyle(4, COLORS.white, 0.95)
      .setDepth(101);

    this.add
      .text(480, 172, '迟到啦！', {
        fontFamily: FONT_FAMILY,
        fontSize: '46px',
        fontStyle: 'bold',
        color: '#fff4d6',
      })
      .setOrigin(0.5)
      .setDepth(102);

    this.add
      .text(480, 245, `本局分数  ${this.score}\n历史最高  ${this.highScore}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '23px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5)
      .setDepth(102);

    const restartButton = this.add
      .rectangle(480, 350, 220, 62, COLORS.coral, 1)
      .setStrokeStyle(3, COLORS.white, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(102);

    const restartLabel = this.add
      .text(480, 350, '再来一次', {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(103);

    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0xff806f).setScale(1.03);
      restartLabel.setScale(1.03);
    });
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(COLORS.coral).setScale(1);
      restartLabel.setScale(1);
    });
    restartButton.once('pointerdown', () => {
      this.scene.restart();
    });
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

    const safeDeltaSeconds = Math.min(delta, 50) / 1000;
    this.elapsedSeconds += safeDeltaSeconds;
    this.score = Math.floor(this.elapsedSeconds * GAMEPLAY.scorePerSecond);
    this.currentSpeed = Math.min(
      GAMEPLAY.maxSpeed,
      GAMEPLAY.initialSpeed +
        this.elapsedSeconds * GAMEPLAY.speedIncreasePerSecond,
    );

    this.scoreText.setText(`分数  ${this.score}`);
    this.highScoreText.setText(`最高  ${Math.max(this.highScore, this.score)}`);

    this.farBackground.tilePositionX +=
      this.currentSpeed * GAMEPLAY.farScrollFactor * safeDeltaSeconds;
    this.campusBackground.tilePositionX +=
      this.currentSpeed * GAMEPLAY.campusScrollFactor * safeDeltaSeconds;
    this.groundVisual.tilePositionX +=
      this.currentSpeed * GAMEPLAY.groundScrollFactor * safeDeltaSeconds;

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
