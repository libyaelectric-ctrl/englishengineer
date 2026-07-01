import type { CefrLevel } from '@/features/level-system';
import {
  includesNormalized,
  isCefrAtOrBelow,
  type LearningDataSkill,
  type UserSkillProfile,
} from '@/features/learning-data';
import { GrammarRepository } from './grammar.repository';
import type { GrammarExplanationLanguage, GrammarRule } from './grammar.types';

export const GrammarEngine = {
  async selectGrammarForTask(
    skill: LearningDataSkill,
    level: CefrLevel,
    taskType: string,
    domain?: string
  ): Promise<GrammarRule[]> {
    const rules = await GrammarRepository.getGrammarRulesByLevel(level);
    return rules.filter(
      (rule) =>
        this.validateGrammarEligibility(rule, skill, level) &&
        includesNormalized(rule.canGenerateTaskTypes, taskType) &&
        (!domain || includesNormalized(rule.domainFit, domain))
    );
  },

  selectGrammarForUserProfile(
    profile: UserSkillProfile,
    skill: LearningDataSkill,
    taskType: string,
    domain?: string
  ): Promise<GrammarRule[]> {
    const level = profile[skill];
    return level
      ? this.selectGrammarForTask(skill, level, taskType, domain)
      : Promise.resolve([]);
  },

  validateGrammarEligibility(
    rule: GrammarRule,
    skill: LearningDataSkill,
    level: CefrLevel
  ): boolean {
    return (
      rule.status === 'approved' &&
      isCefrAtOrBelow(rule.cefrLevel, level) &&
      includesNormalized(rule.skillUse, skill)
    );
  },

  async getGrammarExplanation(
    ruleId: string,
    language: GrammarExplanationLanguage
  ): Promise<string | null> {
    const rule = await GrammarRepository.getGrammarRuleById(ruleId);
    if (!rule) return null;
    return language === 'turkish'
      ? rule.turkishExplanation
      : `${rule.title}: ${rule.explanation}`;
  },
};
