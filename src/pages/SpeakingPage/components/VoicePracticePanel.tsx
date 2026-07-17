import { Lock, Mic, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface VoicePracticePanelProps {
  hasMaxAccess: boolean;
  isRecording: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  pauseRef: React.MutableRefObject<boolean>;
  recordedAudio: string | null;
  pronunciationScore: number | null;
  phonemeFeedback: Array<{ word: string; score: number; phonemes: string }>;
  waveformBars: number[];
  typedTranscript: string;
  onStartRecording: () => void;
  onSubmitRoleplay: () => void;
  onResetRecording: () => void;
}

export const VoicePracticePanel = ({
  hasMaxAccess,
  isRecording,
  isPaused,
  setIsPaused,
  pauseRef,
  recordedAudio,
  pronunciationScore,
  phonemeFeedback,
  waveformBars,
  typedTranscript,
  onStartRecording,
  onSubmitRoleplay,
  onResetRecording,
}: VoicePracticePanelProps) => {
  if (!hasMaxAccess) {
    return (
      <div className="rounded-[4px] border border-warning/20 bg-warning/5 p-6 text-center space-y-4 shadow-sm animate-in fade-in">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-foreground uppercase tracking-wider">
            Voice Practice & Pronunciation Rating is Locked
          </p>
          <p className="text-xs text-muted-copy max-w-md mx-auto leading-relaxed font-medium">
            Real Voice Speaking, pronunciation analysis, and voice simulator
            workflows are exclusive features of the Max Plan ($59/mo). Upgrade
            today to practice speech dynamically.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = '/checkout?plan=max')}
          className="bg-warning hover:bg-warning/90 text-white font-bold uppercase tracking-wider text-[10px] px-5 h-10 rounded-[4px] cursor-pointer border border-warning shadow-sm"
        >
          Upgrade to Max Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Voice Workspace */}
      <div className="rounded-[4px] border border-[#d9d9e3] bg-[#f3f3fd] p-5 flex flex-col items-center justify-center min-h-32 relative overflow-hidden shadow-sm">
        {isRecording ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-end justify-center gap-[3px] h-16 w-full">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#0047bb] transition-all"
                  style={{ height: `${h}px`, transition: 'height 120ms ease' }}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-[#0047bb] uppercase tracking-widest animate-pulse">
              Recording... Speak now.
            </p>
          </div>
        ) : recordedAudio ? (
          <div className="flex flex-col items-center gap-2">
            <Volume2 className="h-8 w-8 text-[#0047bb] animate-pulse" />
            <p className="text-xs font-bold text-foreground">
              Audio recording captured successfully
            </p>
            <span className="text-[10px] text-muted-copy font-bold uppercase tracking-wider">
              Click Reset response to re-record
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Mic className="h-8 w-8 text-muted-copy" />
            <p className="text-xs font-bold text-foreground">
              Microphone is configured and ready
            </p>
            <p className="text-[10px] text-muted-copy font-bold uppercase tracking-wider">
              Click Start Speaking to record your roleplay response
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRecording && !recordedAudio && (
          <button
            type="button"
            onClick={onStartRecording}
            className="flex-1 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] px-4 py-2.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm"
          >
            <Mic className="h-3.5 w-3.5" />
            Start Speaking
          </button>
        )}
        {isRecording && !isPaused && (
          <button
            type="button"
            onClick={() => {
              setIsPaused(true);
              pauseRef.current = true;
            }}
            className="flex-1 rounded-[4px] bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm border border-amber-500"
          >
            Pause Recording
          </button>
        )}
        {isRecording && isPaused && (
          <button
            type="button"
            onClick={() => {
              setIsPaused(false);
              pauseRef.current = false;
            }}
            className="flex-1 rounded-[4px] bg-rose-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm border border-rose-500"
          >
            Resume Recording
          </button>
        )}
        {recordedAudio && (
          <button
            type="button"
            onClick={onSubmitRoleplay}
            className="flex-1 rounded-[4px] bg-success px-4 py-2.5 text-xs font-bold text-white hover:bg-success/90 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm border border-success"
          >
            Submit Spoken Response
          </button>
        )}
        {(isRecording || recordedAudio) && (
          <Button
            variant="secondary"
            onClick={onResetRecording}
            className="rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-[#d9d9e3] hover:bg-[#0047bb]/5 hover:text-[#0047bb] shadow-sm flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" /> Restart
          </Button>
        )}
      </div>

      {/* Spoken loopback transcript */}
      {recordedAudio && typedTranscript && (
        <div className="rounded-[4px] bg-white border border-[#d9d9e3] p-3 space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">
            Spoken Loopback Transcript
          </p>
          <p className="text-xs text-foreground italic leading-relaxed font-normal">
            &quot;{typedTranscript}&quot;
          </p>
        </div>
      )}

      {/* Pronunciation Dashboard */}
      {pronunciationScore && (
        <div className="rounded-[4px] border border-success/20 bg-success/5 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Pronunciation Performance
            </p>
            <span className="rounded-[4px] bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 border border-success/20">
              Score: {pronunciationScore}/100
            </span>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
              Phoneme Analysis:
            </p>
            <div className="flex flex-wrap gap-2">
              {phonemeFeedback.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[4px] bg-white border border-[#d9d9e3] p-2 text-center min-w-16 shadow-sm"
                >
                  <p className="text-xs font-bold text-foreground">
                    {item.word}
                  </p>
                  <p className="text-[10px] font-mono text-muted-copy font-medium">
                    {item.phonemes}
                  </p>
                  <span
                    className={`text-[9px] font-bold ${item.score >= 90 ? 'text-success' : 'text-warning'}`}
                  >
                    {item.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
