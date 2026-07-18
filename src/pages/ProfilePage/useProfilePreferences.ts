import React, { useEffect, useReducer } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  LearningProfileRepository,
  type UserLearningProfile,
} from '@/features/profile';
import { prefsReducer, type ProfilePrefsState } from './ProfilePageReducer';

const resolveActionValue = <T>(v: React.SetStateAction<T>, current: T): T =>
  typeof v === 'function' ? (v as (prev: T) => T)(current) : v;

const loadProfileToPrefs = (profile: UserLearningProfile): Omit<ProfilePrefsState, 'saved'> => ({
  goals: profile.goals || [],
  minutes: profile.dailyTarget?.minutes || 15,
  tasks: profile.dailyTarget?.taskCount || 2,
  missedDays: profile.weeklyTolerance?.allowedMissedDays || 0,
  expLevel: profile.experienceLevel || '',
  careerGoal: profile.careerGoal || '',
});

const buildSavePayload = (
  userId: string,
  prefGoals: string[],
  prefMinutes: number,
  prefTasks: number,
  prefMissedDays: number,
  prefExpLevel: string,
  prefCareerGoal: string
) => {
  LearningProfileRepository.updatePreferences(userId, {
    goals: prefGoals as unknown as UserLearningProfile['goals'],
    dailyTarget: { minutes: prefMinutes, taskCount: prefTasks },
    weeklyTolerance: { allowedMissedDays: prefMissedDays },
    experienceLevel: (prefExpLevel as UserLearningProfile['experienceLevel']) || undefined,
    careerGoal: prefCareerGoal,
  });
};

export const useProfilePreferences = (
  profile: UserLearningProfile | null,
  setMessage: (v: string | null) => void,
  setError: (v: string | null) => void
) => {
  const { currentUser } = useAuthStore();

  const [prefs, dispatchPrefs] = useReducer(prefsReducer, {
    goals: [] as string[],
    minutes: 15,
    tasks: 2,
    missedDays: 0,
    expLevel: '',
    careerGoal: '',
    saved: false,
  } satisfies ProfilePrefsState);

  const {
    goals: prefGoals,
    minutes: prefMinutes,
    tasks: prefTasks,
    missedDays: prefMissedDays,
    expLevel: prefExpLevel,
    careerGoal: prefCareerGoal,
    saved: preferencesSaved,
  } = prefs;

  const setPrefGoals = (v: React.SetStateAction<string[]>) =>
    dispatchPrefs({ type: 'SET_GOALS', value: resolveActionValue(v, prefs.goals) });
  const setPrefMinutes = (v: React.SetStateAction<number>) =>
    dispatchPrefs({ type: 'SET_MINUTES', value: resolveActionValue(v, prefs.minutes) });
  const setPrefTasks = (v: React.SetStateAction<number>) =>
    dispatchPrefs({ type: 'SET_TASKS', value: resolveActionValue(v, prefs.tasks) });
  const setPrefMissedDays = (v: React.SetStateAction<number>) =>
    dispatchPrefs({ type: 'SET_MISSED_DAYS', value: resolveActionValue(v, prefs.missedDays) });
  const setPrefExpLevel = (v: React.SetStateAction<string>) =>
    dispatchPrefs({ type: 'SET_EXP_LEVEL', value: resolveActionValue(v, prefs.expLevel) });
  const setPrefCareerGoal = (v: React.SetStateAction<string>) =>
    dispatchPrefs({ type: 'SET_CAREER_GOAL', value: resolveActionValue(v, prefs.careerGoal) });
  const setPreferencesSaved = (v: React.SetStateAction<boolean>) =>
    dispatchPrefs({ type: 'SET_SAVED', value: resolveActionValue(v, prefs.saved) });

  useEffect(() => {
    if (!profile) return;
    const loaded = loadProfileToPrefs(profile);
    dispatchPrefs({ type: 'LOAD_PROFILE', ...loaded });
  }, [profile]);

  const handleSavePreferences = (event: React.FormEvent) => {
    event.preventDefault();
    setPreferencesSaved(false);
    try {
      buildSavePayload(
        currentUser?.id ?? 'local-user',
        prefGoals, prefMinutes, prefTasks, prefMissedDays, prefExpLevel, prefCareerGoal
      );
      setPreferencesSaved(true);
      setMessage('Learning preferences saved successfully.');
      setError(null);
    } catch {
      setError('Failed to save learning preferences.');
    }
  };

  return {
    prefGoals,
    setPrefGoals,
    prefMinutes,
    setPrefMinutes,
    prefTasks,
    setPrefTasks,
    prefMissedDays,
    setPrefMissedDays,
    prefExpLevel,
    setPrefExpLevel,
    prefCareerGoal,
    setPrefCareerGoal,
    preferencesSaved,
    handleSavePreferences,
  };
};
