import { logger } from '@/shared/logger';
import type { SessionPhase } from '@/shared/storage';

type SessionListener = (phase: SessionPhase) => void;

const listeners = new Set<SessionListener>();

export const SessionEvents = {
  subscribe(listener: SessionListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  emit(phase: SessionPhase): void {
    listeners.forEach((listener) => {
      try {
        listener(phase);
      } catch (err) {
        logger.e('[SessionEvents] Listener error:', err);
      }
    });
  },
};
