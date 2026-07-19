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
const CHINESE_LANGUAGE = /^zh(?:-|_)/iu;
const MALE_VOICE_NAME =
  /(?:yunxi|yunjian|kangkang|li-mu|reed|eddy|rocko|male|男)/iu;
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
  active.synthesis?.cancel?.();
  activeVoices.delete(scene);
  return true;
}

export function chooseSnowPeakVoice(voices = []) {
  const chineseVoices = voices.filter((voice) =>
    CHINESE_LANGUAGE.test(String(voice?.lang ?? '')),
  );
  return (
    chineseVoices.find((voice) =>
      MALE_VOICE_NAME.test(String(voice?.name ?? '')),
    ) ??
    chineseVoices.find((voice) => voice.localService) ??
    chineseVoices[0] ??
    null
  );
}

export function getSnowPeakSpeechSettings(delivery = 'speech') {
  if (delivery === 'song') {
    return Object.freeze({ lang: 'zh-CN', rate: 0.9, pitch: 1.08, volume: 1 });
  }
  if (delivery === 'call') {
    return Object.freeze({ lang: 'zh-CN', rate: 1.08, pitch: 0.86, volume: 1 });
  }
  return Object.freeze({ lang: 'zh-CN', rate: 1.02, pitch: 0.82, volume: 1 });
}

function startIntelligibleSpeech(
  text,
  delivery,
  activeVoice,
  speechRuntime,
) {
  const synthesis = speechRuntime?.speechSynthesis;
  const Utterance = speechRuntime?.SpeechSynthesisUtterance;
  if (!synthesis?.speak || typeof Utterance !== 'function') {
    return false;
  }

  try {
    const utterance = new Utterance(text);
    const settings = getSnowPeakSpeechSettings(delivery);
    Object.assign(utterance, settings);
    const voice = chooseSnowPeakVoice(synthesis.getVoices?.() ?? []);
    if (voice) {
      utterance.voice = voice;
    }
    const release = () => {
      activeVoice.speechActive = false;
      if (
        activeVoice.sources.size === 0 &&
        activeVoices.get(activeVoice.scene) === activeVoice
      ) {
        activeVoices.delete(activeVoice.scene);
      }
    };
    utterance.onend = release;
    utterance.onerror = release;
    activeVoice.synthesis = synthesis;
    activeVoice.speechActive = true;
    synthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function getAccentSequence(sequence, delivery) {
  if (sequence.length <= 1) {
    return sequence;
  }
  const accentIndexes =
    delivery === 'song'
      ? [0, Math.floor(sequence.length / 3), Math.floor(sequence.length * 0.7)]
      : [0, sequence.length - 1];
  return [...new Set(accentIndexes)].map((index) => ({
    ...sequence[index],
    volume: delivery === 'song' ? 0.075 : 0.05,
  }));
}

function playHtmlAudioFallback(scene, sequence, volumeScale = 1) {
  const firstSyllable = sequence[0];
  if (!scene?.sound?.play || !firstSyllable) {
    return false;
  }
  return scene.sound.play(HAKIMI_AUDIO.key, {
    volume: firstSyllable.volume * volumeScale,
    rate: firstSyllable.rate,
  });
}

function scheduleHakimiSequence(scene, sequence, activeVoice) {
  const context = scene.sound.context;
  const audioBuffer = scene.cache.audio.get?.(HAKIMI_AUDIO.key);
  if (!context?.createBufferSource || !context?.createGain || !audioBuffer) {
    return playHtmlAudioFallback(scene, sequence);
  }

  if (context.state === 'suspended') {
    context.resume?.().catch?.(() => {});
  }
  const destination = scene.sound.destination ?? context.destination;
  const baseTime = context.currentTime + 0.018;
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
      activeVoice.sources.delete(source);
      if (
        activeVoice.sources.size === 0 &&
        !activeVoice.speechActive &&
        activeVoices.get(scene) === activeVoice
      ) {
        activeVoices.delete(scene);
      }
    };
    activeVoice.sources.add(source);
    source.start(startTime, safeOffset, safeDuration);
  });
  return true;
}

export function playHakimiVoice(
  scene,
  text,
  {
    delivery = 'speech',
    soundEnabled = true,
    speechRuntime = globalThis,
  } = {},
) {
  const sequence = buildHakimiVoiceSequence(text, { delivery });
  if (!soundEnabled || sequence.length === 0 || !scene) {
    return false;
  }

  stopHakimiVoice(scene);
  const activeVoice = {
    scene,
    sources: new Set(),
    speechActive: false,
    synthesis: null,
  };
  activeVoices.set(scene, activeVoice);
  const didSpeak = startIntelligibleSpeech(
    text,
    delivery,
    activeVoice,
    speechRuntime,
  );
  const canPlayHakimi =
    scene?.cache?.audio?.exists?.(HAKIMI_AUDIO.key) && scene?.sound;

  try {
    const didPlayHakimi =
      canPlayHakimi &&
      scheduleHakimiSequence(
        scene,
        didSpeak ? getAccentSequence(sequence, delivery) : sequence,
        activeVoice,
      );
    if (!didSpeak && !didPlayHakimi) {
      activeVoices.delete(scene);
    }
    return Boolean(didSpeak || didPlayHakimi);
  } catch {
    activeVoice.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Keep the intelligible speech even if a kitten accent fails.
      }
    });
    activeVoice.sources.clear();
    if (!didSpeak) {
      activeVoices.delete(scene);
    }
    return didSpeak;
  }
}

export function playHakimiMeow(scene, soundEnabled = true) {
  return playHakimiVoice(scene, HAKIMI_CALL, {
    delivery: 'call',
    soundEnabled,
  });
}
