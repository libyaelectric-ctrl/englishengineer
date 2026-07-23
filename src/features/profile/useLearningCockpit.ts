import { useEffect, useMemo, useState } from 'react';
import { useLearningStore } from '@/core/learning';
import { useShallow } from 'zustand/shallow';
import { LearningProfileEngine } from './profile.engine';
import { LearningProfileRepository } from './profile.repository';
import type {
  DailyMission,
  UserLearningProfile,
  VocabularyMemorySummary,
} from './profile.types';

const EMPTY_MEMORY: VocabularyMemorySummary = {
  total: 0,
  new: 0,
  learning: 0,
  mastered: 0,
  forgotten: 0,
  dueToday: 0,
  weakWords: 0,
};

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
    }))
  );
  const storedProfile = useMemo(
    () => LearningProfileRepository.getProfile(userId || 'local-user'),
    [userId]
  );
  const profile = useMemo<UserLearningProfile>(
    () =>
      LearningProfileEngine.buildProfileSnapshot(storedProfile, learningState),
    [learningState, storedProfile]
  );
  const [memory, setMemory] = useState(EMPTY_MEMORY);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const nextMemory =
          await LearningProfileEngine.getVocabularyMemorySummary();
        const nextMissions = await LearningProfileEngine.generateDailyMissions(
          profile,
          nextMemory
        );
        if (!active) return;
        setMemory(nextMemory);
        setMissions(nextMissions);
      } catch {
        // Fallback gracefully on storage error
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [userId, learningState.lastActivityDate, learningState.xp]);

  return { profile, memory, missions, isLoading, learningState };
};
