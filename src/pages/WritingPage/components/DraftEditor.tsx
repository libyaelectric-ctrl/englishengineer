import { PenTool, AlertTriangle, Volume2 } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';

interface DraftEditorProps {
  title: string;
  description: string;
  discipline: string;
  scenario?: string;
  task?: string;
  expectedStructure?: string[];
  draft: string;
  onDraftChange: (v: string) => void;
  getReadabilityScore: () => number;
  userErrors: Record<string, string>;
}

export const DraftEditor = ({
  title, description, discipline, scenario, task, expectedStructure,
  draft, onDraftChange, getReadabilityScore, userErrors,
}: DraftEditorProps) => {
  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;

  return (
    <SectionCard
      title={title}
      subtitle={description}
      icon={PenTool}
      headerActions={
        <span className="rounded-lg border border-border-soft bg-surface-hover px-2.5 py-1 font-mono text-[10px] text-muted-copy">
          {discipline}
        </span>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border-soft bg-surface-hover p-4 text-sm text-foreground">
          <p className="text-xs font-black uppercase text-foreground">Scenario</p>
          <p className="mt-2 leading-6">{scenario ?? description}</p>
          {task && <p className="mt-3 font-semibold text-foreground">Goal: {task}</p>}
          {expectedStructure && (
            <p className="mt-2 text-xs leading-5 text-muted-copy">
              Required points: {expectedStructure.join(' · ')}
            </p>
          )}
        </div>

        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          className="h-64 w-full resize-none rounded-xl border border-border-soft bg-surface p-5 text-sm font-medium leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          placeholder="Start writing or polishing your technical draft..."
        />

        <p className={`mt-1 text-right text-xs font-semibold ${wordCount > 200 ? 'text-green-500' : wordCount > 100 ? 'text-blue-500' : 'text-muted-copy'}`}>
          {wordCount} words
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-copy">
            <span>Goal: {Math.min(wordCount, 200)}/200 words</span>
            <span>{Math.round(Math.min(100, (wordCount / 200) * 100))}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (wordCount / 200) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-muted-copy pt-1">
          <div className="flex items-center gap-2">
            <span>CHARACTER COUNT: {draft.length}</span>
            {draft.length > 0 && (
              <div className="w-24 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${draft.length > 1000 ? 'bg-rose-500' : draft.length > 500 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (draft.length / 1200) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <span>READABILITY LEVEL: {getReadabilityScore()}%</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const u = new SpeechSynthesisUtterance(draft);
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          }}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Volume2 className="h-3.5 w-3.5" /> Read Aloud
        </button>

        {userErrors.draft && (
          <p className="text-[10px] text-rose-400 font-bold font-mono flex items-center gap-1 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{userErrors.draft}</span>
          </p>
        )}
      </div>
    </SectionCard>
  );
};
