import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ApiError } from './errors.js';
import { logger } from './logger.js';

/**
 * Team Analytics API
 *
 * GET /api/v1/team/analytics — Manager dashboard data
 * GET /api/v1/team/analytics/export — CSV export of team data
 *
 * Provides aggregate metrics for team managers:
 * - Member progress overview
 * - Engagement rates
 * - Skill distribution
 * - Activity trends
 */

interface TeamMemberAnalytics {
  memberId: string;
  displayName: string;
  email: string;
  discipline: string;
  role: string;
  lastActiveAt: string | null;
  progress: {
    overallScore: number;
    vocabularyScore: number;
    grammarScore: number;
    readingScore: number;
    writingScore: number;
    speakingScore: number;
    listeningScore: number;
  };
  activity: {
    totalSessions: number;
    last7Days: number;
    last30Days: number;
    streakDays: number;
  };
}

interface TeamAnalyticsResponse {
  generatedAt: string;
  teamSize: number;
  summary: {
    averageProgress: number;
    activeThisWeek: number;
    activeThisMonth: number;
    averageSessionsPerMember: number;
    topDiscipline: string;
    strongestSkill: string;
    weakestSkill: string;
  };
  members: TeamMemberAnalytics[];
  engagement: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    retentionRate: number;
    avgSessionDurationMinutes: number;
  };
  skillDistribution: {
    vocabulary: { average: number; median: number; distribution: Record<string, number> };
    grammar: { average: number; median: number; distribution: Record<string, number> };
    reading: { average: number; median: number; distribution: Record<string, number> };
    writing: { average: number; median: number; distribution: Record<string, number> };
  };
}

/**
 * Calculate percentile from a sorted array.
 */
const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
};

/**
 * Build team analytics from workspace data.
 */
const buildTeamAnalytics = (
  members: Array<{
    id: string;
    displayName?: string;
    email?: string;
    discipline?: string;
    role?: string;
    lastActiveAt?: string | null;
  }>,
  summaries: Array<{
    memberId: string;
    overallProgress?: number;
    skillScores?: Record<string, number>;
    completedTasks?: number;
  }>,
  sessions?: Array<{
    userId: string;
    date: string;
    durationMinutes?: number;
  }>
  // eslint-disable-next-line complexity -- dense aggregate data shaping
): TeamAnalyticsResponse => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

  const summaryMap = new Map(summaries.map((s) => [s.memberId, s]));
  const skills = ['vocabulary', 'grammar', 'reading', 'writing', 'speaking', 'listening'];

  // eslint-disable-next-line complexity -- dense per-member data shaping
  const memberAnalytics: TeamMemberAnalytics[] = members.map((m) => {
    const summary = summaryMap.get(m.id);
    const memberSessions = sessions?.filter((s) => s.userId === m.id) ?? [];

    return {
      memberId: m.id,
      displayName: m.displayName ?? 'Unknown',
      email: m.email ?? '',
      discipline: m.discipline ?? 'general',
      role: m.role ?? 'learner',
      lastActiveAt: m.lastActiveAt ?? null,
      progress: {
        overallScore: summary?.overallProgress ?? 0,
        vocabularyScore: summary?.skillScores?.vocabulary ?? 0,
        grammarScore: summary?.skillScores?.grammar ?? 0,
        readingScore: summary?.skillScores?.reading ?? 0,
        writingScore: summary?.skillScores?.writing ?? 0,
        speakingScore: summary?.skillScores?.speaking ?? 0,
        listeningScore: summary?.skillScores?.listening ?? 0,
      },
      activity: {
        totalSessions: memberSessions.length,
        last7Days: memberSessions.filter((s) => new Date(s.date) >= weekAgo).length,
        last30Days: memberSessions.filter((s) => new Date(s.date) >= monthAgo).length,
        streakDays: 0, // Would need streak data from learning store
      },
    };
  });

  // Summary calculations
  const progressScores = memberAnalytics.map((m) => m.progress.overallScore);
  const sortedProgress = [...progressScores].sort((a, b) => a - b);

  const activeThisWeek = memberAnalytics.filter(
    (m) => m.lastActiveAt && new Date(m.lastActiveAt) >= weekAgo
  ).length;

  const activeThisMonth = memberAnalytics.filter(
    (m) => m.lastActiveAt && new Date(m.lastActiveAt) >= monthAgo
  ).length;

  // Skill averages
  const skillAverages: Record<string, number> = {};
  for (const skill of skills) {
    const key = `${skill}Score` as keyof TeamMemberAnalytics['progress'];
    const values = memberAnalytics.map((m) => m.progress[key]);
    skillAverages[skill] =
      values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }

  const strongestSkill =
    Object.entries(skillAverages).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'vocabulary';
  const weakestSkill =
    Object.entries(skillAverages).sort(([, a], [, b]) => a - b)[0]?.[0] ?? 'vocabulary';

  // Discipline distribution
  const disciplineCounts: Record<string, number> = {};
  for (const m of memberAnalytics) {
    disciplineCounts[m.discipline] = (disciplineCounts[m.discipline] ?? 0) + 1;
  }
  const topDiscipline =
    Object.entries(disciplineCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'general';

  // Engagement - mock daily active users (would need real session data)
  const dailyActiveUsers: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86_400_000);
    dailyActiveUsers.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * activeThisWeek) + 1,
    });
  }

  const totalSessions = sessions?.length ?? 0;
  const avgSessionDuration = sessions?.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) / sessions.length)
    : 0;

  return {
    generatedAt: now.toISOString(),
    teamSize: members.length,
    summary: {
      averageProgress:
        sortedProgress.length > 0
          ? Math.round(sortedProgress.reduce((a, b) => a + b, 0) / sortedProgress.length)
          : 0,
      activeThisWeek,
      activeThisMonth,
      averageSessionsPerMember: members.length > 0 ? Math.round(totalSessions / members.length) : 0,
      topDiscipline,
      strongestSkill,
      weakestSkill,
    },
    members: memberAnalytics,
    engagement: {
      dailyActiveUsers,
      retentionRate: members.length > 0 ? Math.round((activeThisMonth / members.length) * 100) : 0,
      avgSessionDurationMinutes: avgSessionDuration,
    },
    skillDistribution: {
      vocabulary: buildSkillDistribution(memberAnalytics.map((m) => m.progress.vocabularyScore)),
      grammar: buildSkillDistribution(memberAnalytics.map((m) => m.progress.grammarScore)),
      reading: buildSkillDistribution(memberAnalytics.map((m) => m.progress.readingScore)),
      writing: buildSkillDistribution(memberAnalytics.map((m) => m.progress.writingScore)),
    },
  };
};

const buildSkillDistribution = (
  scores: number[]
): {
  average: number;
  median: number;
  distribution: Record<string, number>;
} => {
  const sorted = [...scores].sort((a, b) => a - b);
  const average =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const median = Math.round(percentile(sorted, 50));

  const distribution: Record<string, number> = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };
  for (const score of scores) {
    if (score <= 20) distribution['0-20']++;
    else if (score <= 40) distribution['21-40']++;
    else if (score <= 60) distribution['41-60']++;
    else if (score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  }

  return { average, median, distribution };
};

export const registerTeamAnalyticsRoutes = (
  app: Express,
  requireAuth: RequestHandler,
  rateLimiter: RequestHandler
): void => {
  // Team analytics dashboard
  app.get(
    '/api/v1/team/analytics',
    requireAuth,
    rateLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth?.userId;
        if (!userId) {
          throw new ApiError(401, 'unauthorized', 'Authentication required.');
        }

        // In production, fetch from Supabase:
        // - Check user has team/manager role
        // - Fetch organization members and their progress
        // - Fetch session data for engagement metrics
        logger.info('Team analytics requested', { userId, requestId: req.id });

        const analytics = buildTeamAnalytics(
          [], // members from Supabase
          [], // summaries from Supabase
          [] // sessions from Supabase
        );

        res.json(analytics);
      } catch (err) {
        next(err);
      }
    }
  );

  // CSV export
  app.get(
    '/api/v1/team/analytics/export',
    requireAuth,
    rateLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth?.userId;
        if (!userId) {
          throw new ApiError(401, 'unauthorized', 'Authentication required.');
        }

        const analytics = buildTeamAnalytics([], [], []);

        // Build CSV
        const headers = [
          'Name',
          'Email',
          'Discipline',
          'Role',
          'Overall Score',
          'Vocabulary',
          'Grammar',
          'Reading',
          'Writing',
          'Speaking',
          'Listening',
          'Sessions (7d)',
          'Last Active',
        ];
        const rows = analytics.members.map((m) => [
          m.displayName,
          m.email,
          m.discipline,
          m.role,
          String(m.progress.overallScore),
          String(m.progress.vocabularyScore),
          String(m.progress.grammarScore),
          String(m.progress.readingScore),
          String(m.progress.writingScore),
          String(m.progress.speakingScore),
          String(m.progress.listeningScore),
          String(m.activity.last7Days),
          m.lastActiveAt ?? 'Never',
        ]);

        const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
          '\n'
        );

        const filename = `engvox-team-analytics-${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
      } catch (err) {
        next(err);
      }
    }
  );
};
