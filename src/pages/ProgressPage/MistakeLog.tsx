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
    <Card id="mistake-log" className="space-y-5" hoverEffect={false}>
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-xl font-medium text-foreground">
            Mistake Log / Hata Defteri
          </h2>
          <p className="text-sm text-muted-copy">
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
            className="min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {MISTAKE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-foreground">
          Suggestion: {MISTAKE_SUGGESTIONS[category]}
        </p>
        <label className="block">
          <span className="sr-only">Original sentence or repeated mistake</span>
          <textarea
            value={originalText}
            onChange={(event) => setOriginalText(event.target.value)}
            placeholder="Original sentence or repeated mistake"
            className="min-h-24 w-full rounded-lg border border-border-soft bg-surface-hover p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="block">
          <span className="sr-only">Correction and why it is better</span>
          <textarea
            value={correction}
            onChange={(event) => setCorrection(event.target.value)}
            placeholder="Correction and why it is better"
            className="min-h-24 w-full rounded-lg border border-border-soft bg-surface-hover p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <Button
          type="submit"
          disabled={!originalText.trim() || !correction.trim()}
        >
          <Plus className="h-4 w-4" /> Add mistake
        </Button>
      </form>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {mistakeLog.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-hover bg-surface-hover p-6 text-center text-sm text-muted-copy">
            No mistakes saved yet. Add only patterns you want to revisit.
          </p>
        ) : (
          mistakeLog.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-border-soft bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-error">
                    {entry.category}
                  </p>
                  <p className="mt-2 text-sm text-muted-copy line-through">
                    {entry.originalText}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {entry.correction}
                  </p>
                </div>
                <button
                  onClick={() => removeMistake(entry.id)}
                  className="rounded-lg p-2 text-muted-copy hover:bg-error/10 hover:text-error"
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
