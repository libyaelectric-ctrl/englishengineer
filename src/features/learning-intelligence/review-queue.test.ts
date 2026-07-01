import { beforeEach, describe, expect, it } from 'vitest';
import { GrammarProgressService, GrammarRepository } from '@/features/grammar';
import { getInitialUserLearningProfile } from '@/features/profile';
import {
  VocabularyMenuService,
  VocabularyRepository,
} from '@/features/vocabulary';
import { LearningIntelligenceService } from './learning-intelligence.service';
import { UnifiedReviewQueueService } from './review-queue';

describe('UnifiedReviewQueueService', () => {
  beforeEach(() => {
    localStorage.clear();
    GrammarProgressService.reset();
    VocabularyMenuService.reset();
    LearningIntelligenceService.save({
      careerRole: 'Site Engineer',
      completedTaskDates: {},
      mistakeLog: [],
      lastReportDate: null,
    });
  });

  it('combines weak vocabulary, due grammar, repeated mistakes and skill opportunity', async () => {
    const start = new Date('2026-06-01T08:00:00Z');
    const reviewDate = new Date('2026-06-03T08:00:00Z');
    const word = (await VocabularyRepository.getVocabularyByLevel('A1'))[0];
    const rule = (await GrammarRepository.getGrammarRulesByLevel('A1'))[0];
    VocabularyMenuService.reviewWord(word.id, false, start, word.term);
    GrammarProgressService.recordUsage(rule.id, false, start);
    LearningIntelligenceService.addMistake(
      'Grammar',
      'Repeated tense',
      'Use simple past.',
      start
    );
    LearningIntelligenceService.addMistake(
      'Grammar',
      'Repeated tense',
      'Use simple past.',
      start
    );
    LearningIntelligenceService.addMistake(
      'Grammar',
      'Repeated tense',
      'Use simple past.',
      start
    );
    const profile = getInitialUserLearningProfile();
    profile.skills.speaking.completedTasks = 0;
    profile.skills.reading.completedTasks = 12;

    const queue = await UnifiedReviewQueueService.buildQueue(
      profile,
      reviewDate
    );
    expect(queue.map((item) => item.source)).toEqual(
      expect.arrayContaining([
        'weak-word',
        'due-item',
        'repeated-mistake',
        'skill-weakness',
      ])
    );
    expect(queue.some((item) => item.route === '/grammar')).toBe(true);
    expect(queue.some((item) => item.route === '/vocabulary')).toBe(true);
  });
});
