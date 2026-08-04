import { type LearningDataSkill, includesNormalized, isCefrAtOrBelow } from '@/core/learning';

import type { GrammarRule } from '@/features/grammar/grammar.types';
import type { CefrLevel } from '@/features/level-system';

import { VocabularyRepository } from '../services/core/vocabulary.repository';
import { resolveTermMeaningAsync } from '../services/translation/vocabulary-translation.service';
import type { VocabularyTerm } from '../types/vocabulary.types';

export const VocabularyEngine = {
  async selectVocabularyForTask(
    skill: LearningDataSkill,
    level: CefrLevel,
    domain?: string,
    contentDomain?: string,
    lifeContext?: string
  ): Promise<VocabularyTerm[]> {
    const terms = await VocabularyRepository.getVocabularyByLevel(level);
    return terms.filter(
      (term) =>
        this.validateVocabularyEligibility(term, skill, level) &&
        (!domain || term.domain.toLowerCase() === domain.toLowerCase()) &&
        (!contentDomain || term.contentDomain.toLowerCase() === contentDomain.toLowerCase()) &&
        (!lifeContext || term.lifeContext.toLowerCase() === lifeContext.toLowerCase())
    );
  },

  async selectVocabularyForGrammar(
    grammarRuleOrCategory: GrammarRule | string,
    level: CefrLevel,
    skill: LearningDataSkill
  ): Promise<VocabularyTerm[]> {
    const fits =
      typeof grammarRuleOrCategory === 'string'
        ? [grammarRuleOrCategory]
        : [
            grammarRuleOrCategory.id,
            grammarRuleOrCategory.grammarCategory,
            ...grammarRuleOrCategory.grammarFits,
          ];
    const terms = await VocabularyRepository.getVocabularyByLevel(level);
    return terms.filter(
      (term) =>
        this.validateVocabularyEligibility(term, skill, level) &&
        fits.some((fit) => includesNormalized(term.grammarFits, fit))
    );
  },

  validateVocabularyEligibility(
    term: VocabularyTerm,
    skill: LearningDataSkill,
    level: CefrLevel
  ): boolean {
    return (
      term.status === 'approved' &&
      isCefrAtOrBelow(term.cefrLevel, level) &&
      includesNormalized(term.skillUse, skill)
    );
  },

  async getVocabularyExplanation(termId: string, language: string): Promise<string | null> {
    const term = await VocabularyRepository.getVocabularyTermById(termId);
    if (!term) return null;
    if (language === 'english' || language === 'en') return term.definition;
    if (language === 'turkish' || language === 'tr') {
      return term.turkishMeaning || term.definition;
    }
    return resolveTermMeaningAsync(term.term, term, language);
  },
};
