import { create } from 'zustand';
import { PLACEMENT_QUESTIONS } from './placement.data';
import { PlacementService } from './placement.service';
import type { PlacementAnswers, PlacementResult } from './placement.types';

interface PlacementStore {
  currentIndex: number;
  answers: PlacementAnswers;
  result: PlacementResult | null;
  answer: (questionId: string, choiceIndex: number) => void;
  next: () => void;
  previous: () => void;
  submit: (userId: string) => PlacementResult;
  reset: () => void;
}

export const usePlacementStore = create<PlacementStore>((set, get) => ({
  currentIndex: 0,
  answers: {},
  result: null,
  answer: (questionId, choiceIndex) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: choiceIndex },
    })),
  next: () =>
    set((state) => ({
      currentIndex: Math.min(
        state.currentIndex + 1,
        PLACEMENT_QUESTIONS.length - 1
      ),
    })),
  previous: () =>
    set((state) => ({ currentIndex: Math.max(state.currentIndex - 1, 0) })),
  submit: (userId) => {
    const result = PlacementService.submit(userId, get().answers);
    set({ result });
    return result;
  },
  reset: () => set({ currentIndex: 0, answers: {}, result: null }),
}));
