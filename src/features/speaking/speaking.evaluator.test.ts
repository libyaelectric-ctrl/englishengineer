import { describe, expect, it } from 'vitest';
import { SpeakingEvaluator } from './speaking.evaluator';
import { SpeakingMission, SpeakingSubmission } from './speaking.types';

const mockMission: SpeakingMission = {
  id: 'speaking_site_meeting',
  title: 'Site Meeting Alignment Brief',
  description: 'Test mission',
  scenarioType: 'site_meeting',
  discipline: 'Field Engineering',
  cefrLevel: 'B2',
  difficulty: 'Intermediate',
  estimatedMinutes: 10,
  promptText: 'The cable tray installation is blocked by scaffolding so we need to resequence containment works',
  expectedKeywords: ['cable tray', 'scaffolding', 'resequence', 'containment'],
  grammarTargets: ['blocked by', 'we need to'],
  confidenceMarkers: ['confirm', 'coordinate', 'resolve'],
  syllabicTargets: [
    { word: 'Scaffolding', IPA: '/ˈskæf.əl.dɪŋ/', score: 86 },
    { word: 'Resequence', IPA: '/riːˈsiː.kwəns/', score: 84 },
  ],
  targetWpm: 145,
  xpReward: 70,
  coinReward: 20,
  eloReward: 14,
};

const mockSubmission: SpeakingSubmission = {
  missionId: 'speaking_site_meeting',
  transcript: 'The cable tray installation is blocked by scaffolding so we need to resequence containment works and confirm access.',
  typedTranscript: '',
  timeSpentMinutes: 5,
  recordingSeconds: 45,
  usedSpeechRecognition: false,
};

describe('SpeakingEvaluator', () => {
  it('returns valid evaluation result structure', () => {
    const result = SpeakingEvaluator.evaluate(mockMission, mockSubmission);

    expect(result.missionId).toBe('speaking_site_meeting');
    expect(result).toHaveProperty('fluencyScore');
    expect(result).toHaveProperty('clarityScore');
    expect(result).toHaveProperty('grammarScore');
    expect(result).toHaveProperty('technicalVocabularyScore');
    expect(result).toHaveProperty('confidenceScore');
    expect(result).toHaveProperty('finalScore');
    expect(result).toHaveProperty('xpEarned');
    expect(result).toHaveProperty('coinsEarned');
    expect(result).toHaveProperty('feedback');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('weaknesses');
  });

  it('scores within 0-100 range', () => {
    const result = SpeakingEvaluator.evaluate(mockMission, mockSubmission);

    expect(result.finalScore).toBeGreaterThanOrEqual(0);
    expect(result.finalScore).toBeLessThanOrEqual(100);
    expect(result.fluencyScore).toBeGreaterThanOrEqual(0);
    expect(result.clarityScore).toBeGreaterThanOrEqual(0);
    expect(result.grammarScore).toBeGreaterThanOrEqual(0);
  });

  it('uses typedTranscript when transcript is empty', () => {
    const submission: SpeakingSubmission = {
      ...mockSubmission,
      transcript: '',
      typedTranscript: 'The cable tray installation is blocked by scaffolding',
    };
    const result = SpeakingEvaluator.evaluate(mockMission, submission);
    expect(result.transcriptUsed).toContain('cable tray');
  });

  it('penalizes filler words', () => {
    const cleanSubmission: SpeakingSubmission = {
      ...mockSubmission,
      transcript: 'The cable tray installation is blocked by scaffolding so we need to resequence containment',
    };
    const fillerSubmission: SpeakingSubmission = {
      ...mockSubmission,
      transcript: 'The cable tray um installation is basically blocked by scaffolding so we need to like resequence',
    };

    const cleanResult = SpeakingEvaluator.evaluate(mockMission, cleanSubmission);
    const fillerResult = SpeakingEvaluator.evaluate(mockMission, fillerSubmission);

    expect(cleanResult.fillerWordCount).toBe(0);
    expect(fillerResult.fillerWordCount).toBeGreaterThan(0);
  });

  it('adds strengths for high scores', () => {
    const goodSubmission: SpeakingSubmission = {
      ...mockSubmission,
      transcript: 'The cable tray installation is blocked by scaffolding so we need to resequence containment works and confirm access with coordinate resolve.',
      recordingSeconds: 40,
    };
    const result = SpeakingEvaluator.evaluate(mockMission, goodSubmission);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('counts words correctly', () => {
    const result = SpeakingEvaluator.evaluate(mockMission, mockSubmission);
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it('calculates WPM', () => {
    const result = SpeakingEvaluator.evaluate(mockMission, mockSubmission);
    expect(result.wordsPerMinute).toBeGreaterThan(0);
  });
});
