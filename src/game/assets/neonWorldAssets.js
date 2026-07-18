import Phaser from 'phaser';

export const NEON_WORLD_ASSETS = Object.freeze([
  Object.freeze({ key: 'neon-bg-skyline', path: 'assets/worlds/neon-deadline/skyline.png' }),
  Object.freeze({ key: 'neon-bg-mid', path: 'assets/worlds/neon-deadline/mid-buildings.png' }),
  Object.freeze({ key: 'neon-bg-near', path: 'assets/worlds/neon-deadline/near-buildings.png' }),
  Object.freeze({ key: 'neon-drone', path: 'assets/worlds/neon-deadline/drone.png' }),
  Object.freeze({ key: 'neon-turret', path: 'assets/worlds/neon-deadline/turret.png' }),
  Object.freeze({ key: 'neon-control-box', path: 'assets/worlds/neon-deadline/control-box.png' }),
  Object.freeze({ key: 'neon-hover-car', path: 'assets/worlds/neon-deadline/hover-car.png' }),
]);

export function loadNeonWorldAssets(scene) {
  NEON_WORLD_ASSETS.forEach(({ key, path }) => scene.load.image(key, path));
}

export function prepareNeonWorldAssets(scene) {
  NEON_WORLD_ASSETS.forEach(({ key }) => {
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  });
}
