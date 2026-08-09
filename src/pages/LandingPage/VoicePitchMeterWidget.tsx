import { CheckCircle2, Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';

import { useState } from 'react';

import { useLocalizationStore } from '@/features/localization';

export const VoicePitchMeterWidget = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setScore(null);
      setTimeout(() => {
        setIsRecording(false);
        setScore(94); // 94% CEFR C1 oral defense pitch score
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-primary/30 bg-surface/90 backdrop-blur-md p-4 shadow-xl space-y-3 relative light-sweep-container overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />{' '}
          {translate('landing.voiceMeterTitle')}
        </span>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          {translate('landing.voiceMeterSubtitle')}
        </span>
      </div>

      <div className="flex items-center gap-3 bg-background/80 rounded-[var(--radius-card)] p-3 border border-border-soft">
        <button
          type="button"
          onClick={handleToggleRecord}
          aria-label="Toggle microphone"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition shadow-md cursor-pointer ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-primary text-primary-foreground hover:bg-primary-hover'
          }`}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>
              {isRecording
                ? translate('landing.voiceMeterListening')
                : translate('landing.voiceMeterClickMic')}
            </span>
            <Volume2 className="h-3.5 w-3.5 text-primary" />
          </div>

          {/* Animated Waveform Height Bars */}
          <div className="flex items-end gap-1 h-6">
            {[40, 80, 50, 100, 70, 90, 60, 85, 45, 95, 75, 55, 80, 40].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isRecording
                    ? 'bg-gradient-to-t from-primary to-emerald-400 animate-pulse'
                    : 'bg-border-soft'
                }`}
                style={{
                  height: isRecording ? `${h}%` : '20%',
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {score !== null && (
        <div className="rounded-[var(--radius-card)] bg-emerald-500/10 border border-emerald-500/30 p-2.5 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span className="text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />{' '}
            {translate('landing.voiceMeterAccuracy').replace('{score}', String(score))}
          </span>
          <span className="font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            {translate('landing.voiceMeterGrade')}
          </span>
        </div>
      )}
    </div>
  );
};
