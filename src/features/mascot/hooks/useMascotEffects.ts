import { useEffect, useRef } from 'react';

import { showToast } from '@/shared/components/Toast';

import type { MascotStateCopy } from '@/features/localization/translations/mascot.translations';

import { SLEEP_AFTER_MS, stateToastMap, volumeToNumber } from '../mascot.config';
import { MascotState, useMascotStore } from '../mascot.store';
import { playTone, spawnConfetti } from '../mascot.utils';

export const useMascotEffects = (inline: boolean, copy: MascotStateCopy) => {
  const { state, message, soundEnabled, soundVolume, toastEnabled, lastInteractionAt, setState } =
    useMascotStore();
  const prevStateRef = useRef<MascotState>(state);

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

  useEffect(() => {
    if (!toastEnabled) return;
    const cfg = stateToastMap[state];
    if (!cfg) return;
    const msg =
      message ??
      (state === 'thinking'
        ? copy.thinking
        : state === 'sleeping'
          ? copy.sleeping
          : state === 'empty'
            ? copy.empty
            : null);
    if (msg) showToast(`${cfg.icon} ${msg}`, cfg.type);
  }, [state, message, toastEnabled, copy]);

  useEffect(() => {
    if (inline) return;
    const id = setInterval(() => {
      if (Date.now() - lastInteractionAt > SLEEP_AFTER_MS && state !== 'sleeping')
        setState('sleeping');
    }, 5000);
    return () => clearInterval(id);
  }, [inline, lastInteractionAt, state, setState]);
};
