import { useTheme } from '@/features/theme/ThemeProvider';

export const useThemeToggle = () => {
  const { mode, theme, isAuto, toggleTheme, resetToAuto, setMode } = useTheme();

  return { mode, isAuto, currentTheme: theme, toggleTheme, resetToAuto, setMode };
};
