import type { CefrLevel } from '@/features/level-system';
import {
  includesNormalized,
  isCefrAtOrBelow,
  type LearningDataSkill,
  type UserSkillProfile,
} from '@/features/learning-data';
import { GrammarRepository } from './grammar.repository';
import { GrammarProgressService } from './grammar.progress';
import type { GrammarExplanationLanguage, GrammarRule } from './grammar.types';

export type GrammarTaskMix = 'safe' | 'stretch';

export const sortByCurriculumOrder = (rules: GrammarRule[]): GrammarRule[] =>
  [...rules].sort(
    (a, b) =>
      a.difficulty - b.difficulty ||
      a.prerequisites.length - b.prerequisites.length ||
      a.title.localeCompare(b.title)
  );

const applyTaskMix = (
  rules: GrammarRule[],
  mix?: GrammarTaskMix
): GrammarRule[] => {
  const sorted = sortByCurriculumOrder(rules);
  if (!mix) return sorted;

  const preferred = sorted.filter((rule) => {
    const progress = GrammarProgressService.get(rule.id);
    if (mix === 'safe') {
      return (
        progress.reviewStatus === 'Strong' ||
        (progress.correctUsages > 0 &&
          progress.correctUsages >= progress.incorrectUsages)
      );
    }
    return (
      progress.reviewStatus !== 'Strong' ||
      progress.incorrectUsages > progress.correctUsages
    );
  });

  return preferred.length > 0 ? preferred : sorted;
};

export const GrammarEngine = {
  async selectGrammarForTask(
    skill: LearningDataSkill,
    level: CefrLevel,
    taskType: string,
    domain?: string,
    mix?: GrammarTaskMix
  ): Promise<GrammarRule[]> {
    const rules = await GrammarRepository.getGrammarRulesByLevel(level);
    return applyTaskMix(
      rules.filter(
        (rule) =>
          this.validateGrammarEligibility(rule, skill, level) &&
          includesNormalized(rule.canGenerateTaskTypes, taskType) &&
          (!domain || includesNormalized(rule.domainFit, domain))
      ),
      mix
    );
  },

  selectGrammarForUserProfile(
    profile: UserSkillProfile,
    skill: LearningDataSkill,
    taskType: string,
    domain?: string,
    mix?: GrammarTaskMix
  ): Promise<GrammarRule[]> {
    const level = profile[skill];
    return level
      ? this.selectGrammarForTask(skill, level, taskType, domain, mix)
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
