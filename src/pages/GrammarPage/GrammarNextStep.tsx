import { ArrowRight } from 'lucide-react';
import { getModuleLabel } from './GrammarPageHelpers';

export const GrammarNextStep = ({
  nextLesson,
  selectRule,
}: {
  nextLesson: { id: string; title: string; grammarCategory: string };
  selectRule: (id: string) => void;
}) => (
  <div className="rounded-[4px] border border-[#d9d9e3] bg-white p-4 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">
      Next Step
    </p>
    <button
      type="button"
      onClick={() => selectRule(nextLesson.id)}
      className="mt-2 flex w-full items-center gap-3 rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-3 text-left hover:bg-[#0047bb]/10 cursor-pointer"
    >
      <ArrowRight className="h-4 w-4 shrink-0 text-[#0047bb]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {nextLesson.title}
        </span>
        <span className="text-[11px] text-muted-copy">
          {getModuleLabel(nextLesson.grammarCategory)}
        </span>
      </span>
    </button>
  </div>
);
