const activeUtterances = new Set();

function getSpeechEngine() {
  return globalThis.speechSynthesis ?? null;
}

function pickGenericChineseVoice(engine) {
  const voices = engine.getVoices?.() ?? [];
  return (
    voices.find((voice) => voice.lang.toLowerCase() === 'zh-cn') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('zh')) ??
    null
  );
}

function createGenericChineseUtterance(
  Utterance,
  engine,
  text,
  { rate, pitch, volume },
) {
  const utterance = new Utterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  const voice = pickGenericChineseVoice(engine);
  if (voice) {
    utterance.voice = voice;
  }
  const release = () => activeUtterances.delete(utterance);
  utterance.onend = release;
  utterance.onerror = release;
  return utterance;
}

export function speakGenericChinese(
  text,
  { rate = 1.04, pitch = 0.94, volume = 0.72 } = {},
) {
  const engine = getSpeechEngine();
  const Utterance = globalThis.SpeechSynthesisUtterance;
  if (!engine?.speak || !Utterance || !text) {
    return false;
  }

  try {
    engine.cancel();
    activeUtterances.clear();
    const utterance = createGenericChineseUtterance(
      Utterance,
      engine,
      text,
      { rate, pitch, volume },
    );
    activeUtterances.add(utterance);
    engine.speak(utterance);
    return true;
  } catch {
    activeUtterances.clear();
    return false;
  }
}

export function singGenericChinese(
  segments,
  { volume = 0.76 } = {},
) {
  const engine = getSpeechEngine();
  const Utterance = globalThis.SpeechSynthesisUtterance;
  const singableSegments = segments?.filter((segment) => segment?.text) ?? [];
  if (!engine?.speak || !Utterance || singableSegments.length === 0) {
    return false;
  }

  try {
    engine.cancel();
    activeUtterances.clear();
    singableSegments.forEach((segment) => {
      const utterance = createGenericChineseUtterance(
        Utterance,
        engine,
        segment.text,
        {
          rate: segment.rate ?? 0.82,
          pitch: segment.pitch ?? 1,
          volume,
        },
      );
      activeUtterances.add(utterance);
      engine.speak(utterance);
    });
    return true;
  } catch {
    engine.cancel?.();
    activeUtterances.clear();
    return false;
  }
}

export function stopGenericSpeech() {
  const engine = getSpeechEngine();
  if (activeUtterances.size === 0 || !engine?.cancel) {
    return false;
  }

  engine.cancel();
  activeUtterances.clear();
  return true;
}
