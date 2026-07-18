import Phaser from 'phaser';
import gameConfig from './game/config.js';
import './style.css';

const game = new Phaser.Game(gameConfig);

if (import.meta.env.DEV) {
  window.__CAMPUS_RUSH_GAME__ = game;
}
