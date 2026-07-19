import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type {
  AICoachContext,
  AICoachResult,
  AICoachSession,
} from '@/features/ai';
import type { AssessmentProfile } from '@/features/assessment';

interface UserContextSidebarProps {
  coachContext: AICoachContext;
  assessmentProfile: AssessmentProfile;
  lastResult: AICoachResult | null;
  sessions: AICoachSession[];
}

export const UserContextSidebar = ({
  coachContext,
  assessmentProfile,
  lastResult,
  sessions,
}: UserContextSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:sticky lg:top-[5rem] lg:self-start">
      <SectionCard
        title="User Context"
        subtitle="Live local learning profile"
        icon={Zap}
      >
        <div className="space-y-2 text-sm">
          {[
            ['Learner', coachContext.userName],
            ['Role', coachContext.role],
            ['Discipline', coachContext.discipline],
            ['Target', coachContext.targetLevel],
            [
              'Progress',
              `${coachContext.completedMissions}/${coachContext.totalMissions} missions`,
            ],
            [
              'Vocabulary',
              `${coachContext.wordsLearned} words, ${coachContext.vocabularyRetention}% retention`,
            ],
            ['Assessment', assessmentProfile.trustLabel],
            ['Engineer CEFR', assessmentProfile.engineerCefr || 'Pending'],
            ['Internal progress index', `${assessmentProfile.engineerElo}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-border-soft/60 pb-1.5"
            >
              <span className="text-muted-copy font-mono text-[9px] font-bold uppercase tracking-wider">
                {label}
              </span>
              <span className="text-right font-semibold text-foreground text-xs">
                {value}
              </span>
            </div>
          ))}
          <div>
            <div className="flex justify-between text-xs font-mono text-muted-copy mb-2">
              <span>Average Score</span>
              <span>{coachContext.averageScore}%</span>
            </div>
            <ProgressBar value={coachContext.averageScore} color="primary" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <StatusBadge
              label={
                assessmentProfile.hasEnoughData
                  ? 'Assessment profile active'
                  : 'Assessment data limited'
              }
              tone={assessmentProfile.hasEnoughData ? 'success' : 'warning'}
              className="rounded-[4px] font-bold text-[9px] uppercase tracking-wider"
            />
            {coachContext.weakSkills.map((skill) => (
              <span
                key={skill}
                className="text-[9px] font-mono bg-danger/5 text-danger border border-danger/25 px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wider"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      {lastResult && (
        <SectionCard
          title="Suggested Actions"
          subtitle="Next practice steps"
          icon={CheckCircle2}
        >
          <div className="space-y-2">
            {lastResult.suggestedActions.map((action) => (
              <div
                key={action}
                className="flex gap-2 rounded-[4px] border border-border-soft bg-surface-hover p-2 text-xs text-foreground shadow-sm font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-8 rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/95 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer inline-flex items-center justify-center"
            >
              Open Dashboard
            </Button>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Recent Sessions"
        subtitle="Last 5 coach interactions"
        icon={Sparkles}
      >
        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="rounded-[4px] border border-border-soft bg-surface-hover p-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold text-foreground">
                  {session.modeName}
                </p>
                <span className="text-[9px] font-mono text-muted-copy">
                  {new Date(session.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[10px] text-muted-copy mt-1 line-clamp-1">
                {session.input}
              </p>
              <p className="text-[9px] font-mono font-bold text-[#0047bb] mt-1 uppercase tracking-wider">
                {session.result.focusArea}
              </p>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-muted-copy">No coach sessions yet.</p>
          )}
        </div>
      </SectionCard>

      <div className="rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm">
        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#0047bb]">
          Integration Notice
        </p>
        <p className="text-xs text-muted-copy mt-2 leading-relaxed font-medium">
          Set VITE_AI_PROVIDER=backend and VITE_AI_PROXY_URL to connect the
          server-side AI proxy. This frontend never receives vendor secrets.
        </p>
      </div>
    </div>
  );
};
