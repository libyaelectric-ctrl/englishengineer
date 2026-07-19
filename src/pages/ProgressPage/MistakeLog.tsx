import { FormEvent, useState } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import {
  MISTAKE_CATEGORIES,
  MISTAKE_SUGGESTIONS,
  MistakeCategory,
} from '@/features/learning-intelligence';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export const MistakeLog = ({
  mistakeLog,
  addMistake,
  removeMistake,
}: {
  mistakeLog: Array<{
    id: string;
    category: string;
    originalText: string;
    correction: string;
  }>;
  addMistake: (
    category: MistakeCategory,
    originalText: string,
    correction: string
  ) => void;
  removeMistake: (id: string) => void;
}) => {
  const [category, setCategory] = useState<MistakeCategory>('grammar');
  const [originalText, setOriginalText] = useState('');
  const [correction, setCorrection] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!originalText.trim() || !correction.trim()) return;
    addMistake(category, originalText.trim(), correction.trim());
    setOriginalText('');
    setCorrection('');
  };

  return (
    <Card
      id="mistake-log"
      className="space-y-5 p-5 shadow-sm"
      hoverEffect={false}
    >
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-[#0047bb]" />
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Mistake Log / Hata Defteri
          </h2>
          <p className="text-xs text-muted-copy font-medium uppercase tracking-wider">
            Record patterns worth practising again.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="sr-only">Mistake category</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as MistakeCategory)
            }
            className="min-h-10 w-full rounded-[4px] border border-border-soft bg-surface px-3 text-xs font-bold uppercase tracking-wider text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
          >
            {MISTAKE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <p className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-3 text-xs leading-5 text-foreground font-medium shadow-sm">
          Suggestion: {MISTAKE_SUGGESTIONS[category]}
        </p>
        <label className="block">
          <span className="sr-only">Original sentence or repeated mistake</span>
          <textarea
            value={originalText}
            onChange={(event) => setOriginalText(event.target.value)}
            placeholder="Original sentence or repeated mistake"
            className="min-h-24 w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 font-bold placeholder-muted-copy shadow-sm"
          />
        </label>
        <label className="block">
          <span className="sr-only">Correction and why it is better</span>
          <textarea
            value={correction}
            onChange={(event) => setCorrection(event.target.value)}
            placeholder="Correction and why it is better"
            className="min-h-24 w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 font-bold placeholder-muted-copy shadow-sm"
          />
        </label>
        <Button
          type="submit"
          disabled={!originalText.trim() || !correction.trim()}
          className="bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 rounded-[4px] cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add mistake
        </Button>
      </form>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {mistakeLog.length === 0 ? (
          <p className="rounded-[4px] border border-dashed border-border-soft bg-surface-hover p-6 text-center text-sm font-medium text-muted-copy shadow-sm">
            No mistakes saved yet. Add only patterns you want to revisit.
          </p>
        ) : (
          mistakeLog.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-error">
                    {entry.category}
                  </p>
                  <p className="mt-2 text-sm text-muted-copy line-through font-normal">
                    {entry.originalText}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {entry.correction}
                  </p>
                </div>
                <button
                  onClick={() => removeMistake(entry.id)}
                  className="rounded-[4px] p-2 text-muted-copy hover:bg-error/10 hover:text-error cursor-pointer border border-border-soft hover:border-error/20 bg-surface-hover flex items-center justify-center shadow-sm"
                  aria-label="Delete mistake"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
