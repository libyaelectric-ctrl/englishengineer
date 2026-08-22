/**
 * Learning Analytics API
 *
 * Analyzes user learning patterns to identify strengths and weaknesses.
 * Provides insights for AI coaching and personalized recommendations.
 */
import { logger } from './logger.js';

interface LearningEvent {
  userId: string;
  module: string;
  score: number;
  durationMs: number;
  timestamp: number;
  cefrLevel?: string;
  mistakes?: string[];
}

interface SkillAnalysis {
  skill: string;
  totalAttempts: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

interface LearningInsights {
  userId: string;
  overallScore: number;
  studyStreak: number;
  totalStudyMinutes: number;
  skillBreakdown: SkillAnalysis[];
  recommendedFocus: string[];
  recentMistakes: Array<{ module: string; mistake: string; count: number }>;
  optimalStudyTime: string;
  paceAnalysis: 'fast' | 'moderate' | 'slow';
}

// In-memory store for demo; production would use Supabase
const learningEvents: LearningEvent[] = [];

/**
 * Record a learning event for analytics.
 */
export const recordLearningEvent = (event: LearningEvent): void => {
  learningEvents.push(event);

  // Prune old events (keep last 90 days)
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const idx = learningEvents.findIndex((e) => e.timestamp >= cutoff);
  if (idx > 0) learningEvents.splice(0, idx);
};

/**
 * Analyze learning patterns for a user.
 */
export const analyzeLearningPatterns = (userId: string): LearningInsights => {
  const userEvents = learningEvents.filter((e) => e.userId === userId);

  if (userEvents.length === 0) {
    return {
      userId,
      overallScore: 0,
      studyStreak: 0,
      totalStudyMinutes: 0,
      skillBreakdown: [],
      recommendedFocus: [],
      recentMistakes: [],
      optimalStudyTime: 'morning',
      paceAnalysis: 'moderate',
    };
  }

  // Calculate overall metrics
  const totalScore = userEvents.reduce((sum, e) => sum + e.score, 0);
  const overallScore = Math.round(totalScore / userEvents.length);
  const totalStudyMinutes = Math.round(
    userEvents.reduce((sum, e) => sum + e.durationMs, 0) / 60000
  );

  // Calculate streak
  const studyDays = new Set(userEvents.map((e) => new Date(e.timestamp).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (studyDays.has(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Skill breakdown
  const moduleMap = new Map<string, LearningEvent[]>();
  for (const event of userEvents) {
    const existing = moduleMap.get(event.module) ?? [];
    existing.push(event);
    moduleMap.set(event.module, existing);
  }

  const skillBreakdown: SkillAnalysis[] = [];
  for (const [module, events] of moduleMap) {
    const scores = events.map((e) => e.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Trend analysis (last 5 vs previous 5)
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const recent = sorted.slice(-5);
    const previous = sorted.slice(-10, -5);
    const recentAvg =
      recent.length > 0 ? recent.reduce((s, e) => s + e.score, 0) / recent.length : avgScore;
    const previousAvg =
      previous.length > 0 ? previous.reduce((s, e) => s + e.score, 0) / previous.length : avgScore;

    let trend: SkillAnalysis['trend'] = 'stable';
    if (recentAvg > previousAvg + 5) trend = 'improving';
    else if (recentAvg < previousAvg - 5) trend = 'declining';

    // Collect mistakes
    const allMistakes = events.flatMap((e) => e.mistakes ?? []);
    const mistakeCount = new Map<string, number>();
    for (const m of allMistakes) {
      mistakeCount.set(m, (mistakeCount.get(m) ?? 0) + 1);
    }
    const weaknesses = [...mistakeCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([m]) => m);

    const strengths = avgScore >= 80 ? ['Consistent high performance'] : [];
    if (trend === 'improving') strengths.push('Rapid improvement');

    // Recommendation
    let recommendation = '';
    if (avgScore < 50) recommendation = `Focus on ${module} fundamentals — review core concepts`;
    else if (avgScore < 70)
      recommendation = `Practice ${module} regularly — you're making progress`;
    else if (trend === 'declining') recommendation = `Review ${module} — performance declining`;
    else recommendation = `${module} is strong — maintain with occasional practice`;

    skillBreakdown.push({
      skill: module,
      totalAttempts: events.length,
      averageScore: avgScore,
      trend,
      strengths,
      weaknesses,
      recommendation,
    });
  }

  // Recommended focus areas
  const recommendedFocus = skillBreakdown
    .filter((s) => s.averageScore < 70 || s.trend === 'declining')
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3)
    .map((s) => s.skill);

  // Recent mistakes across all modules
  const recentEvents = userEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  const mistakeMap = new Map<string, { module: string; count: number }>();
  for (const event of recentEvents) {
    for (const mistake of event.mistakes ?? []) {
      const key = `${event.module}:${mistake}`;
      const existing = mistakeMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        mistakeMap.set(key, { module: event.module, count: 1 });
      }
    }
  }
  const recentMistakes = [...mistakeMap.entries()]
    .map(([mistake, data]) => ({ mistake, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Optimal study time analysis
  const hourCounts = new Map<number, number>();
  for (const event of userEvents) {
    const hour = new Date(event.timestamp).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }
  const bestHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 9;
  const optimalStudyTime = bestHour < 12 ? 'morning' : bestHour < 17 ? 'afternoon' : 'evening';

  // Pace analysis
  const avgDuration = totalStudyMinutes / userEvents.length;
  let paceAnalysis: LearningInsights['paceAnalysis'] = 'moderate';
  if (avgDuration < 10) paceAnalysis = 'fast';
  else if (avgDuration > 30) paceAnalysis = 'slow';

  return {
    userId,
    overallScore,
    studyStreak: streak,
    totalStudyMinutes,
    skillBreakdown,
    recommendedFocus,
    recentMistakes,
    optimalStudyTime,
    paceAnalysis,
  };
};

/**
 * Get learning analytics summary for AI coaching context.
 */
export const getCoachingContext = (userId: string): string => {
  const insights = analyzeLearningPatterns(userId);

  if (insights.overallScore === 0) {
    return 'New user with no learning history yet.';
  }

  const weakAreas = insights.skillBreakdown
    .filter((s) => s.averageScore < 70)
    .map((s) => `${s.skill} (${s.averageScore}%)`)
    .join(', ');

  const strongAreas = insights.skillBreakdown
    .filter((s) => s.averageScore >= 80)
    .map((s) => `${s.skill} (${s.averageScore}%)`)
    .join(', ');

  return [
    `Overall: ${insights.overallScore}% avg score, ${insights.studyStreak}-day streak, ${insights.totalStudyMinutes}min total study.`,
    weakAreas ? `Weak areas: ${weakAreas}.` : '',
    strongAreas ? `Strong areas: ${strongAreas}.` : '',
    insights.recommendedFocus.length > 0
      ? `Focus on: ${insights.recommendedFocus.join(', ')}.`
      : '',
    `Study pace: ${insights.paceAnalysis}. Best time: ${insights.optimalStudyTime}.`,
  ]
    .filter(Boolean)
    .join(' ');
};
