import { useEffect } from 'react';

import { showToast } from '@/shared/components/Toast';
import { logger } from '@/shared/logger';

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
        } catch (err) {
          logger.e('[SHORTCUT] Failed to persist shortcut hint flag:', err);
        }
      }, 3000);
      return () => clearTimeout(id);
    } catch (err) {
      logger.e('[SHORTCUT] Failed to read shortcut hint state:', err);
    }
  }, []);
}
