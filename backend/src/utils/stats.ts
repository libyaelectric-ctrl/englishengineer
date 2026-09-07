export interface CategoryStats {
  count: number;
  avgScore: number;
}

export interface PerformanceStats {
  total: number;
  correct: number;
  incorrect: number;
  new: number;
  learning: number;
  learned: number;
  mastered: number;
  struggling: number;
}

export interface ScoredItem {
  score: number;
  category: string;
}

export interface PromptItem {
  id: string;
  category?: string;
}

/**
 * Aggregate scores by category from items that have {score, category} directly.
 * Used by reading, listening routes.
 */
export function aggregateByCategory<T extends ScoredItem>(
  items: T[]
): Record<string, CategoryStats> {
  const catMap = new Map<string, number[]>();
  for (const item of items) {
    if (!catMap.has(item.category)) catMap.set(item.category, []);
    catMap.get(item.category)!.push(item.score);
  }

  const result: Record<string, CategoryStats> = {};
  for (const [cat, scores] of catMap) {
    result[cat] = {
      count: scores.length,
      avgScore: round1(scores.reduce((a, b) => a + b, 0) / scores.length),
    };
  }
  return result;
}

/**
 * Aggregate scores by category from submissions that reference prompts.
 * Used by writing, speaking routes.
 */
export function aggregateByPromptCategory(
  submissions: Array<{ promptId: string; [key: string]: unknown }>,
  prompts: PromptItem[],
  scoreKey: string
): Record<string, CategoryStats> {
  const promptMap = new Map(prompts.map((p) => [p.id, p.category ?? 'general']));
  const catMap = new Map<string, number[]>();

  for (const sub of submissions) {
    const cat = promptMap.get(sub.promptId) ?? 'general';
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(Number(sub[scoreKey]));
  }

  const result: Record<string, CategoryStats> = {};
  for (const [cat, scores] of catMap) {
    result[cat] = {
      count: scores.length,
      avgScore: round1(scores.reduce((a, b) => a + b, 0) / scores.length),
    };
  }
  return result;
}

/**
 * Calculate performance categories from items with {result: 'correct' | 'incorrect'} grouped by ID.
 * Used by grammar, vocabulary stats.
 */
export function categorizePerformance<T extends { result: 'correct' | 'incorrect' }>(
  records: T[],
  idKey: keyof T
): PerformanceStats {
  const total = records.length;
  const correctCount = records.filter((r) => r.result === 'correct').length;
  const incorrectCount = total - correctCount;

  const idMap = new Map<string, { correct: number; incorrect: number }>();
  for (const r of records) {
    const key = String(r[idKey]);
    if (!idMap.has(key)) idMap.set(key, { correct: 0, incorrect: 0 });
    const entry = idMap.get(key)!;
    if (r.result === 'correct') entry.correct++;
    else entry.incorrect++;
  }

  let newCount = 0;
  let learning = 0;
  let learned = 0;
  let mastered = 0;
  let struggling = 0;

  for (const [, stats] of idMap) {
    const totalAttempts = stats.correct + stats.incorrect;
    if (totalAttempts === 1 && stats.correct === 1) {
      newCount++;
    } else if (totalAttempts <= 3 && stats.correct >= 1) {
      learning++;
    } else if (stats.correct / totalAttempts >= 0.8) {
      mastered++;
    } else if (stats.correct / totalAttempts >= 0.5) {
      learned++;
    } else {
      struggling++;
    }
  }

  return {
    total,
    correct: correctCount,
    incorrect: incorrectCount,
    new: newCount,
    learning,
    learned,
    mastered,
    struggling,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return round1(scores.reduce((a, b) => a + b, 0) / scores.length);
}