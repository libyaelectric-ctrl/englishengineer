import { useTheme } from '@/features/theme/ThemeProvider';

export const useThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return { currentTheme: theme, toggleTheme };
};
