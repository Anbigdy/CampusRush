export const HAKIMI_AUDIO = Object.freeze({
  key: 'hakimi-kitten-meow',
  assetPath: 'assets/audio/hakimi-kitten-meow.mp3',
  volume: 0.36,
  rate: 1.04,
});

export const SNOW_PEAK_SUNG_LINE = '张雪峰老师，我还记得你';
export const HAKIMI_CALL = '哈基米';

export const SNOW_PEAK_SONG_SEGMENTS = Object.freeze([
  Object.freeze({ text: '张雪峰老师，', pitch: 0.82, rate: 0.86 }),
  Object.freeze({ text: '我还', pitch: 1.02, rate: 0.82 }),
  Object.freeze({ text: '记得', pitch: 1.18, rate: 0.78 }),
  Object.freeze({ text: '你', pitch: 0.94, rate: 0.62 }),
]);

export function loadSnowPeakAudio(scene) {
  scene.load.audio(
    HAKIMI_AUDIO.key,
    `${import.meta.env.BASE_URL}${HAKIMI_AUDIO.assetPath}`,
  );
}

export function playHakimiMeow(scene, soundEnabled = true) {
  if (
    !soundEnabled ||
    !scene?.cache?.audio?.exists?.(HAKIMI_AUDIO.key) ||
    !scene?.sound?.play
  ) {
    return false;
  }

  try {
    return scene.sound.play(HAKIMI_AUDIO.key, {
      volume: HAKIMI_AUDIO.volume,
      rate: HAKIMI_AUDIO.rate,
    });
  } catch {
    return false;
  }
}
