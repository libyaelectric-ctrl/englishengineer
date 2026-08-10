import { beforeEach, describe, expect, it } from 'vitest';

import { SpeakingService } from './speaking.service';

describe('SpeakingService', () => {
  beforeEach(() => {
    SpeakingService.resetSpeakingState();
  });

  it('returns default state on fresh start', () => {
    const state = SpeakingService.getState();
    expect(state.completedMissions).toEqual({});
    expect(state.history).toEqual([]);
    expect(state.lastSelectedMissionId).toBe('speaking_a1_site_introduction');
  });

  it('retrieves all missions', () => {
    const missions = SpeakingService.getMissions();
    expect(missions.length).toBeGreaterThan(0);
    expect(missions[0]).toHaveProperty('id');
    expect(missions[0]).toHaveProperty('promptText');
  });

  it('finds mission by id', () => {
    const missions = SpeakingService.getMissions();
    const first = missions[0];
    const found = SpeakingService.getMissionById(first.id);
    expect(found?.id).toBe(first.id);
  });

  it('returns undefined for unknown mission id', () => {
    const result = SpeakingService.getMissionById('nonexistent');
    expect(result).toBeUndefined();
  });

  it('saves and loads state', () => {
    const state = SpeakingService.getState();
    state.completedMissions['test_mission'] = 85;
    SpeakingService.saveState(state);

    const loaded = SpeakingService.getState();
    expect(loaded.completedMissions['test_mission']).toBe(85);
  });

  it('sets last selected mission id', () => {
    SpeakingService.setLastSelectedMissionId('speaking_toolbox_talk');
    const state = SpeakingService.getState();
    expect(state.lastSelectedMissionId).toBe('speaking_toolbox_talk');
  });

  it('resets state to defaults', () => {
    SpeakingService.setLastSelectedMissionId('speaking_toolbox_talk');
    SpeakingService.resetSpeakingState();
    const state = SpeakingService.getState();
    expect(state.lastSelectedMissionId).toBe('speaking_a1_site_introduction');
    expect(state.completedMissions).toEqual({});
  });

  describe('submitSubmission + mergeBackendFeedback', () => {
    it('grades locally without making any network call (AI evaluation is server-side only)', () => {
      const mission = SpeakingService.getMissions()[0];

      const evaluation = SpeakingService.submitSubmission({
        missionId: mission.id,
        transcript: 'I check the site every morning for safety issues.',
        typedTranscript: '',
        timeSpentMinutes: 2,
        recordingSeconds: 30,
        usedSpeechRecognition: true,
      });

      expect(evaluation.missionId).toBe(mission.id);
      expect(typeof evaluation.finalScore).toBe('number');

      const state = SpeakingService.getState();
      expect(state.history[0].evaluation).toEqual(evaluation);
    });

    it('merges backend feedback into the matching history entry', () => {
      const mission = SpeakingService.getMissions()[0];

      const evaluation = SpeakingService.submitSubmission({
        missionId: mission.id,
        transcript: 'I check the site every morning.',
        typedTranscript: '',
        timeSpentMinutes: 1,
        recordingSeconds: 20,
        usedSpeechRecognition: true,
      });

      SpeakingService.mergeBackendFeedback(mission, evaluation, {
        grammar: 'Watch subject-verb agreement.',
        vocabulary: 'Use more technical terms.',
      });

      expect(evaluation.weaknesses).toEqual(
        expect.arrayContaining(['Watch subject-verb agreement.', 'Use more technical terms.'])
      );
      expect(evaluation.feedback).toBe('Watch subject-verb agreement. Use more technical terms.');

      const state = SpeakingService.getState();
      expect(state.history[0].evaluation.feedback).toBe(evaluation.feedback);
    });

    it('does nothing when backend feedback is undefined or empty', () => {
      const mission = SpeakingService.getMissions()[0];
      const evaluation = SpeakingService.submitSubmission({
        missionId: mission.id,
        transcript: 'A short response.',
        typedTranscript: '',
        timeSpentMinutes: 1,
        recordingSeconds: 15,
        usedSpeechRecognition: true,
      });
      const originalFeedback = evaluation.feedback;

      SpeakingService.mergeBackendFeedback(mission, evaluation, undefined);
      SpeakingService.mergeBackendFeedback(mission, evaluation, {});

      expect(evaluation.feedback).toBe(originalFeedback);
    });
  });
});
