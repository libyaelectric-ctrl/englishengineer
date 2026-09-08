export const LEARNING_SKILL_NAMES = [
  'reading',
  'writing',
  'listening',
  'speaking',
  'vocabulary',
  'grammar',
] as const;

export type LearningSkillName = (typeof LEARNING_SKILL_NAMES)[number];

export interface LearningSkillProfile {
  elo: number;
  completedTasks: number;
}

export interface LearningSkillUpdate {
  elo: number;
  accuracy: number;
  completedTasks: number;
  weaknessScore: number;
  lastPracticedAt: string;
}

export interface CurrentUserPort {
  getUserId(): string | null;
}

export interface LearningProfilePort {
  getSkillProfile(userId: string, skill: LearningSkillName): LearningSkillProfile;
  updateSkill(userId: string, skill: LearningSkillName, update: LearningSkillUpdate): void;
}

export type LearningPoolContentType = 'vocabulary' | 'grammar' | 'speaking';

export interface ContentPoolPersistencePort {
  persistEntry(contentType: LearningPoolContentType, contentId: string): void;
}

export interface LearningPorts {
  currentUser: CurrentUserPort;
  profile: LearningProfilePort;
  contentPool: ContentPoolPersistencePort;
}

const fallbackPorts: LearningPorts = {
  currentUser: { getUserId: () => null },
  profile: {
    getSkillProfile: () => ({ elo: 1000, completedTasks: 0 }),
    updateSkill: () => undefined,
  },
  contentPool: { persistEntry: () => undefined },
};

let activePorts: LearningPorts = fallbackPorts;

export const configureLearningPorts = (ports: LearningPorts): void => {
  activePorts = ports;
};

export const getLearningPorts = (): LearningPorts => activePorts;

export const resetLearningPortsForTests = (): void => {
  activePorts = fallbackPorts;
};
