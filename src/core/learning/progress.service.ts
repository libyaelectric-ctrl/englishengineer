import { LearningState } from './learning.types';

export interface ProgressSummary {
  completedMissionsCount: number;
  totalMissionsCount: number;
  completionPercentage: number;
  averageScore: number;
  totalStudyTimeMinutes: number;
  streak: number;
  xp: number;
  level: number;
  coins: number;
  elo: number;
}

export const ProgressService = {
  /**
   * Computes the level based on accumulated experience points.
   * Every 500 XP is a level up.
   */
  calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
  },

  /**
   * Generates a high-fidelity summary of user study statistics.
   */
  getSummary(state: LearningState): ProgressSummary {
    const completed = state.missions.filter((m) => m.status === 'completed');
    const completedMissionsCount = completed.length;
    const totalMissionsCount = state.missions.length;

    const completionPercentage =
      totalMissionsCount > 0
        ? Math.round((completedMissionsCount / totalMissionsCount) * 100)
        : 0;

    // Calculate average score of completed missions
    const completedWithScores = completed.filter((m) => m.score !== undefined);
    const averageScore =
      completedWithScores.length > 0
        ? Math.round(
            completedWithScores.reduce((acc, m) => acc + (m.score || 0), 0) /
              completedWithScores.length
          )
        : 0;

    // Sum total study sessions duration
    const totalStudyTimeMinutes = state.studySessions.reduce(
      (acc, s) => acc + s.durationMinutes,
      0
    );

    return {
      completedMissionsCount,
      totalMissionsCount,
      completionPercentage,
      averageScore,
      totalStudyTimeMinutes,
      streak: state.streak,
      xp: state.xp,
      level: this.calculateLevel(state.xp),
      coins: state.coins,
      elo: state.elo,
    };
  },

  /**
   * Resolves the user's relative strengths and weaknesses across modules.
   */
  getSkillAnalysis(state: LearningState): {
    weakSkills: string[];
    strongSkills: string[];
  } {
    const modules: (
      | 'Reading'
      | 'Writing'
      | 'Listening'
      | 'Speaking'
      | 'Vocabulary'
    )[] = ['Reading', 'Writing', 'Listening', 'Speaking', 'Vocabulary'];

    const stats = modules.map((m) => {
      const sessions = state.studySessions.filter((s) => s.module === m);
      const avg =
        sessions.length > 0
          ? sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length
          : 50; // default benchmark
      return { module: m, average: avg };
    });

    // Sort by performance
    stats.sort((a, b) => a.average - b.average);

    const weakSkills = stats.filter((s) => s.average < 75).map((s) => s.module);
    const strongSkills = stats
      .filter((s) => s.average >= 75)
      .map((s) => s.module);

    return {
      weakSkills: weakSkills.length > 0 ? weakSkills : ['None'],
      strongSkills: strongSkills.length > 0 ? strongSkills : ['None'],
    };
  },
};
