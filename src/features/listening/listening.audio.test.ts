import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { LISTENING_MISSIONS } from './listening.data';
import { ListeningHelpers } from './listening.helpers';
import { useListeningStore } from './listening.store';

const getWavDurationSeconds = (filePath: string): number => {
  const buffer = fs.readFileSync(filePath);
  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    offset += 8;

    if (chunkId === 'fmt ') {
      byteRate = buffer.readUInt32LE(offset + 8);
    }

    if (chunkId === 'data') {
      dataSize = chunkSize;
      break;
    }

    offset += chunkSize + (chunkSize % 2);
  }

  if (byteRate <= 0 || dataSize <= 0) {
    throw new Error(`Invalid WAV metadata for ${filePath}`);
  }

  return Math.round(dataSize / byteRate);
};

describe('listening audio runtime', () => {
  beforeEach(() => {
    localStorage.clear();
    useListeningStore.getState().resetAllListeningProgress();
  });

  it('resolves every mission audio path to a shipped WAV asset', () => {
    LISTENING_MISSIONS.forEach((mission) => {
      expect(mission.audioUrl.endsWith('.wav')).toBe(true);
      expect(mission.fallbackAudioUrl).toBeUndefined();

      const audioPath = path.join(
        process.cwd(),
        'public',
        mission.audioUrl.replace('/audio/', 'audio/')
      );

      expect(fs.existsSync(audioPath)).toBe(true);
    });
  });

  it('keeps duration metadata aligned with actual WAV duration', () => {
    LISTENING_MISSIONS.forEach((mission) => {
      const audioPath = path.join(
        process.cwd(),
        'public',
        mission.audioUrl.replace('/audio/', 'audio/')
      );
      const actualDuration = getWavDurationSeconds(audioPath);

      expect(mission.audioDurationSeconds).toBe(actualDuration);
    });
  });

  it('records replay state without changing mission answers', () => {
    const mission = LISTENING_MISSIONS[0];
    const store = useListeningStore.getState();

    store.selectMission(mission.id);
    store.setAnswer('q_sm_1', 'A');
    store.recordReplay(mission.id);

    const updated = useListeningStore.getState();
    expect(updated.replayCounts[mission.id]).toBe(1);
    expect(updated.answers.q_sm_1).toBe('A');
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
