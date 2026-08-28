import type {
  EngineeringDiscipline,
  VocabularyDomain,
} from '@/shared/constants/engineering-disciplines';
import { VocabularyRepository } from '@/shared/services/vocabulary.repository';
import type { CefrLevel } from '@/shared/types/domain.types';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import type { LearningPath, PathLevel, PathLevelStatus, PathStage } from './learning-path.types';

export const TERMS_PER_LEVEL = 12;
const COMPLETION_RATIO = 0.8;

const CEFR_ORDER: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const XP_BY_BAND: Record<CefrLevel, number> = {
  A1: 30,
  A2: 45,
  B1: 60,
  B2: 75,
  C1: 90,
  C2: 120,
};

/** Neutral stage colors (band identity); discipline palette supplies accents in the UI. */
const BAND_COLORS: Record<CefrLevel, string> = {
  A1: '#5B8DB8',
  A2: '#4A7FA8',
  B1: '#3D6F96',
  B2: '#305F84',
  C1: '#244E72',
  C2: '#183D60',
};

const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/** Deterministic shuffle (seeded) so a band's term order is stable within a build. */
const seededShuffle = <T>(items: T[], seed: number): T[] => {
  const copy = [...items];
  let state = seed || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Resolved content domains for a discipline — mirrors LearningProfileEngine.getDisciplineDomains. */
export function getDisciplineDomains(discipline: EngineeringDiscipline): VocabularyDomain[] {
  return ['general', 'engineering', discipline];
}

/** Build version: one per day, so term rotation shifts on each new day. */
export function getBuildVersion(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export interface BuildLearningPathOptions {
  masteredTermIds?: string[];
  termsPerLevel?: number;
  buildVersion?: string;
  /** Current CEFR band (e.g. from the user's vocabulary skill) to flag the active stage. */
  currentBand?: string;
}

const stageUnlocked = (stages: PathStage[], stageIndex: number): boolean => {
  if (stageIndex === 0) return true;
  const previous = stages[stageIndex - 1];
  return previous.levels.some((level) => level.masteryRatio >= COMPLETION_RATIO);
};

const applyStatuses = (stages: PathStage[]): void => {
  stages.forEach((stage, stageIndex) => {
    const unlocked = stageUnlocked(stages, stageIndex);
    stage.levels.forEach((level: PathLevel) => {
      if (level.termCount === 0) {
        level.status = 'locked';
        return;
      }
      if (level.masteryRatio >= COMPLETION_RATIO) {
        level.status = 'completed';
      } else if (level.masteryRatio > 0) {
        level.status = 'in-progress';
      } else {
        level.status = (unlocked ? 'available' : 'locked') as PathLevelStatus;
      }
    });
  });
};

/**
 * Builds the real-data learning path for a discipline.
 *
 * Content comes exclusively from VocabularyRepository: terms are fetched for
 * the discipline's content domains, grouped by CEFR band, deterministically
 * shuffled per build version (daily rotation), and chunked into levels.
 */
export async function buildLearningPath(
  discipline: EngineeringDiscipline,
  options: BuildLearningPathOptions = {}
): Promise<LearningPath> {
  const termsPerLevel = options.termsPerLevel ?? TERMS_PER_LEVEL;
  const domains = getDisciplineDomains(discipline);
  const mastered = new Set(options.masteredTermIds ?? []);
  const buildVersion = options.buildVersion ?? getBuildVersion();
  const bandSeed = hashString(`${discipline}:${buildVersion}`);
  const currentBand = (options.currentBand ?? '').replace('+', '') as CefrLevel;

  const allTerms = await VocabularyRepository.getVocabularyByDomains(domains);

  const stages: PathStage[] = CEFR_ORDER.map((cefrLevel, stageIndex) => {
    const bandTerms = allTerms.filter((term) => term.cefrLevel === cefrLevel);
    const ordered = seededShuffle(bandTerms, bandSeed + stageIndex);
    const levels: PathLevel[] = [];

    for (let offset = 0; offset < ordered.length; offset += termsPerLevel) {
      const chunk = ordered.slice(offset, offset + termsPerLevel);
      const termIds = chunk.map((term) => term.id);
      const masteredCount = termIds.filter((id) => mastered.has(id)).length;
      const index = Math.floor(offset / termsPerLevel);
      levels.push({
        id: `path-${discipline}-${cefrLevel.toLowerCase()}-${index}`,
        stageIndex,
        index,
        cefrLevel,
        domain: discipline,
        termIds,
        termCount: termIds.length,
        masteryRatio: termIds.length > 0 ? masteredCount / termIds.length : 0,
        status: 'available',
        xpReward: XP_BY_BAND[cefrLevel],
      });
    }

    return {
      id: `stage-${cefrLevel.toLowerCase()}`,
      cefrLevel,
      titleKey: `learningpath.band.${cefrLevel.toLowerCase()}`,
      color: BAND_COLORS[cefrLevel],
      levels,
      totalTerms: bandTerms.length,
      masteredTerms: bandTerms.filter((term) => mastered.has(term.id)).length,
      isCurrent: cefrLevel === currentBand,
    };
  });

  applyStatuses(stages);

  return {
    discipline,
    domains,
    buildVersion,
    stages,
    totalLevels: stages.reduce((count, stage) => count + stage.levels.length, 0),
    totalTerms: allTerms.length,
    masteredTerms: mastered.size,
  };
}

/** Resolves a level's real term objects from the corpus. Uses termIds from the level to avoid re-fetching all vocabulary. */
export async function getPathLevelTerms(
  path: LearningPath,
  levelId: string
): Promise<VocabularyTerm[]> {
  let level: PathLevel | undefined;
  for (const stage of path.stages) {
    level = stage.levels.find((candidate) => candidate.id === levelId);
    if (level) break;
  }
  if (!level) return [];

  // Use the already-fetched vocabulary from buildLearningPath by fetching with the same domains
  const terms = await VocabularyRepository.getVocabularyByDomains(path.domains);
  const byId = new Map(terms.map((term) => [term.id, term]));
  return level.termIds
    .map((id) => byId.get(id))
    .filter((term): term is VocabularyTerm => Boolean(term));
}

/** Stable default for users without a persisted discipline. */
export function resolveDefaultDiscipline(
  discipline?: EngineeringDiscipline
): EngineeringDiscipline {
  return discipline ?? 'electrical';
}
