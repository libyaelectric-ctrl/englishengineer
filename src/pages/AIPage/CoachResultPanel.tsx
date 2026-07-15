import {
  Clipboard,
  Cpu,
  Download,
} from 'lucide-react';
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

export const CoachResultPanel = ({
  lastResult,
  isLimitedResponse,
  providerStatus,
  onCopyResult,
  onExportResult,
}: CoachResultPanelProps) => (
  <SectionCard
    title="Structured Coach Result"
    subtitle={
      providerStatus.state === 'backend-configured'
        ? 'Secure AI response using the current learning profile'
        : 'Mock AI demo response using local learning context only'
    }
    icon={Cpu}
    headerActions={
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          label={
            providerStatus.state === 'backend-configured'
              ? 'Secure AI response'
              : 'Mock AI demo response'
          }
          tone={
            providerStatus.state === 'backend-configured'
              ? 'success'
              : 'warning'
          }
        />
        <Button
          type="button"
          variant="outline"
          onClick={onCopyResult}
          className="h-8 px-3 text-xs"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onExportResult}
          className="h-8 px-3 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    }
  >
    <div className="space-y-6">
      {isLimitedResponse && providerStatus.mode === 'backend' && (
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-warning">
          <p className="font-medium">Limited AI response</p>
          <p className="mt-1">
            A complete structured result was unavailable. The readable
            response is shown below.
          </p>
        </div>
      )}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-medium">
          Summary
        </p>
        <p className="text-sm text-muted-copy mt-2 leading-relaxed">
          {lastResult.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-medium">
            Professional Version
          </p>
          <p className="text-sm text-muted-copy mt-2 leading-relaxed">
            {lastResult.professionalVersion ||
              lastResult.nativeRewrite}
          </p>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
          <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
            Simplified Version
          </p>
          <p className="text-sm text-muted-copy mt-2 leading-relaxed">
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

      <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
        <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
          Native Rewrite
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {lastResult.nativeRewrite}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
          <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
            Technical Vocabulary
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {lastResult.technicalVocabulary.map((term) => (
              <span
                key={term}
                className="text-[10px] font-mono bg-primary/15 text-primary border border-primary/20 px-2 py-1 rounded-lg"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border-soft bg-surface-hover p-5">
          <p className="text-[10px] font-mono text-muted-copy uppercase tracking-widest font-medium">
            Tone & Next Task
          </p>
          <p className="text-xs text-muted-copy mt-2 leading-relaxed">
            {lastResult.toneFeedback ||
              'Tone feedback unavailable in this response.'}
          </p>
          <p className="mt-2 text-sm text-foreground">
            {lastResult.recommendedNextTask}
          </p>
          <p className="text-xs text-engineer-cyan mt-3">
            {lastResult.cefrEstimate ||
              lastResult.estimatedCefrImpact}
          </p>
          <p className="text-xs text-success mt-1">
            {lastResult.engineerEloImpactEstimate ||
              'Skill progress impact not estimated.'}
          </p>
        </div>
      </div>

      {(lastResult.grammarNotes || []).length > 0 && (
        <ResultList
          title="Grammar Notes"
          items={lastResult.grammarNotes || []}
          tone="warning"
        />
      )}
    </div>
  </SectionCard>
);
