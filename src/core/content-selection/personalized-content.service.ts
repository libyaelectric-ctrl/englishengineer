import { FEATURE_FLAGS } from '@/shared/feature-flags';

import type { GrammarRule } from '@/shared/types/grammar.types';
import type { ReadingMission } from '@/shared/types/reading.types';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';
import type { WritingMission } from '@/shared/types/writing.types';

export interface KnowledgePoolEntry {
  content_type: string;
  content_id: string;
}

/** Extract vocabulary words from any content type */
function extractVocabularyWords(
  content: ReadingMission | WritingMission | VocabularyTerm | GrammarRule
): string[] {
  if ('vocabulary' in content && Array.isArray(content.vocabulary)) {
    return content.vocabulary.map((v) => v.term);
  }
  if ('targetVocabulary' in content && Array.isArray(content.targetVocabulary)) {
    return content.targetVocabulary;
  }
  if ('term' in content && typeof content.term === 'string') {
    return [content.term];
  }
  if ('structure' in content && typeof content.structure === 'string') {
    // Grammar rules: use structure as a proxy for vocabulary matching
    return content.structure.split(/\s+/).filter((w) => w.length > 3);
  }
  return [];
}

function scoreContentByPoolRatio(
  content: ReadingMission | WritingMission | VocabularyTerm | GrammarRule,
  pool: KnowledgePoolEntry[],
  targetRatio: number = 0.75
): { score: number; actualRatio: number } {
  const contentWords = extractVocabularyWords(content);
  const normalizedPool = new Set(pool.map((item) => item.content_id.trim().toLowerCase()));
  const knownCount = contentWords.filter((word) =>
    normalizedPool.has(word.trim().toLowerCase())
  ).length;
  const actualRatio = contentWords.length > 0 ? knownCount / contentWords.length : 0;
  const score = 1 - Math.abs(actualRatio - targetRatio);
  return { score, actualRatio };
}

export function sortContentByPoolRatio<
  T extends ReadingMission | WritingMission | VocabularyTerm | GrammarRule
>(content: T[], pool: KnowledgePoolEntry[], targetRatio = 0.75): T[] {
  if (pool.length === 0 || !FEATURE_FLAGS.UNIFIED_DIFFICULTY_SCORING) return content;
  return [...content].sort((a, b) => {
    const scoreA = scoreContentByPoolRatio(a, pool, targetRatio).score;
    const scoreB = scoreContentByPoolRatio(b, pool, targetRatio).score;
    return scoreB - scoreA;
  });
}
