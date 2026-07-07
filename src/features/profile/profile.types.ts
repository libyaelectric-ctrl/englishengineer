export const SKILL_NAMES = [
  'vocabulary',
  'grammar',
  'reading',
  'writing',
  'listening',
  'speaking',
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];
export type SkillElo = number;
export type LearningGoal =
  | 'daily'
  | 'work'
  | 'engineering'
  | 'travel'
  | 'management';
export type ProfessionId =
  | 'electrical-engineer'
  | 'mechanical-engineer'
  | 'civil-engineer'
  | 'architect'
  | 'mep-engineer'
  | 'qa-qc-engineer'
  | 'commissioning-engineer'
  | 'project-engineer'
  | 'project-manager'
  | 'construction-manager'
  | 'site-supervisor'
  | 'other';
export type IndustryId =
  | 'hospital'
  | 'data-center'
  | 'oil-gas'
  | 'infrastructure'
  | 'residential'
  | 'industrial'
  | 'other';
export type CommunicationGoal =
  | 'site-meetings'
  | 'email-report-writing'
  | 'inspection-communication'
  | 'commissioning'
  | 'management'
  | 'interview-career';
export type SelfReportedCefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'unknown';
export type InterfaceLanguage = 'en' | 'tr';
export type ExperienceLevel =
  | 'student'
  | 'early-career'
  | 'experienced'
  | 'lead-manager'
  | 'prefer-not-to-say';
export type ProfessionalTrack =
  | 'electrical'
  | 'mechanical'
  | 'civil'
  | 'architecture'
  | 'mep-coordination'
  | 'data-center'
  | 'oil-gas'
  | 'qa-qc'
  | 'commissioning'
  | 'infrastructure'
  | 'healthcare-hospital'
  | 'industrial';
export type ElectricalSubdomain =
  | 'low-voltage'
  | 'medium-voltage'
  | 'lighting'
  | 'elv-low-current'
  | 'fire-alarm'
  | 'emergency-power-generators'
  | 'ups'
  | 'data-center-electrical'
  | 'hospital-electrical'
  | 'commissioning'
  | 'qa-qc-electrical'
  | 'testing-inspection'
  | 'site-coordination';
export type CefrBand =
  | 'A1'
  | 'A1+'
  | 'A2'
  | 'A2+'
  | 'B1'
  | 'B1+'
  | 'B2'
  | 'B2+'
  | 'C1'
  | 'C1+'
  | 'C2'
  | 'C2+';
export type SkillTrend =
  | 'improving'
  | 'steady'
  | 'declining'
  | 'not-enough-data';
export type PromotionState = 'progressing' | 'ready' | 'maxed';

export interface SkillProfile {
  skill: SkillName;
  elo: SkillElo;
  cefrBand: CefrBand;
  progressToNextBand: number;
  trend: SkillTrend;
  completedTasks: number;
  accuracy: number;
  weaknessScore: number;
  lastPracticedAt: string | null;
  promotionState: PromotionState;
}

export interface UserLearningProfile {
  userId: string;
  skills: Record<SkillName, SkillProfile>;
  goals: LearningGoal[];
  professionId: ProfessionId | null;
  industryId: IndustryId | null;
  communicationGoals: CommunicationGoal[];
  selfReportedCefr: SelfReportedCefr;
  learningFocus: SkillName[];
  selectedPlan: 'free' | 'pro' | 'enterprise';
  professionalTrack: ProfessionalTrack;
  electricalSubdomain: ElectricalSubdomain;
  experienceLevel: ExperienceLevel;
  careerGoal: string;
  country: string;
  timezone: string;
  interfaceLanguage: InterfaceLanguage;
  placementCompleted: boolean;
  placementConfidence: 'not-assessed' | 'limited' | 'moderate' | 'strong';
  placementBand: CefrBand | null;
  dailyTarget: {
    minutes: number;
    taskCount: number;
  };
  weeklyTolerance: {
    allowedMissedDays: number;
  };
  onboardingCompleted: boolean;
  weeklyGoal: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyMemorySummary {
  total: number;
  new: number;
  learning: number;
  mastered: number;
  forgotten: number;
  dueToday: number;
  weakWords: number;
}

export type MissionType =
  | 'skill-practice'
  | 'vocabulary-review'
  | 'grammar-focus';
export type MissionDifficulty = 'review' | 'current' | 'stretch';

export interface DailyMission {
  id: string;
  type: MissionType;
  skill: SkillName;
  title: string;
  cefrBand: CefrBand;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  reason: string;
  route: string;
  itemCount?: number;
}

export interface AdaptivePaceInput {
  accuracy: number;
  mistakeType: string | null;
  repeatMistakeCount: number;
  responseTimeSeconds: number;
  skill: SkillName;
  currentElo: SkillElo;
}

export interface AdaptivePaceDecision {
  pace: 'slower' | 'maintain' | 'faster';
  difficulty: 'easier' | 'same' | 'slightly-harder';
  sendToMistakeLog: boolean;
  reason: string;
}

export interface ProfileBadge {
  id: string;
  label: string;
  unlocked: boolean;
  description: string;
}
