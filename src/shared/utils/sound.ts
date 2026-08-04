import { logger } from '@/shared/logger';

const SOUND_MUTED_KEY = 'engvox_sound_muted';

const FLIP_FREQ_START = 300;
const FLIP_FREQ_END = 600;
const FLIP_DURATION = 0.04;
const FLIP_GAIN = 0.04;

const POP_FREQ_START = 400;
const POP_FREQ_END = 800;
const POP_RAMP_DURATION = 0.05;
const POP_GAIN = 0.1;
const POP_DURATION = 0.1;

const DING_FREQ_START = 800;
const DING_FREQ_END = 1200;
const DING_RAMP_DURATION = 0.05;
const DING_GAIN = 0.05;
const DING_DURATION = 0.3;

const ERROR_FREQ_START = 200;
const ERROR_FREQ_END = 150;
const ERROR_DURATION = 0.2;
const ERROR_GAIN = 0.05;

export const getSoundMuted = (): boolean => {
  try {
    return localStorage.getItem(SOUND_MUTED_KEY) === 'true';
  } catch (e) {
    logger.w('[SOUND] Failed to read mute state', e);
    return false;
  }
};

const setSoundMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(SOUND_MUTED_KEY, muted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('engvox_sound_toggle', { detail: { muted } }));
  } catch (e) {
    logger.w('[SOUND] Failed to write mute state', e);
  }
};

export const toggleSoundMuted = (): boolean => {
  const next = !getSoundMuted();
  setSoundMuted(next);
  return next;
};

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (sharedAudioCtx && sharedAudioCtx.state !== 'closed') return sharedAudioCtx;
  const AudioContextClass =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  sharedAudioCtx = new AudioContextClass();
  return sharedAudioCtx;
};

export const playSound = (type: 'pop' | 'ding' | 'success' | 'error' | 'flip') => {
  if (getSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'flip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(FLIP_FREQ_START, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(FLIP_FREQ_END, ctx.currentTime + FLIP_DURATION);
      gainNode.gain.setValueAtTime(FLIP_GAIN, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + FLIP_DURATION);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + FLIP_DURATION);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(POP_FREQ_START, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(POP_FREQ_END, ctx.currentTime + POP_RAMP_DURATION);
      gainNode.gain.setValueAtTime(POP_GAIN, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + POP_DURATION);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + POP_DURATION);
    } else if (type === 'ding' || type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(DING_FREQ_START, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        DING_FREQ_END,
        ctx.currentTime + DING_RAMP_DURATION
      );
      gainNode.gain.setValueAtTime(DING_GAIN, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + DING_DURATION);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + DING_DURATION);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(ERROR_FREQ_START, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(ERROR_FREQ_END, ctx.currentTime + ERROR_DURATION);
      gainNode.gain.setValueAtTime(ERROR_GAIN, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + ERROR_DURATION);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + ERROR_DURATION);
    }
  } catch (e) {
    logger.w('[SOUND] Audio playback failed', e);
  }
};
