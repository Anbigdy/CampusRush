import Phaser from 'phaser';
import { createGameTextures } from '../createTextures.js';
import { loadPlayerSkin, preparePlayerSkin } from '../playerSkin.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    loadPlayerSkin(this);
  }

  create() {
    createGameTextures(this);
    preparePlayerSkin(this);
    this.scene.start('MenuScene');
  }
}
