/**
 * useMascotEvents — integrates mascot state with app events.
 *
 * Call once in AppShell to wire up:
 * - XP earned → celebrate
 * - Level up → levelUp
 * - Streak updated → streak / streakDanger
 * - Wrong answer → concerned
 * - Before unload → farewell
 */
import { useEffect, useRef } from 'react';

import { useLearningStore } from '@/core/learning';

import { useLearningIntelligenceStore } from '@/features/learning-intelligence';
import { useLocalizationStore } from '@/features/localization';
import { MASCOT_COPY } from '@/features/localization/translations/mascot.translations';

import { useMascotStore } from './mascot.store';

const getCopy = () => {
  const language = useLocalizationStore.getState().language;
  return MASCOT_COPY[language] ?? MASCOT_COPY.en;
};

export const useMascotEvents = () => {
  const prevXp = useRef<number>(0);
  const prevStreak = useRef<number>(0);
  const prevLevel = useRef<string>('');

  const { setState } = useMascotStore();

  // ---- Track XP / level / streak changes via learning store ----
  useEffect(() => {
    const unsub = useLearningStore.subscribe((state, prevState) => {
      const copy = getCopy();

      // XP earned
      if (state.xp > prevState.xp) {
        const diff = state.xp - prevState.xp;
        if (diff >= 50) {
          setState('levelUp', copy.levelUp(state.level));
        } else {
          setState('celebrate', copy.celebrate[Math.floor(Math.random() * copy.celebrate.length)]);
        }
      }

      // Level up
      if (state.level !== prevState.level && state.level > prevState.level) {
        setState('levelUp', copy.levelUp(state.level));
      }

      // Streak increased
      if (state.streak > prevState.streak) {
        if (state.streak >= 7) {
          setState('streak', copy.streak(state.streak));
        } else {
          setState('celebrate', copy.streak(state.streak));
        }
      }

      prevXp.current = state.xp;
      prevStreak.current = state.streak;
      prevLevel.current = String(state.level);
    });
    return unsub;
  }, [setState]);

  // ---- Track mistakes via learning-intelligence store ----
  useEffect(() => {
    const unsub = useLearningIntelligenceStore.subscribe((state, prevState) => {
      const copy = getCopy();
      const prevCount = prevState.mistakeLog?.length ?? 0;
      const currCount = state.mistakeLog?.length ?? 0;
      if (currCount > prevCount) {
        setState('concerned', copy.concerned[Math.floor(Math.random() * copy.concerned.length)]);
      }
    });
    return unsub;
  }, [setState]);

  // ---- Streak danger check (every 5 min) ----
  useEffect(() => {
    const checkStreakDanger = () => {
      const copy = getCopy();
      const state = useLearningStore.getState();
      const streak = state.streak;

      if (streak <= 0) return;

      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const hoursLeft = Math.max(
        0,
        Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60))
      );

      const todaySessions = (state.studySessions ?? []).filter((s) => {
        const sessionDate = new Date(s.timestamp);
        return sessionDate.toDateString() === now.toDateString();
      });

      if (hoursLeft <= 4 && todaySessions.length === 0 && streak >= 3) {
        setState('streakDanger', copy.streakDanger(hoursLeft));
      }
    };

    const id = setInterval(checkStreakDanger, 5 * 60 * 1000);
    checkStreakDanger();
    return () => clearInterval(id);
  }, [setState]);

  // ---- Farewell on page unload ----
  useEffect(() => {
    const handleBeforeUnload = () => {
      const copy = getCopy();
      const farewell = copy.farewell[Math.floor(Math.random() * copy.farewell.length)];
      useMascotStore.getState().say(farewell, 'farewell');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
