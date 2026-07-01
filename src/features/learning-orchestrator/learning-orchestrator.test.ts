import { beforeEach, describe, expect, it } from 'vitest';
import {
  getInitialUserLearningProfile,
  LearningProfileRepository,
} from '@/features/profile';
import {
  VocabularyMenuService,
  VocabularyRepository,
} from '@/features/vocabulary';
import {
  LearningTaskEngine,
  getTaskLevelAllocation,
} from './learning-task.engine';
import { TaskEvaluationService } from './task-evaluation.service';

describe('connected learning task orchestration', () => {
  beforeEach(() => {
    localStorage.clear();
    LearningProfileRepository.reset();
    VocabularyMenuService.reset();
    VocabularyRepository.clearCache();
    TaskEvaluationService.reset();
  });

  it('recommends the weakest independent skill in the Learning Hub', () => {
    const profile = getInitialUserLearningProfile();
    profile.skills.reading.weaknessScore = 10;
    profile.skills.writing.weaknessScore = 20;
    profile.skills.listening.weaknessScore = 30;
    profile.skills.speaking.weaknessScore = 95;
    profile.skills.vocabulary.weaknessScore = 40;
    profile.skills.grammar.weaknessScore = 50;
    expect(LearningTaskEngine.getWeakestSkill(profile)).toBe('speaking');
  });

  it('uses three safe allocations and one controlled stretch allocation', () => {
    const profile = getInitialUserLearningProfile();
    expect(getTaskLevelAllocation(profile, 'writing')).toEqual([
      { band: 'A1', kind: 'safe' },
      { band: 'A1', kind: 'safe' },
      { band: 'A1', kind: 'safe' },
      { band: 'A1+', kind: 'stretch' },
    ]);
  });

  it('keeps A1 speaking content below A2 even when Reading is C1', async () => {
    const profile = getInitialUserLearningProfile();
    profile.skills.reading.elo = 3800;
    profile.skills.reading.cefrBand = 'C1';
    const recommendation = await LearningTaskEngine.createRecommendation(
      profile,
      'speaking'
    );
    expect(recommendation.targetCefr).toBe('A1');
    expect(recommendation.stretchCefr).toBe('A1+');
    expect(
      recommendation.vocabularyFocus.every(
        ({ term }) => term.cefrLevel === 'A1'
      )
    ).toBe(true);
    expect(
      recommendation.grammarFocus.every((rule) => rule.cefrLevel === 'A1')
    ).toBe(true);
    expect(recommendation.lessonNumber).toBe(1);
    expect(recommendation.explanation.levelReason).toContain('speaking ELO');
    expect(recommendation.explanation.eloRule).toContain('85%');
  });

  it('recommends the skill with the clearest lesson catch-up opportunity', () => {
    const profile = getInitialUserLearningProfile();
    Object.values(profile.skills).forEach((skill) => {
      skill.completedTasks = 20;
    });
    profile.skills.reading.completedTasks = 49;
    profile.skills.speaking.completedTasks = 14;
    expect(LearningTaskEngine.getOpportunitySkill(profile)).toBe('speaking');
  });

  it('selects 70/20/10 vocabulary when a seven-word memory bank exists', async () => {
    const profile = getInitialUserLearningProfile();
    const speakingTerms = (
      await VocabularyRepository.getVocabularyByLevel('A1')
    ).filter((term) => term.skillUse.includes('speaking'));
    speakingTerms
      .slice(0, 7)
      .forEach((term) => VocabularyMenuService.startLearning(term.id));
    const selected = await LearningTaskEngine.selectTaskVocabulary(
      profile,
      'speaking'
    );
    expect(selected).toHaveLength(10);
    expect(selected.filter((item) => item.bucket === 'memory')).toHaveLength(7);
    expect(
      selected.filter((item) => item.bucket === 'current-new')
    ).toHaveLength(2);
    expect(selected.filter((item) => item.bucket === 'stretch')).toHaveLength(
      1
    );
  });

  it('records ELO delta, CEFR effect, and a review recommendation', () => {
    const result = TaskEvaluationService.recordEvaluation({
      taskId: 'writing_a1_1',
      skill: 'writing',
      taskType: 'writing-production',
      targetCefr: 'A1',
      vocabularyUsed: ['site', 'report'],
      grammarUsed: ['simple present'],
      correct: true,
      accuracy: 88,
      mistakeTypes: ['preposition'],
      repeatMistakeCount: 1,
      responseTimeSeconds: 60,
      expectedResponseTimeSeconds: 90,
    });
    expect(result.eloDelta).toBeGreaterThan(0);
    expect(result.nextElo).toBeGreaterThan(result.previousElo);
    expect(result.cefrImpact).toContain('A1');
    expect(result.reviewRecommendation.length).toBeGreaterThan(0);
    expect(result.nextRecommendedAction.length).toBeGreaterThan(0);
    expect(result.mistakeTypes).toContain('preposition');
    expect(result.grammarIssues).toContain('preposition');
  });
});
