import { COLORS, GAMEPLAY } from './constants.js';

export function createCampusBackdrop(scene) {
  const sky = scene.add
    .image(GAMEPLAY.width / 2, GAMEPLAY.groundY / 2, 'sky-gradient')
    .setDisplaySize(GAMEPLAY.width, GAMEPLAY.groundY)
    .setDepth(0);

  const sunGlow = scene.add.circle(796, 86, 67, 0xffe59a, 0.22).setDepth(1);
  const sun = scene.add.circle(796, 86, 39, 0xffdb68, 0.96).setDepth(1);
  scene.add.circle(784, 74, 11, 0xfff4bd, 0.52).setDepth(1);

  const far = scene.add
    .tileSprite(480, 250, GAMEPLAY.width, 230, 'far-scenery')
    .setDepth(2);
  const campus = scene.add
    .tileSprite(480, 315, GAMEPLAY.width, 270, 'campus-scenery')
    .setDepth(3);
  const ground = scene.add
    .tileSprite(480, 495, GAMEPLAY.width, 90, 'ground-tile')
    .setDepth(5);

  return { sky, sunGlow, sun, far, campus, ground };
}

export function scrollCampusBackdrop(backdrop, speed, deltaSeconds) {
  backdrop.far.tilePositionX += speed * GAMEPLAY.farScrollFactor * deltaSeconds;
  backdrop.campus.tilePositionX +=
    speed * GAMEPLAY.campusScrollFactor * deltaSeconds;
  backdrop.ground.tilePositionX +=
    speed * GAMEPLAY.groundScrollFactor * deltaSeconds;
}
