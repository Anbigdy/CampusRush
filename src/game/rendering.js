import { GAMEPLAY } from './constants.js';

export const RENDER_SCALE = Math.min(
  2,
  Math.max(1, globalThis.devicePixelRatio ?? 1),
);

let highDensityTextInstalled = false;

export function installHighDensityTextRendering(Phaser) {
  if (highDensityTextInstalled || RENDER_SCALE === 1) {
    return;
  }

  const factory = Phaser.GameObjects.GameObjectFactory.prototype;
  const createText = factory.text;
  factory.text = function createHighDensityText(...args) {
    return createText.apply(this, args).setResolution(RENDER_SCALE);
  };
  highDensityTextInstalled = true;
}

export function configureLogicalCamera(scene) {
  scene.cameras.main
    .setZoom(RENDER_SCALE)
    .centerOn(GAMEPLAY.width / 2, GAMEPLAY.height / 2);
}
