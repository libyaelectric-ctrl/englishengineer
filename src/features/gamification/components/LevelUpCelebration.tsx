import { Trophy } from 'lucide-react';

import { useCallback, useEffect, useRef, useState } from 'react';

interface LevelUpCelebrationProps {
  level: number | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * Lightweight CSS-only celebration overlay shown when the user reaches a
 * new gamification level. Auto-dismisses after `autoDismissMs`, or on click.
 * Renders nothing when `level` is null.
 */
export function LevelUpCelebration({
  level,
  onDismiss,
  autoDismissMs = 3200,
}: LevelUpCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (level === null) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      fadeTimerRef.current = setTimeout(onDismiss, 250);
    }, autoDismissMs);
    return () => {
      clearTimeout(timer);
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    };
  }, [level, autoDismissMs, onDismiss]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(onDismiss, 200);
  }, [onDismiss]);

  if (level === null) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-live="polite"
      onClick={handleDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDismiss();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 cursor-pointer ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`flex flex-col items-center gap-3 rounded-2xl bg-surface px-10 py-8 shadow-2xl border border-primary/30 transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-2'
        }`}
      >
        <div className="rounded-full bg-primary/10 p-4 animate-bounce">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <p className="text-sm font-bold uppercase tracking-wider text-muted-copy">Level Up</p>
        <p className="text-3xl font-bold text-foreground">Level {level}</p>
        <p className="text-xs text-muted-copy">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
