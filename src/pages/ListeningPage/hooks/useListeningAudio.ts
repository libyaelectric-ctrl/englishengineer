/**
 * useListeningAudio — Audio playback logic hook for ListeningPage.
 *
 * Extracted from ListeningPage/index.tsx for co-location and testability.
 * Contains audio state management: play, pause, seek, speed control.
 *
 * @see ListeningPage/index.tsx for full context
 */

import { useEffect, useRef, useState } from 'react';
import { PLAYBACK_SPEEDS } from '@/features/listening/listening.constants';

export interface UseListeningAudioResult {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  progress: number;
  togglePlay: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cycleSpeed: () => void;
  resetAudio: () => void;
}

export const useListeningAudio = (audioSrc: string | undefined): UseListeningAudioResult => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    const idx = (PLAYBACK_SPEEDS as unknown as number[]).indexOf(speed);
    const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    setSpeed(next);
    if (audio) audio.playbackRate = next as number;
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    speed,
    progress,
    togglePlay,
    handleSeek,
    cycleSpeed,
    resetAudio,
  };
};
