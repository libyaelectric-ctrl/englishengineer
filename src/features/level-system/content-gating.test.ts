// @vitest-environment node
import { describe, expect, it, beforeAll } from 'vitest';
import { LearningState } from '@/core/learning';
import {
  buildLevelProfile,
  filterContentByLevel,
  getContentAccessLabel,
  getSkillProgress,
  resolveActiveLevelContent,
} from './level-system.helpers';
import { DEFAULT_CONTENT_LEVEL_FILTER } from './level-system.types';
import { READING_MISSIONS } from '@/features/reading';
import { WRITING_MISSIONS } from '@/features/writing';
import { LISTENING_MISSIONS } from '@/features/listening';
import { SPEAKING_MISSIONS } from '@/features/speaking';
import { loadVocabularyEntries } from '@/features/vocabulary/data/vocabulary.data';
import { VocabularyEntry } from '@/features/vocabulary/types/vocabulary.types';

let vocabularyEntries: VocabularyEntry[] = [];

beforeAll(async () => {
  vocabularyEntries = await loadVocabularyEntries();
});

const learning = (
  readingSessions = 0,
  speakingSessions = 0
): LearningState => ({
  missions: [],
  achievements: [],
  xp: 0,
  level: 1,
  coins: 0,
  elo: 1000,
  streak: 0,
  lastActivityDate: null,
  studySessions: [
    ...Array.from({ length: readingSessions }, (_, index) => ({
      timestamp: new Date(2026, 0, index + 1).toISOString(),
      durationMinutes: 10,
      score: 85,
      module: 'Reading' as const,
    })),
    ...Array.from({ length: speakingSessions }, (_, index) => ({
      timestamp: new Date(2026, 2, index + 1).toISOString(),
      durationMinutes: 8,
      score: 80,
      module: 'Speaking' as const,
    })),
  ],
  scoreHistory: [],
  xpHistory: [],
  eloHistory: [],
  vocabularyPool: [],
  grammarPool: [],
});

const content = [
  { id: 'a1', cefrLevel: 'A1' as const },
  { id: 'a2', cefrLevel: 'A2' as const },
  { id: 'b2', cefrLevel: 'B2' as const },
  { id: 'c2', cefrLevel: 'C2' as const },
];

describe('real skill-based content gating', () => {
  it('starts a demo user at A1 in every core skill', () => {
    const profile = buildLevelProfile(learning(30, 20), 'demo_engineer');
    expect(
      profile.skills.slice(0, 5).map((skill) => skill.currentLevel)
    ).toEqual(['A1', 'A1', 'A1', 'A1', 'A1']);
  });

  it('allows Reading to be B2 while Speaking remains A1', () => {
    const profile = buildLevelProfile(learning(30), 'user_1');
    expect(getSkillProgress(profile, 'reading').currentLevel).toBe('B2');
    expect(getSkillProgress(profile, 'speaking').currentLevel).toBe('A1');
  });

  it('uses My Level behavior by default and excludes C2 for A1', () => {
    expect(DEFAULT_CONTENT_LEVEL_FILTER).toBe('my-level');
    const visible = filterContentByLevel(
      content,
      'A1',
      DEFAULT_CONTENT_LEVEL_FILTER
    );
    expect(visible).toEqual([content[0]]);
    expect(visible).not.toContain(content[3]);
  });

  it('exposes all levels only through the intentional All Levels mode', () => {
    expect(filterContentByLevel(content, 'A1', 'all-levels')).toEqual(content);
    expect(getContentAccessLabel('C2', 'A1')).toBe('Locked');
  });

  it('provides A1 and A2 starter content in every skill', () => {
    const missionSets = [
      READING_MISSIONS,
      WRITING_MISSIONS,
      LISTENING_MISSIONS,
      SPEAKING_MISSIONS,
    ];
    missionSets.forEach((missions) => {
      expect(missions.some((mission) => mission.cefrLevel === 'A1')).toBe(true);
      expect(missions.some((mission) => mission.cefrLevel === 'A2')).toBe(true);
    });
    expect(vocabularyEntries.some((entry) => entry.CEFR === 'A1')).toBe(true);
    expect(vocabularyEntries.some((entry) => entry.CEFR === 'A2')).toBe(true);
  });

  it('includes the required B1 Listening and Speaking starter content', () => {
    expect(
      LISTENING_MISSIONS.some((mission) => mission.cefrLevel === 'B1')
    ).toBe(true);
    expect(
      SPEAKING_MISSIONS.some((mission) => mission.cefrLevel === 'B1')
    ).toBe(true);
  });

  it('does not fall back to unrelated content when My Level is empty', () => {
    const visible = filterContentByLevel(content, 'B1', 'my-level');
    expect(visible).toEqual([]);
    expect(resolveActiveLevelContent(visible, 'a1')).toBeNull();
  });
});
