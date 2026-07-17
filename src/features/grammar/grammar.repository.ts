import { loadGrammarRulesByLevel } from '@/data/grammar';
import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { CefrLevel } from '@/features/level-system/level-system.types';
import {
  extractCefrFromId,
  getLevelsThrough,
  includesNormalized,
} from '@/core/learning/spaced-repetition.helpers';
import type { LearningDataSkill } from '@/core/learning/spaced-repetition.types';
import { assertGrammarRules } from './grammar.schema';
import type { GrammarRule } from './grammar.types';

const levelCache = new Map<CefrLevel, GrammarRule[]>();

const loadLevel = async (level: CefrLevel): Promise<GrammarRule[]> => {
  const cached = levelCache.get(level);
  if (cached) return cached;
  const rules = assertGrammarRules(await loadGrammarRulesByLevel(level));
  levelCache.set(level, rules);
  return rules;
};

const loadAll = async (): Promise<GrammarRule[]> =>
  (await Promise.all(CEFR_LEVELS.map(loadLevel))).flat();

const levelOrder: Record<CefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const containsText = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.trim().toLowerCase());

export const GrammarRepository = {
  async getAllRulesSorted(): Promise<GrammarRule[]> {
    const all = await loadAll();
    return [...all].sort((a, b) => {
      const aVal = levelOrder[a.cefrLevel] || 0;
      const bVal = levelOrder[b.cefrLevel] || 0;
      if (aVal !== bVal) return aVal - bVal;
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      return a.title.localeCompare(b.title);
    });
  },

  async getGrammarRuleById(id: string): Promise<GrammarRule | undefined> {
    const level = extractCefrFromId(id);
    const rules = level ? await loadLevel(level) : await loadAll();
    return rules.find((rule) => rule.id === id);
  },

  getGrammarRulesByLevel(level: CefrLevel): Promise<GrammarRule[]> {
    return loadLevel(level);
  },

  async getGrammarRulesBySkill(
    skill: LearningDataSkill
  ): Promise<GrammarRule[]> {
    return (await loadAll()).filter((rule) =>
      includesNormalized(rule.skillUse, skill)
    );
  },

  async getGrammarRulesByTaskType(taskType: string): Promise<GrammarRule[]> {
    return (await loadAll()).filter((rule) =>
      includesNormalized(rule.canGenerateTaskTypes, taskType)
    );
  },

  async getGrammarRulesByCategory(category: string): Promise<GrammarRule[]> {
    return (await loadAll()).filter(
      (rule) => rule.grammarCategory.toLowerCase() === category.toLowerCase()
    );
  },

  async getGrammarRulesByDomain(domain: string): Promise<GrammarRule[]> {
    return (await loadAll()).filter((rule) =>
      includesNormalized(rule.domainFit, domain)
    );
  },

  async getGrammarRulesForUserSkillLevel(
    skill: LearningDataSkill,
    level: CefrLevel
  ): Promise<GrammarRule[]> {
    const rules = (
      await Promise.all(getLevelsThrough(level).map(loadLevel))
    ).flat();
    return rules.filter((rule) => includesNormalized(rule.skillUse, skill));
  },

  async searchGrammarRules(query: string): Promise<GrammarRule[]> {
    if (!query.trim()) return [];
    return (await loadAll()).filter(
      (rule) =>
        containsText(rule.title, query) ||
        containsText(rule.structure, query) ||
        containsText(rule.turkishExplanation, query) ||
        containsText(rule.engineeringUseCase, query)
    );
  },

  clearCache(): void {
    levelCache.clear();
  },
};
