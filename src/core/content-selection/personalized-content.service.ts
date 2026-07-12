import { ReadingMission } from '@/features/reading';
import { WritingMission } from '@/features/writing';

interface KnowledgePoolEntry {
  content_type: string;
  content_id: string;
}

export function scoreContentByPoolRatio(
  content: ReadingMission | WritingMission,
  pool: KnowledgePoolEntry[],
  targetRatio: number = 0.75
): { score: number; actualRatio: number } {
  const contentWords = (content as ReadingMission).vocabulary?.map(v => v.term) ?? 
                       (content as WritingMission).targetVocabulary ?? [];
  const knownCount = contentWords.filter(w => pool.some(p => p.content_id === w)).length;
  const actualRatio = contentWords.length > 0 ? knownCount / contentWords.length : 0;
  const score = 1 - Math.abs(actualRatio - targetRatio);
  return { score, actualRatio };
}