import { storage } from '@/shared/storage';

export type ErrorCategory =
  | 'tense'
  | 'preposition'
  | 'article'
  | 'subject-verb-agreement'
  | 'word-order'
  | 'pronoun'
  | 'plural'
  | 'comparison'
  | 'conditionals'
  | 'passive-voice'
  | 'other';

export interface ErrorPatternEntry {
  ruleId: string;
  category: ErrorCategory;
  count: number;
  lastOccurred: string;
  exampleSentence?: string;
}

export interface ErrorPatternSummary {
  totalErrors: number;
  byCategory: Record<ErrorCategory, number>;
  weakestCategory: ErrorCategory | null;
  topCategories: Array<{ category: ErrorCategory; count: number; percentage: number }>;
  recommendations: string[];
}

const STORAGE_KEY = 'EngVox_grammar_error_patterns';

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  'tense': 'Tense Usage',
  'preposition': 'Prepositions',
  'article': 'Articles (a/an/the)',
  'subject-verb-agreement': 'Subject-Verb Agreement',
  'word-order': 'Word Order',
  'pronoun': 'Pronouns',
  'plural': 'Plurals',
  'comparison': 'Comparisons',
  'conditionals': 'Conditionals',
  'passive-voice': 'Passive Voice',
  'other': 'Other',
};

const RECOMMENDATIONS: Record<ErrorCategory, string> = {
  'tense': 'Review present/past/future tense forms. Practice timeline exercises.',
  'preposition': 'Focus on common preposition combinations. Read English texts actively.',
  'article': 'Practice a/an/the usage rules. Pay attention to countable/uncountable nouns.',
  'subject-verb-agreement': 'Review singular/plural verb forms. Check subject before verb.',
  'word-order': 'Practice basic SVO structure. Review adverb placement rules.',
  'pronoun': 'Review pronoun-antecedent agreement. Practice relative pronouns.',
  'plural': 'Review regular/irregular plural forms. Practice countable noun rules.',
  'comparison': 'Review comparative/superlative forms. Practice than/as...as structures.',
  'conditionals': 'Review zero/first/second/third conditional forms and their meanings.',
  'passive-voice': 'Review passive form (be + past participle). Practice active-passive conversion.',
  'other': 'Continue practicing grammar rules systematically.',
};

const normalize = (id: string): string =>
  id.toLowerCase().replace(/[^a-z0-9]/g, '');

const CATEGORY_PATTERNS: Array<[RegExp, ErrorCategory]> = [
  [/tense|past|present|future|perfect|progressive/, 'tense'],
  [/preposition|at|in|on|by|with|from/, 'preposition'],
  [/article|a\b|an\b|the\b/, 'article'],
  [/subject.*verb|agreement|singular|plural.*verb/, 'subject-verb-agreement'],
  [/word.?order|adverb|adjective.*order/, 'word-order'],
  [/pronoun|relative|who|which|that/, 'pronoun'],
  [/plural|irregular.*plural/, 'plural'],
  [/compar|superlat|more|most/, 'comparison'],
  [/conditional|if.*clause|type.*[123]/, 'conditionals'],
  [/passive|be.*past.*participle/, 'passive-voice'],
];

const categorizeRule = (ruleId: string, ruleTitle: string): ErrorCategory => {
  const combined = `${ruleId} ${ruleTitle}`.toLowerCase();
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(combined)) return category;
  }
  return 'other';
};

export const ErrorPatternAnalyzer = {
  getPatterns(): Record<string, ErrorPatternEntry> {
    return storage.get<Record<string, ErrorPatternEntry>>(STORAGE_KEY) ?? {};
  },

  savePatterns(patterns: Record<string, ErrorPatternEntry>): void {
    storage.set(STORAGE_KEY, patterns);
  },

  recordError(
    ruleId: string,
    ruleTitle: string,
    exampleSentence?: string,
    now = new Date()
  ): void {
    const patterns = this.getPatterns();
    const category = categorizeRule(ruleId, ruleTitle);
    const key = `${normalize(ruleId)}_${category}`;

    const existing = patterns[key];
    patterns[key] = {
      ruleId,
      category,
      count: (existing?.count ?? 0) + 1,
      lastOccurred: now.toISOString(),
      exampleSentence: exampleSentence ?? existing?.exampleSentence,
    };

    this.savePatterns(patterns);
  },

  getSummary(): ErrorPatternSummary {
    const patterns = this.getPatterns();
    const entries = Object.values(patterns);
    const totalErrors = entries.reduce((sum, e) => sum + e.count, 0);

    const byCategory = {} as Record<ErrorCategory, number>;
    (Object.keys(CATEGORY_LABELS) as ErrorCategory[]).forEach((cat) => {
      byCategory[cat] = entries
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.count, 0);
    });

    const topCategories = Object.entries(byCategory)
      .map(([category, count]) => ({
        category: category as ErrorCategory,
        count,
        percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .filter((c) => c.count > 0);

    const weakestCategory = topCategories[0]?.category ?? null;
    const recommendations = topCategories
      .slice(0, 3)
      .map((c) => RECOMMENDATIONS[c.category]);

    return { totalErrors, byCategory, weakestCategory, topCategories, recommendations };
  },

  getWeakAreasForPool(): string[] {
    const summary = this.getSummary();
    return summary.topCategories
      .filter((c) => c.percentage >= 10)
      .map((c) => c.category);
  },

  getCategoryLabel(category: ErrorCategory): string {
    return CATEGORY_LABELS[category];
  },

  reset(): void {
    storage.remove(STORAGE_KEY);
  },
};
