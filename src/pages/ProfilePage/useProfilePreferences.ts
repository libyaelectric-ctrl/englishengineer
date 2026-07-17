import { useEffect, useReducer } from 'react';
import { useAuthStore } from '@/features/auth';
import {
  LearningProfileRepository,
  type UserLearningProfile,
} from '@/features/profile';
import { prefsReducer, type ProfilePrefsState } from './ProfilePageReducer';

export const useProfilePreferences = (
  profile: UserLearningProfile | null,
  setMessage: (v: string | null) => void,
  setError: (v: string | null) => void,
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
    goals: prefGoals, minutes: prefMinutes, tasks: prefTasks,
    missedDays: prefMissedDays, expLevel: prefExpLevel,
    careerGoal: prefCareerGoal, saved: preferencesSaved,
  } = prefs;

  const setPrefGoals = (v: React.SetStateAction<string[]>) =>
    dispatchPrefs({ type: 'SET_GOALS', value: typeof v === 'function' ? v(prefs.goals) : v });
  const setPrefMinutes = (v: React.SetStateAction<number>) =>
    dispatchPrefs({ type: 'SET_MINUTES', value: typeof v === 'function' ? v(prefs.minutes) : v });
  const setPrefTasks = (v: React.SetStateAction<number>) =>
    dispatchPrefs({ type: 'SET_TASKS', value: typeof v === 'function' ? v(prefs.tasks) : v });
  const setPrefMissedDays = (v: React.SetStateAction<number>) =>
    dispatchPrefs({ type: 'SET_MISSED_DAYS', value: typeof v === 'function' ? v(prefs.missedDays) : v });
  const setPrefExpLevel = (v: React.SetStateAction<string>) =>
    dispatchPrefs({ type: 'SET_EXP_LEVEL', value: typeof v === 'function' ? v(prefs.expLevel) : v });
  const setPrefCareerGoal = (v: React.SetStateAction<string>) =>
    dispatchPrefs({ type: 'SET_CAREER_GOAL', value: typeof v === 'function' ? v(prefs.careerGoal) : v });
  const setPreferencesSaved = (v: React.SetStateAction<boolean>) =>
    dispatchPrefs({ type: 'SET_SAVED', value: typeof v === 'function' ? v(prefs.saved) : v });

  useEffect(() => {
    if (!profile) return;
    dispatchPrefs({
      type: 'LOAD_PROFILE',
      goals: profile.goals || [],
      minutes: profile.dailyTarget?.minutes || 15,
      tasks: profile.dailyTarget?.taskCount || 2,
      missedDays: profile.weeklyTolerance?.allowedMissedDays || 0,
      expLevel: profile.experienceLevel || '',
      careerGoal: profile.careerGoal || '',
    });
  }, [profile]);

  const handleSavePreferences = (event: React.FormEvent) => {
    event.preventDefault();
    setPreferencesSaved(false);
    try {
      LearningProfileRepository.updatePreferences(currentUser?.id ?? 'local-user', {
        goals: prefGoals as unknown as UserLearningProfile['goals'],
        dailyTarget: { minutes: prefMinutes, taskCount: prefTasks },
        weeklyTolerance: { allowedMissedDays: prefMissedDays },
        experienceLevel: (prefExpLevel as UserLearningProfile['experienceLevel']) || undefined,
        careerGoal: prefCareerGoal,
      });
      setPreferencesSaved(true);
      setMessage('Learning preferences saved successfully.');
      setError(null);
    } catch {
      setError('Failed to save learning preferences.');
    }
  };

  return {
    prefGoals, setPrefGoals, prefMinutes, setPrefMinutes,
    prefTasks, setPrefTasks, prefMissedDays, setPrefMissedDays,
    prefExpLevel, setPrefExpLevel, prefCareerGoal, setPrefCareerGoal,
    preferencesSaved, handleSavePreferences,
  };
};
