import { create } from 'zustand';

import type { CefrLevel } from '@/features/level-system';

import { VocabularyMemoryService } from '../services/core/vocabulary.memory';
import type {
  ExternalVocabularyResult,
  SavedVocabularyWord,
  VocabularyEntry,
  VocabularyMemorySummary,
  VocabularyWordStatus,
} from '../types/vocabulary.types';

interface VocabularyMemoryStore {
  savedWords: SavedVocabularyWord[];
  summary: VocabularyMemorySummary;
  refresh: () => void;
  addEntry: (entry: VocabularyEntry) => void;
  addExternal: (result: ExternalVocabularyResult, level: CefrLevel) => void;
  updateStatus: (id: string, status: VocabularyWordStatus) => void;
  remove: (id: string) => void;
}

const snapshot = () => ({
  savedWords: VocabularyMemoryService.getState().savedWords,
  summary: VocabularyMemoryService.getSummary(),
});

export const useVocabularyMemoryStore = create<VocabularyMemoryStore>((set) => ({
  ...snapshot(),
  refresh: () => set(snapshot()),
  addEntry: (entry) => {
    VocabularyMemoryService.addEntry(entry);
    set(snapshot());
  },
  addExternal: (result, level) => {
    VocabularyMemoryService.addExternalResult(result, level);
    set(snapshot());
  },
  updateStatus: (id, status) => {
    VocabularyMemoryService.updateStatus(id, status);
    set(snapshot());
  },
  remove: (id) => {
    VocabularyMemoryService.remove(id);
    set(snapshot());
  },
}));
