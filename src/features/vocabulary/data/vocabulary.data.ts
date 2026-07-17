import { VocabularyEntry } from '../types/vocabulary.types';
import {
  VocabularyContentRow,
  buildEntries,
} from './vocabulary.expansion-helpers';

let _entriesPromise: Promise<VocabularyEntry[]> | null = null;
let _entriesSync: VocabularyEntry[] | null = null;

export function loadVocabularyEntries(): Promise<VocabularyEntry[]> {
  if (_entriesSync) return Promise.resolve(_entriesSync);
  if (!_entriesPromise) {
    _entriesPromise = import('./vocabulary.data.json').then((mod) => {
      _entriesSync = buildEntries(mod.default as VocabularyContentRow[]);
      return _entriesSync;
    });
  }
  return _entriesPromise;
}

export function getVocabularyEntries(): VocabularyEntry[] | null {
  return _entriesSync;
}

export function getVocabularyEntriesOrWait(): Promise<VocabularyEntry[]> {
  return loadVocabularyEntries();
}
