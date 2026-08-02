import { useAppStore } from '@/store/app.store';

export const useThemeToggle = () => {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { currentTheme: theme, toggleTheme };
};
