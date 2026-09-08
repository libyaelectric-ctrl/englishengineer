import { useRef, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import { MASCOT_COPY } from '@/features/localization/translations/mascot.translations';

import { volumeToNumber } from '../mascot.config';
import { useMascotStore } from '../mascot.store';
import { playTone, spawnConfetti } from '../mascot.utils';

interface UseMascotHandlersReturn {
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  handleTap: () => void;
  setDragging: (dragging: boolean) => void;
  dragInfo: React.MutableRefObject<{
    startX: number;
    startY: number;
    startRight: number;
    startBottom: number;
  } | null>;
}

export const useMascotHandlers = (inline: boolean): UseMascotHandlersReturn => {
  const { minimized, position, setPosition, setState, soundEnabled, touch } = useMascotStore();

  const dragInfo = useRef<{
    startX: number;
    startY: number;
    startRight: number;
    startBottom: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (inline || minimized) return;
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
    };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    touch();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current || inline || minimized) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    setPosition({
      right: Math.max(12, dragInfo.current.startRight - dx),
      bottom: Math.max(12, dragInfo.current.startBottom + dy),
    });
  };

  const onPointerUp = () => {
    if (dragInfo.current) {
      dragInfo.current = null;
      setDragging(false);
    }
  };

  const onPointerCancel = () => {
    dragInfo.current = null;
    setDragging(false);
  };

  const handleTap = () => {
    if (minimized) return;
    touch();

    const currentState = useMascotStore.getState().state;

    if (currentState === 'sleeping') {
      // Wake up from sleep
      const language = useLocalizationStore.getState().language;
      const copy = MASCOT_COPY[language] ?? MASCOT_COPY.en;
      setState('idle', copy.wake);
      if (soundEnabled) {
        const vol = volumeToNumber(useMascotStore.getState().soundVolume);
        playTone([523.25, 659.25], 120, 'sine', vol);
      }
      return;
    }

    // Normal tap: cycle through idle messages
    const language = useLocalizationStore.getState().language;
    const copy = MASCOT_COPY[language] ?? MASCOT_COPY.en;
    const idleMsg = copy.idle[Math.floor(Math.random() * copy.idle.length)];
    setState('idle', idleMsg);
    if (soundEnabled) {
      const vol = volumeToNumber(useMascotStore.getState().soundVolume);
      playTone([523.25, 659.25, 783.99], 140, 'sine', vol);
    }
    // Confetti inside the mascot figure, falling back to body
    const fxContainer = document.querySelector('.engmascot-fx');
    spawnConfetti(fxContainer as HTMLDivElement ?? document.body);
  };

  return {
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    handleTap,
    setDragging,
    dragInfo,
  };
};
