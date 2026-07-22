import { create } from 'zustand';

interface ModuleProgress {
  total: number;
  learned?: number;
  mastered?: number;
  struggling?: number;
  completed?: number;
  submitted?: number;
  avgScore?: number;
}

interface OverviewData {
  vocabulary: ModuleProgress;
  grammar: ModuleProgress;
  reading: ModuleProgress;
  writing: ModuleProgress;
  listening: ModuleProgress;
  speaking: ModuleProgress;
  overallLevel: string;
  dailyGoal: { target: number; completed: number };
  weeklyGoal: { target: number; completed: number };
}

interface ProgressStoreState {
  overview: OverviewData | null;
  isLoading: boolean;
}

interface ProgressStoreActions {
  fetchOverview: () => void;
}

const DEFAULT_OVERVIEW: OverviewData = {
  vocabulary: { total: 0, learned: 0, mastered: 0, struggling: 0 },
  grammar: { total: 0, learned: 0, mastered: 0, struggling: 0 },
  reading: { total: 0, completed: 0, avgScore: 0 },
  writing: { total: 0, submitted: 0, avgScore: 0 },
  listening: { total: 0, completed: 0, avgScore: 0 },
  speaking: { total: 0, submitted: 0, avgScore: 0 },
  overallLevel: 'A1',
  dailyGoal: { target: 5, completed: 0 },
  weeklyGoal: { target: 15, completed: 0 },
};

export const useProgressStore = create<ProgressStoreState & ProgressStoreActions>((set) => ({
  overview: null,
  isLoading: false,
  fetchOverview: () => {
    set({ overview: DEFAULT_OVERVIEW, isLoading: false });
  },
}));
