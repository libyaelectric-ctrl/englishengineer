/**
 * Frontend contract for Vocabulary API responses.
 */

export interface VocabularyLookupResponse {
  word: string;
  phonetic: string;
  definitions: string[];
  translation: string | null;
  source: string;
  translationSource: string | null;
  cached: boolean;
}

export const isVocabularyLookupResponse = (
  data: unknown
): data is VocabularyLookupResponse =>
  typeof data === 'object' &&
  data !== null &&
  'word' in data &&
  'definitions' in data;
