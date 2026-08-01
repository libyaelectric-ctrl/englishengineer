import { useState, useCallback } from 'react';

export const useThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );

  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
  }, [currentTheme]);

  return { currentTheme, toggleTheme };
};
