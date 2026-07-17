import Phaser from 'phaser';
import { createGameTextures } from '../createTextures.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    createGameTextures(this);
    this.scene.start('MenuScene');
  }
}
