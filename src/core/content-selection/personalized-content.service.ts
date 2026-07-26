import type { ReadingMission } from '@/features/reading/reading.types';
import type { WritingMission } from '@/features/writing/writing.types';

export interface KnowledgePoolEntry {
  content_type: string;
  content_id: string;
}

export function scoreContentByPoolRatio(
  content: ReadingMission | WritingMission,
  pool: KnowledgePoolEntry[],
  targetRatio: number = 0.75
): { score: number; actualRatio: number } {
  const contentWords =
    (content as ReadingMission).vocabulary?.map((v) => v.term) ??
    (content as WritingMission).targetVocabulary ??
    [];
  const normalizedPool = new Set(
    pool.map((item) => item.content_id.trim().toLowerCase())
  );
  const knownCount = contentWords.filter((word) =>
    normalizedPool.has(word.trim().toLowerCase())
  ).length;
  const actualRatio =
    contentWords.length > 0 ? knownCount / contentWords.length : 0;
  const score = 1 - Math.abs(actualRatio - targetRatio);
  return { score, actualRatio };
}

export function sortContentByPoolRatio<
  T extends ReadingMission | WritingMission,
>(content: T[], pool: KnowledgePoolEntry[], targetRatio = 0.75): T[] {
  if (pool.length === 0) return content;
  return [...content].sort((a, b) => {
    const scoreA = scoreContentByPoolRatio(a, pool, targetRatio).score;
    const scoreB = scoreContentByPoolRatio(b, pool, targetRatio).score;
    return scoreB - scoreA;
  });
}
