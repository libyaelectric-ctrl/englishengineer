import { useEffect, useRef } from 'react';

import { showToast } from '@/shared/components/Toast';

import type { MascotStateCopy } from '@/features/localization/translations/mascot.translations';

import { SLEEP_AFTER_MS, stateToastMap, volumeToNumber } from '../mascot.config';
import { MascotState, useMascotStore } from '../mascot.store';
import { playTone, spawnConfetti } from '../mascot.utils';

export const useMascotEffects = (inline: boolean, copy: MascotStateCopy) => {
  const { state, message, soundEnabled, soundVolume, toastEnabled } =
    useMascotStore();
  const prevStateRef = useRef<MascotState>(state);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // State-change reactions: confetti + sound
  useEffect(() => {
    if (prevStateRef.current === state) return;
    const oldState = prevStateRef.current;
    prevStateRef.current = state;
    if (['celebrate', 'levelUp', 'streak'].includes(state)) {
      const container = document.querySelector('.engmascot-fx');
      if (container) spawnConfetti(container as HTMLDivElement);
    }
    if (soundEnabled && oldState !== state) {
      const vol = volumeToNumber(soundVolume);
      if (['celebrate', 'streak'].includes(state))
        playTone([523.25, 659.25, 783.99], 140, 'sine', vol);
      else if (state === 'levelUp') playTone([392, 523.25, 659.25, 783.99], 110, 'triangle', vol);
      else if (['concerned', 'streakDanger'].includes(state))
        playTone([300, 220], 160, 'sine', vol);
    }
  }, [state, soundEnabled, soundVolume]);

  // Toast notifications (skip for sleeping, idle, empty — too noisy)
  useEffect(() => {
    if (!toastEnabled) return;
    if (state === 'sleeping' || state === 'idle' || state === 'empty') return;
    const cfg = stateToastMap[state];
    if (!cfg) return;
    const msg =
      message ??
      (state === 'thinking'
        ? copy.thinking
        : null);
    if (msg) showToast(`${cfg.icon} ${msg}`, cfg.type);
  }, [state, message, toastEnabled, copy]);

  // Auto-sleep timer: put mascot to sleep after inactivity
  useEffect(() => {
    if (inline) return;
    const check = () => {
      const { state: current, setState: set } = useMascotStore.getState();
      if (Date.now() - useMascotStore.getState().lastInteractionAt > SLEEP_AFTER_MS && current !== 'sleeping') {
        set('sleeping', copy.sleeping);
      }
    };
    sleepTimerRef.current = setInterval(check, 5000);
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [inline, copy.sleeping]);

  // Auto-wake: listen to global pointer/keyboard events to wake mascot
  useEffect(() => {
    if (inline) return;
    const handleActivity = () => {
      const { state: current, lastInteractionAt: last, setState: set } = useMascotStore.getState();
      if (current === 'sleeping' && Date.now() - last > SLEEP_AFTER_MS) {
        set('idle', copy.wake);
      }
      // Keep the store's lastInteractionAt fresh for any page interaction
      useMascotStore.getState().touch();
    };

    const throttled = (() => {
      let lastRun = 0;
      return () => {
        if (Date.now() - lastRun < 2000) return;
        lastRun = Date.now();
        handleActivity();
      };
    })();

    window.addEventListener('pointerdown', throttled, { passive: true });
    window.addEventListener('keydown', throttled, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', throttled);
      window.removeEventListener('keydown', throttled);
    };
  }, [inline, copy.wake]);
};
