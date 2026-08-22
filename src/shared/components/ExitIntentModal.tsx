import { Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

const STORAGE_KEY = 'engvox:exit-intent-shown';

/**
 * Exit intent modal — detects when cursor moves above viewport (desktop)
 * or when page becomes hidden (mobile tab switch). Shows a discount offer
 * to reduce pricing page bounce rate.
 *
 * Shows at most once per browser session.
 */
export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const hasShown = useRef(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger on upward mouse movement (leaving viewport)
    if (e.clientY <= 0 && !hasShown.current) {
      setIsOpen(true);
      hasShown.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // localStorage may be unavailable
      }
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    // Mobile: page becomes hidden when switching tabs
    if (document.hidden && !hasShown.current) {
      setIsOpen(true);
      hasShown.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // localStorage may be unavailable
      }
    }
  }, []);

  useEffect(() => {
    // Don't show if already shown in this session
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage may be unavailable
    }

    // Only on pricing page
    if (!window.location.pathname.includes('/pricing')) return;

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleMouseLeave, handleVisibilityChange]);

  const close = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-primary/30 bg-surface shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-copy hover:bg-surface-hover hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>

              <h2 className="text-xl font-bold text-foreground">Wait! Here&apos;s 20% off 🎁</h2>
              <p className="mt-2 text-sm text-muted-copy leading-relaxed">
                Upgrade to any paid plan within the next 24 hours and get{' '}
                <strong className="text-foreground">20% off your first month</strong>. Use code at
                checkout.
              </p>

              <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
                  Your discount code
                </p>
                <p className="mt-1 text-lg font-black text-primary font-mono tracking-wider">
                  WELCOME20
                </p>
              </div>

              <Link
                to="/pricing"
                onClick={close}
                className="mt-5 inline-flex w-full items-center justify-center rounded-[var(--radius-card)] bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90 transition-colors"
              >
                Claim My 20% Off →
              </Link>

              <button
                onClick={close}
                className="mt-3 w-full text-xs text-muted-copy hover:text-foreground transition-colors"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
