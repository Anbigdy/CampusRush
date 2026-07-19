import Phaser from 'phaser';
import { GAMEPLAY } from './constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { IsekaiScene } from './scenes/IsekaiScene.js';
import { NeonScene } from './scenes/NeonScene.js';
import { RENDER_SCALE } from './rendering.js';

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAMEPLAY.width * RENDER_SCALE,
  height: GAMEPLAY.height * RENDER_SCALE,
  backgroundColor: '#9bdcf4',
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    width: GAMEPLAY.width * RENDER_SCALE,
    height: GAMEPLAY.height * RENDER_SCALE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAMEPLAY.gravityY },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, IsekaiScene, NeonScene],
};

export default gameConfig;
