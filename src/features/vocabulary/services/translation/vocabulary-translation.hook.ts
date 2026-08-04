import { useEffect, useState } from 'react';

import {
  type MeaningSource,
  loadVocabularyTranslations,
  resolveTermMeaning,
} from './vocabulary-translation.service';

/**
 * React binding for the vocabulary translation layer.
 * Triggers a re-render once the corpus finishes loading and returns a
 * resolver for the currently selected learning language.
 */
export const useTermMeaningResolver = (
  language: string
): ((term: string, source: MeaningSource) => string) => {
  const [, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void loadVocabularyTranslations().then(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (term, source) => resolveTermMeaning(term, source, language);
};
