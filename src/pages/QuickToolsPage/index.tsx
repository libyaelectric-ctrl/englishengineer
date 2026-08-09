import { useEffect, useState } from 'react';

import { PageHeader } from '@/shared/components/PageHeader';

import { AIProviderStatus, AIService } from '@/features/ai';
import { PdfSpecExtractor } from '@/features/tools/PdfSpecExtractor';
import { useWorkToolsStore } from '@/features/work-tools';

import { MeetingPhrasebookTab } from '@/pages/QuickToolsPage/MeetingPhrasebookTab';
import { QuickAITab } from '@/pages/QuickToolsPage/QuickAITab';
import { SiteDictionaryTab } from '@/pages/QuickToolsPage/SiteDictionaryTab';

type QuickTab = 'ai' | 'meeting' | 'dictionary' | 'pdf-spec';

const QuickToolsPage = ({ embedded = false }: { embedded?: boolean }) => {
  const { quickAIDraft } = useWorkToolsStore();
  const [tab, setTab] = useState<QuickTab>('ai');
  const [status, setStatus] = useState<AIProviderStatus>(() => AIService.getStatus([]));

  useEffect(() => {
    if (quickAIDraft) {
      setTab('ai');
    }
  }, [quickAIDraft]);

  return (
    <div className="space-y-7 animate-in fade-in duration-300 pt-12 sm:pt-0">
      {!embedded && (
        <PageHeader
          title="Quick Tools"
          description="Fast meeting language, site terminology, PDF spec flashcards and AI rewriting."
          badgeText={status.label}
          badgeColor={status.isConnected ? 'emerald' : 'amber'}
        />
      )}

      <div
        className="flex flex-wrap gap-2 rounded-[var(--radius-card)] border border-primary/25 bg-surface/80 p-3 shadow-sm font-sans"
        role="tablist"
      >
        {(
          [
            ['ai', 'Quick AI'],
            ['meeting', 'Meeting Phrasebook'],
            ['dictionary', 'Site Dictionary'],
            ['pdf-spec', '21. 📄 PDF Spec Extractor'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-[var(--radius-card)] border px-3.5 py-2 text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab === id
                ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                : 'border-border-soft bg-surface text-muted-copy hover:text-foreground hover:bg-surface-hover hover:border-primary/30'
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

      {tab === 'pdf-spec' && <PdfSpecExtractor />}
    </div>
  );
};

export default QuickToolsPage;
