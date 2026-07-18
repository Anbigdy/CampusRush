import Phaser from 'phaser';
import gameConfig from './game/config.js';
import { setupMobileControls } from './mobileControls.js';
import './style.css';

const mobileControls = setupMobileControls();
const game = new Phaser.Game(gameConfig);

if (import.meta.env.DEV) {
  window.__CAMPUS_RUSH_GAME__ = game;
  window.__CAMPUS_RUSH_MOBILE_CONTROLS__ = mobileControls;
}
