import { loadVocabularyByLevel } from '@/data/vocabulary';
import { CEFR_LEVELS } from '@/features/level-system/level-system.types';
import type { CefrLevel } from '@/features/level-system/level-system.types';
import {
  extractCefrFromId,
  getLevelsThrough,
  includesNormalized,
  type LearningDataSkill,
} from '@/core/learning';
import { assertVocabularyTerms } from '../types/vocabulary.schema';
import type { VocabularyTerm } from '../types/vocabulary.types';

const levelCache = new Map<CefrLevel, VocabularyTerm[]>();
const pendingLevelLoads = new Map<CefrLevel, Promise<VocabularyTerm[]>>();
const VOCABULARY_LEVEL_COUNTS: Record<CefrLevel, number> = {
  A1: 263,
  A2: 667,
  B1: 1651,
  B2: 1847,
  C1: 507,
  C2: 65,
};

const loadLevel = async (level: CefrLevel): Promise<VocabularyTerm[]> => {
  const cached = levelCache.get(level);
  if (cached) return cached;
  const pending = pendingLevelLoads.get(level);
  if (pending) return pending;

  const load = loadVocabularyByLevel(level)
    .then(assertVocabularyTerms)
    .then((terms) => {
      levelCache.set(level, terms);
      return terms;
    })
    .finally(() => pendingLevelLoads.delete(level));
  pendingLevelLoads.set(level, load);
  return load;
};

const loadAll = async (): Promise<VocabularyTerm[]> =>
  (await Promise.all(CEFR_LEVELS.map(loadLevel))).flat();

export const VocabularyRepository = {
  getVocabularyTotalCount(): number {
    return CEFR_LEVELS.reduce(
      (total, level) => total + VOCABULARY_LEVEL_COUNTS[level],
      0
    );
  },

  async getVocabularyTermById(id: string): Promise<VocabularyTerm | undefined> {
    const level = extractCefrFromId(id);
    const terms = level ? await loadLevel(level) : await loadAll();
    return terms.find((term) => term.id === id);
  },

  getVocabularyByLevel(level: CefrLevel): Promise<VocabularyTerm[]> {
    return loadLevel(level);
  },

  async getVocabularyBySkill(
    skill: LearningDataSkill
  ): Promise<VocabularyTerm[]> {
    return (await loadAll()).filter((term) =>
      includesNormalized(term.skillUse, skill)
    );
  },

  async getVocabularyByDomain(domain: string): Promise<VocabularyTerm[]> {
    return (await loadAll()).filter(
      (term) => term.domain.toLowerCase() === domain.toLowerCase()
    );
  },

  async getVocabularyByContentDomain(
    contentDomain: string
  ): Promise<VocabularyTerm[]> {
    return (await loadAll()).filter(
      (term) => term.contentDomain.toLowerCase() === contentDomain.toLowerCase()
    );
  },

  async getVocabularyByLifeContext(
    lifeContext: string
  ): Promise<VocabularyTerm[]> {
    return (await loadAll()).filter(
      (term) => term.lifeContext.toLowerCase() === lifeContext.toLowerCase()
    );
  },

  async getVocabularyByPartOfSpeech(
    partOfSpeech: string
  ): Promise<VocabularyTerm[]> {
    return (await loadAll()).filter(
      (term) => term.partOfSpeech.toLowerCase() === partOfSpeech.toLowerCase()
    );
  },

  async getVocabularyByGrammarFit(
    grammarCategoryOrRule: string
  ): Promise<VocabularyTerm[]> {
    return (await loadAll()).filter((term) =>
      includesNormalized(term.grammarFits, grammarCategoryOrRule)
    );
  },

  async getVocabularyForUserSkillLevel(
    skill: LearningDataSkill,
    level: CefrLevel
  ): Promise<VocabularyTerm[]> {
    const terms = (
      await Promise.all(getLevelsThrough(level).map(loadLevel))
    ).flat();
    return terms.filter((term) => includesNormalized(term.skillUse, skill));
  },

  async searchVocabulary(query: string): Promise<VocabularyTerm[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return (await loadAll()).filter(
      (term) =>
        term.normalizedTerm.includes(normalizedQuery) ||
        term.turkishMeaning.toLowerCase().includes(normalizedQuery) ||
        term.definition.toLowerCase().includes(normalizedQuery)
    );
  },

  clearCache(): void {
    levelCache.clear();
    pendingLevelLoads.clear();
  },
};
