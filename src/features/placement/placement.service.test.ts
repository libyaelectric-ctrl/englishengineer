import { beforeEach, describe, expect, it } from 'vitest';
import { LearningProfileRepository } from '@/features/profile';
import { PLACEMENT_QUESTIONS } from './placement.data';
import { PlacementService } from './placement.service';

describe('PlacementService', () => {
  const userId = 'placement-test-user';

  beforeEach(() => {
    localStorage.clear();
    LearningProfileRepository.reset(userId);
  });

  it('updates assessed skills while unassessed skills remain A1', () => {
    const answers = Object.fromEntries(
      PLACEMENT_QUESTIONS.slice(0, 6).map((question) => [
        question.id,
        question.correctIndex,
      ])
    );
    PlacementService.submit(userId, answers);
    const profile = LearningProfileRepository.getProfile(userId);

    expect(profile.placementCompleted).toBe(true);
    expect(profile.skills.reading.cefrBand).not.toBe('A1');
    expect(profile.skills.vocabulary.cefrBand).toBe(
      profile.skills.reading.cefrBand
    );
    expect(profile.skills.grammar.cefrBand).toBe(
      profile.skills.reading.cefrBand
    );
    expect(profile.skills.writing.cefrBand).toBe('A1');
    expect(profile.skills.listening.cefrBand).toBe('A1');
    expect(profile.skills.speaking.cefrBand).toBe('A1');
  });

  it('supports an explicit A1 start without fake assessment evidence', () => {
    PlacementService.startAtA1(userId);
    const profile = LearningProfileRepository.getProfile(userId);
    expect(profile.placementBand).toBe('A1');
    expect(profile.placementConfidence).toBe('limited');
    expect(PlacementService.getResult(userId)).toBeNull();
  });
});
