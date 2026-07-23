/**
 * Cross-feature event handlers.
 * Connects vocabulary mastery events to learning orchestrator.
 */

import { eventBus } from './event-bus';
import { logger } from '@/shared/logger';

let initialized = false;

export const initCrossFeatureHandlers = (): void => {
  if (initialized) return;
  initialized = true;

  // When vocabulary is mastered, notify learning orchestrator
  eventBus.subscribe('vocabulary:mastered', (event) => {
    logger.i(
      `[CrossFeature] Vocabulary mastered: ${event.payload.termId} — triggering learning path update`
    );
    eventBus.publish({
      id: `sys_${Date.now()}`,
      type: 'learning.completed',
      timestamp: new Date().toISOString(),
      payload: {
        module: 'vocabulary',
        topicId: event.payload.termId,
        score: 100,
        durationSeconds: 0,
      },
    });
  });

  // When speaking is completed, update gamification
  eventBus.subscribe('speaking:completed', (event) => {
    logger.i(
      `[CrossFeature] Speaking completed: ${event.payload.missionId} (score: ${event.payload.score})`
    );
    if (event.payload.score >= 80) {
      eventBus.publish({
        id: `sys_${Date.now()}`,
        type: 'xp.earned',
        timestamp: new Date().toISOString(),
        payload: {
          amount: event.payload.score,
          reason: `Speaking mission completed with score ${event.payload.score}`,
        },
      });
    }
  });
};
