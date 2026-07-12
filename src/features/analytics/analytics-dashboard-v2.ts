import type { SkillName } from '@/features/profile';

export interface SkillRadarData {
  skill: SkillName;
  label: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
  sessionsCompleted: number;
  minutesSpent: number;
}

export interface HeatmapDay {
  date: string;
  dayOfWeek: number;
  hour: number;
  activityCount: number;
  minutesStudied: number;
  averageScore: number;
}

export interface AnalyticsInsight {
  type: 'peak_hour' | 'peak_day' | 'streak' | 'improvement' | 'plateau';
  title: string;
  description: string;
  value: number;
  unit: string;
}

export interface ProductivityPattern {
  bestHour: number;
  bestDay: number;
  averageSessionLength: number;
  totalStudyDays: number;
  consistencyScore: number;
}

function getDayName(dayOfWeek: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[dayOfWeek] || 'Unknown';
}

function getHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export const AnalyticsDashboardV2 = {
  generateSkillRadar(
    skillScores: Record<
      SkillName,
      {
        score: number;
        sessions: number;
        minutes: number;
        trend: 'up' | 'down' | 'stable';
      }
    >
  ): SkillRadarData[] {
    const skillLabels: Record<SkillName, string> = {
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      reading: 'Reading',
      writing: 'Writing',
      listening: 'Listening',
      speaking: 'Speaking',
    };

    return Object.entries(skillScores).map(([skill, data]) => ({
      skill: skill as SkillName,
      label: skillLabels[skill as SkillName] || skill,
      score: Math.round(data.score),
      maxScore: 100,
      trend: data.trend,
      sessionsCompleted: data.sessions,
      minutesSpent: data.minutes,
    }));
  },

  generateHeatmap(
    studySessions: Array<{
      timestamp: string;
      durationMinutes: number;
      score: number;
    }>
  ): HeatmapDay[] {
    const heatmap: HeatmapDay[] = [];

    // Initialize 7 days x 24 hours grid
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap.push({
          date: '',
          dayOfWeek: day,
          hour,
          activityCount: 0,
          minutesStudied: 0,
          averageScore: 0,
        });
      }
    }

    // Populate from sessions
    const hourScores: Record<string, number[]> = {};
    for (const session of studySessions) {
      const date = new Date(session.timestamp);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      const key = `${dayOfWeek}-${hour}`;

      const cell = heatmap.find(
        (h) => h.dayOfWeek === dayOfWeek && h.hour === hour
      );
      if (cell) {
        cell.activityCount++;
        cell.minutesStudied += session.durationMinutes;
        cell.date = session.timestamp.split('T')[0];
      }

      if (!hourScores[key]) hourScores[key] = [];
      hourScores[key].push(session.score);
    }

    // Calculate average scores
    for (const cell of heatmap) {
      const key = `${cell.dayOfWeek}-${cell.hour}`;
      const scores = hourScores[key] || [];
      cell.averageScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
    }

    return heatmap;
  },

  analyzeProductivity(
    studySessions: Array<{ timestamp: string; durationMinutes: number }>
  ): ProductivityPattern {
    if (studySessions.length === 0) {
      return {
        bestHour: 9,
        bestDay: 1,
        averageSessionLength: 0,
        totalStudyDays: 0,
        consistencyScore: 0,
      };
    }

    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};
    const uniqueDays = new Set<string>();
    let totalMinutes = 0;

    for (const session of studySessions) {
      const date = new Date(session.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      uniqueDays.add(dateStr);
      totalMinutes += session.durationMinutes;
    }

    const bestHour = Number(
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 9
    );
    const bestDay = Number(
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 1
    );
    const averageSessionLength = Math.round(
      totalMinutes / studySessions.length
    );
    const totalStudyDays = uniqueDays.size;

    // Consistency: ratio of days studied vs days in period
    const firstSession = new Date(studySessions[0].timestamp);
    const lastSession = new Date(
      studySessions[studySessions.length - 1].timestamp
    );
    const totalDays = Math.max(
      1,
      Math.ceil(
        (lastSession.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const consistencyScore = Math.min(
      100,
      Math.round((totalStudyDays / totalDays) * 100)
    );

    return {
      bestHour,
      bestDay,
      averageSessionLength,
      totalStudyDays,
      consistencyScore,
    };
  },

  generateInsights(
    skillScores: Record<
      string,
      { score: number; trend: 'up' | 'down' | 'stable' }
    >,
    studySessions: Array<{
      timestamp: string;
      durationMinutes: number;
      score: number;
    }>
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const productivity = this.analyzeProductivity(studySessions);

    // Peak hour insight
    insights.push({
      type: 'peak_hour',
      title: 'Most Productive Hour',
      description: `You study best at ${getHourLabel(productivity.bestHour)}`,
      value: productivity.bestHour,
      unit: 'hour',
    });

    // Peak day insight
    insights.push({
      type: 'peak_day',
      title: 'Most Active Day',
      description: `${getDayName(productivity.bestDay)} is your most productive day`,
      value: productivity.bestDay,
      unit: 'day',
    });

    // Streak insight
    insights.push({
      type: 'streak',
      title: 'Study Consistency',
      description: `${productivity.consistencyScore}% consistency over ${productivity.totalStudyDays} days`,
      value: productivity.consistencyScore,
      unit: '%',
    });

    // Improvement insight
    const improvingSkills = Object.entries(skillScores).filter(
      ([, data]) => data.trend === 'up'
    );
    if (improvingSkills.length > 0) {
      insights.push({
        type: 'improvement',
        title: 'Skills Improving',
        description: `${improvingSkills.length} skill${improvingSkills.length > 1 ? 's' : ''} showing improvement`,
        value: improvingSkills.length,
        unit: 'skills',
      });
    }

    // Plateau insight
    const plateauSkills = Object.entries(skillScores).filter(
      ([, data]) => data.trend === 'stable' && data.score < 70
    );
    if (plateauSkills.length > 0) {
      insights.push({
        type: 'plateau',
        title: 'Needs Attention',
        description: `${plateauSkills.length} skill${plateauSkills.length > 1 ? 's' : ''} plateauing below 70%`,
        value: plateauSkills.length,
        unit: 'skills',
      });
    }

    return insights;
  },
};
