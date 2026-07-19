import Phaser from 'phaser';
import { COLORS, GAMEPLAY } from './constants.js';
import { isSoundEnabled, playSound } from './soundEffects.js';
import {
  speakGenericChinese,
  stopGenericSpeech,
} from './speechSynthesis.js';

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';
const FRAME_WIDTH = 192;
const FRAME_HEIGHT = 208;
const RUNNER_SCALE = 0.38;
const RUNNER_X = GAMEPLAY.playerX + 220;
const EVENT_DURATION_SECONDS = 30;
const FATIGUE_WARNING_SECONDS = 2.4;
const SLOWDOWN_SECONDS = 3.2;
const SLOWDOWN_X = GAMEPLAY.playerX + 90;
const RANDOM_LINES = Object.freeze([
  '三口一个巧乐兹',
  '土木有前景',
  '新闻学已死',
  '我没意见',
]);

export const SNOW_PEAK = Object.freeze({
  triggerScore: 2000,
  textureKey: 'snow-peak-runner',
  assetPath: 'assets/npcs/snow-peak/spritesheet.webp',
  runAnimationKey: 'snow-peak-running-right',
  fallAnimationKey: 'snow-peak-failed',
  tiredFrame: 42,
});

export function loadSnowPeak(scene) {
  scene.load.spritesheet(
    SNOW_PEAK.textureKey,
    `${import.meta.env.BASE_URL}${SNOW_PEAK.assetPath}`,
    {
      frameWidth: FRAME_WIDTH,
      frameHeight: FRAME_HEIGHT,
    },
  );
}

export function prepareSnowPeak(scene) {
  scene.textures
    .get(SNOW_PEAK.textureKey)
    .setFilter(Phaser.Textures.FilterMode.NEAREST);

  if (!scene.anims.exists(SNOW_PEAK.runAnimationKey)) {
    scene.anims.create({
      key: SNOW_PEAK.runAnimationKey,
      frames: scene.anims.generateFrameNumbers(SNOW_PEAK.textureKey, {
        start: 8,
        end: 15,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(SNOW_PEAK.fallAnimationKey)) {
    scene.anims.create({
      key: SNOW_PEAK.fallAnimationKey,
      frames: [40, 41, 42, 43, 42].map((frame) => ({
        key: SNOW_PEAK.textureKey,
        frame,
      })),
      frameRate: 4,
      repeat: 0,
    });
  }
}

function makeSpeechBubble(scene, text, accentColor) {
  const width = Phaser.Math.Clamp(text.length * 25 + 48, 210, 390);
  const height = 74;
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x13293c, 0.22);
  graphics.fillRoundedRect(-width / 2 + 5, -height / 2 + 6, width, height, 16);
  graphics.fillStyle(COLORS.cream, 0.99);
  graphics.lineStyle(4, accentColor, 1);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);

  const tail = scene.add
    .triangle(0, height / 2 + 8, 0, 0, 21, 0, 10, 15, COLORS.cream, 1)
    .setStrokeStyle(3, accentColor, 1);
  const label = scene.add
    .text(-width / 2 + 14, -height / 2 - 8, 'SNOW PEAK', {
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fff7e3',
      backgroundColor: '#173c59',
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0, 0.5);
  const message = scene.add
    .text(0, 5, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#173c59',
      align: 'center',
      wordWrap: { width: width - 34 },
    })
    .setOrigin(0.5);

  return {
    container: scene.add
      .container(0, 0, [graphics, tail, label, message])
      .setDepth(66),
    tail,
    width,
  };
}

export class SnowPeakEvent {
  constructor(scene, {
    player,
    obstacles,
    deflectObstacle,
    pauseGame,
    resumeGame,
    grantExtraLife,
  }) {
    this.scene = scene;
    this.player = player;
    this.obstacles = obstacles;
    this.deflectObstacle = deflectObstacle;
    this.pauseGame = pauseGame;
    this.resumeGame = resumeGame;
    this.grantExtraLife = grantExtraLife;
    this.state = 'waiting';
    this.activeRemaining = 0;
    this.speechRemaining = 0;
    this.fatigueRemaining = 0;
    this.slowdownRemaining = 0;
    this.slowdownStartX = RUNNER_X;
    this.lastRandomLine = null;
    this.bubble = null;
    this.bubbleTimer = null;
    this.pickupPrompt = null;
    this.destroyed = false;
    this.statusHud = this.createStatusHud();
  }

  createStatusHud() {
    const background = this.scene.add
      .rectangle(0, 0, 270, 32, 0x17122f, 0.92)
      .setStrokeStyle(2, 0x8fffe0, 0.9);
    const icon = this.scene.add
      .circle(-116, 0, 10, 0xff6f61, 1)
      .setStrokeStyle(2, COLORS.cream, 0.9);
    const iconText = this.scene.add
      .text(-116, -1, 'S', {
        fontFamily: FONT_FAMILY,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(0.5);
    this.statusLabel = this.scene.add
      .text(7, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(0.5);
    return this.scene.add
      .container(797, 160, [background, icon, iconText, this.statusLabel])
      .setDepth(50)
      .setVisible(false);
  }

  update(deltaSeconds, worldSpeed, score) {
    if (this.destroyed) {
      return;
    }

    if (this.state === 'waiting' && score >= SNOW_PEAK.triggerScore) {
      this.startChase();
    }

    if (this.state === 'running') {
      this.activeRemaining = Math.max(0, this.activeRemaining - deltaSeconds);
      this.speechRemaining -= deltaSeconds;
      this.statusLabel.setText(
        `SNOW PEAK · 护航 ${this.activeRemaining.toFixed(1)}s`,
      );
      this.deflectBlockingObstacles();

      if (this.activeRemaining <= 0) {
        this.startFatigueWarning();
      } else if (this.speechRemaining <= 0) {
        this.showRandomLine();
        this.speechRemaining = Phaser.Math.FloatBetween(4.2, 6.4);
      }
    } else if (this.state === 'fatigueWarning') {
      this.fatigueRemaining = Math.max(
        0,
        this.fatigueRemaining - deltaSeconds,
      );
      this.deflectBlockingObstacles();
      if (this.fatigueRemaining <= 0) {
        this.startSlowdown();
      }
    } else if (this.state === 'slowing') {
      this.slowdownRemaining = Math.max(
        0,
        this.slowdownRemaining - deltaSeconds,
      );
      const progress = 1 - this.slowdownRemaining / SLOWDOWN_SECONDS;
      const easedProgress = Phaser.Math.Easing.Cubic.Out(progress);
      this.sprite.x = Phaser.Math.Linear(
        this.slowdownStartX,
        SLOWDOWN_X,
        easedProgress,
      );
      this.sprite.anims.timeScale = Phaser.Math.Linear(0.55, 0.28, progress);
      this.deflectBlockingObstacles();
      if (this.slowdownRemaining <= 0) {
        this.startExhaustion();
      }
    } else if (this.state === 'pickup') {
      this.sprite.x -= worldSpeed * deltaSeconds;
      this.sprite.body.updateFromGameObject();
      if (this.sprite.x < -80) {
        this.sprite.destroy();
        this.pickupPrompt?.destroy();
        this.pickupPrompt = null;
        this.state = 'missed';
        this.statusHud.setVisible(false);
      }
    }

    this.updatePresentation();
  }

  startChase() {
    this.state = 'chasing';
    this.sprite = this.scene.physics.add
      .sprite(-70, GAMEPLAY.groundY, SNOW_PEAK.textureKey, 8)
      .setOrigin(0.5, 1)
      .setScale(RUNNER_SCALE)
      .setDepth(9);
    this.sprite.body.allowGravity = false;
    this.sprite.body.enable = false;
    this.sprite.play(SNOW_PEAK.runAnimationKey);
    this.shadow = this.scene.add
      .ellipse(this.sprite.x, GAMEPLAY.groundY - 3, 58, 12, 0x17122f, 0.25)
      .setDepth(7);
    this.scene.physics.add.overlap(
      this.player,
      this.sprite,
      () => this.collectPickup(),
    );
    this.statusHud.setVisible(true);
    this.statusLabel.setText('SNOW PEAK · 追赶中');
    this.showSpeech('你跑不过我你信不信', 2300, 0xff6f61, {
      enterWithSpeaker: true,
    });

    this.scene.tweens.add({
      targets: this.sprite,
      x: RUNNER_X,
      duration: 1900,
      ease: 'Cubic.Out',
      onComplete: () => {
        if (this.destroyed || this.state !== 'chasing') {
          return;
        }
        this.state = 'running';
        this.activeRemaining = EVENT_DURATION_SECONDS;
        this.speechRemaining = 3.4;
      },
    });
  }

  deflectBlockingObstacles() {
    this.obstacles.children.iterate((obstacle) => {
      if (
        !obstacle?.active ||
        obstacle.getData('resolved') ||
        !obstacle.body?.enable
      ) {
        return;
      }
      const reachesSnowPeak =
        obstacle.body.left <= this.sprite.x + 54 &&
        obstacle.body.right >= this.sprite.x - 34;
      if (reachesSnowPeak) {
        this.deflectObstacle(obstacle);
        playSound(this.scene, 'snowPeakImpact');
      }
    });
  }

  showRandomLine() {
    const choices = RANDOM_LINES.filter((line) => line !== this.lastRandomLine);
    const line = Phaser.Utils.Array.GetRandom(choices);
    this.lastRandomLine = line;
    this.showSpeech(line, 2100, 0x8fffe0);
  }

  startFatigueWarning() {
    if (this.state !== 'running') {
      return;
    }

    this.state = 'fatigueWarning';
    this.fatigueRemaining = FATIGUE_WARNING_SECONDS;
    this.statusLabel.setText('SNOW PEAK · 状态异常');
    this.showSpeech('怎么嘴巴紫紫的', 2300, 0xa884ff);
  }

  startSlowdown() {
    if (this.state !== 'fatigueWarning') {
      return;
    }

    this.state = 'slowing';
    this.slowdownRemaining = SLOWDOWN_SECONDS;
    this.slowdownStartX = this.sprite.x;
    this.sprite.anims.timeScale = 0.55;
    this.statusLabel.setText('SNOW PEAK · 突然慢下来了');
    playSound(this.scene, 'snowPeakSlowdown');
  }

  startExhaustion() {
    if (this.state !== 'slowing') {
      return;
    }

    this.state = 'exhausted';
    this.clearBubble();
    this.statusLabel.setText('SNOW PEAK · 体力耗尽');
    this.pauseGame();
    playSound(this.scene, 'snowPeakTired');
    this.sprite.anims.timeScale = 1;
    this.sprite.play(SNOW_PEAK.fallAnimationKey, true);

    this.scene.time.delayedCall(1350, () => {
      if (this.destroyed || this.state !== 'exhausted') {
        return;
      }
      this.sprite.anims.stop();
      this.sprite.setFrame(SNOW_PEAK.tiredFrame);
      this.showSpeech('张雪峰老师，我还记得你🎵', 2600, 0xb9a5ff);
    });
    this.scene.time.delayedCall(4200, () => this.becomePickup());
  }

  becomePickup() {
    if (this.destroyed || this.state !== 'exhausted') {
      return;
    }

    this.clearBubble();
    this.state = 'pickup';
    this.sprite.anims.stop();
    this.sprite.setFrame(SNOW_PEAK.tiredFrame);
    this.sprite.body.enable = true;
    this.sprite.body.setSize(118, 86);
    this.sprite.body.setOffset(37, 112);
    this.sprite.body.updateFromGameObject();
    this.statusLabel.setText('Snow Peak 已累倒');
    this.pickupPrompt = this.scene.add
      .text(this.sprite.x, this.sprite.y - this.sprite.displayHeight - 22, '念张师', {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#fff7e3',
        backgroundColor: '#e8564f',
        padding: { x: 12, y: 7 },
        stroke: '#173c59',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(65);
    this.scene.tweens.add({
      targets: this.pickupPrompt,
      y: '-=7',
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    this.resumeGame();
  }

  collectPickup() {
    if (this.destroyed || this.state !== 'pickup' || !this.sprite.body.enable) {
      return;
    }

    this.state = 'collected';
    this.sprite.body.enable = false;
    this.scene.tweens.killTweensOf(this.pickupPrompt);
    this.pickupPrompt?.destroy();
    this.pickupPrompt = null;
    this.statusLabel.setText('念张师 · 额外生命 ×1');
    playSound(this.scene, 'extraLife');
    this.grantExtraLife();
    this.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      y: '-=36',
      alpha: 0,
      duration: 520,
      ease: 'Back.In',
      onComplete: () => {
        this.sprite?.destroy();
        this.shadow?.destroy();
        this.sprite = null;
        this.shadow = null;
      },
    });
  }

  markExtraLifeConsumed() {
    if (this.destroyed) {
      return;
    }
    this.statusLabel.setText('念张师 · 额外生命已使用');
    this.scene.tweens.add({
      targets: this.statusHud,
      alpha: 0,
      delay: 1200,
      duration: 500,
      onComplete: () => this.statusHud.setVisible(false).setAlpha(1),
    });
  }

  showSpeech(text, duration, accentColor, { enterWithSpeaker = false } = {}) {
    this.clearBubble();
    this.bubble = makeSpeechBubble(this.scene, text, accentColor);
    this.bubble.enterWithSpeaker = enterWithSpeaker;
    const didSpeak = isSoundEnabled() && speakGenericChinese(text);
    if (!didSpeak) {
      playSound(this.scene, 'snowPeakTalk');
    }
    this.bubbleTimer = this.scene.time.delayedCall(duration, () => {
      this.clearBubble();
    });
    this.updatePresentation();
  }

  clearBubble() {
    stopGenericSpeech();
    this.bubbleTimer?.remove(false);
    this.bubbleTimer = null;
    this.bubble?.container.destroy(true);
    this.bubble = null;
  }

  updatePresentation() {
    if (!this.sprite?.active) {
      return;
    }
    this.shadow?.setPosition(this.sprite.x, GAMEPLAY.groundY - 3);
    if (this.bubble) {
      const bubbleX = this.bubble.enterWithSpeaker
        ? this.sprite.x
        : Phaser.Math.Clamp(
          this.sprite.x,
          this.bubble.width / 2 + 20,
          GAMEPLAY.width - this.bubble.width / 2 - 20,
        );
      this.bubble.container.setPosition(
        bubbleX,
        Math.max(128, this.sprite.y - this.sprite.displayHeight - 70),
      );
      this.bubble.tail.setX(
        Phaser.Math.Clamp(
          this.sprite.x - bubbleX,
          -this.bubble.width / 2 + 28,
          this.bubble.width / 2 - 28,
        ),
      );
    }
    if (this.pickupPrompt?.active) {
      this.pickupPrompt.setX(this.sprite.x);
    }
  }

  destroy() {
    this.destroyed = true;
    this.clearBubble();
    this.scene.tweens.killTweensOf([
      this.sprite,
      this.shadow,
      this.pickupPrompt,
      this.statusHud,
    ]);
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.pickupPrompt?.destroy();
    this.statusHud?.destroy(true);
  }
}
