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
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

const canMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/** The user's actual OS/browser preference. `auto` follows this; light/dark override it. */
const getSystemTheme = (): Theme =>
  canMatchMedia() && window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light';

const resolveTheme = (mode: ThemeMode, systemTheme: Theme): Theme =>
  mode === 'auto' ? systemTheme : mode;

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
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  // Follow live system-preference changes (e.g. the OS switching at sunset)
  // instead of polling the clock. Only `auto` mode consumes this value.
  useEffect(() => {
    if (!canMatchMedia()) return;
    const query = window.matchMedia(PREFERS_DARK_QUERY);
    const sync = () => setSystemTheme(query.matches ? 'dark' : 'light');
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const theme = resolveTheme(mode, systemTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-mode', mode);
    root.style.colorScheme = theme;
    root.classList.toggle('dark', theme === 'dark');
  }, [mode, theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    if (mode === 'auto') localStorage.removeItem(LEGACY_STORAGE_KEY);
    else localStorage.setItem(LEGACY_STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      theme,
      isAuto: mode === 'auto',
      toggleTheme: () => setModeState(theme === 'light' ? 'dark' : 'light'),
      setTheme: (newTheme) => setModeState(newTheme),
      setMode: (newMode) => setModeState(newMode),
      resetToAuto: () => setModeState('auto'),
    }),
    [mode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export type { Theme, ThemeMode };
