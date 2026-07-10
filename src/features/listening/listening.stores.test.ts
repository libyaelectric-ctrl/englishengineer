import { describe, it, beforeEach, assert } from 'vitest';
import { useListeningMissionsStore } from './listening-missions.store';
import { useListeningPlaybackStore } from './listening-playback.store';

beforeEach(() => {
  localStorage.clear();
  useListeningMissionsStore.getState().resetAllMissionsProgress();
  useListeningPlaybackStore.getState().resetPlaybackState();
});

describe('listening-missions-store', () => {
  it('initializes with default state', () => {
    const state = useListeningMissionsStore.getState();
    assert.ok(Array.isArray(state.missions));
    assert.ok(state.missions.length > 0);
    assert.equal(typeof state.selectedMissionId, 'string');
    assert.deepEqual(state.answers, {});
    assert.equal(state.evaluationResult, null);
  });

  it('selectMission updates selectedMissionId and resets answers', () => {
    const store = useListeningMissionsStore.getState();
    store.setAnswer('q1', 'A');
    store.selectMission('listening_a2_campus_tour');
    const updated = useListeningMissionsStore.getState();
    assert.equal(updated.selectedMissionId, 'listening_a2_campus_tour');
    assert.deepEqual(updated.answers, {});
  });

  it('setAnswer stores answer by questionId', () => {
    const store = useListeningMissionsStore.getState();
    store.setAnswer('q_sm_1', 'Option A');
    const updated = useListeningMissionsStore.getState();
    assert.equal(updated.answers.q_sm_1, 'Option A');
  });

  it('setSummary and setUserKeywords update state', () => {
    const store = useListeningMissionsStore.getState();
    store.setSummary('Test summary');
    store.setUserKeywords('keyword1, keyword2');
    const updated = useListeningMissionsStore.getState();
    assert.equal(updated.summary, 'Test summary');
    assert.equal(updated.userKeywords, 'keyword1, keyword2');
  });

  it('incrementTimer increments timeSpentSeconds', () => {
    const initial = useListeningMissionsStore.getState().timeSpentSeconds;
    useListeningMissionsStore.getState().incrementTimer();
    const updated = useListeningMissionsStore.getState().timeSpentSeconds;
    assert.equal(updated, initial + 1);
  });

  it('resetCurrentMission clears mission state', () => {
    const store = useListeningMissionsStore.getState();
    store.setAnswer('q1', 'A');
    store.setSummary('test');
    store.resetCurrentMission();
    const updated = useListeningMissionsStore.getState();
    assert.deepEqual(updated.answers, {});
    assert.equal(updated.summary, '');
    assert.equal(updated.evaluationResult, null);
  });
});

describe('listening-playback-store', () => {
  it('initializes with default playback state', () => {
    const state = useListeningPlaybackStore.getState();
    assert.equal(state.isPlaying, false);
    assert.equal(typeof state.currentTimeSeconds, 'number');
    assert.equal(typeof state.totalDurationSeconds, 'number');
    assert.equal(state.playbackSpeed, 1);
  });

  it('startPlaying sets isPlaying to true', () => {
    useListeningPlaybackStore.getState().startPlaying();
    assert.equal(useListeningPlaybackStore.getState().isPlaying, true);
  });

  it('pausePlaying sets isPlaying to false', () => {
    useListeningPlaybackStore.getState().startPlaying();
    useListeningPlaybackStore.getState().pausePlaying();
    assert.equal(useListeningPlaybackStore.getState().isPlaying, false);
  });

  it('replayPlaying resets time to 0 and starts playing', () => {
    useListeningPlaybackStore.getState().replayPlaying();
    const state = useListeningPlaybackStore.getState();
    assert.equal(state.isPlaying, true);
    assert.equal(state.currentTimeSeconds, 0);
  });

  it('setCurrentTime clamps to valid range', () => {
    useListeningPlaybackStore.getState().setCurrentTime(9999);
    const state = useListeningPlaybackStore.getState();
    assert.ok(state.currentTimeSeconds <= state.totalDurationSeconds);

    useListeningPlaybackStore.getState().setCurrentTime(-5);
    assert.equal(useListeningPlaybackStore.getState().currentTimeSeconds, 0);
  });

  it('setPlaybackSpeed only accepts valid speeds', () => {
    useListeningPlaybackStore.getState().setPlaybackSpeed(2 as never);
    assert.equal(useListeningPlaybackStore.getState().playbackSpeed, 1);

    useListeningPlaybackStore.getState().setPlaybackSpeed(1.5);
    assert.equal(useListeningPlaybackStore.getState().playbackSpeed, 1.5);
  });

  it('updateAudioProgress updates time values', () => {
    useListeningPlaybackStore.getState().updateAudioProgress(30, 120);
    const state = useListeningPlaybackStore.getState();
    assert.equal(state.currentTimeSeconds, 30);
    assert.equal(state.totalDurationSeconds, 120);
  });

  it('toggleFavoriteMission adds and removes favorites', () => {
    const missionId = 'listening_a1_safe_room';
    useListeningPlaybackStore.getState().toggleFavoriteMission(missionId);
    let state = useListeningPlaybackStore.getState();
    assert.ok(state.favoriteMissionIds.includes(missionId));

    useListeningPlaybackStore.getState().toggleFavoriteMission(missionId);
    state = useListeningPlaybackStore.getState();
    assert.ok(!state.favoriteMissionIds.includes(missionId));
  });

  it('skipRelative adjusts time within bounds', () => {
    useListeningPlaybackStore.getState().skipRelative(10);
    const state1 = useListeningPlaybackStore.getState();
    assert.ok(state1.currentTimeSeconds >= 0);

    useListeningPlaybackStore.getState().skipRelative(-9999);
    assert.equal(useListeningPlaybackStore.getState().currentTimeSeconds, 0);
  });
});
