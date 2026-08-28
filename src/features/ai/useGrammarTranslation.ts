import { useCallback, useEffect, useState } from 'react';

import type { GrammarExample } from '@/features/grammar/grammar.types';
import { useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

export interface GrammarTranslation {
  title: string;
  explanation: string;
  structure: string;
  engineeringUseCase: string;
  badExampleTurkishExplanation: string;
  examples: GrammarExample[];
  language: SupportedInterfaceLanguage;
}

export interface GrammarTranslationSource {
  id: string;
  title: string;
  explanation: string;
  structure: string;
  engineeringUseCase: string;
  turkishExplanation: string;
  badExampleTurkishExplanation?: string;
  examples: GrammarExample[];
}

const memoryCache = new Map<string, GrammarTranslation>();
const LS_PREFIX = 'engvox_grammar_tr:';

const buildCacheKey = (ruleId: string, language: string) => `${ruleId}:${language}`;

const loadPersisted = (ruleId: string, language: string): GrammarTranslation | null => {
  try {
    const raw = localStorage.getItem(LS_PREFIX + buildCacheKey(ruleId, language));
    return raw ? (JSON.parse(raw) as GrammarTranslation) : null;
  } catch {
    return null;
  }
};

const persist = (ruleId: string, language: string, value: GrammarTranslation): void => {
  try {
    localStorage.setItem(LS_PREFIX + buildCacheKey(ruleId, language), JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — ignore
  }
};

const toEnglishTranslation = (
  rule: GrammarTranslationSource,
  language: SupportedInterfaceLanguage
): GrammarTranslation => ({
  title: rule.title,
  explanation: rule.explanation,
  structure: rule.structure,
  engineeringUseCase: rule.engineeringUseCase,
  badExampleTurkishExplanation: rule.badExampleTurkishExplanation ?? '',
  examples: rule.examples,
  language,
});

const toTurkishTranslation = (rule: GrammarTranslationSource): GrammarTranslation => ({
  title: rule.title,
  explanation: rule.turkishExplanation || rule.explanation,
  structure: rule.structure,
  engineeringUseCase: rule.engineeringUseCase,
  badExampleTurkishExplanation: rule.badExampleTurkishExplanation ?? '',
  examples: rule.examples,
  language: 'tr',
});

export const useGrammarTranslation = (
  rule: GrammarTranslationSource | null,
  options: { enableAiFallback?: boolean } = {}
) => {
  const language = useLocalizationStore((s) => s.language);
  const [translation, setTranslation] = useState<GrammarTranslation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!rule) {
      setTranslation(null);
      return;
    }

    if (language === 'en') {
      setTranslation(toEnglishTranslation(rule, language));
      return;
    }

    if (language === 'tr') {
      setTranslation(toTurkishTranslation(rule));
      return;
    }

    const cached =
      memoryCache.get(buildCacheKey(rule.id, language)) ?? loadPersisted(rule.id, language);
    if (cached) {
      setTranslation(cached);
      return;
    }

    // Show English content immediately, then translate via AI in the background.
    setTranslation(toEnglishTranslation(rule, language));

    if (!options.enableAiFallback) return;

    let active = true;
    setIsTranslating(true);

    void (async () => {
      try {
        const { PersonalAIService } = await import('@/features/ai/personal-ai.service');
        if (!PersonalAIService.isConfigured) return;

        const [explanation, engineeringUseCase, badExampleNote, translatedExamples] =
          await Promise.all([
            PersonalAIService.translate(rule.explanation, language),
            PersonalAIService.translate(rule.engineeringUseCase, language),
            PersonalAIService.translate(rule.badExampleTurkishExplanation ?? '', language),
            Promise.all(
              (rule.examples ?? []).map(async (ex): Promise<GrammarExample> => {
                const native = await PersonalAIService.translate(ex.english, language);
                return { english: ex.english, turkish: native };
              })
            ),
          ]);

        if (!active) return;

        const next: GrammarTranslation = {
          title: rule.title,
          explanation,
          structure: rule.structure,
          engineeringUseCase,
          badExampleTurkishExplanation: badExampleNote,
          examples: translatedExamples,
          language,
        };
        memoryCache.set(buildCacheKey(rule.id, language), next);
        persist(rule.id, language, next);
        setTranslation(next);
      } catch {
        // Keep the English fallback on failure.
      } finally {
        if (active) setIsTranslating(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [rule, language, options.enableAiFallback]);

  const translateWithAI = useCallback(
    async (text: string, targetLang: SupportedInterfaceLanguage): Promise<string> => {
      const { PersonalAIService } = await import('@/features/ai/personal-ai.service');
      if (!PersonalAIService.isConfigured) return text;
      return PersonalAIService.translate(text, targetLang);
    },
    []
  );

  return { translation, isTranslating, language, translateWithAI };
};
