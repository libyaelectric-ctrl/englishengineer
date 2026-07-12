import { describe, it, expect } from 'vitest';
import { TeamLeaderboardService } from './team-leaderboard';

const mockMembers = [
  {
    id: 'm1',
    displayName: 'Alice',
    completedTasks: 10,
    skillScores: { vocabulary: 85, grammar: 70 },
    xpEarned: 500,
    streak: 5,
  },
  {
    id: 'm2',
    displayName: 'Bob',
    completedTasks: 5,
    skillScores: { vocabulary: 60, grammar: 80 },
    xpEarned: 300,
    streak: 3,
  },
  {
    id: 'm3',
    displayName: 'Charlie',
    completedTasks: 15,
    skillScores: { vocabulary: 90, grammar: 90 },
    xpEarned: 800,
    streak: 7,
  },
];

describe('TeamLeaderboardService', () => {
  describe('generateLeaderboard', () => {
    it('sorts members by score descending', () => {
      const entries = TeamLeaderboardService.generateLeaderboard(mockMembers);
      expect(entries[0].rank).toBe(1);
      expect(entries[0].displayName).toBe('Charlie');
      expect(entries[1].displayName).toBe('Alice');
      expect(entries[2].displayName).toBe('Bob');
    });

    it('assigns correct ranks', () => {
      const entries = TeamLeaderboardService.generateLeaderboard(mockMembers);
      expect(entries.map((e) => e.rank)).toEqual([1, 2, 3]);
    });

    it('calculates trend based on previous scores', () => {
      const entries = TeamLeaderboardService.generateLeaderboard(mockMembers, {
        m1: 50,
        m2: 60,
        m3: 70,
      });
      expect(entries.find((e) => e.memberId === 'm1')?.trend).toBe('up');
      expect(entries.find((e) => e.memberId === 'm2')?.trend).toBe('down');
    });

    it('handles empty members', () => {
      const entries = TeamLeaderboardService.generateLeaderboard([]);
      expect(entries).toHaveLength(0);
    });
  });

  describe('generateWeeklyChallenges', () => {
    it('generates 8 challenges', () => {
      const challenges = TeamLeaderboardService.generateWeeklyChallenges({}, 1);
      expect(challenges).toHaveLength(8);
    });

    it('marks completed challenges', () => {
      const progress = { 'vocabulary-Vocabulary Master': 50 };
      const challenges = TeamLeaderboardService.generateWeeklyChallenges(
        progress,
        1
      );
      const vocabChallenge = challenges.find(
        (c) => c.title === 'Vocabulary Master'
      );
      expect(vocabChallenge?.isCompleted).toBe(true);
    });

    it('caps current value at target', () => {
      const progress = { 'vocabulary-Vocabulary Master': 100 };
      const challenges = TeamLeaderboardService.generateWeeklyChallenges(
        progress,
        1
      );
      const vocabChallenge = challenges.find(
        (c) => c.title === 'Vocabulary Master'
      );
      expect(vocabChallenge?.currentValue).toBe(50);
    });

    it('sets expiry to end of week', () => {
      const challenges = TeamLeaderboardService.generateWeeklyChallenges({}, 1);
      const expiry = new Date(challenges[0].expiresAt);
      expect(expiry.getDay()).toBe(0); // Sunday
    });
  });

  describe('buildTeamLeaderboard', () => {
    it('builds complete leaderboard with stats', () => {
      const leaderboard = TeamLeaderboardService.buildTeamLeaderboard(
        'org-1',
        mockMembers
      );
      expect(leaderboard.organizationId).toBe('org-1');
      expect(leaderboard.entries).toHaveLength(3);
      expect(leaderboard.challenges).toHaveLength(8);
      expect(leaderboard.teamStats.totalMembers).toBe(3);
      expect(leaderboard.teamStats.totalXpEarned).toBe(1600);
      expect(leaderboard.teamStats.totalTasksCompleted).toBe(30);
    });

    it('calculates average score', () => {
      const leaderboard = TeamLeaderboardService.buildTeamLeaderboard(
        'org-1',
        mockMembers
      );
      expect(leaderboard.teamStats.averageScore).toBeGreaterThan(0);
    });

    it('includes generatedAt timestamp', () => {
      const leaderboard = TeamLeaderboardService.buildTeamLeaderboard(
        'org-1',
        mockMembers
      );
      expect(leaderboard.generatedAt).toBeDefined();
    });
  });
});
