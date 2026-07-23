import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import {
  PronunciationFeedbackEngine,
  type PronunciationFeedback,
  type PronunciationMap,
} from '@/features/speaking';

interface PronunciationFeedbackPanelProps {
  targetWords: Array<{ word: string; ipa: string }>;
  recognizedText: string;
  sessionId: string;
}

const ACCENT_COLORS: Record<string, string> = {
  vowel: 'text-amber-600 bg-amber-50 border-amber-200',
  consonant: 'text-rose-600 bg-rose-50 border-rose-200',
  stress: 'text-violet-600 bg-violet-50 border-violet-200',
  rhythm: 'text-sky-600 bg-sky-50 border-sky-200',
};

export function PronunciationFeedbackPanel({
  targetWords,
  recognizedText,
  sessionId,
}: PronunciationFeedbackPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<PronunciationMap | null>(null);

  const analyze = () => {
    const map = PronunciationFeedbackEngine.analyzeSession(
      targetWords,
      recognizedText,
      sessionId
    );
    setResult(map);
    setExpanded(true);
  };

  return (
    <div className="rounded-[4px] border border-border-soft bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground">
          Pronunciation Feedback
        </h3>
        <button
          type="button"
          onClick={() => (result ? setExpanded(!expanded) : analyze())}
          className="text-[10px] font-bold text-[#0047bb] cursor-pointer"
        >
          {result ? (expanded ? 'Hide' : 'Show') : 'Analyze'}
        </button>
      </div>

      {result && expanded && (
        <div className="mt-3 space-y-3">
          {/* Overall Score */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{
                background: PronunciationFeedbackEngine.getAccentColor(
                  result.overallScore
                ),
              }}
            >
              {result.overallScore}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {PronunciationFeedbackEngine.getAccentLabel(
                  result.overallScore
                )}
              </p>
              <p className="text-[10px] text-muted-copy">
                {result.feedbacks.length} words analyzed
              </p>
            </div>
          </div>

          {/* Weak Phonemes */}
          {result.weakPhonemes.length > 0 && (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 p-2">
              <p className="text-[10px] font-bold text-amber-800 mb-1">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                Focus on these sounds:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.weakPhonemes.map((p) => (
                  <span
                    key={p}
                    className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-mono text-amber-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Word Details */}
          <div className="space-y-2">
            {result.feedbacks.map((fb) => (
              <WordFeedbackCard key={fb.word} feedback={fb} />
            ))}
          </div>

          {/* Strong Phonemes */}
          {result.strongPhonemes.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Strong: {result.strongPhonemes.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WordFeedbackCard({ feedback }: { feedback: PronunciationFeedback }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-[4px] border border-border-soft bg-white p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            {feedback.word}
          </span>
          <span className="text-[9px] font-mono text-muted-copy">
            {feedback.ipa}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
              feedback.overallAccuracy >= 80
                ? 'bg-emerald-100 text-emerald-700'
                : feedback.overallAccuracy >= 60
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
            }`}
          >
            {feedback.overallAccuracy}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-muted-copy cursor-pointer"
        >
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {feedback.problemArea && (
        <div
          className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[8px] font-bold ${ACCENT_COLORS[feedback.problemArea] ?? ''}`}
        >
          {feedback.problemArea}
        </div>
      )}

      <p className="mt-1 text-[10px] text-muted-copy">{feedback.tip}</p>

      {showDetails && feedback.phonemeDetails.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {feedback.phonemeDetails.map((p, i) => (
            <span
              key={i}
              className={`rounded px-1 py-0.5 text-[8px] font-mono ${
                p.accuracy >= 80
                  ? 'bg-emerald-50 text-emerald-700'
                  : p.accuracy >= 60
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
              }`}
              title={p.tip}
            >
              {p.phoneme} {p.accuracy}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
