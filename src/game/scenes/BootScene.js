import Phaser from 'phaser';
import {
  finishLoadingScreen,
  updateLoadingScreen,
} from '../../loadingScreen.js';
import { loadBackgroundMusic } from '../backgroundMusic.js';
import { createGameTextures } from '../createTextures.js';
import { loadPlayerSkin, preparePlayerSkin } from '../playerSkin.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    updateLoadingScreen(0.18, '正在整理书包…');
    this.load.on('progress', (progress) => {
      updateLoadingScreen(0.18 + progress * 0.7, '正在装载校园素材…');
    });
    this.load.on('fileprogress', (file) => {
      const status = file.key === 'campus-rush-theme'
        ? '正在调试随身听…'
        : '正在叫醒主角…';
      updateLoadingScreen(0.82, status);
    });
    this.load.once('complete', () => {
      updateLoadingScreen(0.92, '正在布置校园…');
    });
    loadPlayerSkin(this);
    loadBackgroundMusic(this);
  }

  create() {
    createGameTextures(this);
    preparePlayerSkin(this);
    this.scene.start('MenuScene');
    finishLoadingScreen();
  }
}
