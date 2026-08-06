import { type LearningDataSkill, includesNormalized, isCefrAtOrBelow } from '@/core/learning';

import { VocabularyRepository } from '@/shared/services/vocabulary.repository';
import { resolveTermMeaningAsync } from '@/shared/services/vocabulary-translation.service';
import type { CefrLevel } from '@/shared/types/domain.types';
import type { GrammarRule } from '@/shared/types/grammar.types';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

export const VocabularyEngine = {
  async selectVocabularyForTask(
    skill: LearningDataSkill,
    level: CefrLevel,
    domain?: string,
    contentDomain?: string,
    lifeContext?: string,
    domains?: string[]
  ): Promise<VocabularyTerm[]> {
    const terms = await VocabularyRepository.getVocabularyByLevel(level);
    const activeDomains = domains && domains.length > 0 ? domains : domain ? [domain] : undefined;
    return terms.filter(
      (term) =>
        this.validateVocabularyEligibility(term, skill, level) &&
        (!activeDomains ||
          activeDomains.some((d) => term.domain.toLowerCase() === d.toLowerCase())) &&
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