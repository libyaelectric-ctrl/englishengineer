import { beforeEach, describe, expect, it } from 'vitest';

import { WritingService } from './writing.service';

describe('WritingService', () => {
  beforeEach(() => {
    WritingService.resetWritingState();
  });

  it('returns default state on fresh start', () => {
    const state = WritingService.getState();
    expect(state.completedMissions).toEqual({});
    expect(state.history).toEqual([]);
  });

  describe('submitSubmission + mergeBackendFeedback', () => {
    it('grades locally and returns immediately (backend AI call is fire-and-forget)', () => {
      const mission = WritingService.getMissions()[0];

      const evaluation = WritingService.submitSubmission({
        missionId: mission.id,
        finalDraft:
          'The site engineer inspected the foundation before pouring concrete for the new structure.',
        timeSpentMinutes: 5,
        autoFixesUsed: 0,
      });

      expect(evaluation.missionId).toBe(mission.id);
      expect(typeof evaluation.finalScore).toBe('number');

      const state = WritingService.getState();
      expect(state.history[0].evaluation).toEqual(evaluation);
    });

    it('merges backend feedback into the matching history entry', () => {
      const mission = WritingService.getMissions()[0];

      const evaluation = WritingService.submitSubmission({
        missionId: mission.id,
        finalDraft: 'A short draft about site safety procedures.',
        timeSpentMinutes: 3,
        autoFixesUsed: 0,
      });

      WritingService.mergeBackendFeedback(mission, evaluation, {
        grammar: 'Review verb tenses.',
        vocabulary: 'Use more technical vocabulary.',
      });

      expect(evaluation.weaknesses).toEqual(
        expect.arrayContaining(['Review verb tenses.', 'Use more technical vocabulary.'])
      );
      expect(evaluation.feedback).toBe('Review verb tenses. Use more technical vocabulary.');

      const state = WritingService.getState();
      expect(state.history[0].evaluation.feedback).toBe(evaluation.feedback);
    });

    it('does nothing when backend feedback is undefined or empty', () => {
      const mission = WritingService.getMissions()[0];
      const evaluation = WritingService.submitSubmission({
        missionId: mission.id,
        finalDraft: 'Another short draft.',
        timeSpentMinutes: 2,
        autoFixesUsed: 0,
      });
      const originalFeedback = evaluation.feedback;

      WritingService.mergeBackendFeedback(mission, evaluation, undefined);
      WritingService.mergeBackendFeedback(mission, evaluation, {});

      expect(evaluation.feedback).toBe(originalFeedback);
    });
  });
});
