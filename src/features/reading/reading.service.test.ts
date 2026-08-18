import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storage } from '@/shared/storage';

import { ReadingService } from './reading.service';

// Mock dependencies
vi.mock('@/shared/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/core/learning', () => ({
  useLearningStore: {
    getState: vi.fn(() => ({
      missions: [],
      submitMissionResult: vi.fn(),
      completeGenericPractice: vi.fn(),
    })),
  },
}));

vi.mock('@/features/vocabulary', () => ({
  VocabularyService: {
    addDiscoveredTerms: vi.fn(),
  },
}));

vi.mock('@/shared/services/grammar-transfer.service', () => ({
  GrammarTransferService: {
    recordReadingEvidence: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/features/ai', () => ({
  AIService: {
    run: vi.fn().mockResolvedValue({ structuredResult: null }),
  },
}));

describe('ReadingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getState', () => {
    it('returns default state when no data in storage', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ReadingService.getState();
      expect(state).toEqual({
        completedMissions: {},
        lastSelectedMissionId: 'reading_a1_site_signs',
        history: [],
      });
    });

    it('merges stored state with defaults', () => {
      vi.mocked(storage.get).mockReturnValue({
        completedMissions: { 'mission-1': 85 },
        lastSelectedMissionId: 'mission-2',
        history: [
          { missionId: 'mission-1', timestamp: '2024-01-01', score: 85, evaluation: {} as any },
        ],
      });
      const state = ReadingService.getState();
      expect(state.completedMissions).toEqual({ 'mission-1': 85 });
      expect(state.lastSelectedMissionId).toBe('mission-2');
      expect(state.history).toHaveLength(1);
    });
  });

  describe('saveState', () => {
    it('saves state to storage', () => {
      const state = {
        completedMissions: { 'mission-1': 90 },
        lastSelectedMissionId: 'mission-1',
        history: [],
      };
      ReadingService.saveState(state);
      expect(storage.set).toHaveBeenCalledWith('EngVox_reading_state', state);
    });
  });

  describe('getMissions', () => {
    it('returns all missions when no discipline specified', () => {
      const missions = ReadingService.getMissions();
      expect(missions.length).toBeGreaterThan(0);
    });

    it('filters missions by discipline', () => {
      const allMissions = ReadingService.getMissions();
      const civilMissions = ReadingService.getMissions('civil' as any);
      expect(civilMissions.length).toBeLessThanOrEqual(allMissions.length);
    });
  });

  describe('getMissionById', () => {
    it('returns undefined for non-existent mission', () => {
      const mission = ReadingService.getMissionById('non-existent');
      expect(mission).toBeUndefined();
    });

    it('returns mission when it exists', () => {
      const allMissions = ReadingService.getMissions();
      if (allMissions.length > 0) {
        const mission = ReadingService.getMissionById(allMissions[0].id);
        expect(mission).toBeDefined();
        expect(mission?.id).toBe(allMissions[0].id);
      }
    });
  });

  describe('setLastSelectedMissionId', () => {
    it('updates lastSelectedMissionId and saves state', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      ReadingService.setLastSelectedMissionId('new-mission');
      expect(storage.set).toHaveBeenCalled();
      const savedState = vi.mocked(storage.set).mock.calls[0][1] as any;
      expect(savedState.lastSelectedMissionId).toBe('new-mission');
    });
  });

  describe('resetReadingState', () => {
    it('resets to default state', () => {
      ReadingService.resetReadingState();
      expect(storage.set).toHaveBeenCalled();
      const savedState = vi.mocked(storage.set).mock.calls[0][1] as any;
      expect(savedState.completedMissions).toEqual({});
      expect(savedState.history).toEqual([]);
    });
  });
});
