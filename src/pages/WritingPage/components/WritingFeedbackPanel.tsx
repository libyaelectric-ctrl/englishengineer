import { AlertCircle } from 'lucide-react';

interface Score {
  label: string;
  value: number;
  max: number;
}

interface WritingFeedbackPanelProps {
  scores: Score[];
  feedback: string;
  corrections?: string[];
}

const getScoreColor = (value: number): string => {
  if (value >= 80) return 'text-green-600';
  if (value >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const WritingFeedbackPanel = ({
  scores,
  feedback,
  corrections = [],
}: WritingFeedbackPanelProps) => (
  <div className="space-y-4">
    <h3 className="text-sm font-bold text-foreground">Assessment Results</h3>

    <div className="grid grid-cols-2 gap-3">
      {scores.map((score) => (
        <div
          key={score.label}
          className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-3"
        >
          <p className="text-[10px] font-bold uppercase text-muted-copy">
            {score.label}
          </p>
          <p className={`text-lg font-bold ${getScoreColor(score.value)}`}>
            {score.value}/{score.max}
          </p>
          <div className="mt-1 h-1 rounded-full bg-border-soft overflow-hidden">
            <div
              className="h-full bg-[#0047bb] transition-all"
              style={{ width: `${(score.value / score.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    {feedback && (
      <div className="rounded-[4px] border-2 border-[#0047bb] bg-surface p-4">
        <p className="text-[10px] font-bold uppercase text-muted-copy mb-2">
          Feedback
        </p>
        <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
          {feedback}
        </p>
      </div>
    )}

    {corrections.length > 0 && (
      <div className="rounded-[4px] border border-amber-300 bg-amber-50 p-4">
        <p className="text-[10px] font-bold uppercase text-amber-700 mb-2">
          Corrections
        </p>
        <ul className="space-y-1">
          {corrections.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-amber-800"
            >
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
