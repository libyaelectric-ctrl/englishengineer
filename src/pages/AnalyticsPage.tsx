import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Calendar,
  Flame,
  LineChart,
  Radar,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { MetricCard } from '@/shared/components/MetricCard';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useLearningStore } from '@/core/learning';
import {
  AnalyticsService,
  AnalyticsTimelinePoint,
  useAnalyticsStore,
} from '@/features/analytics';
import { AssessmentProfile } from '@/features/assessment';
import { canViewAdvancedAnalytics, useBillingStore, canAccessFeature } from '@/features/billing';
import { useWorkspaceStore } from '@/features/billing/workspace.store';
import { WorkspaceSelector } from '@/features/billing/WorkspaceSelector';

const chartTabs: Array<{
  id: ReturnType<typeof useAnalyticsStore.getState>['activeChart'];
  label: string;
}> = [
  { id: 'overview', label: 'Overview' },
  { id: 'skills', label: 'Skills' },
  { id: 'xp', label: 'XP' },
  { id: 'elo', label: 'Skill index' },
  { id: 'vocabulary', label: 'Vocabulary' },
];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const learningState = useLearningStore();
  const subscription = useBillingStore((state) => state.subscription);
  const resetAll = useLearningStore((state) => state.resetAll);
  const activeChart = useAnalyticsStore((state) => state.activeChart);
  const setActiveChart = useAnalyticsStore((state) => state.setActiveChart);
  const analytics = AnalyticsService.getSummary(learningState);
  const advancedAnalyticsEntitlement = canViewAdvancedAnalytics(subscription);

  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];
  const hasProjectAccess = canAccessFeature(subscription, 'projectWorkspace').allowed;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Analytics Pro"
        description="Local analytics derived from completed EngineerOS activity. Estimates improve as real learning sessions accumulate."
        badgeText={
          analytics.recentSessions.length > 0
            ? `CEFR ESTIMATE: ${analytics.estimatedCefr}`
            : 'LOCAL DATA ONLY'
        }
        badgeColor={analytics.recentSessions.length > 0 ? 'emerald' : 'amber'}
        actions={
          <Button
            onClick={resetAll}
            variant="outline"
            className="gap-2 border-slate-200 text-slate-600 hover:text-sky-800"
          >
            <RefreshCcw className="h-4 w-4 text-primary" /> Reset Core Data
          </Button>
        }
      />

      <div className="premium-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Analytics Reality</p>
          <p className="mt-1 text-xs text-slate-400">
            Metrics are calculated from local learning state. No external
            calibration or production data warehouse is connected.
          </p>
        </div>
        <StatusBadge label="Based on local activity" tone="warning" />
      </div>

      {hasProjectAccess && (
        <div className="rounded-[16px] border border-blue-500/20 bg-blue-500/5 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-primary" />
                Project-Based Advanced Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Analyze document counts, AI coach context, and persistent memory metrics scoped per workspace.
              </p>
            </div>
            <WorkspaceSelector planId={subscription.planId} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-[12px] bg-white border border-slate-200 p-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspace Documents
              </p>
              <p className="text-2xl font-black text-slate-900">
                {activeWorkspace?.documents?.length || 0}
              </p>
              <p className="text-xs text-slate-500 leading-normal">
                Files uploaded and analyzed for this project scope.
              </p>
            </div>
            
            <div className="rounded-[12px] bg-white border border-slate-200 p-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Memory Keys
              </p>
              <p className="text-2xl font-black text-slate-900">
                {Object.keys(activeWorkspace?.memory || {}).length}
              </p>
              <p className="text-xs text-slate-500 leading-normal">
                Persistent context keys injected into your AI prompts.
              </p>
            </div>

            <div className="rounded-[12px] bg-white border border-slate-200 p-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Isolated AI Sessions
              </p>
              <p className="text-2xl font-black text-slate-900">
                {activeWorkspace?.sessions?.length || 0}
              </p>
              <p className="text-xs text-slate-500 leading-normal">
                AI Coach transcripts kept separate within this workspace.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          label="Overall Progress"
          value={`${analytics.overallProgress}%`}
          icon={Target}
          trend={`${analytics.recentSessions.length} recent sessions`}
          statusColor="primary"
        />
        <MetricCard
          label="Study Consistency"
          value={`${analytics.studyConsistency}%`}
          icon={Calendar}
          trend={`${analytics.averageSessionLength}m avg session`}
          statusColor="cyan"
        />
        <MetricCard
          label="Improvement Velocity"
          value={`${analytics.improvementVelocity >= 0 ? '+' : ''}${analytics.improvementVelocity}%`}
          icon={TrendingUp}
          trend={`${analytics.retention}% retention signal`}
          statusColor={analytics.improvementVelocity >= 0 ? 'emerald' : 'amber'}
        />
        <MetricCard
          label="AI Coach Usage"
          value={`${analytics.aiCoachUsage.totalSessions}`}
          icon={Sparkles}
          trend={analytics.aiCoachUsage.mostUsedMode}
          statusColor="amber"
        />
      </div>

      <SectionCard
        title="Assessment Profile"
        subtitle="Engineering communication dimensions derived from existing learning evidence"
        icon={ShieldCheck}
        headerActions={
          <StatusBadge
            label={analytics.assessmentProfile.trustLabel}
            tone={
              analytics.assessmentProfile.hasEnoughData ? 'success' : 'warning'
            }
          />
        }
      >
        <AssessmentProfilePanel profile={analytics.assessmentProfile} />
      </SectionCard>

      {!advancedAnalyticsEntitlement.allowed && (
        <SectionCard
          title="Advanced Analytics Locked"
          subtitle="Upgrade to unlock the full local analytics workspace. Cloud analytics remain available only after secure sync is configured."
          icon={Sparkles}
        >
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm text-amber-200">
              {advancedAnalyticsEntitlement.reason}
            </p>
            <Button
              onClick={() => navigate('/profile')}
              className="mt-4 h-10 bg-primary text-white font-bold"
            >
              Upgrade to Pro
            </Button>
          </div>
        </SectionCard>
      )}

      {advancedAnalyticsEntitlement.allowed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SectionCard
              title="Performance Command Center"
              subtitle="Derived from existing learning, vocabulary, achievement, and AI Coach state"
              icon={BarChart3}
              headerActions={
                <div className="flex flex-wrap gap-1 rounded-[12px] border border-slate-200 bg-slate-50 p-1">
                  {chartTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveChart(tab.id)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                        activeChart === tab.id
                          ? 'bg-primary text-white shadow-md'
                          : 'text-slate-600 hover:bg-white hover:text-sky-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="pt-6">
                {activeChart === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnalyticsProgress
                      label="Overall Progress"
                      value={analytics.overallProgress}
                    />
                    <AnalyticsProgress
                      label="Vocabulary Retention"
                      value={analytics.vocabularyRetention}
                    />
                    <AnalyticsProgress
                      label="Study Consistency"
                      value={analytics.studyConsistency}
                    />
                    <AnalyticsProgress
                      label="Average Retention"
                      value={analytics.retention}
                    />
                    <WeeklyActivityChart
                      values={analytics.weeklyActivity.map(
                        (item) => item.minutes
                      )}
                    />
                    <StudyHeatmap values={analytics.studyHeatmap} />
                  </div>
                )}

                {activeChart === 'skills' && (
                  <div className="space-y-6">
                    <SkillRadar skills={analytics.skillRadar} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.skillRadar.map((skill) => (
                        <div
                          key={skill.module}
                          className="rounded-[12px] border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-slate-900">
                              {skill.module}
                            </h4>
                            <span
                              className={`text-[10px] font-mono uppercase ${
                                skill.trend === 'up'
                                  ? 'text-emerald-400'
                                  : skill.trend === 'down'
                                    ? 'text-rose-400'
                                    : 'text-slate-500'
                              }`}
                            >
                              {skill.trend}
                            </span>
                          </div>
                          <div className="mt-4 space-y-3">
                            <AnalyticsProgress
                              label="Average Score"
                              value={skill.averageScore}
                            />
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <MiniStat
                                label="Missions"
                                value={`${skill.completedMissions}`}
                              />
                              <MiniStat
                                label="Sessions"
                                value={`${skill.sessionCount}`}
                              />
                              <MiniStat
                                label="Minutes"
                                value={`${skill.totalMinutes}`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeChart === 'xp' && (
                  <TimelinePanel
                    title="XP Timeline"
                    icon={Zap}
                    points={analytics.xpTimeline}
                    footer={`Growth delta: ${analytics.xpGrowth >= 0 ? '+' : ''}${analytics.xpGrowth} XP`}
                  />
                )}

                {activeChart === 'elo' && (
                  <TimelinePanel
                    title="Skill Progress Timeline"
                    icon={LineChart}
                    points={analytics.eloTimeline}
                    footer={`Index growth: ${analytics.eloGrowth >= 0 ? '+' : ''}${analytics.eloGrowth}`}
                  />
                )}

                {activeChart === 'vocabulary' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MiniStat
                        label="Words Learned"
                        value={`${analytics.vocabularySummary.wordsLearned}`}
                      />
                      <MiniStat
                        label="Reviews Today"
                        value={`${analytics.vocabularySummary.todaysReviews}`}
                      />
                      <MiniStat
                        label="Vocab Streak"
                        value={`${analytics.vocabularySummary.vocabularyStreak}d`}
                      />
                    </div>
                    <AnalyticsProgress
                      label="Vocabulary Retention"
                      value={analytics.vocabularyRetention}
                    />
                    <div className="space-y-3">
                      {analytics.vocabularySummary.categoryMastery.map(
                        (item) => (
                          <AnalyticsProgress
                            key={item.discipline}
                            label={item.discipline}
                            value={item.percentage}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Recent Sessions"
              subtitle="Latest learning activity across all engines"
              icon={Activity}
            >
              <div className="space-y-3">
                {analytics.recentSessions.map((session) => (
                  <div
                    key={`${session.timestamp}-${session.module}`}
                    className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {session.module}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">
                        {session.score}%
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {session.durationMinutes} min
                      </p>
                    </div>
                  </div>
                ))}
                {analytics.recentSessions.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No recent sessions yet.
                  </p>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              title="Next Recommended Study"
              subtitle="Single best next step from current data"
              icon={Brain}
            >
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-black">
                  {analytics.nextRecommendedStudy.module}
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">
                  {analytics.nextRecommendedStudy.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {analytics.nextRecommendedStudy.reason}
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Weak Skills"
              subtitle="Training sectors requiring attention"
              icon={Radar}
            >
              <TagList
                items={analytics.weakSkills}
                tone="rose"
                emptyLabel="No weak skills detected"
              />
            </SectionCard>

            <SectionCard
              title="Strong Skills"
              subtitle="Current strongest learning sectors"
              icon={Flame}
            >
              <TagList
                items={analytics.strongSkills}
                tone="emerald"
                emptyLabel="No strong skills detected yet"
              />
            </SectionCard>

            <SectionCard
              title="Recent Achievements"
              subtitle="Latest unlocked badges"
              icon={Award}
            >
              <div className="space-y-3">
                {analytics.recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4"
                  >
                    <p className="text-sm font-bold text-slate-900">
                      {achievement.title}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {analytics.recentAchievements.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No achievements unlocked yet.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="AI Coach Analytics"
              subtitle="Locally stored coach usage"
              icon={Sparkles}
            >
              <div className="space-y-4 text-sm text-slate-400">
                <DetailRow
                  label="Sessions"
                  value={`${analytics.aiCoachUsage.totalSessions}`}
                />
                <DetailRow
                  label="Most Used"
                  value={analytics.aiCoachUsage.mostUsedMode}
                />
                <DetailRow
                  label="Focus Area"
                  value={analytics.aiCoachUsage.suggestedFocusArea}
                />
                <DetailRow
                  label="Last Used"
                  value={
                    analytics.aiCoachUsage.lastUsedAt
                      ? new Date(
                          analytics.aiCoachUsage.lastUsedAt
                        ).toLocaleDateString()
                      : 'No sessions'
                  }
                />
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

interface AnalyticsProgressProps {
  label: string;
  value: number;
}

const AnalyticsProgress = ({ label, value }: AnalyticsProgressProps) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold text-slate-300">
      <span>{label}</span>
      <span className="text-primary font-mono">{value}%</span>
    </div>
    <ProgressBar value={value} color="primary" />
  </div>
);

const AssessmentProfilePanel = ({
  profile,
}: {
  profile: AssessmentProfile;
}) => {
  if (!profile.hasEnoughData) {
    return (
      <div className="rounded-[16px] border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="text-sm font-bold text-amber-100">
          Not enough assessment data yet.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-amber-200/80">
          Complete Reading, Writing, Listening, Speaking, or Vocabulary missions
          to build a reliable engineering communication profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat label="Overall" value={`${profile.overallScore ?? 0}%`} />
        <MiniStat
          label="Engineer CEFR"
          value={profile.engineerCefr || 'Pending'}
        />
        <MiniStat
          label="Internal progress index"
          value={`${profile.engineerElo}`}
        />
        <MiniStat label="Confidence" value={`${profile.confidenceScore}%`} />
      </div>

      <div className="rounded-[16px] border border-cyan-400/20 bg-cyan-400/5 p-4">
        <p className="text-xs font-bold text-cyan-100">
          {profile.certificateDisclaimer}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-cyan-200/80">
          {profile.confidenceExplanation}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ReadinessCard
          label="Meeting Readiness"
          value={profile.readiness.meetings}
        />
        <ReadinessCard
          label="Report Readiness"
          value={profile.readiness.reports}
        />
        <ReadinessCard
          label="Consultant Readiness"
          value={profile.readiness.consultantCommunication}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest font-black">
            Strongest Dimensions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.strongestDimensions.map((dimension) => (
              <span
                key={dimension.dimensionId}
                className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-mono uppercase text-emerald-200"
              >
                {dimension.label} {dimension.score}%
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[16px] border border-rose-500/20 bg-rose-500/5 p-5">
          <p className="text-[10px] font-mono text-rose-300 uppercase tracking-widest font-black">
            Priority Improvement Areas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.weakestDimensions.map((dimension) => (
              <span
                key={dimension.dimensionId}
                className="rounded border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[10px] font-mono uppercase text-rose-200"
              >
                {dimension.label} {dimension.score}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {profile.dimensionScores.map((dimension) => (
          <div
            key={dimension.dimensionId}
            className="rounded-[12px] border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black text-slate-900">
                {dimension.label}
              </p>
              <span className="text-[10px] font-mono text-primary">
                {dimension.score === null ? 'Pending' : `${dimension.score}%`}
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={dimension.score ?? 0} color="primary" />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {dimension.evidence}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReadinessCard = ({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) => (
  <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
      <span>{label}</span>
      <span className="text-primary font-mono">
        {value === null ? 'Pending' : `${value}%`}
      </span>
    </div>
    <div className="mt-3">
      <ProgressBar value={value ?? 0} color="primary" />
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
    <p className="text-[10px] font-mono text-slate-500 uppercase">{label}</p>
    <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
    <span className="font-mono text-xs uppercase">{label}</span>
    <span className="text-right font-bold text-slate-900">{value}</span>
  </div>
);

const TagList = ({
  items,
  tone,
  emptyLabel,
}: {
  items: string[];
  tone: 'rose' | 'emerald';
  emptyLabel: string;
}) => {
  const filtered = items.filter((item) => item !== 'None');
  if (filtered.length === 0)
    return <p className="text-xs text-slate-500">{emptyLabel}</p>;

  const classes =
    tone === 'rose'
      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';

  return (
    <div className="flex flex-wrap gap-2">
      {filtered.map((item) => (
        <span
          key={item}
          className={`text-[10px] font-mono uppercase border px-2 py-1 rounded ${classes}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const WeeklyActivityChart = ({ values }: { values: number[] }) => {
  const maxValue = Math.max(...values, 1);
  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
        Weekly Activity
      </p>
      <div className="h-36 flex items-end gap-2 mt-5">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="w-full rounded-t bg-primary/80 min-h-[6px]"
              style={{ height: `${Math.max(6, (value / maxValue) * 120)}px` }}
            />
            <span className="text-[9px] font-mono text-slate-500">
              {value}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudyHeatmap = ({
  values,
}: {
  values: Array<{ date: string; count: number }>;
}) => (
  <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
      Study Heatmap
    </p>
    <div className="grid grid-cols-7 gap-2 mt-5">
      {values.map((item) => (
        <div
          key={item.date}
          title={`${item.date}: ${item.count} sessions`}
          className={`aspect-square rounded-md border border-slate-200 ${
            item.count >= 3
              ? 'bg-emerald-400'
              : item.count === 2
                ? 'bg-primary'
                : item.count === 1
                  ? 'bg-primary/40'
                  : 'bg-slate-100'
          }`}
        />
      ))}
    </div>
  </div>
);

const SkillRadar = ({
  skills,
}: {
  skills: Array<{ module: string; averageScore: number }>;
}) => {
  const size = 220;
  const center = size / 2;
  const radius = 82;
  const points = skills.map((skill, index) => {
    const angle = (Math.PI * 2 * index) / skills.length - Math.PI / 2;
    const distance = radius * (skill.averageScore / 100);
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      labelX: center + Math.cos(angle) * (radius + 22),
      labelY: center + Math.sin(angle) * (radius + 22),
      skill,
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="overflow-x-auto rounded-[16px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">
        Skill Radar
      </p>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto mt-4 h-64 w-64">
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx={center}
            cy={center}
            r={radius * ratio}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
          />
        ))}
        <polygon
          points={polygon}
          fill="rgba(59,130,246,0.24)"
          stroke="#3b82f6"
          strokeWidth="3"
        />
        {points.map((point) => (
          <g key={point.skill.module}>
            <circle cx={point.x} cy={point.y} r="4" fill="#38bdf8" />
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              fill="#cbd5e1"
              className="text-[9px] font-mono"
            >
              {point.skill.module}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const TimelinePanel = ({
  title,
  icon: Icon,
  points,
  footer,
}: {
  title: string;
  icon: typeof LineChart;
  points: AnalyticsTimelinePoint[];
  footer: string;
}) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 text-slate-900">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-black">{title}</h3>
    </div>
    <LineSvg points={points} />
    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
      {points
        .slice()
        .reverse()
        .slice(0, 8)
        .map((point) => (
          <div
            key={`${point.date}-${point.label}-${point.value}`}
            className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-slate-50 p-3"
          >
            <div>
              <p className="text-xs font-bold text-slate-900">{point.label}</p>
              <p className="text-[9px] font-mono text-slate-500">
                {point.date}
              </p>
            </div>
            <span className="text-xs font-mono font-black text-primary">
              {point.value}
            </span>
          </div>
        ))}
    </div>
    <p className="text-[10px] font-mono text-slate-500 text-center uppercase tracking-widest">
      {footer}
    </p>
  </div>
);

const LineSvg = ({ points }: { points: AnalyticsTimelinePoint[] }) => {
  if (points.length === 0) {
    return <p className="text-xs text-slate-500">No timeline data yet.</p>;
  }

  const width = 600;
  const height = 180;
  const padding = 26;
  const values = points.map((point) => point.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const svgPoints = points.map((point, index) => {
    const x =
      padding +
      (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((point.value - minValue) / range) * (height - padding * 2);
    return { x, y, point };
  });
  const path = svgPoints
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`)
    .join(' ');

  return (
    <div className="relative overflow-x-auto rounded-[16px] border border-slate-200 bg-slate-50 p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44 overflow-visible"
      >
        <path
          d={path}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {svgPoints.map((item) => (
          <g key={`${item.point.date}-${item.point.label}-${item.point.value}`}>
            <circle
              cx={item.x}
              cy={item.y}
              r="5"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AnalyticsPage;
