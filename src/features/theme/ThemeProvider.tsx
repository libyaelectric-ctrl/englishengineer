import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeMode = 'auto' | Theme;

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  isAuto: boolean;
  toggleTheme: () => void;
  setTheme: (newTheme: Theme) => void;
  setMode: (newMode: ThemeMode) => void;
  resetToAuto: () => void;
}

const STORAGE_KEY = 'engvox-theme-mode';
const LEGACY_STORAGE_KEY = 'engvox-theme';

const getClockTheme = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
};

const resolveMode = (mode: ThemeMode): Theme => (mode === 'auto' ? getClockTheme() : mode);

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'auto' || value === 'light' || value === 'dark';

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'auto';
  const storedMode = localStorage.getItem(STORAGE_KEY);
  if (isThemeMode(storedMode)) return storedMode;
  const legacyTheme = localStorage.getItem(LEGACY_STORAGE_KEY);
  return isThemeMode(legacyTheme) && legacyTheme !== 'auto' ? legacyTheme : 'auto';
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'auto',
  theme: 'light',
  isAuto: true,
  toggleTheme: () => {},
  setTheme: () => {},
  setMode: () => {},
  resetToAuto: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [theme, setResolvedTheme] = useState<Theme>(() => resolveMode(getInitialMode()));

  useEffect(() => {
    const resolved = resolveMode(mode);
    setResolvedTheme(resolved);
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-mode', mode);
    root.style.colorScheme = resolved;
    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem(STORAGE_KEY, mode);
    if (mode === 'auto') localStorage.removeItem(LEGACY_STORAGE_KEY);
    else localStorage.setItem(LEGACY_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'auto') return;
    const interval = window.setInterval(() => setResolvedTheme(resolveMode('auto')), 60 * 1000);
    return () => window.clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'auto') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    root.classList.toggle('dark', theme === 'dark');
  }, [mode, theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    theme,
    isAuto: mode === 'auto',
    toggleTheme: () => setModeState((current) => (resolveMode(current) === 'light' ? 'dark' : 'light')),
    setTheme: (newTheme) => setModeState(newTheme),
    setMode: (newMode) => setModeState(newMode),
    resetToAuto: () => setModeState('auto'),
  }), [mode, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export type { Theme, ThemeMode };
