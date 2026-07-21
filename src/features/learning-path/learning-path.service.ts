export type SkillLevel = 'vocabulary' | 'grammar' | 'writing' | 'reading' | 'speaking' | 'listening';

export interface SkillProgress {
  skill: SkillLevel;
  masteredCount: number;
  learnedCount: number;
  level: number;
}

export interface LearningPathRule {
  skill: SkillLevel;
  prerequisites: SkillLevel[];
  requiredMastered: number;
  ownLevelWeight: number;
  upperLevelWeight: number;
}

export const LEARNING_PATH_RULES: Record<SkillLevel, LearningPathRule> = {
  vocabulary: {
    skill: 'vocabulary',
    prerequisites: [],
    requiredMastered: 0,
    ownLevelWeight: 0.75,
    upperLevelWeight: 0.25,
  },
  grammar: {
    skill: 'grammar',
    prerequisites: [],
    requiredMastered: 0,
    ownLevelWeight: 0.75,
    upperLevelWeight: 0.25,
  },
  writing: {
    skill: 'writing',
    prerequisites: ['vocabulary', 'grammar'],
    requiredMastered: 500,
    ownLevelWeight: 0.75,
    upperLevelWeight: 0.25,
  },
  reading: {
    skill: 'reading',
    prerequisites: ['vocabulary', 'grammar'],
    requiredMastered: 500,
    ownLevelWeight: 0.75,
    upperLevelWeight: 0.25,
  },
  speaking: {
    skill: 'speaking',
    prerequisites: ['writing', 'reading'],
    requiredMastered: 100,
    ownLevelWeight: 0.75,
    upperLevelWeight: 0.25,
  },
  listening: {
    skill: 'listening',
    prerequisites: ['writing', 'reading'],
    requiredMastered: 100,
    ownLevelWeight: 0.75,
    upperLevelWeight: 0.25,
  },
};

export const LearningPathService = {
  isSkillUnlocked(skill: SkillLevel, allProgress: Record<SkillLevel, SkillProgress>): boolean {
    const rule = LEARNING_PATH_RULES[skill];
    if (rule.prerequisites.length === 0) return true;

    return rule.prerequisites.every((prereq) => {
      const prereqProgress = allProgress[prereq];
      return prereqProgress && prereqProgress.masteredCount >= rule.requiredMastered;
    });
  },

  getAvailableSkills(allProgress: Record<SkillLevel, SkillProgress>): SkillLevel[] {
    return (Object.keys(LEARNING_PATH_RULES) as SkillLevel[]).filter((skill) =>
      this.isSkillUnlocked(skill, allProgress)
    );
  },

  getContentLevel(skill: SkillLevel, progress: SkillProgress): { ownLevel: number; upperLevel: number } {
    const rule = LEARNING_PATH_RULES[skill];
    const totalWords = progress.masteredCount + progress.learnedCount;
    const baseLevel = Math.floor(totalWords / 100);

    return {
      ownLevel: Math.floor(baseLevel * rule.ownLevelWeight),
      upperLevel: Math.ceil(baseLevel * rule.upperLevelWeight),
    };
  },

  getSkillHierarchy(): SkillLevel[][] {
    return [
      ['vocabulary', 'grammar'],
      ['writing', 'reading'],
      ['speaking', 'listening'],
    ];
  },
};
