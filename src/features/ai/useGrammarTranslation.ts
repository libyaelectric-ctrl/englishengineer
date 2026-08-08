import { useCallback, useEffect, useState } from 'react';

import { useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

import { loadVocabularyTranslations, getTermTranslation } from '@/shared/services/vocabulary-translation.service';

export interface GrammarTranslation {
  title: string;
  explanation: string;
  structure: string;
  engineeringUseCase: string;
  language: SupportedInterfaceLanguage;
}

const translationCache = new Map<string, GrammarTranslation>();

const buildCacheKey = (ruleId: string, language: string) => `grammar:${ruleId}:${language}`;

export const useGrammarTranslation = (
  rule: {
    id: string;
    title: string;
    explanation: string;
    structure: string;
    engineeringUseCase: string;
    turkishExplanation: string;
  } | null,
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
      setTranslation({
        title: rule.title,
        explanation: rule.explanation,
        structure: rule.structure,
        engineeringUseCase: rule.engineeringUseCase,
        language,
      });
      return;
    }

    if (language === 'tr') {
      setTranslation({
        title: rule.title,
        explanation: rule.turkishExplanation || rule.explanation,
        structure: rule.structure,
        engineeringUseCase: rule.engineeringUseCase,
        language,
      });
      return;
    }

    const cacheKey = buildCacheKey(rule.id, language);
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslation(cached);
      return;
    }

    setTranslation({
      title: rule.title,
      explanation: rule.explanation,
      structure: rule.structure,
      engineeringUseCase: rule.engineeringUseCase,
      language,
    });

    if (!options.enableAiFallback) return;

    let active = true;
    setIsTranslating(true);

    void (async () => {
      try {
        await loadVocabularyTranslations();
        const titleTr = getTermTranslation(rule.title, language);
        if (titleTr?.meaning && active) {
          const next: GrammarTranslation = {
            title: titleTr.meaning,
            explanation: rule.explanation,
            structure: rule.structure,
            engineeringUseCase: rule.engineeringUseCase,
            language,
          };
          translationCache.set(cacheKey, next);
          setTranslation(next);
        }
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
