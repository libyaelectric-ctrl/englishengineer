import { create } from 'zustand';
import { LearningIntelligenceService } from './learning-intelligence.service';
import {
  CareerRole,
  LearningIntelligencePreferences,
  MistakeCategory,
} from './learning-intelligence.types';

interface LearningIntelligenceState extends LearningIntelligencePreferences {
  setCareerRole: (role: CareerRole) => void;
  toggleTask: (taskId: string) => void;
  addMistake: (
    category: MistakeCategory,
    originalText: string,
    correction: string
  ) => void;
  removeMistake: (id: string) => void;
  markReportGenerated: () => void;
}

const persist = (state: LearningIntelligenceState): void => {
  LearningIntelligenceService.save({
    careerRole: state.careerRole,
    completedTaskDates: state.completedTaskDates,
    mistakeLog: state.mistakeLog,
    lastReportDate: state.lastReportDate,
  });
};

export const useLearningIntelligenceStore = create<LearningIntelligenceState>(
  (set, get) => ({
    ...LearningIntelligenceService.load(),
    setCareerRole: (careerRole) => {
      set({ careerRole });
      persist(get());
    },
    toggleTask: (taskId) => {
      const today = new Date().toISOString().slice(0, 10);
      const current = get().completedTaskDates[taskId];
      const completedTaskDates = { ...get().completedTaskDates };
      if (current === today) delete completedTaskDates[taskId];
      else completedTaskDates[taskId] = today;
      set({ completedTaskDates });
      persist(get());
    },
    addMistake: (category, originalText, correction) => {
      LearningIntelligenceService.addMistake(
        category,
        originalText,
        correction
      );
      set({ mistakeLog: LearningIntelligenceService.load().mistakeLog });
    },
    removeMistake: (id) => {
      set({ mistakeLog: get().mistakeLog.filter((entry) => entry.id !== id) });
      persist(get());
    },
    markReportGenerated: () => {
      set({ lastReportDate: new Date().toISOString() });
      persist(get());
    },
  })
);
