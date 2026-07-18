import Phaser from 'phaser';
import { COLORS, GAMEPLAY } from '../constants.js';
import {
  createCampusBackdrop,
  scrollCampusBackdrop,
} from '../sceneVisuals.js';
import { PLAYER_SKIN } from '../playerSkin.js';
import { readHighScore } from '../storage.js';
import {
  isSoundEnabled,
  playSound,
  toggleSound,
} from '../soundEffects.js';

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.hasStarted = false;
    this.backdrop = createCampusBackdrop(this);
    this.createDecorations();
    this.createSoundToggle();
    this.createTitle();
    this.createInstructionCard();
    this.createStartButton();
  }

  createDecorations() {
    this.add
      .rectangle(848, 54, 154, 44, COLORS.navyDark, 0.88)
      .setStrokeStyle(2, COLORS.white, 0.82)
      .setDepth(12);
    this.add
      .text(848, 54, '08:29  ·  早八预警', {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(0.5)
      .setDepth(13);

    this.add
      .sprite(128, 450, PLAYER_SKIN.textureKey, PLAYER_SKIN.idleFrame)
      .setOrigin(0.5, 1)
      .setScale(PLAYER_SKIN.baseScale * 1.5)
      .setDepth(8);
    this.add.ellipse(128, 446, 78, 13, COLORS.navyDark, 0.18).setDepth(6);

    this.add
      .image(845, 425, 'obstacle-backpack')
      .setScale(1.1)
      .setDepth(7);
    this.add
      .image(903, 416, 'obstacle-barricade')
      .setScale(0.72)
      .setDepth(7);
  }

  createTitle() {
    this.add
      .text(480, 88, 'CAMPUS RUSH', {
        fontFamily: FONT_FAMILY,
        fontSize: '62px',
        fontStyle: 'bold',
        color: '#0d2a40',
      })
      .setOrigin(0.5)
      .setAlpha(0.22)
      .setPosition(484, 94)
      .setDepth(9);

    this.add
      .text(480, 84, 'CAMPUS RUSH', {
        fontFamily: FONT_FAMILY,
        fontSize: '62px',
        fontStyle: 'bold',
        color: '#173c59',
        stroke: '#ffffff',
        strokeThickness: 9,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(480, 132, '校 园 冲 刺', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#356d89',
        letterSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  createSoundToggle() {
    const button = this.add
      .rectangle(848, 106, 154, 34, COLORS.cream, 0.96)
      .setStrokeStyle(2, COLORS.navy, 0.82)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);
    const label = this.add
      .text(848, 106, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#173c59',
      })
      .setOrigin(0.5)
      .setDepth(13);
    const updateLabel = () => {
      label.setText(`音效  ${isSoundEnabled() ? '开' : '关'}`);
    };

    updateLabel();
    button.on('pointerover', () => button.setFillStyle(0xffffff, 1));
    button.on('pointerout', () => button.setFillStyle(COLORS.cream, 0.96));
    button.on('pointerdown', () => {
      toggleSound(this);
      updateLabel();
    });
  }

  createInstructionCard() {
    this.add
      .rectangle(486, 269, 550, 224, COLORS.navyDark, 0.2)
      .setDepth(9);
    this.add
      .rectangle(480, 262, 550, 224, COLORS.cream, 0.97)
      .setStrokeStyle(3, COLORS.navy, 0.92)
      .setDepth(10);

    this.add
      .rectangle(480, 171, 158, 28, COLORS.coral, 1)
      .setDepth(11);
    this.add
      .text(480, 171, '早八危机 · 快迟到了', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.add
      .text(480, 209, '二段跳越过高障碍，空中下蹲快速下坠！', {
        fontFamily: FONT_FAMILY,
        fontSize: '21px',
        fontStyle: 'bold',
        color: '#173c59',
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.add
      .text(330, 246, '跳跃 / 二段', {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#53758a',
      })
      .setOrigin(0, 0.5)
      .setDepth(12);

    this.createKeyChip(452, 246, 'SPACE', 84);
    this.createKeyChip(544, 246, '↑', 52);
    this.createKeyChip(620, 246, '点击', 72);

    this.add
      .text(330, 286, '下蹲 / 下坠', {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#53758a',
      })
      .setOrigin(0, 0.5)
      .setDepth(12);

    this.createKeyChip(452, 286, '↓', 52);
    this.createKeyChip(516, 286, 'S', 52);
    this.createKeyChip(596, 286, '按住', 80);

    this.add
      .rectangle(480, 331, 244, 42, COLORS.navy, 1)
      .setDepth(11);
    this.add.circle(381, 331, 13, COLORS.orange, 1).setDepth(12);
    this.add
      .text(381, 331, '★', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(13);
    this.add
      .text(495, 331, `历史最高分  ${readHighScore()}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.add
      .text(480, 360, '达到 1000 分，开启异世界主线', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#7a5aa8',
      })
      .setOrigin(0.5)
      .setDepth(12);
  }

  createKeyChip(x, y, label, width) {
    this.add
      .rectangle(x, y, width, 31, 0xffffff, 1)
      .setStrokeStyle(2, 0x9ab3c1, 1)
      .setDepth(12);
    this.add
      .text(x, y, label, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#173c59',
      })
      .setOrigin(0.5)
      .setDepth(13);
  }

  createStartButton() {
    const shadow = this.add
      .rectangle(484, 410, 246, 66, 0x9d3f3b, 0.38)
      .setDepth(11);
    const button = this.add
      .rectangle(480, 404, 246, 66, COLORS.coral, 1)
      .setStrokeStyle(4, COLORS.white, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);
    const label = this.add
      .text(480, 404, '开始冲刺  →', {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(13);

    button.on('pointerover', () => {
      button.setFillStyle(0xff8375).setScale(1.035);
      label.setScale(1.035);
      shadow.setScale(1.035);
    });
    button.on('pointerout', () => {
      button.setFillStyle(COLORS.coral).setScale(1);
      label.setScale(1);
      shadow.setScale(1);
    });
    button.on('pointerdown', () => {
      if (this.hasStarted) {
        return;
      }
      this.hasStarted = true;
      playSound(this, 'start');
      this.scene.start('GameScene');
    });
  }

  update(_time, delta) {
    const seconds = Math.min(delta, 50) / 1000;
    scrollCampusBackdrop(this.backdrop, 55, seconds);
  }
}
