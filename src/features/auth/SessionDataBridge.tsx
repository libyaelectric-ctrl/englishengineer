import { queryClient } from '@/providers/QueryProvider';

import { useEffect } from 'react';

import { useLearningStore } from '@/core/learning';

import { SessionEvents } from '@/shared/events/session.events';
import { LearningIntelligenceService } from '@/shared/services/learning-intelligence.service';
import { SESSION_NAMESPACE_EVENT, storage } from '@/shared/storage';
import { useLearningIntelligenceStore } from '@/shared/stores/learning-intelligence.store';

import { useAIStore } from '@/features/ai';

const resetSensitiveMemory = (): void => {
  useLearningStore.getState().resetAll();
  useAIStore.getState().resetCoach();
  useLearningIntelligenceStore.setState(LearningIntelligenceService.load());
  queryClient.clear();
};
const hydrateActiveNamespace = (): void => {
  if (!storage.getSession()) return;
  void useLearningStore.persist.rehydrate();
  void useAIStore.persist.rehydrate();
  useLearningIntelligenceStore.setState(LearningIntelligenceService.load());
};
export const SessionDataBridge = () => {
  useEffect(() => {
    const onNamespace = (event: Event): void => {
      const detail = (event as CustomEvent<{ phase: 'cleared' | 'activated' }>).detail;
      if (detail.phase === 'cleared') {
        SessionEvents.emit('cleared');
        resetSensitiveMemory();
      } else {
        SessionEvents.emit('activated');
        hydrateActiveNamespace();
      }
    };
    window.addEventListener(SESSION_NAMESPACE_EVENT, onNamespace);
    queryClient.clear();
    hydrateActiveNamespace();
    return () => window.removeEventListener(SESSION_NAMESPACE_EVENT, onNamespace);
  }, []);
  return null;
};
