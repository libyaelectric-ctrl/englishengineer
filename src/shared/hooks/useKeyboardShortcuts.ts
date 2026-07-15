import { useEffect } from 'react';
import { useAppStore } from '@/store/app.store';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap = {}) {
  const toggleTheme = useAppStore((s) => s.setTheme);
  const currentTheme = useAppStore((s) => s.theme);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = [
        e.ctrlKey || e.metaKey ? 'ctrl' : '',
        e.shiftKey ? 'shift' : '',
        e.altKey ? 'alt' : '',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
        return;
      }

      if (key === 'ctrl+k') {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>('[aria-label*="Search"]')
          ?.focus();
      }

      if (key === 'ctrl+d') {
        e.preventDefault();
        toggleTheme(currentTheme === 'dark' ? 'light' : 'dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, toggleTheme, currentTheme]);
}
