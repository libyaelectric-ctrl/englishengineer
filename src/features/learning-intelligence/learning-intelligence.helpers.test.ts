import { describe, expect, it } from 'vitest';
import { LearningState } from '@/core/learning';
import { AssessmentProfile } from '@/features/assessment';
import {
  buildSevenDayReport,
  getPersonalizedTasks,
} from './learning-intelligence.helpers';
import { MistakeLogEntry } from './learning-intelligence.types';

const learning: LearningState = {
  missions: [],
  achievements: [],
  xp: 100,
  level: 1,
  coins: 10,
  elo: 1010,
  streak: 1,
  lastActivityDate: null,
  studySessions: [],
  scoreHistory: [],
  xpHistory: [],
  eloHistory: [],
};

const assessment: AssessmentProfile = {
  hasEnoughData: false,
  dataStatus: 'insufficient',
  overallScore: null,
  engineerCefr: null,
  engineerElo: 1000,
  dimensionScores: [],
  strongestDimensions: [],
  weakestDimensions: [],
  recentHistory: [],
  recommendedNextMissions: [],
  readiness: { meetings: null, reports: null, consultantCommunication: null },
  trustLabel: 'Limited local evidence',
  confidenceScore: 0,
  confidenceExplanation: 'Not enough evidence.',
  certificateDisclaimer: 'Not an official certificate.',
};

const mistake: MistakeLogEntry = {
  id: 'mistake-1',
  category: 'tone',
  originalText: 'Send now.',
  correction: 'Please submit the document by 14:00.',
  createdAt: new Date().toISOString(),
};

describe('Learning Intelligence personalization', () => {
  it('changes recommended tasks with career role', () => {
    const qa = buildSevenDayReport(
      learning,
      assessment,
      {},
      [mistake],
      'QA/QC Engineer',
      'A1'
    );
    const commissioning = buildSevenDayReport(
      learning,
      assessment,
      {},
      [mistake],
      'Commissioning Engineer',
      'A1'
    );
    expect(qa.recommendedNextTasks).not.toEqual(
      commissioning.recommendedNextTasks
    );
    expect(qa.recommendedNextTasks[0]).toContain('NCR');
  });

  it('uses current level and repeated mistake in the report', () => {
    const report = buildSevenDayReport(
      learning,
      assessment,
      {},
      [mistake, { ...mistake, id: 'mistake-2' }],
      'Project Manager',
      'B1'
    );
    expect(report.currentLevel).toBe('B1');
    expect(report.cefrEstimate).toContain('B1');
    expect(report.topRepeatedMistake).toBe('tone');
    expect(report.recommendedQuickAIAction).toBe('More polite');
  });

  it('generates role-aware and level-aware daily tasks', () => {
    const tasks = getPersonalizedTasks(
      'Procurement Engineer',
      'A2',
      'Writing',
      [mistake],
      {}
    );
    expect(tasks[0].module).toBe('Writing');
    expect(tasks.every((task) => task.level === 'A2')).toBe(true);
    expect(tasks[0].description).toContain('Procurement Engineer');
  });
});
// @vitest-environment node
