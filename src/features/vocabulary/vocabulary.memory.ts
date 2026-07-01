import { storage } from '@/shared/storage';
import type {
  MyVocabularyFilter,
  SavedVocabularyWord,
  ExternalVocabularyResult,
  VocabularyEntry,
  VocabularyMemoryState,
  VocabularyMemorySummary,
  VocabularyWordSource,
  VocabularyWordStatus,
} from './vocabulary.types';
import type { CefrLevel } from '@/features/level-system';

const STORAGE_KEY = 'engineeros_vocabulary_memory';
const DAY_MS = 24 * 60 * 60 * 1000;

const addDays = (date: Date, days: number): string =>
  new Date(date.getTime() + days * DAY_MS).toISOString();

const getNextReviewDate = (status: VocabularyWordStatus, now: Date): string => {
  if (status === 'Weak' || status === 'Review Today') return now.toISOString();
  if (status === 'Mastered') return addDays(now, 7);
  if (status === 'Learning') return addDays(now, 2);
  return addDays(now, 1);
};

const normalizeState = (
  state: VocabularyMemoryState | null
): VocabularyMemoryState => ({
  savedWords: Array.isArray(state?.savedWords) ? state.savedWords : [],
});

export const isVocabularyWordDue = (
  word: SavedVocabularyWord,
  now = new Date()
): boolean => new Date(word.nextReviewDate).getTime() <= now.getTime();

export const filterMyVocabulary = (
  words: SavedVocabularyWord[],
  filter: MyVocabularyFilter,
  now = new Date()
): SavedVocabularyWord[] => {
  if (filter === 'All') return words;
  if (filter === 'Review Today') {
    return words.filter((word) => isVocabularyWordDue(word, now));
  }
  if (filter === 'Weak' || filter === 'Mastered') {
    return words.filter((word) => word.status === filter);
  }
  return words.filter((word) => word.cefrLevel === filter);
};

export const VocabularyMemoryService = {
  getState(): VocabularyMemoryState {
    return normalizeState(storage.get<VocabularyMemoryState>(STORAGE_KEY));
  },

  saveState(state: VocabularyMemoryState): void {
    storage.set(STORAGE_KEY, state);
  },

  addEntry(
    entry: VocabularyEntry,
    source: VocabularyWordSource = 'EngineerOS Dictionary',
    now = new Date()
  ): SavedVocabularyWord {
    const state = this.getState();
    const existing = state.savedWords.find(
      (word) => word.entryId === entry.id || word.term === entry.word
    );
    if (existing) return existing;

    const word: SavedVocabularyWord = {
      id: `saved_${entry.id}`,
      entryId: entry.id,
      term: entry.word,
      turkishMeaning: entry.meaning,
      cefrLevel: entry.CEFR,
      category: entry.discipline,
      exampleSentence: entry.example,
      status: 'New',
      dateAdded: now.toISOString(),
      lastReviewed: null,
      nextReviewDate: getNextReviewDate('New', now),
      reviewCount: 0,
      source,
    };
    this.saveState({ savedWords: [word, ...state.savedWords] });
    return word;
  },

  addExternalResult(
    result: ExternalVocabularyResult,
    cefrLevel: CefrLevel,
    now = new Date()
  ): SavedVocabularyWord {
    const state = this.getState();
    const existing = state.savedWords.find(
      (word) => word.term.toLowerCase() === result.word.toLowerCase()
    );
    if (existing) return existing;
    const word: SavedVocabularyWord = {
      id: `saved_external_${result.word.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      entryId: null,
      term: result.word,
      turkishMeaning: result.translation ?? 'Translation not available',
      cefrLevel,
      category: 'General Professional English',
      exampleSentence: result.definitions[0] ?? 'Definition not available.',
      status: 'New',
      dateAdded: now.toISOString(),
      lastReviewed: null,
      nextReviewDate: getNextReviewDate('New', now),
      reviewCount: 0,
      source: result.cached ? 'Cached result' : result.source,
    };
    this.saveState({ savedWords: [word, ...state.savedWords] });
    return word;
  },

  updateStatus(
    id: string,
    status: VocabularyWordStatus,
    now = new Date()
  ): void {
    const state = this.getState();
    this.saveState({
      savedWords: state.savedWords.map((word) =>
        word.id === id
          ? {
              ...word,
              status,
              lastReviewed: now.toISOString(),
              nextReviewDate: getNextReviewDate(status, now),
              reviewCount: word.reviewCount + 1,
            }
          : word
      ),
    });
  },

  markEntryWeak(entryId: string, now = new Date()): void {
    const word = this.getState().savedWords.find(
      (item) => item.entryId === entryId
    );
    if (word) this.updateStatus(word.id, 'Weak', now);
  },

  remove(id: string): void {
    const state = this.getState();
    this.saveState({
      savedWords: state.savedWords.filter((word) => word.id !== id),
    });
  },

  getDueWords(now = new Date()): SavedVocabularyWord[] {
    return this.getState().savedWords.filter((word) =>
      isVocabularyWordDue(word, now)
    );
  },

  getWeakWords(): SavedVocabularyWord[] {
    return this.getState().savedWords.filter((word) => word.status === 'Weak');
  },

  getSummary(now = new Date()): VocabularyMemorySummary {
    const words = this.getState().savedWords;
    return {
      savedWords: words.length,
      dueToday: words.filter((word) => isVocabularyWordDue(word, now)).length,
      weakWords: words.filter((word) => word.status === 'Weak').length,
      masteredWords: words.filter((word) => word.status === 'Mastered').length,
    };
  },

  reset(): void {
    storage.remove(STORAGE_KEY);
  },
};
