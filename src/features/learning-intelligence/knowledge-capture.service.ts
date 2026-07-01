import { GrammarProgressService, GrammarRepository } from '@/features/grammar';
import type { CefrLevel } from '@/features/level-system';
import {
  VocabularyMenuService,
  VocabularyRepository,
} from '@/features/vocabulary';

export interface KnowledgeCaptureInput {
  cefrLevel: CefrLevel;
  vocabularyTerms?: string[];
  grammarHints?: string[];
}

export interface KnowledgeCaptureResult {
  vocabularyAdded: number;
  grammarExposed: number;
}

const normalize = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ');

const uniqueNormalized = (values: string[]): string[] => [
  ...new Set(values.map(normalize).filter(Boolean)),
];

export const KnowledgeCaptureService = {
  async capture({
    cefrLevel,
    vocabularyTerms = [],
    grammarHints = [],
  }: KnowledgeCaptureInput): Promise<KnowledgeCaptureResult> {
    const normalizedTerms = uniqueNormalized(vocabularyTerms).slice(0, 10);
    const normalizedGrammar = uniqueNormalized(grammarHints).slice(0, 5);
    let vocabularyAdded = 0;
    let grammarExposed = 0;

    if (normalizedTerms.length > 0) {
      const levelTerms =
        await VocabularyRepository.getVocabularyByLevel(cefrLevel);
      const progress = VocabularyMenuService.getState().progress;
      for (const term of levelTerms) {
        if (
          normalizedTerms.includes(normalize(term.term)) &&
          !progress[term.id]
        ) {
          VocabularyMenuService.startLearning(term.id);
          vocabularyAdded += 1;
        }
      }
    }

    if (normalizedGrammar.length > 0) {
      const rules = await GrammarRepository.getGrammarRulesByLevel(cefrLevel);
      const matchedRuleIds = rules
        .filter((rule) => {
          const searchable = normalize(
            `${rule.title} ${rule.structure} ${rule.grammarCategory}`
          );
          return normalizedGrammar.some(
            (hint) =>
              searchable.includes(hint) || hint.includes(normalize(rule.title))
          );
        })
        .slice(0, 3)
        .map((rule) => rule.id);

      matchedRuleIds.forEach((ruleId) => {
        GrammarProgressService.recordExposure(ruleId);
        grammarExposed += 1;
      });
    }

    return { vocabularyAdded, grammarExposed };
  },
};
