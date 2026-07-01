import { storage } from '@/shared/storage';
import { IdService } from '@/core/ids';
import type {
  LearningIntelligencePreferences,
  MistakeCategory,
  MistakeLogEntry,
} from './learning-intelligence.types';

const STORAGE_KEY = 'learning_intelligence';

export const CRITICAL_MISTAKE_REPEAT_THRESHOLD = 3;

const DEFAULTS: LearningIntelligencePreferences = {
  careerRole: 'Site Engineer',
  completedTaskDates: {},
  mistakeLog: [],
  lastReportDate: null,
};

export const LearningIntelligenceService = {
  load(): LearningIntelligencePreferences {
    const stored = storage.get<LearningIntelligencePreferences>(STORAGE_KEY);
    return {
      careerRole: stored?.careerRole ?? DEFAULTS.careerRole,
      completedTaskDates: stored?.completedTaskDates ?? {},
      mistakeLog: stored?.mistakeLog ?? [],
      lastReportDate: stored?.lastReportDate ?? null,
    };
  },
  save(state: LearningIntelligencePreferences): void {
    storage.set(STORAGE_KEY, state);
  },

  addMistake(
    category: MistakeCategory,
    originalText: string,
    correction: string,
    now = new Date()
  ): MistakeLogEntry {
    const state = this.load();
    const normalizedOriginal = originalText.trim().toLocaleLowerCase('en');
    const existing = state.mistakeLog.find(
      (item) =>
        item.category === category &&
        item.originalText.trim().toLocaleLowerCase('en') === normalizedOriginal
    );
    const repetitionCount = (existing?.repetitionCount ?? 0) + 1;
    const entry: MistakeLogEntry = existing
      ? {
          ...existing,
          correction,
          updatedAt: now.toISOString(),
          repetitionCount,
          isCritical: repetitionCount >= CRITICAL_MISTAKE_REPEAT_THRESHOLD,
        }
      : {
          id: IdService.createId('mistake'),
          category,
          originalText,
          correction,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          repetitionCount,
          isCritical: false,
        };
    const withoutExisting = state.mistakeLog.filter(
      (item) => item.id !== existing?.id
    );
    this.save({
      ...state,
      mistakeLog: [entry, ...withoutExisting].slice(0, 100),
    });
    return entry;
  },
};
