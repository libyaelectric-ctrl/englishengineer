import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ListeningService } from './listening.service';

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

vi.mock('@/shared/logger', () => ({
  logger: {
    w: vi.fn(),
  },
}));

import { storage } from '@/shared/storage';

describe('ListeningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getState', () => {
    it('returns default state when no data in storage', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.getState();
      expect(state).toHaveProperty('completedMissions');
      expect(state).toHaveProperty('lastSelectedMissionId');
      expect(state).toHaveProperty('history');
      expect(state).toHaveProperty('favoriteMissionIds');
      expect(state.completedMissions).toEqual({});
      expect(state.history).toEqual([]);
      expect(state.favoriteMissionIds).toEqual([]);
    });

    it('merges stored state with defaults', () => {
      vi.mocked(storage.get).mockReturnValue({
        completedMissions: { 'mission-1': 85 },
        lastSelectedMissionId: 'mission-2',
        history: [],
        favoriteMissionIds: ['mission-1'],
        resumePositions: { 'mission-1': 30 },
        replayCounts: { 'mission-1': 2 },
        listeningSecondsByMission: { 'mission-1': 60 },
        speedSamples: [1, 1.25],
        audioCompletedMissionIds: ['mission-1'],
      });
      const state = ListeningService.getState();
      expect(state.completedMissions).toEqual({ 'mission-1': 85 });
      expect(state.lastSelectedMissionId).toBe('mission-2');
      expect(state.favoriteMissionIds).toEqual(['mission-1']);
      expect(state.resumePositions).toEqual({ 'mission-1': 30 });
      expect(state.replayCounts).toEqual({ 'mission-1': 2 });
      expect(state.listeningSecondsByMission).toEqual({ 'mission-1': 60 });
      expect(state.speedSamples).toEqual([1, 1.25]);
      expect(state.audioCompletedMissionIds).toEqual(['mission-1']);
    });
  });

  describe('saveState', () => {
    it('saves state to storage', () => {
      const state = {
        completedMissions: { 'mission-1': 90 },
        lastSelectedMissionId: 'mission-1',
        history: [],
        favoriteMissionIds: [],
        resumePositions: {},
        replayCounts: {},
        listeningSecondsByMission: {},
        speedSamples: [],
        audioCompletedMissionIds: [],
      };
      ListeningService.saveState(state);
      expect(storage.set).toHaveBeenCalledWith('EngVox_listening_state', state);
    });
  });

  describe('getMissions', () => {
    it('returns all missions when no discipline specified', () => {
      const missions = ListeningService.getMissions();
      expect(missions.length).toBeGreaterThan(0);
    });

    it('filters missions by discipline', () => {
      const allMissions = ListeningService.getMissions();
      const civilMissions = ListeningService.getMissions('civil' as any);
      expect(civilMissions.length).toBeLessThanOrEqual(allMissions.length);
    });
  });

  describe('getMissionById', () => {
    it('returns undefined for non-existent mission', () => {
      const mission = ListeningService.getMissionById('non-existent');
      expect(mission).toBeUndefined();
    });

    it('returns mission when it exists', () => {
      const allMissions = ListeningService.getMissions();
      if (allMissions.length > 0) {
        const mission = ListeningService.getMissionById(allMissions[0].id);
        expect(mission).toBeDefined();
        expect(mission?.id).toBe(allMissions[0].id);
      }
    });
  });

  describe('setLastSelectedMissionId', () => {
    it('updates lastSelectedMissionId and saves state', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      ListeningService.setLastSelectedMissionId('new-mission');
      expect(storage.set).toHaveBeenCalled();
      const savedState = vi.mocked(storage.set).mock.calls[0][1] as any;
      expect(savedState.lastSelectedMissionId).toBe('new-mission');
    });
  });

  describe('toggleFavoriteMission', () => {
    it('adds mission to favorites when not already favorite', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.toggleFavoriteMission('mission-1');
      expect(state.favoriteMissionIds).toContain('mission-1');
    });

    it('removes mission from favorites when already favorite', () => {
      vi.mocked(storage.get).mockReturnValue({
        favoriteMissionIds: ['mission-1'],
      });
      const state = ListeningService.toggleFavoriteMission('mission-1');
      expect(state.favoriteMissionIds).not.toContain('mission-1');
    });
  });

  describe('saveResumePosition', () => {
    it('saves resume position for mission', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.saveResumePosition('mission-1', 30);
      expect(state.resumePositions).toEqual({ 'mission-1': 30 });
    });

    it('floors the seconds value', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.saveResumePosition('mission-1', 30.7);
      expect(state.resumePositions).toEqual({ 'mission-1': 30 });
    });

    it('floors negative values to 0', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.saveResumePosition('mission-1', -5);
      expect(state.resumePositions).toEqual({ 'mission-1': 0 });
    });
  });

  describe('recordReplay', () => {
    it('increments replay count for mission', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.recordReplay('mission-1');
      expect(state.replayCounts).toEqual({ 'mission-1': 1 });
    });

    it('increments existing replay count', () => {
      vi.mocked(storage.get).mockReturnValue({
        replayCounts: { 'mission-1': 2 },
      });
      const state = ListeningService.recordReplay('mission-1');
      expect(state.replayCounts).toEqual({ 'mission-1': 3 });
    });
  });

  describe('recordListeningSecond', () => {
    it('increments listening seconds for mission', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.recordListeningSecond('mission-1', 1);
      expect(state.listeningSecondsByMission).toEqual({ 'mission-1': 1 });
    });

    it('adds speed sample to last 100', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.recordListeningSecond('mission-1', 1.25);
      expect(state.speedSamples).toContain(1.25);
    });

    it('keeps only last 100 speed samples', () => {
      vi.mocked(storage.get).mockReturnValue({
        speedSamples: Array(100).fill(1),
      });
      const state = ListeningService.recordListeningSecond('mission-1', 1.5);
      expect(state.speedSamples).toHaveLength(100);
      expect(state.speedSamples[99]).toBe(1.5);
    });
  });

  describe('markAudioCompleted', () => {
    it('marks audio as completed for mission', () => {
      vi.mocked(storage.get).mockReturnValue(null);
      const state = ListeningService.markAudioCompleted('mission-1');
      expect(state.audioCompletedMissionIds).toContain('mission-1');
      expect(state.resumePositions).toEqual({ 'mission-1': 0 });
    });

    it('does not duplicate mission in audioCompletedMissionIds', () => {
      vi.mocked(storage.get).mockReturnValue({
        audioCompletedMissionIds: ['mission-1'],
      });
      const state = ListeningService.markAudioCompleted('mission-1');
      expect(state.audioCompletedMissionIds.filter((id: string) => id === 'mission-1')).toHaveLength(1);
    });
  });

  describe('resetListeningState', () => {
    it('calls saveState with an object containing expected shape', () => {
      const spy = vi.spyOn(ListeningService, 'saveState');
      ListeningService.resetListeningState();
      expect(spy).toHaveBeenCalledTimes(1);
      const saved = spy.mock.calls[0][0] as any;
      expect(saved.completedMissions).toEqual({});
      expect(saved.history).toEqual([]);
      expect(Array.isArray(saved.favoriteMissionIds)).toBe(true);
      expect(Array.isArray(saved.speedSamples)).toBe(true);
      spy.mockRestore();
    });
  });
});
