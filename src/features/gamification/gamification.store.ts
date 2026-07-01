import { create } from 'zustand';
import { storage } from '@/shared/storage';
import { createRewardHistoryItem, getTodayKey } from './gamification.helpers';
import { DAILY_LOGIN_REWARD } from './gamification.rewards';
import {
  GamificationPersistedState,
  GamificationStoreState,
} from './gamification.types';

const STORAGE_KEY = 'gamification_pro_state';

const getInitialState = (): GamificationPersistedState => {
  const persisted = storage.get<GamificationPersistedState>(STORAGE_KEY);
  return {
    rewardHistory: persisted?.rewardHistory || [],
    claimedDailyLoginDate: persisted?.claimedDailyLoginDate || null,
    challengeProgress: persisted?.challengeProgress || {},
  };
};

const saveState = (state: GamificationPersistedState): void => {
  storage.set(STORAGE_KEY, state);
};

const initialState = getInitialState();

export const useGamificationStore = create<GamificationStoreState>(
  (set, get) => ({
    ...initialState,

    claimDailyLoginReward: () => {
      const today = getTodayKey();
      if (get().claimedDailyLoginDate === today) return null;

      const reward = createRewardHistoryItem(DAILY_LOGIN_REWARD);
      const rewardHistory = [reward, ...get().rewardHistory].slice(0, 30);
      set({ claimedDailyLoginDate: today, rewardHistory });
      saveState({
        rewardHistory,
        claimedDailyLoginDate: today,
        challengeProgress: get().challengeProgress,
      });
      return reward;
    },

    addRewardHistoryItem: (reward) => {
      const rewardHistory = [reward, ...get().rewardHistory].slice(0, 30);
      set({ rewardHistory });
      saveState({
        rewardHistory,
        claimedDailyLoginDate: get().claimedDailyLoginDate,
        challengeProgress: get().challengeProgress,
      });
    },

    clearRewardHistory: () => {
      set({
        rewardHistory: [],
        claimedDailyLoginDate: null,
        challengeProgress: {},
      });
      storage.remove(STORAGE_KEY);
    },
  })
);
