import type { CefrBand, SkillName } from '@/features/profile';

export type PlacementDomain = 'reading' | 'vocabulary' | 'grammar';

export interface PlacementQuestion {
  id: string;
  domain: PlacementDomain;
  prompt: string;
  choices: string[];
  correctIndex: number;
  band: CefrBand;
}

export interface PlacementResult {
  score: number;
  answeredCount: number;
  recommendedBand: CefrBand;
  confidence: 'limited' | 'moderate' | 'strong';
  strengths: PlacementDomain[];
  priorityAreas: PlacementDomain[];
  recommendedSkills: SkillName[];
  completedAt: string;
}

export type PlacementAnswers = Record<string, number>;
