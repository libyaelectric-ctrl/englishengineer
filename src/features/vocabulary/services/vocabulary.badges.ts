export interface VocabularyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'accuracy' | 'speed' | 'mastery';
  requirement: (stats: VocabularyStats) => boolean;
  unlockedAt: string | null;
}

export interface VocabularyStats {
  totalWordsLearned: number;
  wordsMastered: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  totalReviews: number;
  perfectSessions: number;
  leechWords: number;
  fastestReviewMs: number;
}

export interface BadgeUnlockResult {
  badge: VocabularyBadge;
  newlyUnlocked: boolean;
}

const BADGE_DEFINITIONS: Omit<VocabularyBadge, 'unlockedAt'>[] = [
  // Milestone badges
  {
    id: 'first-word',
    name: 'First Step',
    description: 'Learn your first vocabulary word',
    icon: '🌱',
    category: 'milestone',
    requirement: (s) => s.totalWordsLearned >= 1,
  },
  {
    id: 'ten-words',
    name: 'Word Collector',
    description: 'Learn 10 vocabulary words',
    icon: '📚',
    category: 'milestone',
    requirement: (s) => s.totalWordsLearned >= 10,
  },
  {
    id: 'fifty-words',
    name: 'Vocabulary Builder',
    description: 'Learn 50 vocabulary words',
    icon: '🏗️',
    category: 'milestone',
    requirement: (s) => s.totalWordsLearned >= 50,
  },
  {
    id: 'hundred-words',
    name: 'Century',
    description: 'Learn 100 vocabulary words',
    icon: '💯',
    category: 'milestone',
    requirement: (s) => s.totalWordsLearned >= 100,
  },
  // Streak badges
  {
    id: 'streak-3',
    name: 'Habit Forming',
    description: 'Maintain a 3-day review streak',
    icon: '🔥',
    category: 'streak',
    requirement: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day review streak',
    icon: '⚡',
    category: 'streak',
    requirement: (s) => s.currentStreak >= 7,
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day review streak',
    icon: '👑',
    category: 'streak',
    requirement: (s) => s.currentStreak >= 30,
  },
  // Accuracy badges
  {
    id: 'perfect-accuracy',
    name: 'Sharp Mind',
    description: 'Complete a session with 100% accuracy',
    icon: '🎯',
    category: 'accuracy',
    requirement: (s) => s.perfectSessions >= 1,
  },
  {
    id: 'high-accuracy',
    name: 'Focused Learner',
    description: 'Achieve 90%+ average accuracy',
    icon: '🧠',
    category: 'accuracy',
    requirement: (s) => s.averageAccuracy >= 90 && s.totalReviews >= 10,
  },
  // Speed badges
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a review in under 2 seconds per word',
    icon: '⚡',
    category: 'speed',
    requirement: (s) => s.fastestReviewMs > 0 && s.fastestReviewMs < 2000,
  },
  // Mastery badges
  {
    id: 'master-10',
    name: 'Apprentice',
    description: 'Master 10 words',
    icon: '🎓',
    category: 'mastery',
    requirement: (s) => s.wordsMastered >= 10,
  },
  {
    id: 'master-50',
    name: 'Scholar',
    description: 'Master 50 words',
    icon: '📜',
    category: 'mastery',
    requirement: (s) => s.wordsMastered >= 50,
  },
  {
    id: 'master-100',
    name: 'Vocabulary Master',
    description: 'Master 100 words',
    icon: '🏆',
    category: 'mastery',
    requirement: (s) => s.wordsMastered >= 100,
  },
  {
    id: 'zero-leech',
    name: 'No Leeches',
    description: 'Complete 20+ reviews with zero leech words',
    icon: '🛡️',
    category: 'mastery',
    requirement: (s) => s.totalReviews >= 20 && s.leechWords === 0,
  },
];

const STORAGE_KEY = 'EngVox_vocabulary_badges';

export const VocabularyBadgeService = {
  getUnlockedBadges(): Record<string, string> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  saveUnlockedBadges(badges: Record<string, string>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  },

  getAllBadges(): VocabularyBadge[] {
    const unlocked = this.getUnlockedBadges();
    return BADGE_DEFINITIONS.map((def) => ({
      ...def,
      unlockedAt: unlocked[def.id] ?? null,
    }));
  },

  checkAndUnlock(stats: VocabularyStats): BadgeUnlockResult[] {
    const unlocked = this.getUnlockedBadges();
    const results: BadgeUnlockResult[] = [];
    let changed = false;

    for (const def of BADGE_DEFINITIONS) {
      if (unlocked[def.id]) {
        results.push({
          badge: { ...def, unlockedAt: unlocked[def.id] },
          newlyUnlocked: false,
        });
        continue;
      }

      if (def.requirement(stats)) {
        const now = new Date().toISOString();
        unlocked[def.id] = now;
        changed = true;
        results.push({
          badge: { ...def, unlockedAt: now },
          newlyUnlocked: true,
        });
      } else {
        results.push({
          badge: { ...def, unlockedAt: null },
          newlyUnlocked: false,
        });
      }
    }

    if (changed) {
      this.saveUnlockedBadges(unlocked);
    }

    return results;
  },

  getUnlockedCount(): number {
    return Object.keys(this.getUnlockedBadges()).length;
  },

  getTotalCount(): number {
    return BADGE_DEFINITIONS.length;
  },

  getProgress(stats: VocabularyStats): {
    unlocked: number;
    total: number;
    nextBadge: VocabularyBadge | null;
  } {
    const badges = this.checkAndUnlock(stats);
    const unlocked = badges.filter((b) => b.newlyUnlocked || b.badge.unlockedAt).length;
    const nextBadge = badges.find((b) => !b.badge.unlockedAt)?.badge ?? null;
    return { unlocked, total: badges.length, nextBadge };
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
