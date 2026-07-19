import type { GrammarRuleProgress } from './grammar.progress';
import type { ErrorCategory } from './grammar.error-patterns';

export interface GrammarDashboardData {
  overallProgress: {
    total: number;
    mastered: number;
    learning: number;
    due: number;
    newRules: number;
    masteryPercentage: number;
  };
  categoryBreakdown: Array<{
    category: string;
    total: number;
    mastered: number;
    learning: number;
    strength: number;
  }>;
  errorPatternSummary: {
    totalErrors: number;
    topCategories: Array<{ category: ErrorCategory; count: number; percentage: number }>;
  };
  weeklyActivity: Array<{
    date: string;
    exposures: number;
    correct: number;
    incorrect: number;
  }>;
  recommendations: string[];
  transferEvidence: {
    readingComplete: number;
    writingComplete: number;
    total: number;
  };
}

const CATEGORY_MAP: Record<string, string> = {
  'tense': 'Tenses',
  'conditionals': 'Conditionals',
  'passive': 'Passive Voice',
  'articles': 'Articles',
  'prepositions': 'Prepositions',
  'comparisons': 'Comparisons',
  'relative': 'Relative Clauses',
  'modals': 'Modal Verbs',
  'gerunds': 'Gerunds & Infinitives',
  'other': 'Other',
};

export const GrammarDashboardService = {
  buildDashboard(
    allProgress: Record<string, GrammarRuleProgress>,
    errorSummary: { totalErrors: number; topCategories: Array<{ category: ErrorCategory; count: number; percentage: number }> },
    getRuleCategory: (ruleId: string) => string
  ): GrammarDashboardData {
    const values = Object.values(allProgress);

    const mastered = values.filter((p) => p.reviewStatus === 'Strong').length;
    const learning = values.filter((p) => p.reviewStatus === 'Learning').length;
    const due = values.filter((p) => p.reviewStatus === 'Due').length;
    const newRules = values.filter((p) => p.reviewStatus === 'New').length;

    const categoryMap = new Map<string, GrammarRuleProgress[]>();
    values.forEach((p) => {
      const cat = CATEGORY_MAP[getRuleCategory(p.ruleId)] ?? 'Other';
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(p);
    });

    const categoryBreakdown = [...categoryMap.entries()].map(([category, rules]) => ({
      category,
      total: rules.length,
      mastered: rules.filter((r) => r.reviewStatus === 'Strong').length,
      learning: rules.filter((r) => r.reviewStatus === 'Learning').length,
      strength: Math.round(rules.reduce((sum, r) => sum + r.strength, 0) / rules.length),
    }));

    const readingEvidence = values.filter(
      (p) => p.skillEvidence.reading && p.skillEvidence.reading.score >= 80
    ).length;
    const writingEvidence = values.filter(
      (p) => p.skillEvidence.writing && p.skillEvidence.writing.score >= 80
    ).length;

    const recommendations = this.generateRecommendations(
      categoryBreakdown,
      errorSummary.topCategories,
      mastered,
      values.length
    );

    return {
      overallProgress: {
        total: values.length,
        mastered,
        learning,
        due,
        newRules,
        masteryPercentage: values.length > 0 ? Math.round((mastered / values.length) * 100) : 0,
      },
      categoryBreakdown,
      errorPatternSummary: errorSummary,
      weeklyActivity: [],
      recommendations,
      transferEvidence: {
        readingComplete: readingEvidence,
        writingComplete: writingEvidence,
        total: values.length,
      },
    };
  },

  generateRecommendations(
    categoryBreakdown: Array<{ category: string; strength: number }>,
    topErrorCategories: Array<{ category: ErrorCategory; percentage: number }>,
    mastered: number,
    total: number
  ): string[] {
    const recs: string[] = [];

    const weakCategories = categoryBreakdown
      .filter((c) => c.strength < 50)
      .sort((a, b) => a.strength - b.strength);

    if (weakCategories.length > 0) {
      recs.push(`Focus on weak areas: ${weakCategories.map((c) => c.category).join(', ')}.`);
    }

    if (topErrorCategories.length > 0) {
      const top = topErrorCategories[0];
      recs.push(`Most errors in ${top.category} (${top.percentage}%). Review related rules.`);
    }

    if (mastered === 0 && total > 0) {
      recs.push('Start with basic rules to build a strong foundation.');
    } else if (mastered / total > 0.8) {
      recs.push('Excellent progress! Focus on transfer evidence for remaining rules.');
    }

    if (recs.length === 0) {
      recs.push('Continue practicing to maintain your grammar skills.');
    }

    return recs;
  },

  getCategoryStrengthColor(strength: number): string {
    if (strength >= 80) return '#22c55e';
    if (strength >= 60) return '#84cc16';
    if (strength >= 40) return '#eab308';
    if (strength >= 20) return '#f97316';
    return '#ef4444';
  },
};
