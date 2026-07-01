// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { createLearningState } from '@/test/fixtures';
import { LearningProfileEngine } from './profile.engine';
import { getInitialUserLearningProfile } from './profile.utils';

describe('learning profile engine', () => {
  it('updates Reading evidence without upgrading Speaking', () => {
    const initial = getInitialUserLearningProfile('demo', new Date(0));
    const snapshot = LearningProfileEngine.buildProfileSnapshot(
      initial,
      createLearningState({
        studySessions: [
          {
            timestamp: new Date(2026, 0, 1).toISOString(),
            durationMinutes: 10,
            score: 92,
            module: 'Reading',
          },
        ],
      })
    );
    expect(snapshot.skills.reading.elo).toBeGreaterThan(1000);
    expect(snapshot.skills.speaking.elo).toBe(1000);
    expect(snapshot.skills.speaking.cefrBand).toBe('A1');
  });

  it('gets the 5000-term total from the vocabulary repository', async () => {
    const summary = await LearningProfileEngine.getVocabularyMemorySummary();
    expect(summary.total).toBe(5000);
    expect(summary.new).toBe(5000);
    expect(summary.mastered).toBe(0);
  });

  it('generates skill-specific daily missions', async () => {
    const profile = getInitialUserLearningProfile('demo', new Date(0));
    profile.skills.reading.weaknessScore = 10;
    profile.skills.writing.weaknessScore = 20;
    profile.skills.listening.weaknessScore = 30;
    profile.skills.speaking.weaknessScore = 100;
    profile.skills.vocabulary.weaknessScore = 40;
    profile.skills.grammar.weaknessScore = 50;
    const memory = await LearningProfileEngine.getVocabularyMemorySummary();
    const missions = await LearningProfileEngine.generateDailyMissions(
      profile,
      memory
    );
    expect(missions).toHaveLength(3);
    expect(missions[0]).toMatchObject({ skill: 'speaking', cefrBand: 'A1' });
    expect(missions.map((mission) => mission.skill)).toContain('vocabulary');
    expect(missions.map((mission) => mission.skill)).toContain('grammar');
  });

  it('does not use advanced CEFR for an A1 speaking recommendation', async () => {
    const profile = getInitialUserLearningProfile('demo', new Date(0));
    profile.skills.reading.elo = 3800;
    profile.skills.reading.cefrBand = 'C1';
    profile.skills.reading.weaknessScore = 0;
    profile.skills.writing.weaknessScore = 20;
    profile.skills.listening.weaknessScore = 20;
    profile.skills.speaking.weaknessScore = 100;
    profile.skills.vocabulary.weaknessScore = 20;
    profile.skills.grammar.weaknessScore = 20;
    const memory = await LearningProfileEngine.getVocabularyMemorySummary();
    const missions = await LearningProfileEngine.generateDailyMissions(
      profile,
      memory
    );
    expect(missions[0].skill).toBe('speaking');
    expect(missions[0].cefrBand).toBe('A1');
  });
});
