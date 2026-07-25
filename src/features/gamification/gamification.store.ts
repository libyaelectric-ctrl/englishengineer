import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eosPersistConfig } from '@/shared/storage/persist-middleware';
import { storage } from '@/shared/storage';
import { createRewardHistoryItem, getTodayKey } from './gamification.helpers';
import { DAILY_LOGIN_REWARD } from './gamification.rewards';
import {
  GamificationStoreState,
} from './gamification.types';

const STORAGE_KEY = 'gamification_pro_state';

export const useGamificationStore = create<GamificationStoreState>()(
  persist(
    (set, get) => ({
      rewardHistory: [],
      claimedDailyLoginDate: null,
      challengeProgress: {},

      claimDailyLoginReward: () => {
        const today = getTodayKey();
        if (get().claimedDailyLoginDate === today) return null;

        const reward = createRewardHistoryItem(DAILY_LOGIN_REWARD);
        const rewardHistory = [reward, ...get().rewardHistory].slice(0, 30);
        set({ claimedDailyLoginDate: today, rewardHistory });
        return reward;
      },

      addRewardHistoryItem: (reward) => {
        const rewardHistory = [reward, ...get().rewardHistory].slice(0, 30);
        set({ rewardHistory });
      },

      clearRewardHistory: () => {
        set({
          rewardHistory: [],
          claimedDailyLoginDate: null,
          challengeProgress: {},
        });
        storage.remove(STORAGE_KEY);
      },
    }),
    eosPersistConfig(STORAGE_KEY)
  )
);
