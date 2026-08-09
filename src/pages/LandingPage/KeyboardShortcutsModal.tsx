import { Keyboard, X } from 'lucide-react';

import { useEffect } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ key: TranslationKey; desc: TranslationKey }> = [
  { key: 'landing.shortcut1Key', desc: 'landing.shortcut1Desc' },
  { key: 'landing.shortcut2Key', desc: 'landing.shortcut2Desc' },
  { key: 'landing.shortcut3Key', desc: 'landing.shortcut3Desc' },
  { key: 'landing.shortcut4Key', desc: 'landing.shortcut4Desc' },
  { key: 'landing.shortcut5Key', desc: 'landing.shortcut5Desc' },
];

export const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-primary/30 bg-surface/95 p-5 shadow-2xl space-y-4 relative light-sweep-container overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              {translate('landing.shortcutsTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-copy hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between rounded-[var(--radius-card)] border border-border-soft bg-background/80 p-2.5 text-xs font-medium"
            >
              <span className="text-foreground">{translate(s.desc)}</span>
              <kbd className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] font-bold text-primary shadow-xs">
                {translate(s.key)}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {translate('landing.shortcutsClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
