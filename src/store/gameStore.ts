import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eosPersistConfig } from '@/shared/storage/persist-middleware';

export interface GameStoreState {
  hearts: number;
  maxHearts: number;
  xp: number;
  streak: number;
  gems: number;
  completedLevelIds: string[];
  levelStars: Record<string, number>;
  unlockedUnitIndex: number;
  lastActivityDate: string | null;

  // Actions
  loseHeart: () => boolean; // returns true if hearts remaining > 0, false if depleted
  refillHearts: () => void;
  addXp: (amount: number) => void;
  addGems: (amount: number) => void;
  completeLevel: (levelId: string, stars: number, xpReward: number) => void;
  unlockNextUnit: () => void;
  resetProgress: () => void;
}

const DEFAULT_MAX_HEARTS = 5;

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      hearts: DEFAULT_MAX_HEARTS,
      maxHearts: DEFAULT_MAX_HEARTS,
      xp: 0,
      streak: 1,
      gems: 100,
      completedLevelIds: [],
      levelStars: {},
      unlockedUnitIndex: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],

      loseHeart: () => {
        const currentHearts = get().hearts;
        const nextHearts = Math.max(0, currentHearts - 1);
        set({ hearts: nextHearts });
        return nextHearts > 0;
      },

      refillHearts: () => {
        set({ hearts: DEFAULT_MAX_HEARTS });
      },

      addXp: (amount: number) => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastActivityDate;
        let streak = get().streak;

        if (lastDate) {
          const diffDays = Math.floor(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 3600 * 24)
          );
          if (diffDays === 1) {
            streak += 1;
          } else if (diffDays > 1) {
            streak = 1;
          }
        } else {
          streak = 1;
        }

        set((state) => ({
          xp: state.xp + amount,
          streak,
          lastActivityDate: today,
        }));
      },

      addGems: (amount: number) => {
        set((state) => ({ gems: state.gems + amount }));
      },

      completeLevel: (levelId: string, stars: number, xpReward: number) => {
        const state = get();
        const existingStars = state.levelStars[levelId] || 0;
        const newCompleted = state.completedLevelIds.includes(levelId)
          ? state.completedLevelIds
          : [...state.completedLevelIds, levelId];

        const updatedStars = {
          ...state.levelStars,
          [levelId]: Math.max(existingStars, stars),
        };

        state.addXp(xpReward);
        set({
          completedLevelIds: newCompleted,
          levelStars: updatedStars,
        });
      },

      unlockNextUnit: () => {
        set((state) => ({ unlockedUnitIndex: state.unlockedUnitIndex + 1 }));
      },

      resetProgress: () => {
        set({
          hearts: DEFAULT_MAX_HEARTS,
          xp: 0,
          streak: 1,
          gems: 100,
          completedLevelIds: [],
          levelStars: {},
          unlockedUnitIndex: 0,
          lastActivityDate: new Date().toISOString().split('T')[0],
        });
      },
    }),
    eosPersistConfig('engdua_game_store', (s) => ({
      hearts: s.hearts,
      xp: s.xp,
      streak: s.streak,
      gems: s.gems,
      completedLevelIds: s.completedLevelIds,
      levelStars: s.levelStars,
      unlockedUnitIndex: s.unlockedUnitIndex,
      lastActivityDate: s.lastActivityDate,
    }))
  )
);
