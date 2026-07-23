import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { LISTENING_MISSIONS } from './listening.data';
import { ListeningHelpers } from './listening.helpers';
import { useListeningMissionsStore } from './listening-missions.store';
import { useListeningPlaybackStore } from './listening-playback.store';

describe('listening audio runtime', () => {
  beforeEach(() => {
    localStorage.clear();
    useListeningMissionsStore.getState().resetAllMissionsProgress();
    useListeningPlaybackStore.getState().resetPlaybackState();
  });

  it('resolves every mission audio path to a shipped MP3 asset', () => {
    LISTENING_MISSIONS.forEach((mission) => {
      expect(mission.audioUrl.endsWith('.mp3')).toBe(true);
      expect(mission.fallbackAudioUrl).toBeUndefined();

      const audioPath = path.join(
        process.cwd(),
        'public',
        mission.audioUrl.replace('/audio/', 'audio/')
      );

      expect(fs.existsSync(audioPath)).toBe(true);
    });
  });

  it('provides positive duration metadata for every mission', () => {
    LISTENING_MISSIONS.forEach((mission) => {
      expect(mission.audioDurationSeconds).toBeGreaterThan(0);
    });
  });

  it('records replay state without changing mission answers', () => {
    const mission = LISTENING_MISSIONS[0];
    const missionsStore = useListeningMissionsStore.getState();
    const playbackStore = useListeningPlaybackStore.getState();

    missionsStore.selectMission(mission.id);
    missionsStore.setAnswer('q_sm_1', 'A');
    playbackStore.recordReplay(mission.id);

    const updatedMissions = useListeningMissionsStore.getState();
    const updatedPlayback = useListeningPlaybackStore.getState();
    expect(updatedPlayback.replayCounts[mission.id]).toBe(1);
    expect(updatedMissions.answers.q_sm_1).toBe('A');
  });

  it('returns a clear loading failure message for unavailable audio', () => {
    expect(ListeningHelpers.getAudioLoadFailureMessage()).toContain(
      'Audio asset could not be loaded'
    );
  });

  it('normalizes browser duration to metadata fallback when media duration is unavailable', () => {
    expect(ListeningHelpers.normalizeDurationSeconds(Number.NaN, 44)).toBe(44);
    expect(ListeningHelpers.normalizeDurationSeconds(44.37, 92)).toBe(44);
  });
});
