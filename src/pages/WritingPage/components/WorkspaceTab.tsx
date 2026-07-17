import { Link } from 'react-router-dom';
import {
  PenTool,
  Check,
  AlertTriangle,
  Sparkles,
  FileText,
  Layers,
  ArrowLeft,
  Clock,
  Info,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { Button } from '@/shared/components/Button';
import {
  WritingHelpers,
  type WritingCorrection,
  type WritingEvaluationResult,
} from '@/features/writing';
import { WritingEvaluationResults } from '../WritingEvaluationResults';

interface Mission {
  id: string;
  title: string;
  description: string;
  cefrLevel: string;
  discipline: string;
  corrections: WritingCorrection[];
  scenario?: string;
  task?: string;
  expectedStructure?: string[];
  sampleExcellentAnswer?: string;
}

interface WorkspaceTabProps {
  currentMission: Mission;
  draft: string;
  setDraft: (draft: string) => void;
  timeSpentSeconds: number;
  evaluationResult: WritingEvaluationResult | null;
  selectedMissionId: string;
  selectedRule: WritingCorrection | null;
  setSelectedRule: (rule: WritingCorrection | null) => void;
  userErrors: Record<string, string>;
  showModelAnswer: boolean;
  setShowModelAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  activeCorrections: WritingCorrection[];
  getReadabilityScore: () => number;
  handleApplyFix: (original: string, fix: string) => void;
  handleAutoFixAll: () => void;
  handleSubmit: () => void;
  resetCurrentMission: () => void;
  handleBackToMissions: () => void;
  moveMission: (offset: number) => void;
  currentMissionIndex: number;
  visibleMissionsLength: number;
}

export const WorkspaceTab = ({
  currentMission,
  draft,
  setDraft,
  timeSpentSeconds,
  evaluationResult,
  selectedMissionId,
  selectedRule,
  setSelectedRule,
  userErrors,
  showModelAnswer,
  setShowModelAnswer,
  activeCorrections,
  getReadabilityScore,
  handleApplyFix,
  handleAutoFixAll,
  handleSubmit,
  resetCurrentMission,
  handleBackToMissions,
  moveMission,
  currentMissionIndex,
  visibleMissionsLength,
}: WorkspaceTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border-soft bg-surface p-4 md:flex-row md:items-center md:justify-between">
        <button
          onClick={handleBackToMissions}
          className="flex items-center gap-2 text-xs font-bold text-muted-copy hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Writing list</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border ${WritingHelpers.getCefrBadgeStyles(currentMission.cefrLevel)}`}
          >
            Level: {currentMission.cefrLevel}
          </span>
          <span className="text-xs font-mono text-muted-copy bg-surface-hover px-3 py-1 rounded border border-border-soft flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Elapsed: {WritingHelpers.formatTime(timeSpentSeconds)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => moveMission(-1)}
            disabled={currentMissionIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="min-w-14 text-center text-xs font-black text-muted-copy">
            {currentMissionIndex + 1}/{visibleMissionsLength}
          </span>
          <Button
            variant="outline"
            onClick={() => moveMission(1)}
            disabled={currentMissionIndex >= visibleMissionsLength - 1}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
          <Link
            to="/curriculum"
            className="hidden text-xs font-bold text-primary sm:inline-flex"
          >
            Hub
          </Link>
        </div>
      </div>

      {!evaluationResult ? (
        /* --- WORKSPACE SUB-VIEW (IN PROGRESS) --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Draft Editor Sandbox & Guide Rules */}
          <div className="lg:col-span-7 space-y-6">
            <SectionCard
              title={currentMission.title}
              subtitle={currentMission.description}
              icon={PenTool}
              headerActions={
                <span className="rounded-lg border border-border-soft bg-surface-hover px-2.5 py-1 font-mono text-[10px] text-muted-copy">
                  {currentMission.discipline}
                </span>
              }
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-border-soft bg-surface-hover p-4 text-sm text-foreground">
                  <p className="text-xs font-black uppercase text-foreground">
                    Scenario
                  </p>
                  <p className="mt-2 leading-6">
                    {currentMission.scenario ?? currentMission.description}
                  </p>
                  {currentMission.task && (
                    <p className="mt-3 font-semibold text-foreground">
                      Goal: {currentMission.task}
                    </p>
                  )}
                  {currentMission.expectedStructure && (
                    <p className="mt-2 text-xs leading-5 text-muted-copy">
                      Required points:{' '}
                      {currentMission.expectedStructure.join(' · ')}
                    </p>
                  )}
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-64 w-full resize-none rounded-xl border border-border-soft bg-surface p-5 text-sm font-medium leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Start writing or polishing your technical draft..."
                />
                <p
                  className={`mt-1 text-right text-xs font-semibold ${draft.trim().split(/\s+/).filter(Boolean).length > 200 ? 'text-green-500' : draft.trim().split(/\s+/).filter(Boolean).length > 100 ? 'text-blue-500' : 'text-muted-copy'}`}
                >
                  {draft.trim().split(/\s+/).filter(Boolean).length} words
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-copy">
                    <span>
                      Goal:{' '}
                      {Math.min(
                        draft.trim().split(/\s+/).filter(Boolean).length,
                        200
                      )}
                      /200 words
                    </span>
                    <span>
                      {Math.round(
                        Math.min(
                          100,
                          (draft.trim().split(/\s+/).filter(Boolean).length /
                            200) *
                            100
                        )
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (draft.trim().split(/\s+/).filter(Boolean).length / 200) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-muted-copy pt-1">
                  <div className="flex items-center gap-2">
                    <span>CHARACTER COUNT: {draft.length}</span>
                    {draft.length > 0 && (
                      <div className="w-24 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            draft.length > 1000
                              ? 'bg-rose-500'
                              : draft.length > 500
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (draft.length / 1200) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <span>READABILITY LEVEL: {getReadabilityScore()}%</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(draft);
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                  }}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Read Aloud
                </button>

                {userErrors.draft && (
                  <p className="text-[10px] text-rose-400 font-bold font-mono flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{userErrors.draft}</span>
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Style Guideline Insights */}
            <div className="space-y-3 rounded-xl border border-border-soft bg-surface-hover p-5">
              <h5 className="text-xs font-black uppercase text-muted-copy tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-engineer-cyan" />
                <span>
                  Linguistic Guideline Insights (
                  {currentMission.corrections.length - activeCorrections.length}
                  /{currentMission.corrections.length} resolved)
                </span>
              </h5>

              {selectedRule ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-md animate-in slide-in-from-top-2 duration-300">
                  <h6 className="font-mono text-sm text-primary font-bold uppercase tracking-wide">
                    {selectedRule.type} Correction Guide
                  </h6>
                  <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
                    <strong className="text-foreground">Guideline:</strong>{' '}
                    {selectedRule.text}
                  </p>
                  <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-mono">
                    <span className="text-rose-400 font-bold">
                      "{selectedRule.original}"
                    </span>{' '}
                    →{' '}
                    <span className="text-emerald-400 font-bold">
                      "{selectedRule.fix}"
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-copy italic py-1 font-medium">
                    Click on any linguistic flag in the right column checkpoint,
                    or review the brief outline of required revisions below:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentMission.corrections.map((c) => {
                      const isFixed = !activeCorrections.some(
                        (ac) => ac.id === c.id
                      );
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedRule(c)}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all cursor-pointer ${
                            isFixed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover hover:bg-surface-hover hover:text-foreground'
                          }`}
                        >
                          {c.type.toUpperCase()}: {c.original}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Syntactic Optimization Checkpoint */}
          <div className="lg:col-span-5 space-y-6">
            <SectionCard
              title="Syntactic Optimization Checkpoint"
              subtitle="Verify linguistic and technical upgrades to earn rewards"
              icon={Sparkles}
              headerActions={
                activeCorrections.length > 0 && (
                  <Button
                    onClick={handleAutoFixAll}
                    variant="outline"
                    className="text-[10px] h-7 border-primary/40 text-primary hover:bg-primary/5 font-bold font-mono py-0"
                  >
                    Auto-Fix All
                  </Button>
                )
              }
            >
              <div className="space-y-6">
                {activeCorrections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-4 animate-in zoom-in-95 duration-300">
                    <Check className="h-10 w-10 text-emerald-400 bg-emerald-500/10 p-2 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        No Issues Detected
                      </p>
                      <p className="text-xs text-muted-copy mt-1.5 leading-relaxed font-medium">
                        Linguistic clarity, professional tone, and technical
                        jargon conform completely to standard protocols.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {activeCorrections.map((alert) => (
                      <div
                        key={alert.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedRule(alert)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedRule(alert);
                          }
                        }}
                        className="group relative cursor-pointer space-y-3 rounded-xl border border-border-soft bg-surface p-4 shadow-sm transition-all hover:-translate-y-px hover:border-border-hover hover:bg-surface-hover/60"
                      >
                        <div className="flex items-start gap-2.5 text-xs">
                          <AlertTriangle
                            className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${alert.type === 'grammar' ? 'text-rose-500' : 'text-amber-500'}`}
                          />
                          <p className="text-muted-copy leading-relaxed font-semibold">
                            {alert.text}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-border-soft pt-2.5">
                          <span className="text-[10px] font-mono text-muted-copy">
                            "{alert.original}" →{' '}
                            <span className="text-emerald-400 font-bold">
                              "{alert.fix}"
                            </span>
                          </span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyFix(alert.original, alert.fix);
                            }}
                            className="text-[10px] h-6 px-2.5 py-0 bg-primary/20 hover:bg-primary/30 text-primary rounded font-bold"
                          >
                            Auto-Fix
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Bar */}
                <div className="flex items-center justify-between border-t border-border-soft pt-4">
                  <Button
                    variant="outline"
                    onClick={resetCurrentMission}
                    className="h-10 border-border-soft text-xs text-muted-copy hover:text-foreground"
                  >
                    Reset Sandbox
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-primary-hover text-foreground font-black px-5 h-10"
                  >
                    Submit Draft
                  </Button>
                </div>
              </div>
            </SectionCard>

            {/* Performance indicator metrics */}
            <SectionCard
              title="Draft Quality Indicators"
              subtitle="Active textual metrics"
              icon={Layers}
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-muted-copy font-bold">
                    <span>CLARITY SCORE</span>
                    <span>{getReadabilityScore()}%</span>
                  </div>
                  <ProgressBar value={getReadabilityScore()} color="primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-muted-copy font-bold">
                    <span>TECHNICAL DENSITY</span>
                    <span>
                      {selectedMissionId === 'writing_cache_draft'
                        ? 68
                        : selectedMissionId === 'writing_rfc_migration'
                          ? 84
                          : 95}
                      %
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      selectedMissionId === 'writing_cache_draft'
                        ? 68
                        : selectedMissionId === 'writing_rfc_migration'
                          ? 84
                          : 95
                    }
                    color="cyan"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      ) : (
        <>
          <WritingEvaluationResults
            evaluationResult={evaluationResult}
            currentMission={currentMission}
            resetCurrentMission={resetCurrentMission}
            setSelectedRule={setSelectedRule}
            handleBackToMissions={handleBackToMissions}
            currentMissionIndex={currentMissionIndex}
            visibleMissions={[]}
            moveMission={moveMission}
          />
          <SectionCard
            title="Model Answer"
            subtitle="Reference structure for this mission"
            icon={FileText}
            headerActions={
              <Button
                variant="outline"
                onClick={() => setShowModelAnswer((s) => !s)}
                className="text-xs h-8"
              >
                {showModelAnswer ? 'Hide Model Answer' : 'Show Model Answer'}
              </Button>
            }
          >
            {showModelAnswer && currentMission.expectedStructure ? (
              <div className="space-y-2">
                {currentMission.expectedStructure.map((point, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border-soft bg-surface-hover p-3 text-sm text-foreground"
                  >
                    {point}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-copy">
                Toggle above to reveal the model answer.
              </p>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
};
