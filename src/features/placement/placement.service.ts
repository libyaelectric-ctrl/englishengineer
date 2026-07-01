import { storage } from '@/shared/storage';
import { LearningProfileRepository, getEloBandRange } from '@/features/profile';
import { PLACEMENT_QUESTIONS } from './placement.data';
import { evaluatePlacement } from './placement.helpers';
import type { PlacementAnswers, PlacementResult } from './placement.types';

const STORAGE_KEY = 'engineeros_placement_result';

export const PlacementService = {
  getResult(userId: string): PlacementResult | null {
    return storage.get<PlacementResult>(`${STORAGE_KEY}_${userId}`);
  },

  submit(userId: string, answers: PlacementAnswers): PlacementResult {
    const result = evaluatePlacement(PLACEMENT_QUESTIONS, answers);
    const startingElo = getEloBandRange(result.recommendedBand).min;

    result.recommendedSkills.forEach((skill) => {
      LearningProfileRepository.updateSkill(userId, skill, {
        elo: startingElo,
      });
    });
    LearningProfileRepository.updatePreferences(userId, {
      placementCompleted: true,
      placementConfidence: result.confidence,
      placementBand: result.recommendedBand,
      learningFocus: result.priorityAreas,
    });
    storage.set(`${STORAGE_KEY}_${userId}`, result);
    return result;
  },

  startAtA1(userId: string): void {
    LearningProfileRepository.updatePreferences(userId, {
      placementCompleted: true,
      placementConfidence: 'limited',
      placementBand: 'A1',
    });
  },
};
