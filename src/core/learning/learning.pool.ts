import { storage } from '@/shared/storage';
import { logger } from '@/shared/logger';
import { eventBus } from '@/core/events/event-bus';
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '@/features/auth/supabase.client';
import { useAuthStore } from '@/features/auth';
import { useLearningStore } from './learning.store';

const STORAGE_KEY = 'learning_state';

const syncPoolToSupabase = (
  contentType: 'vocabulary' | 'grammar' | 'speaking',
  contentId: string
) => {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  const userId = useAuthStore.getState().currentUser?.id;
  if (!client || !userId) return;

  client
    .from('knowledge_pool_entries')
    .upsert(
      { user_id: userId, content_type: contentType, content_id: contentId },
      { onConflict: 'user_id,content_type,content_id' }
    )
    .then(({ error }: { error: unknown }) => {
      if (error)
        logger.w(
          `[${contentType}Pool] Supabase write failed: ${String(error)}`
        );
    });
};

export const addToVocabularyPool = (termId: string) => {
  const current = useLearningStore.getState().vocabularyPool ?? [];
  if (current.includes(termId)) return;
  const updated = [...current, termId];
  useLearningStore.setState({ vocabularyPool: updated });
  storage.set(STORAGE_KEY, {
    ...useLearningStore.getState(),
    vocabularyPool: updated,
  });
  logger.i(`[VocabPool] +1 term → pool size: ${updated.length}`);
  syncPoolToSupabase('vocabulary', termId);
};

export const addToGrammarPool = (ruleId: string) => {
  const current = useLearningStore.getState().grammarPool ?? [];
  if (current.includes(ruleId)) return;
  const updated = [...current, ruleId];
  useLearningStore.setState({ grammarPool: updated });
  storage.set(STORAGE_KEY, {
    ...useLearningStore.getState(),
    grammarPool: updated,
  });
  logger.i(`[GrammarPool] +1 rule → pool size: ${updated.length}`);
  syncPoolToSupabase('grammar', ruleId);
};

export const addToSpeakingPool = (missionId: string) => {
  const current = useLearningStore.getState().speakingPool ?? [];
  if (current.includes(missionId)) return;
  const updated = [...current, missionId];
  useLearningStore.setState({ speakingPool: updated });
  storage.set(STORAGE_KEY, {
    ...useLearningStore.getState(),
    speakingPool: updated,
  });
  logger.i(`[SpeakingPool] +1 mission → pool size: ${updated.length}`);
  syncPoolToSupabase('speaking', missionId);
};

// Event bus → Pool bağlantısı
eventBus.subscribe('vocabulary:mastered', (event) => {
  const termId = (event.payload as { termId: string }).termId;
  addToVocabularyPool(termId);
});

eventBus.subscribe('grammar:mastered', (event) => {
  const ruleId = (event.payload as { ruleId: string }).ruleId;
  addToGrammarPool(ruleId);
});

eventBus.subscribe('speaking:completed', (event) => {
  const missionId = (event.payload as { missionId: string }).missionId;
  addToSpeakingPool(missionId);
});
