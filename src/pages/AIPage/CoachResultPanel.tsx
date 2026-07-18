import { Clipboard, Cpu, Download } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { AICoachResult, AIProviderStatus } from '@/features/ai';
import { ResultList } from './ResultList';

interface CoachResultPanelProps {
  lastResult: AICoachResult;
  isLimitedResponse: boolean;
  providerStatus: AIProviderStatus;
  onCopyResult: () => void;
  onExportResult: () => void;
}

const LimitedResponseBanner = ({
  isLimitedResponse,
  mode,
}: {
  isLimitedResponse: boolean;
  mode: string;
}) =>
  isLimitedResponse && mode === 'backend' ? (
    <div className="rounded-[4px] border border-warning/30 bg-warning/5 p-4 text-xs font-medium text-warning shadow-sm">
      <p className="font-bold uppercase tracking-wider">
        Limited AI response
      </p>
      <p className="mt-1">
        A complete structured result was unavailable. The readable response
        is shown below.
      </p>
    </div>
  ) : null;

const ConditionalGrammarNotes = ({ notes }: { notes?: string[] }) => {
  if (!notes || notes.length === 0) return null;
  return <ResultList title="Grammar Notes" items={notes} tone="warning" />;
};

const VocabularyTerms = ({ terms }: { terms: string[] }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {terms.map((term) => (
      <span
        key={term}
        className="text-[9px] font-mono bg-[#0047bb]/10 text-[#0047bb] border border-[#0047bb]/25 px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wider"
      >
        {term}
      </span>
    ))}
  </div>
);

export const CoachResultPanel = ({
  lastResult,
  isLimitedResponse,
  providerStatus,
  onCopyResult,
  onExportResult,
}: CoachResultPanelProps) => {
  const isBackend = providerStatus.state === 'backend-configured';

  return (
    <SectionCard
      title="Structured Coach Result"
      subtitle={
        isBackend
          ? 'Secure AI response using the current learning profile'
          : 'Mock AI demo response using local learning context only'
      }
      icon={Cpu}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={isBackend ? 'Secure AI response' : 'Mock AI demo response'}
            tone={isBackend ? 'success' : 'warning'}
            className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
          />
        <Button
          type="button"
          variant="outline"
          onClick={onCopyResult}
          className="h-8 rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm gap-1 px-3 inline-flex items-center justify-center"
        >
          <Clipboard className="h-3.5 w-3.5 text-muted-copy" />
          Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onExportResult}
          className="h-8 rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer shadow-sm gap-1 px-3 inline-flex items-center justify-center"
        >
          <Download className="h-3.5 w-3.5 text-muted-copy" />
          Export
        </Button>
      </div>
    }
  >
    <div className="space-y-6">
      <LimitedResponseBanner isLimitedResponse={isLimitedResponse} mode={providerStatus.mode} />
      <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-5 shadow-sm">
        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#0047bb]">
          Summary
        </p>
        <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
          {lastResult.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-[4px] border border-[#0047bb]/25 bg-[#0047bb]/5 p-5 shadow-sm">
          <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#0047bb]">
            Professional Version
          </p>
          <p className="text-xs text-muted-copy mt-2 leading-relaxed font-semibold">
            {lastResult.professionalVersion || lastResult.nativeRewrite}
          </p>
        </div>
        <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-5 shadow-sm">
          <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-copy">
            Simplified Version
          </p>
          <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
            {lastResult.simplifiedVersion || lastResult.summary}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultList
          title="Strengths"
          items={lastResult.strengths}
          tone="success"
        />
        <ResultList
          title="Weaknesses"
          items={lastResult.weaknesses}
          tone="danger"
        />
      </div>

      <ResultList
        title="Corrections"
        items={lastResult.corrections}
        tone="warning"
      />

      <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-5 shadow-sm">
        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-copy">
          Native Rewrite
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground font-semibold">
          {lastResult.nativeRewrite}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-5 shadow-sm">
          <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-copy">
            Technical Vocabulary
          </p>
          <VocabularyTerms terms={lastResult.technicalVocabulary} />
        </div>
        <div className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] p-5 shadow-sm">
          <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-copy">
            Tone & Next Task
          </p>
          <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
            {lastResult.toneFeedback ||
              'Tone feedback unavailable in this response.'}
          </p>
          <p className="mt-2 text-xs font-bold text-foreground leading-normal">
            {lastResult.recommendedNextTask}
          </p>
          <p className="text-xs text-engineer-cyan mt-3 font-semibold font-mono">
            {lastResult.cefrEstimate || lastResult.estimatedCefrImpact}
          </p>
          <p className="text-xs text-success mt-1 font-semibold font-mono">
            {lastResult.engineerEloImpactEstimate ||
              'Skill progress impact not estimated.'}
          </p>
        </div>
      </div>

      <ConditionalGrammarNotes notes={lastResult.grammarNotes} />
    </div>
  </SectionCard>
  );
};
