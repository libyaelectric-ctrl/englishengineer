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

export function aggregateByCategory<T extends ScoredItem>(
  items: readonly T[]
): Record<string, CategoryStats> {
  const categories = new Map<string, number[]>();
  for (const item of items) {
    const scores = categories.get(item.category) ?? [];
    scores.push(item.score);
    categories.set(item.category, scores);
  }
  return summarizeCategories(categories);
}

export function aggregateByPromptCategory<
  T extends { promptId: string },
  K extends keyof T,
>(
  submissions: readonly T[],
  prompts: readonly PromptItem[],
  scoreKey: K
): Record<string, CategoryStats> {
  const promptMap = new Map(prompts.map((prompt) => [prompt.id, prompt.category ?? 'general']));
  const categories = new Map<string, number[]>();

  for (const submission of submissions) {
    const rawScore = submission[scoreKey];
    if (typeof rawScore !== 'number' || !Number.isFinite(rawScore)) continue;
    const category = promptMap.get(submission.promptId) ?? 'general';
    const scores = categories.get(category) ?? [];
    scores.push(rawScore);
    categories.set(category, scores);
  }

  return summarizeCategories(categories);
}

export function categorizePerformance<T extends { result: 'correct' | 'incorrect' }>(
  records: readonly T[],
  idKey: keyof T
): PerformanceStats {
  const total = records.length;
  const correct = records.filter((record) => record.result === 'correct').length;
  const attempts = new Map<string, { correct: number; incorrect: number }>();

  for (const record of records) {
    const key = String(record[idKey]);
    const current = attempts.get(key) ?? { correct: 0, incorrect: 0 };
    current[record.result] += 1;
    attempts.set(key, current);
  }

  const result: PerformanceStats = {
    total,
    correct,
    incorrect: total - correct,
    new: 0,
    learning: 0,
    learned: 0,
    mastered: 0,
    struggling: 0,
  };

  for (const stats of attempts.values()) {
    const totalAttempts = stats.correct + stats.incorrect;
    if (totalAttempts === 1 && stats.correct === 1) result.new += 1;
    else if (totalAttempts <= 3 && stats.correct >= 1) result.learning += 1;
    else if (stats.correct / totalAttempts >= 0.8) result.mastered += 1;
    else if (stats.correct / totalAttempts >= 0.5) result.learned += 1;
    else result.struggling += 1;
  }

  return result;
}

const summarizeCategories = (
  categories: ReadonlyMap<string, readonly number[]>
): Record<string, CategoryStats> => {
  const result: Record<string, CategoryStats> = {};
  for (const [category, scores] of categories) {
    result[category] = {
      count: scores.length,
      avgScore: round1(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    };
  }
  return result;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

export function averageScore(scores: readonly number[]): number {
  if (scores.length === 0) return 0;
  return round1(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}
