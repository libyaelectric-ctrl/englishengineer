import { useEffect } from 'react';

export function useKeyboardNav(onSelect?: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement?.getAttribute('role') === 'button') {
        (document.activeElement as HTMLElement)?.click();
      }
      if (onSelect) onSelect(e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSelect]);
}
