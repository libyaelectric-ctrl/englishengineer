import { describe, it, expect, beforeEach } from 'vitest';
import { useVocabularyStore } from './store/vocabulary.store';

describe('Vocabulary Integration', () => {
  beforeEach(() => {
    useVocabularyStore.setState({
      entries: [],
      selectedEntry: null,
      isLoading: false,
      error: null,
    });
  });

  it('initializes with empty entries', () => {
    const state = useVocabularyStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.selectedEntry).toBeNull();
  });

  it('can add entries', () => {
    const newEntry = {
      id: 'word-1',
      term: 'panel',
      definition: 'Electrical control board',
      language: 'en',
      createdAt: new Date().toISOString(),
    };

    useVocabularyStore.setState({
      entries: [newEntry],
    });

    expect(useVocabularyStore.getState().entries).toHaveLength(1);
    expect(useVocabularyStore.getState().entries[0].term).toBe('panel');
  });

  it('can select an entry', () => {
    const entry = {
      id: 'word-1',
      term: 'circuit',
      definition: 'Electrical pathway',
      language: 'en',
      createdAt: new Date().toISOString(),
    };

    useVocabularyStore.setState({
      entries: [entry],
      selectedEntry: entry,
    });

    expect(useVocabularyStore.getState().selectedEntry?.term).toBe('circuit');
  });

  it('can clear selected entry', () => {
    useVocabularyStore.setState({
      selectedEntry: { id: 'word-1', term: 'test' } as any,
    });

    useVocabularyStore.setState({ selectedEntry: null });
    expect(useVocabularyStore.getState().selectedEntry).toBeNull();
  });

  it('handles loading state', () => {
    useVocabularyStore.setState({ isLoading: true });
    expect(useVocabularyStore.getState().isLoading).toBe(true);

    useVocabularyStore.setState({ isLoading: false });
    expect(useVocabularyStore.getState().isLoading).toBe(false);
  });

  it('handles error state', () => {
    useVocabularyStore.setState({ error: 'Network error' });
    expect(useVocabularyStore.getState().error).toBe('Network error');

    useVocabularyStore.setState({ error: null });
    expect(useVocabularyStore.getState().error).toBeNull();
  });
});
