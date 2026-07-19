let activeUtterance = null;

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
    const utterance = new Utterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    const voice = pickGenericChineseVoice(engine);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
    };
    utterance.onerror = utterance.onend;
    activeUtterance = utterance;
    engine.speak(utterance);
    return true;
  } catch {
    activeUtterance = null;
    return false;
  }
}

export function stopGenericSpeech() {
  const engine = getSpeechEngine();
  if (!activeUtterance || !engine?.cancel) {
    return false;
  }

  engine.cancel();
  activeUtterance = null;
  return true;
}
