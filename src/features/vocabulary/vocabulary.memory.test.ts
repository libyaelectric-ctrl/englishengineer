import { beforeEach, describe, expect, it, beforeAll } from 'vitest';
import { loadVocabularyEntries } from './vocabulary.data';
import {
  filterMyVocabulary,
  VocabularyMemoryService,
} from './vocabulary.memory';
import { VocabularyEntry } from './vocabulary.types';

let entries: VocabularyEntry[] = [];

beforeAll(async () => {
  entries = await loadVocabularyEntries();
});

describe('My Vocabulary memory and review queue', () => {
  beforeEach(() => {
    localStorage.clear();
    VocabularyMemoryService.reset();
  });

  it('saves a word and restores it from local persistence', () => {
    const entry = entries.find((item) => item.CEFR === 'A1');
    expect(entry).toBeDefined();
    VocabularyMemoryService.addEntry(entry!);
    expect(VocabularyMemoryService.getState().savedWords[0].term).toBe(
      entry!.word
    );
  });

  it('does not duplicate an already saved word', () => {
    const entry = entries[0];
    VocabularyMemoryService.addEntry(entry);
    VocabularyMemoryService.addEntry(entry);
    expect(VocabularyMemoryService.getState().savedWords).toHaveLength(1);
  });

  it('marks a saved word as Weak and includes it in Weak Words', () => {
    const saved = VocabularyMemoryService.addEntry(entries[0]);
    VocabularyMemoryService.updateStatus(saved.id, 'Weak');
    expect(VocabularyMemoryService.getWeakWords()[0].status).toBe('Weak');
  });

  it('marks a saved word as Mastered with a longer interval', () => {
    const now = new Date('2026-06-27T10:00:00.000Z');
    const saved = VocabularyMemoryService.addEntry(
      entries[0],
      'EngVox Dictionary',
      now
    );
    VocabularyMemoryService.updateStatus(saved.id, 'Mastered', now);
    const updated = VocabularyMemoryService.getState().savedWords[0];
    expect(updated.status).toBe('Mastered');
    expect(new Date(updated.nextReviewDate).getTime()).toBeGreaterThan(
      now.getTime() + 6 * 24 * 60 * 60 * 1000
    );
  });

  it('removes a word from My Vocabulary', () => {
    const saved = VocabularyMemoryService.addEntry(entries[0]);
    VocabularyMemoryService.remove(saved.id);
    expect(VocabularyMemoryService.getState().savedWords).toEqual([]);
  });

  it('places due words in the Review Queue', () => {
    const now = new Date('2026-06-27T10:00:00.000Z');
    const saved = VocabularyMemoryService.addEntry(
      entries[0],
      'EngVox Dictionary',
      now
    );
    VocabularyMemoryService.updateStatus(saved.id, 'Review Today', now);
    expect(VocabularyMemoryService.getDueWords(now)).toHaveLength(1);
  });

  it('filters saved words by CEFR and status', () => {
    const a1 = entries.find((entry) => entry.CEFR === 'A1')!;
    const a2 = entries.find((entry) => entry.CEFR === 'A2')!;
    const first = VocabularyMemoryService.addEntry(a1);
    VocabularyMemoryService.addEntry(a2);
    VocabularyMemoryService.updateStatus(first.id, 'Weak');
    const words = VocabularyMemoryService.getState().savedWords;
    expect(filterMyVocabulary(words, 'A2')).toHaveLength(1);
    expect(filterMyVocabulary(words, 'Weak')).toHaveLength(1);
  });

  it('calculates dashboard vocabulary counts from canonical memory', () => {
    const first = VocabularyMemoryService.addEntry(entries[0]);
    const second = VocabularyMemoryService.addEntry(entries[1]);
    VocabularyMemoryService.updateStatus(first.id, 'Weak');
    VocabularyMemoryService.updateStatus(second.id, 'Mastered');
    const summary = VocabularyMemoryService.getSummary();
    expect(summary.savedWords).toBe(2);
    expect(summary.weakWords).toBe(1);
    expect(summary.masteredWords).toBe(1);
  });
});
