import { beforeEach, describe, expect, it } from 'vitest';
import {
  getMissingGrammarTransferEvidence,
  getGrammarReviewReason,
  GrammarProgressService,
} from './grammar.progress';

describe('Grammar progression', () => {
  beforeEach(() => {
    localStorage.clear();
    GrammarProgressService.reset();
  });
  it('does not mark a rule strong merely because it was opened', () => {
    const progress = GrammarProgressService.recordExposure('rule_1');
    expect(progress.reviewStatus).toBe('Learning');
    expect(progress.strength).toBe(0);
    expect(progress.correctUsages).toBe(0);
  });
  it('requires grammar practice plus reading and writing transfer to master a rule', () => {
    const now = new Date('2026-06-29T10:00:00Z');
    GrammarProgressService.recordUsage('rule_1', true, now);
    GrammarProgressService.recordUsage('rule_1', true, now);
    const practiced = GrammarProgressService.recordUsage('rule_1', true, now);
    expect(practiced.reviewStatus).toBe('Learning');
    expect(practiced.strength).toBe(75);
    expect(getMissingGrammarTransferEvidence(practiced)).toEqual([
      'reading',
      'writing',
    ]);
    GrammarProgressService.recordSkillEvidence(
      'rule_1',
      'reading',
      'reading_mission',
      86,
      now
    );
    const progress = GrammarProgressService.recordSkillEvidence(
      'rule_1',
      'writing',
      'writing_mission',
      91,
      now
    );
    expect(progress.reviewStatus).toBe('Strong');
    expect(progress.strength).toBe(75);
    expect(progress.nextReviewDate).toBe('2026-07-13T10:00:00.000Z');
  });
  it('summarizes new, learning, due and strong rules honestly', () => {
    const now = new Date('2026-06-29T10:00:00Z');
    GrammarProgressService.recordUsage('rule_learning', true, now);
    GrammarProgressService.recordUsage('rule_strong', true, now);
    GrammarProgressService.recordUsage('rule_strong', true, now);
    GrammarProgressService.recordUsage('rule_strong', true, now);
    GrammarProgressService.recordSkillEvidence(
      'rule_strong',
      'reading',
      'reading_mission',
      85,
      now
    );
    GrammarProgressService.recordSkillEvidence(
      'rule_strong',
      'writing',
      'writing_mission',
      85,
      now
    );
    const summary = GrammarProgressService.getSummary(360, now);
    expect(summary).toMatchObject({
      tracked: 2,
      newRules: 358,
      learning: 1,
      strong: 1,
      due: 0,
    });
  });
  it('explains new, learning and due review priorities', () => {
    const now = new Date('2026-06-29T10:00:00Z');
    expect(
      getGrammarReviewReason(GrammarProgressService.get('new', now), now)
    ).toContain('next named topic');
    const learning = GrammarProgressService.recordUsage('learning', false, now);
    expect(getGrammarReviewReason(learning, now)).toContain('previous mistake');
    expect(
      getGrammarReviewReason(
        GrammarProgressService.get(
          'learning',
          new Date('2026-06-30T10:00:00Z')
        ),
        new Date('2026-06-30T10:00:00Z')
      )
    ).toContain('current priority');
  });
});
