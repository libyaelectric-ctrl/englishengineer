import { X } from 'lucide-react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { storage } from '@/shared/storage';
import { cn } from '@/shared/utils/cn';

const HIDDEN_KEY = 'yibo_mascot_hidden';
const SPRITE_SIZE = 72;
const EDGE_MARGIN = 12;
const WALK_SPEED = 68;
const REST_MIN_MS = 1600;
const REST_MAX_MS = 3400;
const HOP_MS = 650;

type YiboPhase = 'walk' | 'rest' | 'hop';

interface YiboMascotProps {
  /** Disable wandering entirely (static corner sprite). */
  staticMode?: boolean;
}

/**
 * Animated EngVox mascot ("Yibo") that wanders along the bottom edge of the
 * viewport. It walks back and forth, stops to rest, and hops when clicked.
 * Honors prefers-reduced-motion and persists a dismiss toggle.
 */
export const YiboMascot = ({ staticMode = false }: YiboMascotProps) => {
  const [hidden, setHidden] = useState<boolean>(
    () => storage.globalGet<boolean>(HIDDEN_KEY) ?? false
  );
  const [phase, setPhase] = useState<YiboPhase>('walk');
  const [facingLeft, setFacingLeft] = useState(false);
  const [reducedMotion] = useState<boolean>(() =>
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const outerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(EDGE_MARGIN);
  const dirRef = useRef(1);
  const phaseRef = useRef<YiboPhase>('walk');
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const boundsRef = useRef({ min: EDGE_MARGIN, max: 0 });

  const syncBounds = useCallback(() => {
    const max = Math.max(EDGE_MARGIN, window.innerWidth - SPRITE_SIZE - EDGE_MARGIN);
    boundsRef.current = { min: EDGE_MARGIN, max };
    xRef.current = Math.min(Math.max(xRef.current, EDGE_MARGIN), max);
  }, []);

  const applyX = useCallback((x: number) => {
    if (outerRef.current) {
      outerRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }, []);

  const startRest = useCallback(() => {
    phaseRef.current = 'rest';
    setPhase('rest');
    const duration = REST_MIN_MS + Math.round(Math.random() * (REST_MAX_MS - REST_MIN_MS));
    restTimerRef.current = setTimeout(() => {
      dirRef.current *= -1;
      setFacingLeft(dirRef.current < 0);
      phaseRef.current = 'walk';
      setPhase('walk');
    }, duration);
  }, []);

  const step = useCallback(
    (now: number) => {
      if (phaseRef.current !== 'walk') return;
      const dt = Math.min((now - lastTickRef.current) / 1000, 0.05);
      lastTickRef.current = now;
      const { min, max } = boundsRef.current;
      let x = xRef.current + dirRef.current * WALK_SPEED * dt;
      if (x <= min) {
        x = min;
        startRest();
      } else if (x >= max) {
        x = max;
        startRest();
      }
      xRef.current = x;
      applyX(x);
    },
    [applyX, startRest]
  );

  const loop = useCallback(
    (now: number) => {
      step(now);
      rafRef.current = requestAnimationFrame(loop);
    },
    [step]
  );

  useEffect(() => {
    syncBounds();
    applyX(xRef.current);
    if (staticMode || reducedMotion) {
      return;
    }
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    const onResize = (): void => {
      syncBounds();
      applyX(xRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
    };
  }, [applyX, loop, reducedMotion, staticMode, syncBounds]);

  const handleToggleHidden = (): void => {
    const next = !hidden;
    setHidden(next);
    storage.globalSet(HIDDEN_KEY, next);
  };

  const handlePop = (): void => {
    if (phaseRef.current === 'hop') return;
    phaseRef.current = 'hop';
    setPhase('hop');
    if (hopTimerRef.current) clearTimeout(hopTimerRef.current);
    hopTimerRef.current = setTimeout(() => {
      phaseRef.current = 'walk';
      setPhase('walk');
    }, HOP_MS);
  };

  if (hidden) {
    return (
      <button
        type="button"
        onClick={handleToggleHidden}
        aria-label="Show Yibo mascot"
        title="Show Yibo"
        className="fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-surface/90 p-1 shadow-lg backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
      >
        <img
          src="/yibo.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      </button>
    );
  }

  return (
    <div
      ref={outerRef}
      className="pointer-events-none fixed bottom-0 left-0 z-30"
      style={{ height: SPRITE_SIZE, width: SPRITE_SIZE }}
    >
      <div
        className={cn('relative h-full w-full', staticMode && '')}
        style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
      >
        <button
          type="button"
          onClick={handlePop}
          aria-label="Yibo mascot (click to make it hop)"
          className={cn(
            'pointer-events-auto absolute inset-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary',
            phase === 'walk' && 'yibo-walk',
            phase === 'rest' && 'yibo-rest',
            phase === 'hop' && 'yibo-hop'
          )}
        >
          <img
            src="/yibo.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full rounded-full object-cover shadow-lg"
            draggable={false}
            loading="lazy"
            style={{ filter: 'drop-shadow(0 6px 10px rgb(0 0 0 / 0.25))' }}
          />
        </button>
        <button
          type="button"
          onClick={handleToggleHidden}
          aria-label="Hide Yibo mascot"
          title="Hide Yibo"
          className="pointer-events-auto absolute -top-1.5 -right-1.5 flex h-6 w-6 scale-0 items-center justify-center rounded-full border border-border-soft bg-surface/95 text-muted-copy shadow-md transition-transform duration-150 hover:bg-surface-hover hover:text-foreground cursor-pointer yibo-hide-ctrl"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
