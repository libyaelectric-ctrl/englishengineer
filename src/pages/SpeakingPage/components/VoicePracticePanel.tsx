import { Lock, Mic, RotateCcw, Volume2, History, Check } from 'lucide-react';
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

const LockedView = () => (
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
        workflows are exclusive features of the Max Plan ($59/mo). Upgrade today
        to practice speech dynamically.
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

const VoiceWorkspace = ({
  isRecording,
  recordedAudio,
  waveformBars,
}: {
  isRecording: boolean;
  recordedAudio: string | null;
  waveformBars: number[];
}) => (
  <div className="rounded-[4px] border border-border-soft bg-[#f3f3fd] p-5 flex flex-col items-center justify-center min-h-32 relative overflow-hidden shadow-sm">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />
    {isRecording ? (
      <div className="flex flex-col items-center gap-3 w-full relative z-10">
        <div className="flex items-end justify-center gap-[3px] h-16 w-full">
          {waveformBars.map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-[4px] bg-[#0047bb] transition-all"
              style={{ height: `${h}px`, transition: 'height 120ms ease' }}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold text-[#0047bb] uppercase tracking-widest animate-pulse">
          VOCAL-SYNC: ACTIVE RECORDING STATE...
        </p>
      </div>
    ) : recordedAudio ? (
      <div className="flex flex-col items-center gap-2 relative z-10">
        <Volume2 className="h-8 w-8 text-[#0047bb] animate-pulse" />
        <p className="text-xs font-bold text-foreground">
          Audio response successfully captured
        </p>
        <span className="text-[9px] text-muted-copy font-bold uppercase tracking-wider bg-[#d9d9e3]/30 px-2 py-0.5 rounded-[4px]">
          VOCAL-ACQUISITION: COMPLETE
        </span>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-2 text-center relative z-10">
        <Mic className="h-8 w-8 text-muted-copy" />
        <p className="text-xs font-bold text-foreground">
          Voice capture module ready
        </p>
        <p className="text-[9px] text-muted-copy font-bold uppercase tracking-wider">
          Initialize capture sequence by starting microphone
        </p>
      </div>
    )}
  </div>
);

const VoiceControls = ({
  isRecording,
  isPaused,
  recordedAudio,
  onStartRecording,
  setIsPaused,
  pauseRef,
  onSubmitRoleplay,
  onResetRecording,
}: {
  isRecording: boolean;
  isPaused: boolean;
  recordedAudio: string | null;
  onStartRecording: () => void;
  setIsPaused: (paused: boolean) => void;
  pauseRef: React.MutableRefObject<boolean>;
  onSubmitRoleplay: () => void;
  onResetRecording: () => void;
}) => (
  <div className="flex gap-2 relative z-10">
    {!isRecording && !recordedAudio && (
      <button
        type="button"
        onClick={onStartRecording}
        className="flex-1 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] px-4 py-2.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm"
      >
        <Mic className="h-3.5 w-3.5" />
        Start Voice Capture
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
        Pause Voice Capture
      </button>
    )}
    {isRecording && isPaused && (
      <button
        type="button"
        onClick={() => {
          setIsPaused(false);
          pauseRef.current = false;
        }}
        className="flex-1 rounded-[4px] bg-[#0047bb] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0047bb]/90 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm border border-[#0047bb]"
      >
        Resume Voice Capture
      </button>
    )}
    {recordedAudio && (
      <button
        type="button"
        onClick={onSubmitRoleplay}
        className="flex-1 rounded-[4px] bg-success px-4 py-2.5 text-xs font-bold text-white hover:bg-success/90 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider h-10 shadow-sm border border-success"
      >
        Process Recording
      </button>
    )}
    {(isRecording || recordedAudio) && (
      <Button
        variant="secondary"
        onClick={onResetRecording}
        className="rounded-[4px] cursor-pointer h-10 px-4 text-xs font-bold border-border-soft hover:bg-[#0047bb]/5 hover:text-[#0047bb] shadow-sm flex items-center gap-1.5"
      >
        <RotateCcw className="h-4 w-4" /> Restart
      </Button>
    )}
  </div>
);

const PhonemeCard = ({
  item,
}: {
  item: { word: string; score: number; phonemes: string };
}) => {
  const isAccurate = item.score >= 90;
  return (
    <div className="rounded-[4px] bg-surface border border-border-soft p-3 text-center shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-xs font-bold text-foreground">{item.word}</p>
        <p className="text-[10px] font-mono text-muted-copy font-medium mt-1">
          [{item.phonemes}]
        </p>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1">
        {isAccurate ? (
          <Check className="h-3 w-3 text-[#0047bb]" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        )}
        <span
          className={`text-[9px] font-bold ${isAccurate ? 'text-[#0047bb]' : 'text-amber-600'}`}
        >
          {item.score}%
        </span>
      </div>
    </div>
  );
};

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
    return <LockedView />;
  }

  return (
    <div className="space-y-4 font-sans">
      <VoiceWorkspace
        isRecording={isRecording}
        recordedAudio={recordedAudio}
        waveformBars={waveformBars}
      />

      <VoiceControls
        isRecording={isRecording}
        isPaused={isPaused}
        recordedAudio={recordedAudio}
        onStartRecording={onStartRecording}
        setIsPaused={setIsPaused}
        pauseRef={pauseRef}
        onSubmitRoleplay={onSubmitRoleplay}
        onResetRecording={onResetRecording}
      />

      {recordedAudio && typedTranscript && (
        <div className="rounded-[4px] bg-[#f3f3fd] border border-border-soft p-3.5 space-y-1 shadow-sm">
          <p className="text-[9px] font-bold text-[#0047bb] uppercase tracking-wider">
            Loopback Speech Transcription
          </p>
          <p className="text-xs text-foreground italic leading-relaxed font-normal">
            &quot;{typedTranscript}&quot;
          </p>
        </div>
      )}

      {pronunciationScore && (
        <div className="rounded-[4px] border border-border-soft bg-surface p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <div>
              <span className="font-mono text-[9px] font-bold text-muted-copy uppercase tracking-widest">
                PRON-EVAL
              </span>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mt-1">
                Pronunciation Analysis Feedback
              </p>
            </div>
            <span className="rounded-[4px] bg-[#0047bb]/5 text-[#0047bb] text-[10px] font-bold px-2 py-0.5 border border-[#0047bb]/15">
              Score: {pronunciationScore}/100
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-[#0047bb]" />
              <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
                Phoneme Diagnostics:
              </p>
            </div>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
              {phonemeFeedback.map((item, idx) => (
                <PhonemeCard key={idx} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
