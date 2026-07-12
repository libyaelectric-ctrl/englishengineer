import { Link } from 'react-router-dom';
import {
  Check,
  AlertTriangle,
  Sparkles,
  FileText,
  CheckCircle2,
  Award,
  Coins,
  TrendingUp,
  X,
  ChevronRight,
} from 'lucide-react';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import {
  WritingModelAnswer,
  type WritingEvaluationResult,
} from '@/features/writing';

interface WritingEvaluationResultsProps {
  evaluationResult: WritingEvaluationResult;
  currentMission: {
    sampleExcellentAnswer?: string;
  };
  resetCurrentMission: () => void;
  setSelectedRule: (rule: null) => void;
  handleBackToMissions: () => void;
  currentMissionIndex: number;
  visibleMissions: unknown[];
  moveMission: (delta: number) => void;
}

export const WritingEvaluationResults = ({
  evaluationResult,
  currentMission,
  resetCurrentMission,
  setSelectedRule,
  handleBackToMissions,
  currentMissionIndex,
  visibleMissions,
  moveMission,
}: WritingEvaluationResultsProps) => (
  <div className="space-y-8 animate-in zoom-in-95 duration-400">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Score Summary Side Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="flex flex-col items-center space-y-6 rounded-xl border border-border-soft bg-surface p-6 text-center shadow-sm">
          <div>
            <h4 className="text-sm font-black text-muted-copy uppercase tracking-widest font-mono">
              Composition Outcome
            </h4>
            <p className="text-[10px] text-muted-copy mt-0.5 uppercase">
              Linguistic Standard Verification
            </p>
          </div>

          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-border-soft bg-surface-hover shadow-sm">
            <div className="absolute inset-2 rounded-full border border-dashed border-border-soft" />
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black leading-none text-foreground">
                {evaluationResult.finalScore}
              </span>
              <span className="text-[10px] font-mono text-muted-copy uppercase mt-1">
                score %
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-copy italic px-2 font-medium leading-relaxed">
            &quot;{evaluationResult.feedback}&quot;
          </p>

          <div className="w-full space-y-4 border-t border-border-soft pt-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-copy">
                <span>Linguistic Clarity</span>
                <span>{evaluationResult.linguisticClarityScore}%</span>
              </div>
              <ProgressBar
                value={evaluationResult.linguisticClarityScore}
                color="primary"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-copy">
                <span>Jargon / Vocabulary</span>
                <span>{evaluationResult.jargonDensityScore}%</span>
              </div>
              <ProgressBar
                value={evaluationResult.jargonDensityScore}
                color="cyan"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-copy">
                <span>Professional Tone</span>
                <span>{evaluationResult.professionalToneScore}%</span>
              </div>
              <ProgressBar
                value={evaluationResult.professionalToneScore}
                color="emerald"
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-4">
          <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5" />
            <span>Scoring Rewards Claimed</span>
          </h5>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border-soft bg-surface-hover p-3 text-center">
              <span className="text-[9px] font-mono text-muted-copy uppercase block">
                XP gained
              </span>
              <span className="mt-0.5 block text-sm font-bold text-foreground">
                +{evaluationResult.xpEarned}
              </span>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-hover p-3 text-center">
              <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                <Coins className="h-2.5 w-2.5 text-amber-500 shrink-0" /> COINS
              </span>
              <span className="mt-0.5 block text-sm font-bold text-foreground">
                +{evaluationResult.coinsEarned}
              </span>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-hover p-3 text-center">
              <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5 text-cyan-500 shrink-0" />{' '}
                LEVEL PROGRESS
              </span>
              <span
                className={`text-sm font-bold block mt-0.5 ${evaluationResult.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {evaluationResult.eloChange >= 0
                  ? `+${evaluationResult.eloChange}`
                  : evaluationResult.eloChange}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border-soft bg-surface-hover p-5 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Identified Strengths</span>
            </h5>
            <ul className="space-y-1.5">
              {evaluationResult.strengths.map((s) => (
                <li
                  key={s}
                  className="text-xs text-muted-copy font-medium flex items-start gap-1.5"
                >
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 border-t border-border-soft pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <h5 className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Development Gaps</span>
            </h5>
            <ul className="space-y-1.5">
              {evaluationResult.weaknesses.map((w) => (
                <li
                  key={w}
                  className="text-xs text-muted-copy font-medium flex items-start gap-1.5"
                >
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SectionCard
          title="Polished Proposal Output"
          subtitle="Final submitted text after review"
          icon={FileText}
        >
          <div className="whitespace-pre-wrap rounded-xl border border-border-soft bg-surface-hover p-5 text-sm font-medium leading-relaxed text-foreground">
            {evaluationResult.finalDraft}
          </div>
        </SectionCard>

        <SectionCard
          title="Detailed Linguistic Audit"
          subtitle="Review each active syntactic flag and corresponding corrections applied"
          icon={Sparkles}
        >
          <div className="space-y-6">
            {evaluationResult.detailedCorrections.map((item, idx) => (
              <div
                key={item.correctionId}
                className={`p-4 rounded-md border space-y-3 ${item.isFixed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border-soft bg-surface font-mono text-xs font-black text-muted-copy">
                      {idx + 1}
                    </span>
                    <h6 className="mt-0.5 text-xs font-bold leading-tight text-foreground md:text-sm">
                      {item.text}
                    </h6>
                  </div>
                  <span
                    className={`text-[10px] font-black font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1 shrink-0 ${item.isFixed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                  >
                    {item.isFixed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span>{item.isFixed ? 'Optimized' : 'Unresolved'}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border-soft bg-surface p-3 md:grid-cols-2">
                  <div>
                    <span className="text-[9px] font-mono text-muted-copy uppercase block">
                      Casual/Error Term
                    </span>
                    <span className="text-xs font-bold text-rose-400 block mt-0.5">
                      &quot;{item.original}&quot;
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-muted-copy uppercase block">
                      Professional Revision
                    </span>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                      &quot;{item.fix}&quot;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <WritingModelAnswer
          hasSubmitted={Boolean(evaluationResult)}
          modelAnswer={currentMission.sampleExcellentAnswer}
          suggestions={evaluationResult.weaknesses}
        />

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link
            to="/curriculum"
            className="inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-bold text-primary hover:bg-surface-hover"
          >
            Learning Hub
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              resetCurrentMission();
              setSelectedRule(null);
            }}
            className="h-10 border-border-soft text-xs text-muted-copy hover:text-foreground"
          >
            Retry Sandbox
          </Button>
          <Button
            onClick={handleBackToMissions}
            className="bg-primary hover:bg-primary-hover text-foreground font-black px-6 h-10"
          >
            Back to Writing list
          </Button>
          {currentMissionIndex < visibleMissions.length - 1 && (
            <Button onClick={() => moveMission(1)}>
              Next lesson <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);
