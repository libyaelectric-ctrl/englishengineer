import { describe, it, expect, beforeEach } from 'vitest';
import { useVocabularyStore } from './store/vocabulary.store';

describe('Vocabulary Integration', () => {
  beforeEach(() => {
    useVocabularyStore.setState({
      mode: 'flashcards',
      responses: {},
      isSubmitting: false,
    });
  });

  it('initializes with flashcards mode', () => {
    const state = useVocabularyStore.getState();
    expect(state.mode).toBe('flashcards');
    expect(state.responses).toEqual({});
    expect(state.isSubmitting).toBe(false);
  });

  it('can set training mode', () => {
    useVocabularyStore.getState().setMode('multiple_choice');
    expect(useVocabularyStore.getState().mode).toBe('multiple_choice');
  });

  it('can set word response', () => {
    useVocabularyStore.getState().setResponse('word-1', 'transformer');
    expect(useVocabularyStore.getState().responses['word-1']).toBe(
      'transformer'
    );
  });

  it('calculates vocabulary stats', () => {
    useVocabularyStore.getState().fetchVocabularyStats();
    const stats = useVocabularyStore.getState().stats;
    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe('number');
  });
});
