import { beforeEach, describe, expect, it } from 'vitest';
import { SPEAKING_MISSIONS } from '@/features/speaking/speaking.data';
import {
  getSpeakingHistoryDetails,
  getSpeakingRoleplayCategory,
  SPEAKING_MVP_MODE,
  SPEAKING_MVP_REQUIRES_MICROPHONE,
} from '@/features/speaking/speaking-mvp';
import type { SpeakingEvaluationResult } from '@/features/speaking/speaking.types';
import { buildReviewPriorities } from './review-priority';
import {
  CRITICAL_MISTAKE_REPEAT_THRESHOLD,
  LearningIntelligenceService,
} from './learning-intelligence.service';

const evaluation: SpeakingEvaluationResult = {
  missionId: 'speaking_a1_site_introduction',
  fluencyScore: 58,
  clarityScore: 62,
  grammarScore: 70,
  technicalVocabularyScore: 75,
  confidenceScore: 60,
  finalScore: 59,
  xpEarned: 10,
  coinsEarned: 2,
  eloChange: -2,
  wordCount: 12,
  sentenceCount: 2,
  fillerWordCount: 0,
  wordsPerMinute: 80,
  isWordsPerMinuteEstimated: true,
  strengths: [],
  weaknesses: ['Clarity'],
  feedback: 'Repeat a shorter response.',
  transcriptUsed: 'I am an engineer. I check the site.',
};

describe('decisions 61-70', () => {
  beforeEach(() => {
    LearningIntelligenceService.save({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [],
      lastReportDate: null,
    });
  });

  it('keeps Speaking MVP text-first without a microphone requirement', () => {
    expect(SPEAKING_MVP_REQUIRES_MICROPHONE).toBe(false);
    expect(SPEAKING_MVP_MODE).toBe('Written Roleplay');
  });

  it('offers Daily, Work and Engineering roleplay categories', () => {
    const categories = new Set(
      SPEAKING_MISSIONS.map(getSpeakingRoleplayCategory)
    );
    expect(categories).toEqual(new Set(['Daily', 'Work', 'Engineering']));
  });

  it('creates a roleplay history error type and progress note', () => {
    expect(getSpeakingHistoryDetails(evaluation)).toMatchObject({
      roleplayMode: 'Written Roleplay',
      errorType: 'Speaking Response',
    });
    expect(getSpeakingHistoryDetails(evaluation).progressNote).toContain(
      'Repeat'
    );
  });

  it('marks the same mistake critical at exactly three repetitions', () => {
    expect(CRITICAL_MISTAKE_REPEAT_THRESHOLD).toBe(3);
    LearningIntelligenceService.addMistake(
      'Grammar',
      'Wrong tense',
      'Use past simple.'
    );
    LearningIntelligenceService.addMistake(
      'Grammar',
      'Wrong tense',
      'Use past simple.'
    );
    const third = LearningIntelligenceService.addMistake(
      'Grammar',
      'Wrong tense',
      'Use past simple.'
    );
    expect(third.repetitionCount).toBe(3);
    expect(third.isCritical).toBe(true);
    expect(LearningIntelligenceService.load().mistakeLog).toHaveLength(1);
  });

  it('prioritizes repeated, weak, due and skill weakness review sources', () => {
    const priorities = buildReviewPriorities([
      { id: 'skill', label: 'Speaking', source: 'skill-weakness' },
      { id: 'due', label: 'Due words', source: 'due-item' },
      { id: 'weak', label: 'Weak words', source: 'weak-word' },
      { id: 'repeat', label: 'Grammar error', source: 'repeated-mistake' },
    ]);
    expect(priorities.map((item) => item.source)).toEqual([
      'repeated-mistake',
      'weak-word',
      'due-item',
      'skill-weakness',
    ]);
  });
});
