import type { SkillName } from '@/features/profile/profile.types';

export interface LeaderboardEntry {
  memberId: string;
  displayName: string;
  score: number;
  xpEarned: number;
  tasksCompleted: number;
  streak: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  skill: SkillName | 'general';
  reward: { xp: number; coins: number };
  expiresAt: string;
  isCompleted: boolean;
}

export interface TeamLeaderboard {
  organizationId: string;
  generatedAt: string;
  entries: LeaderboardEntry[];
  challenges: WeeklyChallenge[];
  teamStats: {
    totalMembers: number;
    activeMembers: number;
    averageScore: number;
    totalXpEarned: number;
    totalTasksCompleted: number;
  };
}

function calculateMemberScore(member: {
  completedTasks: number;
  skillScores: Record<string, number>;
}): number {
  const scores = Object.values(member.skillScores);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  return Math.round(avgScore * 0.6 + member.completedTasks * 0.4);
}

function determineTrend(
  currentScore: number,
  previousScore: number
): 'up' | 'down' | 'stable' {
  if (currentScore > previousScore) return 'up';
  if (currentScore < previousScore) return 'down';
  return 'stable';
}

const CHALLENGE_TEMPLATES: Array<{
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  skill: SkillName | 'general';
  reward: { xp: number; coins: number };
}> = [
  {
    title: 'Vocabulary Master',
    description: 'Learn 50 new vocabulary words this week',
    targetValue: 50,
    unit: 'words',
    skill: 'vocabulary',
    reward: { xp: 200, coins: 50 },
  },
  {
    title: 'Grammar Guru',
    description: 'Complete 10 grammar exercises',
    targetValue: 10,
    unit: 'exercises',
    skill: 'grammar',
    reward: { xp: 150, coins: 30 },
  },
  {
    title: 'Reading Marathon',
    description: 'Read 5 technical articles',
    targetValue: 5,
    unit: 'articles',
    skill: 'reading',
    reward: { xp: 180, coins: 40 },
  },
  {
    title: 'Writing Workshop',
    description: 'Submit 3 writing assignments',
    targetValue: 3,
    unit: 'assignments',
    skill: 'writing',
    reward: { xp: 200, coins: 45 },
  },
  {
    title: 'Listening Pro',
    description: 'Complete 8 listening sessions',
    targetValue: 8,
    unit: 'sessions',
    skill: 'listening',
    reward: { xp: 160, coins: 35 },
  },
  {
    title: 'Speaking Challenge',
    description: 'Practice 5 speaking scenarios',
    targetValue: 5,
    unit: 'scenarios',
    skill: 'speaking',
    reward: { xp: 190, coins: 40 },
  },
  {
    title: 'Streak Warrior',
    description: 'Maintain a 7-day learning streak',
    targetValue: 7,
    unit: 'days',
    skill: 'general',
    reward: { xp: 300, coins: 100 },
  },
  {
    title: 'Multi-Skill Explorer',
    description: 'Practice all 6 skills in one week',
    targetValue: 6,
    unit: 'skills',
    skill: 'general',
    reward: { xp: 250, coins: 75 },
  },
];

export const TeamLeaderboardService = {
  generateLeaderboard(
    members: Array<{
      id: string;
      displayName: string;
      completedTasks: number;
      skillScores: Record<string, number>;
      xpEarned: number;
      streak: number;
    }>,
    previousScores: Record<string, number> = {}
  ): LeaderboardEntry[] {
    return members
      .map((member) => ({
        memberId: member.id,
        displayName: member.displayName,
        score: calculateMemberScore(member),
        xpEarned: member.xpEarned,
        tasksCompleted: member.completedTasks,
        streak: member.streak,
        rank: 0,
        trend: determineTrend(
          calculateMemberScore(member),
          previousScores[member.id] || 0
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  },

  generateWeeklyChallenges(
    memberProgress: Record<string, number>,
    weekNumber: number
  ): WeeklyChallenge[] {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

    return CHALLENGE_TEMPLATES.map((template, index) => {
      const key = `${template.skill}-${template.title}`;
      const currentValue = memberProgress[key] || 0;

      return {
        id: `challenge-w${weekNumber}-${index}`,
        title: template.title,
        description: template.description,
        targetValue: template.targetValue,
        currentValue: Math.min(currentValue, template.targetValue),
        unit: template.unit,
        skill: template.skill,
        reward: template.reward,
        expiresAt: endOfWeek.toISOString(),
        isCompleted: currentValue >= template.targetValue,
      };
    });
  },

  buildTeamLeaderboard(
    organizationId: string,
    members: Array<{
      id: string;
      displayName: string;
      completedTasks: number;
      skillScores: Record<string, number>;
      xpEarned: number;
      streak: number;
    }>,
    previousScores: Record<string, number> = {},
    memberProgress: Record<string, number> = {},
    weekNumber: number = Math.ceil(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )
  ): TeamLeaderboard {
    const entries = this.generateLeaderboard(members, previousScores);
    const challenges = this.generateWeeklyChallenges(memberProgress, weekNumber);

    const activeMembers = members.length;

    const totalXpEarned = members.reduce((sum, m) => sum + m.xpEarned, 0);
    const totalTasksCompleted = members.reduce(
      (sum, m) => sum + m.completedTasks,
      0
    );

    const allScores = entries.map((e) => e.score);
    const averageScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    return {
      organizationId,
      generatedAt: new Date().toISOString(),
      entries,
      challenges,
      teamStats: {
        totalMembers: members.length,
        activeMembers,
        averageScore,
        totalXpEarned,
        totalTasksCompleted,
      },
    };
  },
};
