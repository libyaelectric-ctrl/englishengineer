import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = dark ? 'dark' : 'light';
    // data-theme attribute ile dark mode
    root.setAttribute('data-theme', theme);
    // Fallback: class-based dark mode da desteklenir
    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover transition-colors"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
