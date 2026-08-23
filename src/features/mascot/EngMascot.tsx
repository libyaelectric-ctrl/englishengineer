import { AnimatePresence, motion } from 'motion/react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { showToast } from '@/shared/components/Toast';

import { useLocalizationStore } from '@/features/localization';
import { MASCOT_COPY } from '@/features/localization/translations/mascot.translations';

import './engmascot.css';
import { type MascotState, type SoundVolume, useMascotStore } from './mascot.store';

const MASCOT_IMG = '/mascot/engmascot.webp';
const SLEEP_AFTER_MS = 90_000;

// ---------------------------------------------------------------------------
// Sound effects — Web Audio API (self-contained, no external audio files)
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

const VOLUME_MAP: Record<SoundVolume, number> = { off: 0, low: 0.02, high: 0.06 };

const playTone = (
  freqs: number[],
  durationMs = 140,
  type: OscillatorType = 'sine',
  volume: SoundVolume = 'high'
) => {
  const ctx = getAudioCtx();
  if (!ctx || volume === 'off') return;
  const gain = VOLUME_MAP[volume];
  const now = ctx.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = now + i * (durationMs / 1000) * 0.85;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
    osc.connect(g).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durationMs / 1000 + 0.02);
  });
};

// ---------------------------------------------------------------------------
// Typewriter hook
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

/** Maps mascot state → toast type */
const stateToastMap: Partial<
  Record<MascotState, { type: 'success' | 'error' | 'info'; icon: string }>
> = {
  celebrate: { type: 'success', icon: '🎉' },
  streak: { type: 'success', icon: '🔥' },
  levelUp: { type: 'success', icon: '🏆' },
  concerned: { type: 'error', icon: '😅' },
  streakDanger: { type: 'error', icon: '⚠️' },
  point: { type: 'info', icon: '💡' },
};

export interface EngMascotProps {
  inline?: boolean;
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
    soundVolume,
    toastEnabled,
    contrastMode,
    lastInteractionAt,
    setState,
    say,
    toggleMinimized,
    setPosition,
    setSoundVolume,
    setToastEnabled,
    toggleContrastMode,
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fxRef = useRef<HTMLDivElement>(null);
  const prevStateRef = useRef<MascotState>(state);

  // Confetti on positive states
  useEffect(() => {
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;
    if (state === 'celebrate' || state === 'levelUp' || state === 'streak') {
      spawnConfetti(fxRef.current);
    }
  }, [state]);

  // Toast notifications on state changes
  useEffect(() => {
    if (!toastEnabled) return;
    const toastConfig = stateToastMap[state];
    if (!toastConfig) return;
    const displayMessage =
      message ??
      (state === 'thinking'
        ? copy.thinking
        : state === 'sleeping'
          ? copy.sleeping
          : state === 'empty'
            ? copy.empty
            : null);
    if (displayMessage) {
      showToast(`${toastConfig.icon} ${displayMessage}`, toastConfig.type);
    }
  }, [state, message, toastEnabled, copy]);

  // Sleep after inactivity
  useEffect(() => {
    if (inline) return;
    const id = setInterval(() => {
      if (Date.now() - lastInteractionAt > SLEEP_AFTER_MS && state !== 'sleeping') {
        setState('sleeping');
      }
    }, 5_000);
    return () => clearInterval(id);
  }, [inline, lastInteractionAt, state, setState]);

  // Sound on state change
  useEffect(() => {
    if (!soundEnabled) return;
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;
    const vol = soundVolume;
    if (state === 'celebrate' || state === 'streak')
      playTone([523.25, 659.25, 783.99], 140, 'sine', vol);
    else if (state === 'levelUp') playTone([392, 523.25, 659.25, 783.99], 110, 'triangle', vol);
    else if (state === 'concerned' || state === 'streakDanger')
      playTone([300, 220], 160, 'sine', vol);
  }, [state, soundEnabled, soundVolume]);

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

  const handleTap = useCallback(() => {
    touch();
    if (soundEnabled) playTone([440], 90, 'sine', soundVolume);
    if (state === 'sleeping') {
      say(copy.wake, 'idle');
      return;
    }
    const pool = copy.idle;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    say(pick, 'idle');
  }, [state, copy, say, touch, soundEnabled, soundVolume]);

  // Drag handlers
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
      className={`${inline ? 'relative inline-flex flex-col items-center' : 'select-none'} ${contrastMode ? 'engmascot-high-contrast' : ''}`}
      style={containerStyle}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {copy.ariaGreeting}: {displayMessage ?? ''}
      </div>

      {/* Speech bubble */}
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

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            className="engmascot-settings"
          >
            <div className="space-y-3">
              {/* Sound toggle */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-foreground">🔊 Sound</span>
                <div className="flex gap-1">
                  {(['off', 'low', 'high'] as SoundVolume[]).map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setSoundVolume(vol)}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${
                        soundVolume === vol
                          ? 'bg-primary text-white'
                          : 'bg-surface-hover text-muted-copy hover:bg-surface'
                      }`}
                    >
                      {vol === 'off' ? '🔇' : vol === 'low' ? '🔈' : '🔊'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toast toggle */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-foreground">💬 Toast</span>
                <button
                  type="button"
                  onClick={() => setToastEnabled(!toastEnabled)}
                  className={`relative h-5 w-9 rounded-full transition ${
                    toastEnabled ? 'bg-primary' : 'bg-surface-hover'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      toastEnabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Contrast mode */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-foreground">🔲 Contrast</span>
                <button
                  type="button"
                  onClick={toggleContrastMode}
                  className={`relative h-5 w-9 rounded-full transition ${
                    contrastMode ? 'bg-primary' : 'bg-surface-hover'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      contrastMode ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Settings button */}
        {!inline && !minimized && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSettingsOpen(!settingsOpen);
            }}
            className="engmascot-mini-btn"
            aria-label="Mascot settings"
            title="Settings"
          >
            ⚙️
          </button>
        )}

        {/* Mascot figure */}
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
          <img src={MASCOT_IMG} alt="" draggable={false} loading="lazy" decoding="async" />
          <span className="engmascot-blink" aria-hidden="true" />
          <span className="engmascot-ring" aria-hidden="true" />
          <div className="engmascot-fx" aria-hidden="true" ref={fxRef} />
        </div>

        {/* Minimize / restore */}
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
