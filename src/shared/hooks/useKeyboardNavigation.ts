import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHORTCUT_MAP: Record<string, string> = {
  '1': '/dashboard',
  '2': '/vocabulary',
  '3': '/curriculum/today',
  '4': '/tools/work',
  '5': '/team',
  '6': '/profile/overview',
};

const isInputFocused = (target: EventTarget | null): boolean => {
  const tag = (target as HTMLElement)?.tagName?.toLowerCase();
  return ['input', 'textarea', 'select'].includes(tag);
};

export const useKeyboardNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (isInputFocused(e.target)) return;

      const path = SHORTCUT_MAP[e.key];
      if (path) {
        e.preventDefault();
        navigate(path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};
