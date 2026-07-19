import { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import {
  SentenceGeneratorService,
  type SentenceExample,
} from '@/features/vocabulary';

interface SentencePanelProps {
  word: string;
  partOfSpeech: string;
  meaning: string;
}

const CONTEXT_LABELS: Record<string, string> = {
  workplace: '🏢 Workplace',
  technical: '⚙️ Technical',
  daily: '💬 Daily',
  formal: '📋 Formal',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

export function SentencePanel({
  word,
  partOfSpeech,
  meaning,
}: SentencePanelProps) {
  const [sentences, setSentences] = useState<SentenceExample[]>([]);
  const [expanded, setExpanded] = useState(false);

  const generate = () => {
    const result = SentenceGeneratorService.generateForWord(
      word,
      partOfSpeech,
      meaning,
      4
    );
    setSentences(result);
    setExpanded(true);
  };

  return (
    <div className="mt-3 rounded-[4px] border border-border-soft bg-surface p-3">
      <button
        type="button"
        onClick={() =>
          sentences.length > 0 ? setExpanded(!expanded) : generate()
        }
        className="flex w-full items-center justify-between text-xs font-bold text-foreground cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Example Sentences
        </span>
        {sentences.length > 0 && (
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-copy transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {expanded && sentences.length > 0 && (
        <div className="mt-3 space-y-2">
          {sentences.map((s, i) => (
            <div
              key={i}
              className="rounded-[4px] border border-border-soft bg-surface p-2.5"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold text-muted-copy">
                  {CONTEXT_LABELS[s.context] ?? s.context}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase ${DIFFICULTY_COLORS[s.difficulty]}`}
                >
                  {s.difficulty}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground">
                {s.sentence}
              </p>
              <p className="mt-1 text-[10px] text-muted-copy">
                {s.translation}
              </p>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generate}
            className="w-full text-[10px]"
          >
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}
