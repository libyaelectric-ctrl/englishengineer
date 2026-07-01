import { useMemo } from 'react';
import { useLearningStore } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  getBaseCefrLevel,
  LearningProfileEngine,
  LearningProfileRepository,
} from '@/features/profile';
import type { SkillKey } from './level-system.types';

export const useSkillLevel = (skill: SkillKey) => {
  const learning = useLearningStore();
  const userId = useAuthStore((state) => state.currentUser?.id);

  return useMemo(() => {
    if (skill === 'workTools' || skill === 'quickAI') {
      return {
        skill,
        currentLevel: 'A1' as const,
        completedTasks: 0,
        requiredTasksForNextLevel: 10,
        nextLevel: 'A2' as const,
        confidence: 'demo' as const,
      };
    }
    const stored = LearningProfileRepository.getProfile(userId || 'local-user');
    const snapshot = LearningProfileEngine.buildProfileSnapshot(
      stored,
      learning
    );
    const independent = snapshot.skills[skill];
    return {
      skill,
      currentLevel: getBaseCefrLevel(independent.cefrBand),
      completedTasks: independent.completedTasks,
      requiredTasksForNextLevel: Math.max(
        0,
        Math.ceil((100 - independent.progressToNextBand) / 10)
      ),
      nextLevel: null,
      confidence:
        independent.completedTasks === 0
          ? ('demo' as const)
          : independent.completedTasks < 10
            ? ('estimated' as const)
            : ('calibrated' as const),
    };
  }, [learning, skill, userId]);
};
