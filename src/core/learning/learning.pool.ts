import { eventBus } from '@/core/events/event-bus';

import { logger } from '@/shared/logger';

import { getLearningPorts } from './learning.ports';
import { useLearningStore } from './learning.store';

const persistPoolEntry = (
  contentType: 'vocabulary' | 'grammar' | 'speaking',
  contentId: string
): void => {
  getLearningPorts().contentPool.persistEntry(contentType, contentId);
};

export const addToVocabularyPool = (termId: string) => {
  const current = useLearningStore.getState().vocabularyPool ?? [];
  if (current.includes(termId)) return;
  const updated = [...current, termId];
  useLearningStore.setState({ vocabularyPool: updated });
  logger.i(`[VocabPool] +1 term → pool size: ${updated.length}`);
  persistPoolEntry('vocabulary', termId);
};

export const addToGrammarPool = (ruleId: string) => {
  const current = useLearningStore.getState().grammarPool ?? [];
  if (current.includes(ruleId)) return;
  const updated = [...current, ruleId];
  useLearningStore.setState({ grammarPool: updated });
  logger.i(`[GrammarPool] +1 rule → pool size: ${updated.length}`);
  persistPoolEntry('grammar', ruleId);
};

export const addToSpeakingPool = (missionId: string) => {
  const current = useLearningStore.getState().speakingPool ?? [];
  if (current.includes(missionId)) return;
  const updated = [...current, missionId];
  useLearningStore.setState({ speakingPool: updated });
  logger.i(`[SpeakingPool] +1 mission → pool size: ${updated.length}`);
  persistPoolEntry('speaking', missionId);
};

let poolSubscriptionsInitialized = false;

export const initPoolSubscriptions = () => {
  if (poolSubscriptionsInitialized) return;
  poolSubscriptionsInitialized = true;

  eventBus.subscribe('vocabulary:mastered', (event) => {
    const { termId } = event.payload as { termId: string };
    addToVocabularyPool(termId);
  });

  eventBus.subscribe('grammar:mastered', (event) => {
    const { ruleId } = event.payload as { ruleId: string };
    addToGrammarPool(ruleId);
  });

  eventBus.subscribe('speaking:completed', (event) => {
    const { missionId } = event.payload as { missionId: string };
    addToSpeakingPool(missionId);
  });
};
