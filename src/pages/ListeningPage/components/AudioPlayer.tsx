import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

interface AudioPlayerProps {
  audioUrl?: string;
  onTimeUpdate?: (time: number) => void;
}

export const AudioPlayer = ({ audioUrl, onTimeUpdate }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => { setCurrentTime(audio.currentTime); onTimeUpdate?.(audio.currentTime); };
    const onDur = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onDur); };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const seek = (delta: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-4 space-y-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center gap-3">
        <button onClick={() => seek(-10)} className="text-muted-copy hover:text-foreground"><SkipBack className="h-4 w-4" /></button>
        <button onClick={togglePlay} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={() => seek(10)} className="text-muted-copy hover:text-foreground"><SkipForward className="h-4 w-4" /></button>
        <span className="text-[10px] font-mono text-muted-copy">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <input type="range" min={0} max={duration || 1} value={currentTime} onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }} className="w-full h-1 accent-primary" />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-copy hover:text-foreground'}`}>{s}x</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Volume2 className="h-3 w-3 text-muted-copy" />
          <input type="range" min={0} max={1} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-16 h-1 accent-primary" />
        </div>
      </div>
    </div>
  );
};
