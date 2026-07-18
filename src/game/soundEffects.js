const SOUND_ENABLED_KEY = 'campusRush.soundEnabled.v1';

const SOUND_LIBRARY = Object.freeze({
  start: [
    { frequency: 392, endFrequency: 494, duration: 0.1, type: 'triangle', volume: 0.04 },
    { frequency: 494, endFrequency: 659, duration: 0.11, delay: 0.08, type: 'triangle', volume: 0.045 },
    { frequency: 659, endFrequency: 784, duration: 0.13, delay: 0.16, type: 'sine', volume: 0.04 },
  ],
  jump: [
    { frequency: 320, endFrequency: 660, duration: 0.13, type: 'square', volume: 0.028 },
    { frequency: 690, endFrequency: 820, duration: 0.07, delay: 0.055, type: 'sine', volume: 0.025 },
  ],
  crouch: [
    { frequency: 230, endFrequency: 115, duration: 0.11, type: 'triangle', volume: 0.04 },
  ],
  pass: [
    { frequency: 720, endFrequency: 980, duration: 0.075, type: 'sine', volume: 0.024 },
  ],
  milestone: [
    { frequency: 523, duration: 0.09, type: 'sine', volume: 0.032 },
    { frequency: 659, duration: 0.09, delay: 0.075, type: 'sine', volume: 0.034 },
    { frequency: 784, duration: 0.12, delay: 0.15, type: 'sine', volume: 0.038 },
  ],
  gameOver: [
    { frequency: 300, endFrequency: 145, duration: 0.34, type: 'sawtooth', volume: 0.04 },
    { frequency: 190, endFrequency: 90, duration: 0.3, delay: 0.11, type: 'triangle', volume: 0.035 },
  ],
  record: [
    { frequency: 659, duration: 0.1, type: 'sine', volume: 0.035 },
    { frequency: 831, duration: 0.1, delay: 0.09, type: 'sine', volume: 0.038 },
    { frequency: 988, duration: 0.18, delay: 0.18, type: 'sine', volume: 0.04 },
  ],
  toggle: [
    { frequency: 440, endFrequency: 620, duration: 0.08, type: 'sine', volume: 0.03 },
  ],
});

function getStorage() {
  return globalThis.localStorage ?? globalThis.window?.localStorage;
}

function readSoundEnabled() {
  try {
    return getStorage()?.getItem(SOUND_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

function writeSoundEnabled(enabled) {
  try {
    getStorage()?.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {
    // The current session can still use sound if browser storage is unavailable.
  }
}

let soundEnabled = readSoundEnabled();

function scheduleTone(context, tone, baseDelay) {
  const startTime = context.currentTime + baseDelay + (tone.delay ?? 0);
  const endTime = startTime + tone.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = tone.type;
  oscillator.frequency.setValueAtTime(tone.frequency, startTime);
  if (tone.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      tone.endFrequency,
      endTime,
    );
  }

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(tone.volume, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.025);
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function toggleSound(scene) {
  if (soundEnabled) {
    playSound(scene, 'toggle');
    soundEnabled = false;
  } else {
    soundEnabled = true;
    playSound(scene, 'toggle');
  }

  writeSoundEnabled(soundEnabled);
  return soundEnabled;
}

export function playSound(scene, soundName, options = {}) {
  if (!soundEnabled) {
    return false;
  }

  const tones = SOUND_LIBRARY[soundName];
  const context = scene?.sound?.context;
  if (!tones || !context?.createOscillator || !context?.createGain) {
    return false;
  }

  try {
    if (context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const baseDelay = Math.max(0, options.delay ?? 0);
    tones.forEach((tone) => scheduleTone(context, tone, baseDelay));
    return true;
  } catch {
    return false;
  }
}
