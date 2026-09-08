import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (newTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const getClockTheme = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('engvox-theme') as Theme | null;
    return stored ?? getClockTheme();
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('engvox-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('engvox-theme')) return;
    const interval = window.setInterval(() => setTheme(getClockTheme()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const setThemeValue = (newTheme: Theme) => setTheme(newTheme);

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeValue }}>{children}</ThemeContext.Provider>;
};
