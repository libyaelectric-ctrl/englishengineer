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
});
