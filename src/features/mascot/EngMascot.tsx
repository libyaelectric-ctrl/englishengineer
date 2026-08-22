import { AnimatePresence, motion } from 'motion/react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import { MASCOT_COPY } from '@/features/localization/translations/mascot.translations';

import './engmascot.css';
import { type MascotState, useMascotStore } from './mascot.store';

const MASCOT_IMG = '/mascot/engmascot.webp';
const SLEEP_AFTER_MS = 90_000; // "falls asleep" after 90s of no mascot activity

// ---------------------------------------------------------------------------
// Sound effects — synthesized with the Web Audio API so no audio asset files
// are needed (keeps this feature self-contained and avoids licensing any
// third-party sound clips).
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;
const getAudioCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
};

const playTone = (freqs: number[], durationMs = 140, type: OscillatorType = 'sine') => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = now + i * (durationMs / 1000) * 0.85;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.06, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durationMs / 1000 + 0.02);
  });
};

const SOUNDS = {
  click: () => playTone([440], 90, 'sine'),
  celebrate: () => playTone([523.25, 659.25, 783.99], 140, 'sine'),
  concerned: () => playTone([300, 220], 160, 'sine'),
  levelUp: () => playTone([392, 523.25, 659.25, 783.99], 110, 'triangle'),
};

// ---------------------------------------------------------------------------
// Typewriter hook — reveals speech-bubble text character by character.
// ---------------------------------------------------------------------------
const useTypewriter = (text: string, speedMs = 18) => {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);
  return shown;
};

const spawnConfetti = (el: HTMLDivElement | null) => {
  if (!el) return;
  el.innerHTML = '';
  const emojis = ['✨', '🎉', '⭐', '💫', '🏆'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    p.textContent = emojis[i % emojis.length];
    const left = 10 + Math.random() * 80;
    const dx = (Math.random() - 0.5) * 60;
    const rot = (Math.random() - 0.5) * 360;
    const delay = Math.random() * 0.3;
    const dur = 0.9 + Math.random() * 0.5;
    p.style.cssText = `
      position:absolute;left:${left}%;top:${20 + Math.random() * 20}%;
      font-size:${14 + Math.random() * 10}px;opacity:0;
      animation:engmascot-fx-float ${dur}s ease-out ${delay}s forwards;
      --dx:${dx}px;--rot:${rot}deg;
    `;
    el.appendChild(p);
  }
};

const stateAnimClass: Record<MascotState, string> = {
  idle: 'engmascot-idle',
  celebrate: 'engmascot-celebrate',
  concerned: 'engmascot-concerned',
  thinking: 'engmascot-thinking',
  point: 'engmascot-point',
  streak: 'engmascot-celebrate',
  levelUp: 'engmascot-celebrate',
  streakDanger: 'engmascot-concerned',
  empty: 'engmascot-point',
  farewell: 'engmascot-idle',
  sleeping: 'engmascot-sleeping',
};

export interface EngMascotProps {
  /** Render inline within a page instead of as a floating corner widget. */
  inline?: boolean;
  /** Fixed size in pixels for the character image (widget default: 64). */
  size?: number;
}

export const EngMascot: React.FC<EngMascotProps> = ({ inline = false, size = 64 }) => {
  const language = useLocalizationStore((s) => s.language);
  const copy = MASCOT_COPY[language] ?? MASCOT_COPY.en;

  const {
    state,
    message,
    visible,
    minimized,
    position,
    soundEnabled,
    lastInteractionAt,
    setState,
    say,
    toggleMinimized,
    setPosition,
    setSoundEnabled,
    touch,
  } = useMascotStore();

  const dockRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{
    startX: number;
    startY: number;
    origRight: number;
    origBottom: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const fxRef = useRef<HTMLDivElement>(null);
  const prevStateRef = useRef<MascotState>(state);

  useEffect(() => {
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;
    if (state === 'celebrate' || state === 'levelUp' || state === 'streak') {
      spawnConfetti(fxRef.current);
    }
  }, [state]);

  // ---- Sleep after inactivity (only for the persistent corner widget) ----
  useEffect(() => {
    if (inline) return;
    const id = setInterval(() => {
      if (Date.now() - lastInteractionAt > SLEEP_AFTER_MS && state !== 'sleeping') {
        setState('sleeping');
      }
    }, 5_000);
    return () => clearInterval(id);
  }, [inline, lastInteractionAt, state, setState]);

  // ---- Play a sound whenever the mascot enters a new emotional state ----
  useEffect(() => {
    if (!soundEnabled) return;
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;
    if (state === 'celebrate' || state === 'streak') SOUNDS.celebrate();
    else if (state === 'levelUp') SOUNDS.levelUp();
    else if (state === 'concerned' || state === 'streakDanger') SOUNDS.concerned();
  }, [state, soundEnabled]);

  const displayMessage =
    message ??
    (state === 'thinking'
      ? copy.thinking
      : state === 'sleeping'
        ? copy.sleeping
        : state === 'empty'
          ? copy.empty
          : null);

  const typed = useTypewriter(displayMessage ?? '', 16);

  // ---- Tap-for-random-tip interaction ----
  const handleTap = useCallback(() => {
    touch();
    if (soundEnabled) SOUNDS.click();
    if (state === 'sleeping') {
      say(copy.wake, 'idle');
      return;
    }
    const pool = copy.idle;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    say(pick, 'idle');
  }, [state, copy, say, touch, soundEnabled]);

  // ---- Drag to reposition (corner widget only) ----
  const onPointerDown = (e: React.PointerEvent) => {
    if (inline) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      origRight: position.right,
      origBottom: position.bottom,
    };
    setDragging(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setDragging(true);
    const nextRight = Math.min(
      Math.max(dragInfo.current.origRight - dx, 8),
      window.innerWidth - 60
    );
    const nextBottom = Math.min(
      Math.max(dragInfo.current.origBottom - dy, 8),
      window.innerHeight - 60
    );
    setPosition({ right: nextRight, bottom: nextBottom });
  };
  const onPointerUp = () => {
    const wasDragging = dragging;
    dragInfo.current = null;
    setDragging(false);
    if (!wasDragging) handleTap();
  };

  if (!visible) return null;

  const imgSize = inline ? size : minimized ? 40 : 64;

  const containerStyle: React.CSSProperties = inline
    ? {}
    : {
        position: 'fixed',
        right: position.right,
        bottom: position.bottom,
        zIndex: 60,
      };

  return (
    <div
      ref={dockRef}
      className={inline ? 'relative inline-flex flex-col items-center' : 'select-none'}
      style={containerStyle}
    >
      {/* aria-live region: announces mascot messages to screen readers without
          requiring the sighted-only speech bubble to be present in the DOM */}
      <div className="sr-only" role="status" aria-live="polite">
        {copy.ariaGreeting}: {displayMessage ?? ''}
      </div>

      <AnimatePresence>
        {displayMessage && !minimized && (
          <motion.div
            key={displayMessage}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.2, 0.9, 0.25, 1] }}
            className="engmascot-bubble"
          >
            {typed}
            <span className="engmascot-bubble-tail" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {!inline && !minimized && (
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="engmascot-mini-btn"
            aria-label={soundEnabled ? 'Mute mascot sounds' : 'Unmute mascot sounds'}
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        )}

        <div
          className={`engmascot-figure ${stateAnimClass[state]}`}
          style={{ width: imgSize, cursor: inline ? 'default' : dragging ? 'grabbing' : 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragInfo.current = null;
            setDragging(false);
          }}
          role={inline ? undefined : 'button'}
          tabIndex={inline ? undefined : 0}
          aria-label={inline ? undefined : copy.ariaGreeting}
          onKeyDown={(e) => {
            if (!inline && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleTap();
            }
          }}
        >
          <img src={MASCOT_IMG} alt="" draggable={false} />
          <span className="engmascot-blink" aria-hidden="true" />
          <span className="engmascot-ring" aria-hidden="true" />
          <div className="engmascot-fx" aria-hidden="true" ref={fxRef} />
        </div>

        {!inline && !minimized && (
          <button
            type="button"
            onClick={toggleMinimized}
            className="engmascot-mini-btn"
            aria-label="Minimize mascot"
            title="Minimize"
          >
            —
          </button>
        )}
        {!inline && minimized && (
          <button
            type="button"
            onClick={toggleMinimized}
            className="engmascot-mini-btn engmascot-restore"
            aria-label="Show mascot"
            title="Show"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default EngMascot;
