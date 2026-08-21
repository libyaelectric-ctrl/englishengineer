import { Keyboard, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { useEffect, useRef } from 'react';

import { useKeyboardShortcutsPanel } from '@/shared/hooks/useKeyboardShortcutsPanel';

// ---------------------------------------------------------------------------
// Categorized shortcuts
// ---------------------------------------------------------------------------

interface ShortcutGroup {
  label: string;
  shortcuts: Array<{ keys: string[]; description: string }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['1'], description: 'Go to Dashboard' },
      { keys: ['2'], description: 'Go to Vocabulary' },
      { keys: ['3'], description: 'Go to Grammar' },
      { keys: ['4'], description: 'Go to Reading' },
      { keys: ['5'], description: 'Go to Writing' },
      { keys: ['6'], description: 'Go to Listening' },
      { keys: ['7'], description: 'Go to Speaking' },
      { keys: ['8'], description: 'Go to Learning Path' },
      { keys: ['9'], description: 'Go to Profile' },
    ],
  },
  {
    label: 'General',
    shortcuts: [
      { keys: ['Esc'], description: 'Close panel or modal' },
      { keys: ['⌘', '/'], description: 'Toggle this shortcuts panel' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Kbd helper
// ---------------------------------------------------------------------------

const Kbd = ({ children }: { children: string }) => (
  <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border-soft bg-surface-hover px-1.5 font-mono text-[11px] font-bold text-foreground">
    {children}
  </kbd>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const KeyboardShortcutsPanel = () => {
  const { isOpen, close } = useKeyboardShortcutsPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.12 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: prefersReduced ? 0 : 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface shadow-2xl outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Keyboard className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={close}
                className="cursor-pointer rounded-[var(--radius-card)] p-1.5 text-muted-copy transition-colors hover:bg-surface-hover hover:text-foreground"
                aria-label="Close shortcuts panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-5 custom-scrollbar">
              <div className="space-y-6">
                {SHORTCUT_GROUPS.map((group) => (
                  <div key={group.label}>
                    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy/60">
                      {group.label}
                    </h3>
                    <div className="space-y-1.5">
                      {group.shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.description}
                          className="flex items-center justify-between rounded-[var(--radius-card)] px-3 py-2 transition-colors hover:bg-surface-hover/50"
                        >
                          <span className="text-sm text-foreground">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-[10px] text-muted-copy/40">+</span>}
                                <Kbd>{key}</Kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-soft px-5 py-3 text-[10px] text-muted-copy/60">
              <span>
                Press <Kbd>Esc</Kbd> to close
              </span>
              <span>
                <Kbd>⌘</Kbd>/<Kbd>/</Kbd> to toggle
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsPanel;
