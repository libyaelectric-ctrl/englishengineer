import { useEffect, useRef, useState } from 'react';

import { logger } from '@/shared/logger';
import { storage } from '@/shared/storage';

const STORAGE_KEY = 'gamification.lastSeenLevel.v1';

/**
 * Detects when currentLevel increases compared to the last level the user
 * has seen (persisted locally). Returns the new level while the celebration
 * should be shown, or null otherwise. Call `acknowledge()` once the
 * celebration UI has been dismissed to persist the new "seen" level.
 */
export function useLevelUpDetector(currentLevel: number): {
  justLeveledUp: number | null;
  acknowledge: () => void;
} {
  const [justLeveledUp, setJustLeveledUp] = useState<number | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    let lastSeen: number | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      lastSeen = raw ? Number(raw) : null;
    } catch (e) {
      logger.w('[GAMIFICATION] Failed to read last seen level', e);
      lastSeen = null;
    }

    if (lastSeen === null) {
      // First time we've ever tracked this — don't celebrate retroactively,
      // just record the current level as the baseline.
      try {
        window.localStorage.setItem(STORAGE_KEY, String(currentLevel));
      } catch (e) {
        logger.w('[GAMIFICATION] Failed to write last seen level', e);
      }
      return;
    }

    if (currentLevel > lastSeen) {
      setJustLeveledUp(currentLevel);
    }
  }, [currentLevel]);

  const acknowledge = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(currentLevel));
    } catch (e) {
      logger.w('[GAMIFICATION] Failed to persist acknowledged level', e);
    }
    setJustLeveledUp(null);
  };

  return { justLeveledUp, acknowledge };
}

// Re-export storage.isAvailable for callers that want to guard rendering
// entirely when local storage cannot persist the "last seen" level.
export const isLevelTrackingAvailable = (): boolean => storage.isAvailable();
