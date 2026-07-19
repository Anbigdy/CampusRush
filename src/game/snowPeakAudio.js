export const HAKIMI_AUDIO = Object.freeze({
  key: 'hakimi-kitten-meow',
  assetPath: 'assets/audio/hakimi-kitten-meow.mp3',
  volume: 0.3,
  rate: 1.12,
});

export const SNOW_PEAK_SUNG_LINE = '张雪峰老师，我还记得你';
export const HAKIMI_CALL = '哈基米';

const SPEECH_RATES = Object.freeze([1.08, 1.22, 1.36, 1.16, 1.3]);
const CALL_RATES = Object.freeze([1.18, 1.42, 1.26]);
const SONG_SEMITONES = Object.freeze([0, 3, 7, 5, 8, 7, 5, 3, 0, 5, 3]);
const SILENT_GLYPHS = /[\s，。！？、；：,.!?—…🎵]/u;
const activeVoices = new WeakMap();

function getSpokenGlyphs(text) {
  return [...String(text ?? '')]
    .filter((glyph) => !SILENT_GLYPHS.test(glyph))
    .slice(0, 14);
}

function getSequenceRate(glyph, index, delivery) {
  if (delivery === 'song') {
    const semitones = SONG_SEMITONES[index % SONG_SEMITONES.length];
    return 2 ** (semitones / 12);
  }
  const rates = delivery === 'call' ? CALL_RATES : SPEECH_RATES;
  return rates[(glyph.codePointAt(0) + index) % rates.length];
}

export function buildHakimiVoiceSequence(
  text,
  { delivery = 'speech' } = {},
) {
  const glyphs = getSpokenGlyphs(text);
  let cursor = 0;
  return glyphs.map((glyph, index) => {
    const code = glyph.codePointAt(0);
    const rate = getSequenceRate(glyph, index, delivery);
    const sourceDuration =
      delivery === 'song'
        ? 0.2 + (index % 2) * 0.025
        : 0.135 + (code % 3) * 0.018;
    const syllable = Object.freeze({
      delay: cursor,
      offset: 0.018 + (code % 4) * 0.022,
      sourceDuration,
      rate,
      volume:
        delivery === 'call'
          ? 0.34
          : delivery === 'song'
            ? 0.31
            : 0.27,
    });
    const audibleDuration = sourceDuration / rate;
    cursor += audibleDuration + (delivery === 'song' ? 0.065 : 0.042);
    return syllable;
  });
}

export function loadSnowPeakAudio(scene) {
  scene.load.audio(
    HAKIMI_AUDIO.key,
    `${import.meta.env.BASE_URL}${HAKIMI_AUDIO.assetPath}`,
  );
}

export function stopHakimiVoice(scene) {
  const active = scene && activeVoices.get(scene);
  if (!active) {
    return false;
  }

  active.sources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // The source may already have ended naturally.
    }
  });
  activeVoices.delete(scene);
  return true;
}

function playHtmlAudioFallback(scene, sequence) {
  const firstSyllable = sequence[0];
  if (!scene?.sound?.play || !firstSyllable) {
    return false;
  }
  return scene.sound.play(HAKIMI_AUDIO.key, {
    volume: firstSyllable.volume,
    rate: firstSyllable.rate,
  });
}

export function playHakimiVoice(
  scene,
  text,
  { delivery = 'speech', soundEnabled = true } = {},
) {
  const sequence = buildHakimiVoiceSequence(text, { delivery });
  if (
    !soundEnabled ||
    sequence.length === 0 ||
    !scene?.cache?.audio?.exists?.(HAKIMI_AUDIO.key) ||
    !scene?.sound
  ) {
    return false;
  }

  stopHakimiVoice(scene);
  const context = scene.sound.context;
  const audioBuffer = scene.cache.audio.get?.(HAKIMI_AUDIO.key);
  if (
    !context?.createBufferSource ||
    !context?.createGain ||
    !audioBuffer
  ) {
    return playHtmlAudioFallback(scene, sequence);
  }

  try {
    if (context.state === 'suspended') {
      context.resume?.().catch?.(() => {});
    }
    const destination = scene.sound.destination ?? context.destination;
    const baseTime = context.currentTime + 0.018;
    const sources = new Set();
    const activeVoice = { sources };
    activeVoices.set(scene, activeVoice);
    sequence.forEach((syllable) => {
      const source = context.createBufferSource();
      const gain = context.createGain();
      const startTime = baseTime + syllable.delay;
      const safeOffset = Math.min(
        syllable.offset,
        Math.max(0, audioBuffer.duration - 0.04),
      );
      const safeDuration = Math.min(
        syllable.sourceDuration,
        Math.max(0.04, audioBuffer.duration - safeOffset),
      );
      const endTime = startTime + safeDuration / syllable.rate;

      source.buffer = audioBuffer;
      source.playbackRate.setValueAtTime(syllable.rate, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(
        syllable.volume,
        startTime + 0.012,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      source.connect(gain);
      gain.connect(destination);
      source.onended = () => {
        sources.delete(source);
        if (
          sources.size === 0 &&
          activeVoices.get(scene) === activeVoice
        ) {
          activeVoices.delete(scene);
        }
      };
      sources.add(source);
      source.start(startTime, safeOffset, safeDuration);
    });
    return true;
  } catch {
    stopHakimiVoice(scene);
    return false;
  }
}

export function playHakimiMeow(scene, soundEnabled = true) {
  return playHakimiVoice(scene, HAKIMI_CALL, {
    delivery: 'call',
    soundEnabled,
  });
}
