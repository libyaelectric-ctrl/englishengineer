import { configureLearningPorts, type LearningSkillName } from '@/core/learning/learning.ports';

import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { logger } from '@/shared/logger';
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '@/shared/services/auth-backend/supabase.client';

configureLearningPorts({
  currentUser: {
    getUserId: () => useAuthStore.getState().currentUser?.id ?? null,
  },
  contentPool: {
    persistEntry: (contentType, contentId) => {
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
          if (error) logger.w(`[${contentType}Pool] Supabase write failed: ${String(error)}`);
        });
    },
  },
  profile: {
    getSkillProfile: (userId: string, skill: LearningSkillName) => {
      const profile = LearningProfileRepository.getProfile(userId);
      const currentSkill = profile.skills[skill];
      return {
        elo: currentSkill.elo,
        completedTasks: currentSkill.completedTasks,
      };
    },
    updateSkill: (userId, skill, update) => {
      LearningProfileRepository.updateSkill(userId, skill, update);
    },
  },
});
