import React, { useEffect } from 'react';
import { useAppStore } from '@/store/app.store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useAppStore((state) => state.theme);
  const autoTheme = useAppStore((state) => state.autoTheme);
  const applyAutoTheme = useAppStore((state) => state.applyAutoTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auto-switch every 60 seconds when autoTheme is enabled
  useEffect(() => {
    if (!autoTheme) return;
    const interval = window.setInterval(() => {
      applyAutoTheme();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [autoTheme, applyAutoTheme]);

  return <>{children}</>;
};
