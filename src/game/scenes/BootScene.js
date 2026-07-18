import Phaser from 'phaser';
import {
  finishLoadingScreen,
  updateLoadingScreen,
} from '../../loadingScreen.js';
import { loadBackgroundMusic } from '../backgroundMusic.js';
import { createGameTextures } from '../createTextures.js';
import { loadPlayerSkin, preparePlayerSkin } from '../playerSkin.js';
import {
  SNOW_PEAK,
  loadSnowPeak,
  prepareSnowPeak,
} from '../snowPeakEvent.js';

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
      let status = '正在叫醒主角…';
      if (file.key === 'campus-rush-theme') {
        status = '正在调试随身听…';
      } else if (file.key === SNOW_PEAK.textureKey) {
        status = '正在寻找 Snow Peak…';
      }
      updateLoadingScreen(0.82, status);
    });
    this.load.once('complete', () => {
      updateLoadingScreen(0.92, '正在布置校园…');
    });
    loadPlayerSkin(this);
    loadBackgroundMusic(this);
    loadSnowPeak(this);
  }

  create() {
    createGameTextures(this);
    preparePlayerSkin(this);
    prepareSnowPeak(this);
    this.scene.start('MenuScene');
    finishLoadingScreen();
  }
}
