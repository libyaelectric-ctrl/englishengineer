import { Link } from 'react-router-dom';
import {
  Check,
  AlertTriangle,
  HelpCircle,
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

interface ReadingEvaluationResult {
  finalScore: number;
  feedback: string;
  comprehensionScore: number;
  vocabularyScore: number;
  technicalAccuracyScore: number;
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  strengths: string[];
  weaknesses: string[];
  detailedAnswers: Array<{
    questionId: string;
    questionText: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
}

interface ReadingEvaluationResultsProps {
  evaluationResult: ReadingEvaluationResult;
  resetCurrentMission: () => void;
  setSelectedWord: (word: null) => void;
  handleBackToMissions: () => void;
  currentMissionIndex: number;
  visibleMissions: unknown[];
  moveMission: (delta: number) => void;
}

export const ReadingEvaluationResults = ({
  evaluationResult,
  resetCurrentMission,
  setSelectedWord,
  handleBackToMissions,
  currentMissionIndex,
  visibleMissions,
  moveMission,
}: ReadingEvaluationResultsProps) => (
  <div className="space-y-8 animate-in zoom-in-95 duration-400">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="flex flex-col items-center space-y-6 rounded-xl border border-border-soft bg-surface p-6 text-center">
          <div>
            <h4 className="text-sm font-medium text-muted-copy uppercase tracking-widest font-mono">Verification Outcome</h4>
            <p className="text-[10px] text-muted-copy mt-0.5 uppercase">Substation Signal Standard Match</p>
          </div>
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
            <div className="absolute inset-2 rounded-full border border-dashed border-primary/30" />
            <div className="flex flex-col items-center">
              <span className="text-4xl font-medium leading-none text-foreground">{evaluationResult.finalScore}</span>
              <span className="text-[10px] font-mono text-muted-copy uppercase mt-1">score %</span>
            </div>
          </div>
          <p className="text-xs text-muted-copy italic px-2 font-medium leading-relaxed">&quot;{evaluationResult.feedback}&quot;</p>
          <div className="w-full space-y-4 border-t border-border-soft pt-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-medium text-muted-copy">
                <span>Comprehension Rate</span><span>{evaluationResult.comprehensionScore}%</span>
              </div>
              <ProgressBar value={evaluationResult.comprehensionScore} color="primary" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-medium text-muted-copy">
                <span>Jargon / Vocabulary</span><span>{evaluationResult.vocabularyScore}%</span>
              </div>
              <ProgressBar value={evaluationResult.vocabularyScore} color="primary" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-medium text-muted-copy">
                <span>Technical Precision</span><span>{evaluationResult.technicalAccuracyScore}%</span>
              </div>
              <ProgressBar value={evaluationResult.technicalAccuracyScore} color="success" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-success/5 border border-success/20 rounded-lg space-y-4">
          <h5 className="text-xs font-medium uppercase text-success tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5" /><span>Scoring Rewards Claimed</span>
          </h5>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3 text-center">
              <span className="text-[9px] font-mono text-muted-copy uppercase block">XP gained</span>
              <span className="mt-0.5 block text-sm font-medium text-foreground">+{evaluationResult.xpEarned}</span>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3 text-center">
              <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                <Coins className="h-2.5 w-2.5 text-warning shrink-0" /> COINS
              </span>
              <span className="mt-0.5 block text-sm font-medium text-foreground">+{evaluationResult.coinsEarned}</span>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3 text-center">
              <span className="text-[9px] font-mono text-muted-copy uppercase block flex items-center justify-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5 text-primary shrink-0" /> LEVEL PROGRESS
              </span>
              <span className={`text-sm font-medium block mt-0.5 ${evaluationResult.eloChange >= 0 ? 'text-success' : 'text-rose-400'}`}>
                {evaluationResult.eloChange >= 0 ? `+${evaluationResult.eloChange}` : evaluationResult.eloChange}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border-soft bg-surface-hover p-5 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="text-xs font-medium text-success uppercase tracking-widest font-mono flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" /><span>Identified Strengths</span>
            </h5>
            <ul className="space-y-1.5">
              {evaluationResult.strengths.map((s) => (
                <li key={s} className="text-xs text-muted-copy font-medium flex items-start gap-1.5">
                  <span className="text-success font-medium shrink-0 mt-0.5">•</span><span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 border-t border-border-soft pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <h5 className="text-xs font-medium text-warning uppercase tracking-widest font-mono flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" /><span>Development Gaps</span>
            </h5>
            <ul className="space-y-1.5">
              {evaluationResult.weaknesses.map((w) => (
                <li key={w} className="text-xs text-muted-copy font-medium flex items-start gap-1.5">
                  <span className="text-warning font-medium shrink-0 mt-0.5">•</span><span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SectionCard title="Detailed Technical Evaluation" subtitle="Review each answered question and corresponding engineering justifications" icon={HelpCircle}>
          <div className="space-y-6">
            {evaluationResult.detailedAnswers.map((item, idx) => (
              <div key={item.questionId} className={`p-4 rounded-lg border space-y-3 ${item.isCorrect ? 'bg-success/5 border-success/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border-soft bg-surface font-mono text-xs font-medium text-muted-copy">{idx + 1}</span>
                    <h6 className="mt-0.5 text-xs font-medium leading-tight text-foreground md:text-sm">{item.questionText}</h6>
                  </div>
                  <span className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1 shrink-0 ${item.isCorrect ? 'bg-success/10 text-success border border-success/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {item.isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>{item.isCorrect ? 'Correct' : 'Incorrect'}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-border-soft bg-surface p-3 md:grid-cols-2">
                  <div>
                    <span className="text-[9px] font-mono text-muted-copy uppercase block">Your Answer</span>
                    <span className="mt-0.5 block text-xs font-medium text-foreground">{item.userAnswer}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-muted-copy uppercase block">Expected Key / Option</span>
                    <span className="text-xs font-medium text-success block mt-0.5">{item.correctAnswer}</span>
                  </div>
                </div>
                <div className="space-y-1 rounded-lg border border-border-soft bg-surface-hover p-3">
                  <span className="text-[9px] font-medium uppercase text-muted-copy tracking-wider font-mono">Technical Justification</span>
                  <p className="text-xs text-muted-copy leading-relaxed font-medium">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link to="/writing" className="inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-medium text-primary hover:bg-primary/5">Follow up in Writing</Link>
          <Button variant="outline" onClick={() => { resetCurrentMission(); setSelectedWord(null); }} className="h-10 border-border-soft text-xs text-muted-copy hover:text-primary">Retry Assessment</Button>
          <Button onClick={handleBackToMissions} className="bg-primary hover:bg-primary/90 text-white font-medium px-6 h-10">Back to Reading list</Button>
          {currentMissionIndex < visibleMissions.length - 1 && (
            <Button onClick={() => moveMission(1)}>Next lesson <ChevronRight className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  </div>
);
