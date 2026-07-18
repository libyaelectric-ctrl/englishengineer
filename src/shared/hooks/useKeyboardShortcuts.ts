import { useEffect } from 'react';
import { useAppStore } from '@/store/app.store';

interface ShortcutMap {
  [key: string]: () => void;
}

const isTextInput = (target: EventTarget | null) =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

const buildShortcutKey = (e: KeyboardEvent) =>
  [
    e.ctrlKey || e.metaKey ? 'ctrl' : '',
    e.shiftKey ? 'shift' : '',
    e.altKey ? 'alt' : '',
    e.key.toLowerCase(),
  ]
    .filter(Boolean)
    .join('+');

const handleBuiltInShortcut = (
  key: string,
  e: KeyboardEvent,
  toggleTheme: (theme: 'dark' | 'light') => void,
  currentTheme: 'dark' | 'light'
) => {
  if (key === 'ctrl+k') {
    e.preventDefault();
    document.querySelector<HTMLInputElement>('[aria-label*="Search"]')?.focus();
    return;
  }

  if (key === 'ctrl+d') {
    e.preventDefault();
    toggleTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }
};

export function useKeyboardShortcuts(shortcuts: ShortcutMap = {}) {
  const toggleTheme = useAppStore((s) => s.setTheme) as (
    theme: 'dark' | 'light'
  ) => void;
  const currentTheme = useAppStore((s) => s.theme);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return;

      const key = buildShortcutKey(e);

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
        return;
      }

      handleBuiltInShortcut(key, e, toggleTheme, currentTheme);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, toggleTheme, currentTheme]);
}
