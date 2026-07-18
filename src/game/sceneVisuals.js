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

export function createIsekaiBackdrop(scene) {
  const sky = scene.add
    .image(GAMEPLAY.width / 2, GAMEPLAY.groundY / 2, 'isekai-sky')
    .setDisplaySize(GAMEPLAY.width, GAMEPLAY.groundY)
    .setDepth(0);

  const moonGlow = scene.add.circle(782, 92, 72, 0xc9c3ff, 0.18).setDepth(1);
  const moon = scene.add.circle(782, 92, 39, 0xf4edff, 0.98).setDepth(1);
  scene.add.circle(768, 78, 9, 0xffffff, 0.52).setDepth(1);
  scene.add.circle(805, 105, 6, 0xc7bceb, 0.38).setDepth(1);

  const far = scene.add
    .tileSprite(480, 250, GAMEPLAY.width, 230, 'isekai-far')
    .setDepth(2);
  const campus = scene.add
    .tileSprite(480, 315, GAMEPLAY.width, 270, 'isekai-scenery')
    .setDepth(3);
  const ground = scene.add
    .tileSprite(480, 495, GAMEPLAY.width, 90, 'isekai-ground')
    .setDepth(5);

  const wisps = [
    scene.add.circle(286, 176, 4, 0x8fffe0, 0.7),
    scene.add.circle(522, 132, 3, 0xb9a5ff, 0.72),
    scene.add.circle(886, 206, 5, 0x8fffe0, 0.62),
  ].map((wisp) => wisp.setDepth(4));

  return { sky, sunGlow: moonGlow, sun: moon, far, campus, ground, wisps };
}

export function createNeonBackdrop(scene) {
  const sky = scene.add
    .tileSprite(480, 225, GAMEPLAY.width, 450, 'neon-bg-skyline')
    .setTileScale(2.02)
    .setTint(0xa6afd0)
    .setAlpha(0.86)
    .setDepth(0);
  const far = scene.add
    .tileSprite(480, 225, GAMEPLAY.width, 450, 'neon-bg-mid')
    .setTileScale(2.02)
    .setTint(0x7380a8)
    .setAlpha(0.58)
    .setDepth(1);
  const city = scene.add
    .tileSprite(480, 225, GAMEPLAY.width, 450, 'neon-bg-near')
    .setTileScale(2.02)
    .setTint(0x7c789d)
    .setAlpha(0.68)
    .setDepth(2);
  const ground = scene.add
    .tileSprite(480, 495, GAMEPLAY.width, 90, 'neon-ground')
    .setDepth(5);

  const atmosphere = scene.add
    .rectangle(480, 225, GAMEPLAY.width, 450, 0x030817, 0.22)
    .setDepth(3);
  const horizonGlow = scene.add
    .rectangle(480, 402, GAMEPLAY.width, 28, 0x35f2df, 0.055)
    .setDepth(3);
  const rain = Array.from({ length: 22 }, (_, index) =>
    scene.add
      .rectangle(
        (index * 47 + 19) % GAMEPLAY.width,
        118 + ((index * 83) % 340),
        2,
        13 + (index % 4) * 5,
        index % 5 === 0 ? 0xff5bae : 0x75f9ec,
        0.1 + (index % 3) * 0.035,
      )
      .setAngle(16)
      .setDepth(4),
  );

  return { sky, far, city, ground, atmosphere, horizonGlow, rain };
}

export function scrollCampusBackdrop(backdrop, speed, deltaSeconds) {
  backdrop.far.tilePositionX += speed * GAMEPLAY.farScrollFactor * deltaSeconds;
  backdrop.campus.tilePositionX +=
    speed * GAMEPLAY.campusScrollFactor * deltaSeconds;
  backdrop.ground.tilePositionX +=
    speed * GAMEPLAY.groundScrollFactor * deltaSeconds;
}

export function scrollIsekaiBackdrop(backdrop, speed, deltaSeconds) {
  scrollCampusBackdrop(backdrop, speed, deltaSeconds);
  backdrop.wisps?.forEach((wisp, index) => {
    wisp.x -= speed * (0.05 + index * 0.012) * deltaSeconds;
    wisp.y += Math.sin(wisp.x * 0.018 + index) * 4 * deltaSeconds;
    if (wisp.x < -12) {
      wisp.x = GAMEPLAY.width + 12;
    }
  });
}

export function scrollNeonBackdrop(backdrop, speed, deltaSeconds) {
  backdrop.sky.tilePositionX += speed * 0.045 * deltaSeconds;
  backdrop.far.tilePositionX += speed * 0.14 * deltaSeconds;
  backdrop.city.tilePositionX += speed * 0.48 * deltaSeconds;
  backdrop.ground.tilePositionX += speed * GAMEPLAY.groundScrollFactor * deltaSeconds;
  backdrop.rain.forEach((drop, index) => {
    drop.x -= speed * (0.16 + (index % 4) * 0.025) * deltaSeconds;
    drop.y += (155 + (index % 5) * 34) * deltaSeconds;
    if (drop.x < -12 || drop.y > GAMEPLAY.groundY + 20) {
      drop.x = GAMEPLAY.width + (index % 5) * 22;
      drop.y = 92 - (index % 4) * 36;
    }
  });
}
