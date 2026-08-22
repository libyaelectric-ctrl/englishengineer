import { useEffect } from 'react';

import { showToast } from '@/shared/components/Toast';

const STORAGE_KEY = 'engvox:shortcut-hint-seen';

/**
 * Shows a one-time "Pro tip: Ctrl+K" toast on the user's first dashboard visit.
 * The hint is stored in localStorage so it only fires once per browser.
 */
export function useShortcutHint() {
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      // Delay 3s so the user settles in first
      const id = setTimeout(() => {
        showToast('💡 Pro tip: Press Ctrl+K to quickly navigate anywhere', 'info');
        try {
          localStorage.setItem(STORAGE_KEY, '1');
        } catch {
          // localStorage may be full or unavailable
        }
      }, 3000);
      return () => clearTimeout(id);
    } catch {
      // localStorage may be unavailable
    }
  }, []);
}
