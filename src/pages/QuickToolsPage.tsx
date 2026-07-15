import { useState } from 'react';
import { AIService, AIProviderStatus } from '@/features/ai';
import { useWorkToolsStore } from '@/features/work-tools';
import { Button } from '@/shared/components/Button';
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
        className="flex flex-wrap gap-2 rounded-xl border border-border-soft bg-surface p-3"
        role="tablist"
      >
        {(
          [
            ['ai', 'Quick AI'],
            ['meeting', 'Meeting Phrasebook'],
            ['dictionary', 'Site Dictionary'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            role="tab"
            aria-selected={tab === id}
            variant={tab === id ? 'primary' : 'ghost'}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
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
