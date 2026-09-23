import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GrammarTransferService } from '@/shared/services/grammar-transfer.service';

import { WritingService } from './writing.service';

describe('WritingService', () => {
  beforeEach(() => {
    WritingService.resetWritingState();
  });

  // A submission starts a grammar-evidence write without awaiting it, and that write
  // dynamically imports the grammar corpus. Finishing the file while the import is still in
  // flight tears the module registry down under it, and vitest fails the whole run with an
  // EnvironmentTeardownError -- so the test settles the work it started instead of racing the
  // teardown. The mocked rejection is expected here: the corpus is not fetchable from a test.
  afterEach(async () => {
    await WritingService.settlePendingEvidence();
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

    it('keeps the grammar-evidence write settleable instead of abandoning it', async () => {
      const mission = WritingService.getMissions()[0];
      let releaseEvidence: () => void = () => undefined;
      const evidenceWrite = new Promise<string[]>((resolve) => {
        releaseEvidence = () => resolve([]);
      });
      const spy = vi
        .spyOn(GrammarTransferService, 'recordWritingEvidence')
        .mockReturnValue(evidenceWrite);

      WritingService.submitSubmission({
        missionId: mission.id,
        finalDraft: 'The site engineer inspected the foundation before pouring concrete.',
        timeSpentMinutes: 5,
        autoFixesUsed: 0,
      });

      expect(spy).toHaveBeenCalledTimes(1);

      // The write is still open, so settling must still be waiting -- if the promise had been
      // dropped at the call site, this would have resolved immediately and the import would be
      // free to outlive the test.
      let settled = false;
      const settling = WritingService.settlePendingEvidence().then(() => {
        settled = true;
      });
      await Promise.resolve();
      expect(settled).toBe(false);

      releaseEvidence();
      await settling;
      expect(settled).toBe(true);

      spy.mockRestore();
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
