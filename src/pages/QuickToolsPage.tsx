import { useState } from 'react';
import { AIService, AIProviderStatus } from '@/features/ai';
import { useWorkToolsStore } from '@/features/work-tools';
import { PageHeader } from '@/shared/components/PageHeader';
import { QuickAITab } from '@/pages/QuickToolsPage/QuickAITab';
import { MeetingPhrasebookTab } from '@/pages/QuickToolsPage/MeetingPhrasebookTab';
import { SiteDictionaryTab } from '@/pages/QuickToolsPage/SiteDictionaryTab';

type QuickTab = 'ai' | 'meeting' | 'dictionary';

const QuickToolsPage = ({ embedded = false }: { embedded?: boolean }) => {
  const { quickAIDraft } = useWorkToolsStore();
  const [tab, setTab] = useState<QuickTab>('ai');
  const [status, setStatus] = useState<AIProviderStatus>(() =>
    AIService.getStatus([])
  );

  return (
    <div className="space-y-7 animate-in fade-in duration-300 pt-12 sm:pt-0">
      {!embedded && (
        <PageHeader
          title="Quick Tools"
          description="Fast meeting language, site terminology and provider-controlled AI rewriting."
          badgeText={status.label}
          badgeColor={status.isConnected ? 'emerald' : 'amber'}
        />
      )}

      <div
        className="flex flex-wrap gap-2 rounded-xl border border-[#0047bb]/25 bg-surface/80 p-3 shadow-sm font-sans"
        role="tablist"
      >
        {(
          [
            ['ai', 'Quick AI'],
            ['meeting', 'Meeting Phrasebook'],
            ['dictionary', 'Site Dictionary'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === id
                ? 'border-[#0047bb]/40 bg-[#0047bb]/10 text-[#0047bb] shadow-sm'
                : 'border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover hover:border-[#0047bb]/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ai' && (
        <QuickAITab
          initialDraft={quickAIDraft?.text ?? ''}
          status={status}
          onStatusChange={setStatus}
        />
      )}

      {tab === 'meeting' && <MeetingPhrasebookTab />}

      {tab === 'dictionary' && <SiteDictionaryTab />}
    </div>
  );
};

export default QuickToolsPage;
