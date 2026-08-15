import { useEffect, useState } from 'react';

import {
  type MeaningSource,
  loadLanguageCorpus,
  resolveTermMeaning,
} from './vocabulary-translation.service';

/**
 * React binding for the vocabulary translation layer.
 * Triggers a re-render once the selected language's corpus chunk finishes
 * loading and returns a resolver for that learning language.
 */
export const useTermMeaningResolver = (
  language: string
): ((term: string, source: MeaningSource) => string) => {
  const [, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void loadLanguageCorpus(language).then(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [language]);

  return (term, source) => resolveTermMeaning(term, source, language);
};
