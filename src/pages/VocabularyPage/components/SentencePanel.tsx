import { ChevronDown, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/shared/components/Button';
import { getIcon } from '@/shared/icons/registry';

import { type SentenceExample, SentenceGeneratorService } from '@/features/vocabulary';

interface SentencePanelProps {
  word: string;
  partOfSpeech: string;
  meaning: string;
}

const CONTEXT_LABELS: Record<string, string> = {
  workplace: 'Workplace',
  technical: 'Technical',
  daily: 'Daily',
  formal: 'Formal',
};

const CONTEXT_ICONS: Record<string, LucideIcon> = {
  workplace: (getIcon('building') ?? Sparkles) as LucideIcon,
  technical: (getIcon('settings') ?? Sparkles) as LucideIcon,
  daily: (getIcon('message') ?? Sparkles) as LucideIcon,
  formal: (getIcon('clipboard-check') ?? Sparkles) as LucideIcon,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

export function SentencePanel({ word, partOfSpeech, meaning }: SentencePanelProps) {
  const [sentences, setSentences] = useState<SentenceExample[]>([]);
  const [expanded, setExpanded] = useState(false);

  const generate = () => {
    const result = SentenceGeneratorService.generateForWord(word, partOfSpeech, meaning, 4);
    setSentences(result);
    setExpanded(true);
  };

  return (
    <div className="mt-3 rounded-[4px] border border-border-soft bg-surface p-3">
      <button
        type="button"
        onClick={() => (sentences.length > 0 ? setExpanded(!expanded) : generate())}
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
            <div key={i} className="rounded-[4px] border border-border-soft bg-surface p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-copy">
                  {(() => {
                    const ContextIcon = CONTEXT_ICONS[s.context];
                    return ContextIcon ? (
                      <ContextIcon className="h-3 w-3" aria-hidden="true" />
                    ) : null;
                  })()}
                  {CONTEXT_LABELS[s.context] ?? s.context}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${DIFFICULTY_COLORS[s.difficulty]}`}
                >
                  {s.difficulty}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground">{s.sentence}</p>
              <p className="mt-1 text-[10px] text-muted-copy">{s.translation}</p>
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
