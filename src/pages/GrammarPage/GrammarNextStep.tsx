import { ArrowRight } from 'lucide-react';
import { getModuleLabel } from './GrammarPageHelpers';

export const GrammarNextStep = ({
  nextLesson,
  selectRule,
}: {
  nextLesson: { id: string; title: string; grammarCategory: string };
  selectRule: (id: string) => void;
}) => (
  <div className="rounded-lg border border-border-soft bg-surface p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">
      Next Step
    </p>
    <button
      type="button"
      onClick={() => selectRule(nextLesson.id)}
      className="mt-2 flex w-full items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-left hover:bg-primary/10"
    >
      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">
          {nextLesson.title}
        </span>
        <span className="text-[11px] text-muted-copy">
          {getModuleLabel(nextLesson.grammarCategory)}
        </span>
      </span>
    </button>
  </div>
);
