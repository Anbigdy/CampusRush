import Phaser from 'phaser';
import {
  finishLoadingScreen,
  updateLoadingScreen,
} from '../../loadingScreen.js';
import { loadBackgroundMusic } from '../backgroundMusic.js';
import { createGameTextures } from '../createTextures.js';
import {
  loadNeonWorldAssets,
  prepareNeonWorldAssets,
} from '../assets/neonWorldAssets.js';
import { loadPlayerSkin, preparePlayerSkin } from '../playerSkin.js';
import {
  SNOW_PEAK,
  loadSnowPeak,
  prepareSnowPeak,
} from '../snowPeakEvent.js';
import { HAKIMI_AUDIO } from '../snowPeakAudio.js';

const ASSET_PROGRESS_START = 0.18;
const ASSET_PROGRESS_SPAN = 0.74;

function getDetailedLoadProgress(progressByFile, totalToLoad) {
  if (!totalToLoad) {
    return 0;
  }

  const partialProgress = [...progressByFile.values()].reduce(
    (sum, progress) => sum + progress,
    0,
  );
  return Phaser.Math.Clamp(partialProgress / totalToLoad, 0, 1);
}

function getFileStatus(file) {
  if (file.percentComplete >= 0.995) {
    return '正在处理已下载素材…';
  }
  if (file.key === 'campus-rush-theme') {
    return '正在调试随身听…';
  }
    if (file.key === SNOW_PEAK.textureKey) {
      return '正在寻找 Snow Peak…';
    }
    if (file.key === HAKIMI_AUDIO.key) {
      return '正在叫醒哈基米…';
    }
  if (file.key.startsWith('neon-')) {
    return '正在接通未来城…';
  }
  return '正在叫醒主角…';
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const progressByFile = new Map();
    updateLoadingScreen(ASSET_PROGRESS_START, '正在整理书包…');
    this.load.on('progress', (progress) => {
      const detailedProgress = Math.max(
        progress,
        getDetailedLoadProgress(progressByFile, this.load.totalToLoad),
      );
      updateLoadingScreen(
        ASSET_PROGRESS_START + detailedProgress * ASSET_PROGRESS_SPAN,
      );
    });
    this.load.on('fileprogress', (file, percentComplete) => {
      progressByFile.set(file.key, percentComplete);
      const detailedProgress = getDetailedLoadProgress(
        progressByFile,
        this.load.totalToLoad,
      );
      updateLoadingScreen(
        ASSET_PROGRESS_START + detailedProgress * ASSET_PROGRESS_SPAN,
        getFileStatus(file),
      );
    });
    this.load.once('complete', () => {
      updateLoadingScreen(0.94, '正在布置校园…');
    });
    loadPlayerSkin(this);
    loadBackgroundMusic(this);
    loadSnowPeak(this);
    loadNeonWorldAssets(this);
  }

  create() {
    updateLoadingScreen(0.97, '正在生成跑道…');
    createGameTextures(this);
    preparePlayerSkin(this);
    prepareSnowPeak(this);
    prepareNeonWorldAssets(this);
    this.scene.start('MenuScene');
    finishLoadingScreen();
  }
}
