import { TriangleAlert } from 'lucide-react';
import { StatusPill } from './GrammarPageComponents';

type ReviewTarget = {
  rule: { id: string; title: string };
  status: string;
};

export const GrammarReviewQueue = ({
  reviewTargets,
  selectRule,
}: {
  reviewTargets: ReviewTarget[];
  selectRule: (id: string) => void;
}) => (
  <div className="rounded-lg border border-border-soft bg-surface p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-muted-copy">
      Review Queue
    </p>
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
      {reviewTargets.map(({ rule, status }) => (
        <button
          key={rule.id}
          type="button"
          onClick={() => selectRule(rule.id)}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-border-soft bg-background px-3 py-2 text-left hover:border-warning/40"
        >
          <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-warning" />
          <span className="truncate text-xs font-bold">{rule.title}</span>
          <StatusPill status={status as any} compact />
        </button>
      ))}
    </div>
  </div>
);
