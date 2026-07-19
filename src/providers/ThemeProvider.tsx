import React, { useEffect } from 'react';
import { useAppStore } from '@/store/app.store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    // Remove both first
    root.classList.remove('dark', 'light');
    root.removeAttribute('data-theme');
    // Apply current theme
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync on mount (for SSR / initial paint)
  useEffect(() => {
    const root = document.documentElement;
    const current = useAppStore.getState().theme;
    root.classList.remove('dark', 'light');
    root.removeAttribute('data-theme');
    root.classList.add(current);
    root.setAttribute('data-theme', current);
  }, []);

  return <>{children}</>;
};
