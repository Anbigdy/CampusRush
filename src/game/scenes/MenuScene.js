import Phaser from 'phaser';
import { COLORS, GAMEPLAY } from '../constants.js';
import { readHighScore } from '../storage.js';

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.hasStarted = false;
    this.createBackground();

    this.add
      .text(GAMEPLAY.width / 2, 82, 'CAMPUS RUSH', {
        fontFamily: FONT_FAMILY,
        fontSize: '58px',
        fontStyle: 'bold',
        color: '#173b57',
        stroke: '#ffffff',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(GAMEPLAY.width / 2, 130, '校园冲刺', {
        fontFamily: FONT_FAMILY,
        fontSize: '23px',
        fontStyle: 'bold',
        color: '#2f617c',
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(10);

    const panel = this.add
      .rectangle(GAMEPLAY.width / 2, 258, 490, 210, COLORS.navyDark, 0.9)
      .setStrokeStyle(3, COLORS.white, 0.9)
      .setDepth(9);

    this.add
      .text(GAMEPLAY.width / 2, 196, '快迟到了！一路跳过校园障碍吧', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#fff4d6',
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(
        GAMEPLAY.width / 2,
        262,
        '空格键  /  方向上键  /  点击画面\n落地后才能再次跳跃',
        {
          fontFamily: FONT_FAMILY,
          fontSize: '19px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(GAMEPLAY.width / 2, 334, `历史最高分  ${readHighScore()}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#89e9be',
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.createStartButton();

    panel.setScale(0.98);
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
    this.add
      .tileSprite(480, 495, GAMEPLAY.width, 90, 'ground-tile')
      .setDepth(4);
  }

  createStartButton() {
    const button = this.add
      .rectangle(GAMEPLAY.width / 2, 405, 230, 64, COLORS.coral, 1)
      .setStrokeStyle(4, COLORS.white, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    const label = this.add
      .text(GAMEPLAY.width / 2, 405, '开始冲刺', {
        fontFamily: FONT_FAMILY,
        fontSize: '25px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(13);

    button.on('pointerover', () => {
      button.setFillStyle(0xff806f);
      button.setScale(1.03);
      label.setScale(1.03);
    });
    button.on('pointerout', () => {
      button.setFillStyle(COLORS.coral);
      button.setScale(1);
      label.setScale(1);
    });
    button.on('pointerdown', () => {
      if (this.hasStarted) {
        return;
      }
      this.hasStarted = true;
      this.scene.start('GameScene');
    });
  }

  update(_time, delta) {
    const seconds = Math.min(delta, 50) / 1000;
    this.farBackground.tilePositionX += 10 * seconds;
    this.campusBackground.tilePositionX += 18 * seconds;
  }
}
