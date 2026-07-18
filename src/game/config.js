import Phaser from 'phaser';
import { GAMEPLAY } from './constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { IsekaiScene } from './scenes/IsekaiScene.js';

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAMEPLAY.width,
  height: GAMEPLAY.height,
  backgroundColor: '#9bdcf4',
  render: {
    antialias: true,
    pixelArt: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAMEPLAY.width,
    height: GAMEPLAY.height,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAMEPLAY.gravityY },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, IsekaiScene],
};

export default gameConfig;
