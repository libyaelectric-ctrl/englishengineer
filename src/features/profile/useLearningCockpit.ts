import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';

import { useMemo } from 'react';

import { useLearningStore } from '@/core/learning';

import { LearningProfileEngine } from './profile.engine';
import { LearningProfileRepository } from './profile.repository';
import type { UserLearningProfile } from './profile.types';

export const useLearningCockpit = (userId?: string | null) => {
  const learningState = useLearningStore(
    useShallow((s) => ({
      xp: s.xp,
      level: s.level,
      elo: s.elo,
      streak: s.streak,
      coins: s.coins,
      missions: s.missions,
      achievements: s.achievements,
      studySessions: s.studySessions,
      lastActivityDate: s.lastActivityDate,
      scoreHistory: s.scoreHistory,
      xpHistory: s.xpHistory,
      eloHistory: s.eloHistory,
      vocabularyPool: s.vocabularyPool,
      grammarPool: s.grammarPool,
      hearts: s.hearts,
      heartsDepletedAt: s.heartsDepletedAt,
      weakTermIds: s.weakTermIds,
    }))
  );
  const storedProfile = useMemo(
    () => LearningProfileRepository.getProfile(userId || 'local-user'),
    [userId]
  );
  const profile = useMemo<UserLearningProfile>(
    () => LearningProfileEngine.buildProfileSnapshot(storedProfile, learningState),
    [learningState, storedProfile]
  );

  const { data: memory, isPending: memoryLoading } = useQuery({
    queryKey: ['vocabularyMemory'],
    queryFn: () => LearningProfileEngine.getVocabularyMemorySummary(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: missions, isPending: missionsLoading } = useQuery({
    queryKey: ['dailyMissions', profile, memory],
    queryFn: () => (memory ? LearningProfileEngine.generateDailyMissions(profile, memory) : []),
    enabled: !!memory,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile,
    memory: memory ?? {
      total: 0,
      new: 0,
      learning: 0,
      mastered: 0,
      forgotten: 0,
      dueToday: 0,
      weakWords: 0,
    },
    missions: missions ?? [],
    isLoading: memoryLoading || missionsLoading,
    learningState,
  };
};
