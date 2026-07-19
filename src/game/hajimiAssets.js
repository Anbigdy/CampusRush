const EXTRA_HAJIMI_ASSET_COUNT = 12;

const EXTRA_HAJIMI_ASSETS = Array.from(
  { length: EXTRA_HAJIMI_ASSET_COUNT },
  (_, index) => {
    const suffix = String(index + 1).padStart(2, '0');
    return Object.freeze({
      key: `hajimi-extra-${suffix}`,
      assetPath: `assets/hajimi/hajimi-extra-${suffix}.png`,
    });
  },
);

export const HAJIMI_ASSETS = Object.freeze([
  Object.freeze({
    key: 'hajimi-fisheye',
    assetPath: 'assets/hajimi/hajimi-fisheye.png',
  }),
  Object.freeze({
    key: 'hajimi-confused',
    assetPath: 'assets/hajimi/hajimi-confused.png',
  }),
  Object.freeze({
    key: 'hajimi-smug',
    assetPath: 'assets/hajimi/hajimi-smug.png',
  }),
  Object.freeze({
    key: 'hajimi-annoyed',
    assetPath: 'assets/hajimi/hajimi-annoyed.png',
  }),
  Object.freeze({
    key: 'hajimi-tongue',
    assetPath: 'assets/hajimi/hajimi-tongue.png',
  }),
  Object.freeze({
    key: 'hajimi-shocked',
    assetPath: 'assets/hajimi/hajimi-shocked.png',
  }),
  ...EXTRA_HAJIMI_ASSETS,
]);

export function loadHajimiAssets(scene) {
  HAJIMI_ASSETS.forEach(({ key, assetPath }) => {
    scene.load.image(key, `${import.meta.env.BASE_URL}${assetPath}`);
  });
}
