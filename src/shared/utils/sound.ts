const SOUND_MUTED_KEY = 'engvox_sound_muted';

export const getSoundMuted = (): boolean => {
  try {
    return localStorage.getItem(SOUND_MUTED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setSoundMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(SOUND_MUTED_KEY, muted ? 'true' : 'false');
    window.dispatchEvent(
      new CustomEvent('engvox_sound_toggle', { detail: { muted } })
    );
  } catch {
    // Ignore storage errors
  }
};

export const toggleSoundMuted = (): boolean => {
  const next = !getSoundMuted();
  setSoundMuted(next);
  return next;
};

export const playSound = (
  type: 'pop' | 'ding' | 'success' | 'error' | 'flip'
) => {
  if (getSoundMuted()) return;
  try {
    // Check if AudioContext is supported
    const AudioContextClass =
      window.AudioContext ??
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'flip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'ding' || type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Silently ignore audio playback failures
  }
};

export const getBestNaturalVoice = (): SpeechSynthesisVoice | null => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. Google US/UK English (Natural/High Quality)
  const googleVoice = voices.find(
    (v) =>
      (v.name.includes('Google') || v.name.includes('Natural')) &&
      v.lang.startsWith('en')
  );
  if (googleVoice) return googleVoice;

  // 2. Microsoft Natural / Online English (e.g. Jenny, Aria, Guy, Christopher)
  const msNatural = voices.find(
    (v) =>
      (v.name.includes('Online') ||
        v.name.includes('Natural') ||
        v.name.includes('Neural')) &&
      v.lang.startsWith('en')
  );
  if (msNatural) return msNatural;

  // 3. Apple Samantha / Daniel / Karen / Siri
  const appleVoice = voices.find(
    (v) =>
      (v.name.includes('Samantha') ||
        v.name.includes('Daniel') ||
        v.name.includes('Karen') ||
        v.name.includes('Siri')) &&
      v.lang.startsWith('en')
  );
  if (appleVoice) return appleVoice;

  // 4. Any US or UK English voice
  const enVoice = voices.find(
    (v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')
  );
  return enVoice || null;
};

const findVoice = (
  voices: SpeechSynthesisVoice[],
  voiceName?: string
): SpeechSynthesisVoice | null => {
  if (voiceName) {
    const named = voices.find((v) => v.name === voiceName);
    if (named) return named;
  }
  return getBestNaturalVoice();
};

export const playNaturalTTS = (
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    pitch?: number;
    rate?: number;
    voiceName?: string;
  }
) => {
  if (getSoundMuted()) return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options?.rate ?? 0.92;
  utterance.pitch = options?.pitch ?? 1.02;

  const setVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = findVoice(voices, options?.voiceName);

    if (selectedVoice) utterance.voice = selectedVoice;
    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onError) utterance.onerror = options.onError;
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      setVoiceAndSpeak();
    };
    setVoiceAndSpeak();
  }
};
