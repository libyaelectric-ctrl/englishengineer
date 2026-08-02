import { RotateCcw, Trophy } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';

import type { InterviewScore, InterviewSession } from '../../simulator/interview-simulator';

export const ResultsView = ({
  session,
  scores,
  overallScore,
  onReset,
}: {
  session: InterviewSession;
  scores: InterviewScore[];
  overallScore: number;
  onReset: () => void;
}) => (
  <div className="space-y-6 animate-in fade-in">
    <SectionCard
      title="Interview Results"
      subtitle={`${session.type === 'system-design' ? 'System Design' : 'Coding'} interview completed`}
      icon={Trophy}
      footer={
        <Button
          onClick={onReset}
          className="rounded-[4px] cursor-pointer bg-primary hover:bg-primary/90 border border-primary text-white font-bold uppercase tracking-wider text-[11px] h-10 px-5 shadow-sm flex items-center gap-1.5"
        >
          <RotateCcw className="h-4 w-4" /> New Interview
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-[4px] border border-primary/25 bg-primary/5 p-6 text-center shadow-sm">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
            Overall Score
          </p>
          <p className="mt-2 text-4xl font-bold text-foreground">
            {overallScore}
            <span className="text-lg text-muted-copy">/100</span>
          </p>
          <div className="mt-3">
            <ProgressBar value={overallScore} color="primary" />
          </div>
        </div>

        {scores.map((score, i) => (
          <div key={i} className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-copy tracking-wider">
                  Question {i + 1}
                </p>
                <p className="mt-1 text-sm text-foreground font-medium leading-relaxed">
                  {session.questions[i].question.slice(0, 80)}...
                </p>
              </div>
              <span
                className={`rounded-[4px] px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  score.overall >= 80
                    ? 'bg-success/10 text-success border border-success/20'
                    : score.overall >= 60
                      ? 'bg-warning/10 text-warning border border-warning/20'
                      : 'bg-error/10 text-error border border-error/20'
                }`}
              >
                {score.overall}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-border-soft pt-3">
              {[
                ['Technical', score.technicalAccuracy],
                ['Clarity', score.clarity],
                ['Depth', score.depth],
                ['Communication', score.communication],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="text-center bg-surface-hover p-2 rounded-[4px] border border-border-soft"
                >
                  <p className="text-[10px] uppercase text-muted-copy font-bold tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{value}%</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-copy font-medium leading-relaxed italic">
              &quot;{score.feedback}&quot;
            </p>
            {score.strengths.length > 0 && (
              <div className="mt-3 border-t border-border-soft pt-3">
                <p className="text-[10px] font-bold uppercase text-success tracking-wider">
                  Strengths
                </p>
                <ul className="mt-1 space-y-1">
                  {score.strengths.map((s, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-1.5 text-xs text-foreground font-medium"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {score.improvements.length > 0 && (
              <div className="mt-3 border-t border-border-soft pt-3">
                <p className="text-[10px] font-bold uppercase text-warning tracking-wider">
                  Improvements
                </p>
                <ul className="mt-1 space-y-1">
                  {score.improvements.map((s, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-1.5 text-xs text-foreground font-medium"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  </div>
);
