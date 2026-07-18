export const BACKGROUND_MUSIC = Object.freeze({
  key: 'campus-rush-theme',
  assetPath: 'assets/audio/campus-rush-theme.m4a',
  title: "Summer (Nature's Crescendo)",
  artist: 'ConcernedApe',
  volume: 0.18,
});

let backgroundMusic = null;

export function loadBackgroundMusic(scene) {
  scene.load.audio(
    BACKGROUND_MUSIC.key,
    `${import.meta.env.BASE_URL}${BACKGROUND_MUSIC.assetPath}`,
  );
}

function getBackgroundMusic(scene) {
  if (!backgroundMusic || !scene.sound.sounds.includes(backgroundMusic)) {
    backgroundMusic = scene.sound.add(BACKGROUND_MUSIC.key, {
      loop: true,
      volume: BACKGROUND_MUSIC.volume,
    });
  }

  return backgroundMusic;
}

export function syncBackgroundMusic(scene, enabled) {
  if (!enabled) {
    if (backgroundMusic?.isPlaying) {
      backgroundMusic.pause();
    }
    return false;
  }

  const music = getBackgroundMusic(scene);
  if (music.isPaused) {
    music.resume();
  } else if (!music.isPlaying) {
    music.play();
  }

  return music.isPlaying;
}
