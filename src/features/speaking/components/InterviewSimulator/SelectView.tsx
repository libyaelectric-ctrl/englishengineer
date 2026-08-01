import { ChevronRight, Layers, Code, Trophy } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import type { InterviewType } from '../../interview-simulator';

export const SelectView = ({ onSelect }: { onSelect: (type: InterviewType) => void }) => (
  <div className="space-y-6 animate-in fade-in">
    <SectionCard
      title="Technical Interview Simulator"
      subtitle="Practice System Design and Coding interviews with AI scoring and voice recording"
      icon={Trophy}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('system-design')}
          className="group rounded-[4px] border border-border-soft bg-surface p-6 text-left transition-all hover:border-primary/40 hover:bg-primary/5 shadow-sm cursor-pointer"
        >
          <Layers className="h-8 w-8 text-primary" />
          <h3 className="mt-3 text-lg font-bold text-foreground tracking-tight">System Design</h3>
          <p className="mt-2 text-sm text-muted-copy font-normal">
            Practice designing scalable systems. Cover architecture, trade-offs, and technical
            decisions.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
            Start practice
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('coding')}
          className="group rounded-[4px] border border-border-soft bg-surface p-6 text-left transition-all hover:border-primary/40 hover:bg-primary/5 shadow-sm cursor-pointer"
        >
          <Code className="h-8 w-8 text-primary" />
          <h3 className="mt-3 text-lg font-bold text-foreground tracking-tight">
            Coding Interview
          </h3>
          <p className="mt-2 text-sm text-muted-copy font-normal">
            Solve coding problems aloud. Practice explaining your approach, complexity, and edge
            cases.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
            Start practice
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </SectionCard>
  </div>
);
