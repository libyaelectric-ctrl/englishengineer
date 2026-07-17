import { useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  CheckCircle,
} from 'lucide-react';
import { useListeningPlaybackStore } from './listening-playback.store';
import { ListeningHelpers } from './listening.helpers';
import type { ListeningPlaybackSpeed } from './listening.types';
import type { ListeningMission } from './listening.types';
import { Button } from '@/shared/components/Button';

const SPEED_OPTIONS: ListeningPlaybackSpeed[] = [0.75, 1, 1.25, 1.5];

interface AudioPlayerProps {
  mission: ListeningMission;
}

export const AudioPlayer = ({ mission }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPlaying = useListeningPlaybackStore((s) => s.isPlaying);
  const currentTimeSeconds = useListeningPlaybackStore(
    (s) => s.currentTimeSeconds
  );
  const totalDurationSeconds = useListeningPlaybackStore(
    (s) => s.totalDurationSeconds
  );
  const playbackSpeed = useListeningPlaybackStore((s) => s.playbackSpeed);
  const isAudioLoading = useListeningPlaybackStore((s) => s.isAudioLoading);
  const audioError = useListeningPlaybackStore((s) => s.audioError);
  const resumePositions = useListeningPlaybackStore((s) => s.resumePositions);
  const replayCounts = useListeningPlaybackStore((s) => s.replayCounts);
  const audioCompletedMissionIds = useListeningPlaybackStore(
    (s) => s.audioCompletedMissionIds
  );
  const startPlaying = useListeningPlaybackStore((s) => s.startPlaying);
  const pausePlaying = useListeningPlaybackStore((s) => s.pausePlaying);
  const replayPlaying = useListeningPlaybackStore((s) => s.replayPlaying);
  const setPlaybackSpeed = useListeningPlaybackStore((s) => s.setPlaybackSpeed);
  const setAudioLoading = useListeningPlaybackStore((s) => s.setAudioLoading);
  const setAudioError = useListeningPlaybackStore((s) => s.setAudioError);
  const updateAudioProgress = useListeningPlaybackStore(
    (s) => s.updateAudioProgress
  );
  const recordListeningSecond = useListeningPlaybackStore(
    (s) => s.recordListeningSecond
  );
  const markAudioCompleted = useListeningPlaybackStore(
    (s) => s.markAudioCompleted
  );
  const recordReplay = useListeningPlaybackStore((s) => s.recordReplay);

  const isCompleted = audioCompletedMissionIds.includes(mission.id);
  const replayCount = replayCounts[mission.id] || 0;
  const resumePosition = resumePositions[mission.id] || 0;

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      const duration = ListeningHelpers.normalizeDurationSeconds(
        audio.duration,
        mission.audioDurationSeconds
      );
      updateAudioProgress(0, duration);
      setAudioLoading(false);
    };

    const handleCanPlay = () => {
      setAudioLoading(false);
    };

    const handleError = () => {
      setAudioError(ListeningHelpers.getAudioLoadFailureMessage());
    };

    const handleEnded = () => {
      markAudioCompleted(mission.id);
      pausePlaying();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [mission.id, mission.audioDurationSeconds]);

  // Load audio source when mission changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioLoading(true);
    audio.src = mission.audioUrl;
    audio.load();

    // Restore resume position
    if (resumePosition > 0) {
      audio.currentTime = resumePosition;
    }
  }, [mission.audioUrl, resumePosition]);

  // Sync playback speed
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Play/pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        pausePlaying();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, pausePlaying]);

  // Timer for progress tracking
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio) {
          updateAudioProgress(audio.currentTime, audio.duration);
          recordListeningSecond();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, updateAudioProgress, recordListeningSecond]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pausePlaying();
    } else {
      startPlaying();
      if (currentTimeSeconds === 0 && !isCompleted) {
        recordReplay(mission.id);
      }
    }
  }, [
    isPlaying,
    currentTimeSeconds,
    isCompleted,
    pausePlaying,
    startPlaying,
    recordReplay,
    mission.id,
  ]);

  const handleReplay = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }
    replayPlaying();
    recordReplay(mission.id);
  }, [replayPlaying, recordReplay, mission.id]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const seconds = Number(e.target.value);
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = seconds;
      }
      updateAudioProgress(seconds, totalDurationSeconds);
    },
    [totalDurationSeconds, updateAudioProgress]
  );

  const handleSpeedChange = useCallback(
    (speed: ListeningPlaybackSpeed) => {
      setPlaybackSpeed(speed);
    },
    [setPlaybackSpeed]
  );

  const handleSkipBack = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, audio.currentTime - 10);
      audio.currentTime = newTime;
      updateAudioProgress(newTime, totalDurationSeconds);
    }
  }, [totalDurationSeconds, updateAudioProgress]);

  const handleSkipForward = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.min(totalDurationSeconds, audio.currentTime + 10);
      audio.currentTime = newTime;
      updateAudioProgress(newTime, totalDurationSeconds);
    }
  }, [totalDurationSeconds, updateAudioProgress]);

  return (
    <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {ListeningHelpers.getAudioFormatLabel(mission.audioUrl)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCircle className="h-3 w-3" />
              Completed
            </span>
          )}
          {replayCount > 0 && (
            <span className="text-xs text-muted-copy">
              Replay #{replayCount}
            </span>
          )}
        </div>
      </div>

      {audioError ? (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-400">
          {audioError}
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={totalDurationSeconds}
              value={currentTimeSeconds}
              onChange={handleSeek}
              className="w-full h-1.5 bg-border-soft rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              disabled={isAudioLoading}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-copy">
                {ListeningHelpers.formatTime(currentTimeSeconds)}
              </span>
              <span className="text-xs text-muted-copy">
                {ListeningHelpers.formatTime(totalDurationSeconds)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkipBack}
              disabled={isAudioLoading}
              title="Back 10s"
              aria-label="Back 10s"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleReplay}
              disabled={isAudioLoading}
              title="Replay"
              aria-label="Replay"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={isAudioLoading}
              className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkipForward}
              disabled={isAudioLoading}
              title="Forward 10s"
              aria-label="Forward 10s"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-hover text-muted-copy hover:text-foreground'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </>
      )}

      <p className="mt-3 text-xs text-center text-muted-copy">
        {mission.accentLabel}
      </p>
    </div>
  );
};
