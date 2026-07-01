import type { GrammarRule } from '@/features/grammar';
import type { CefrLevel } from '@/features/level-system';
import {
  includesNormalized,
  isCefrAtOrBelow,
  type LearningDataSkill,
} from '@/features/learning-data';
import { VocabularyRepository } from './vocabulary.repository';
import type { VocabularyTerm } from './vocabulary.types';

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
        (!contentDomain ||
          term.contentDomain.toLowerCase() === contentDomain.toLowerCase()) &&
        (!lifeContext ||
          term.lifeContext.toLowerCase() === lifeContext.toLowerCase())
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

  async getVocabularyExplanation(
    termId: string,
    language: 'english' | 'turkish'
  ): Promise<string | null> {
    const term = await VocabularyRepository.getVocabularyTermById(termId);
    if (!term) return null;
    return language === 'turkish' ? term.turkishMeaning : term.definition;
  },
};
