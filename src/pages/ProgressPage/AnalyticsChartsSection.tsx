import { BarChart3, Zap, LineChart } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import {
  AnalyticsProgress,
  MiniStat,
} from '@/pages/ProgressPage/AnalyticsPanels';
import {
  WeeklyActivityChart,
  StudyHeatmap,
  SkillRadar,
  TimelinePanel,
} from '@/pages/ProgressPage/AnalyticsCharts';
import type { AnalyticsStoreState } from '@/features/analytics';

export const AnalyticsChartsSection = ({
  analytics,
  activeChart,
  setActiveChart,
  chartTabs,
}: {
  analytics: ReturnType<
    typeof import('@/features/analytics').AnalyticsService.getSummary
  >;
  activeChart: AnalyticsStoreState['activeChart'];
  setActiveChart: AnalyticsStoreState['setActiveChart'];
  chartTabs: Array<{ id: AnalyticsStoreState['activeChart']; label: string }>;
}) => {
  return (
    <SectionCard
      title="Performance Command Center"
      subtitle="Derived from existing learning, vocabulary, achievement, and AI Coach state"
      icon={BarChart3}
      headerActions={
        <div className="flex flex-wrap gap-1 rounded-[4px] border border-border-soft bg-surface p-1 shadow-sm">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`px-3 py-1.5 text-[10px] font-sans font-bold rounded-[4px] uppercase tracking-wider transition-all cursor-pointer ${activeChart === tab.id ? 'bg-[#0047bb] text-white border border-[#0047bb]' : 'text-muted-copy hover:bg-[#0047bb]/5 hover:text-[#0047bb]'}`}
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
              values={analytics.weeklyActivity.map((item) => item.minutes)}
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
                  className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">
                      {skill.module}
                    </h4>
                    <span
                      className={`text-[10px] font-mono uppercase ${skill.trend === 'up' ? 'text-success' : skill.trend === 'down' ? 'text-rose-400' : 'text-muted-copy'}`}
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
              {analytics.vocabularySummary.categoryMastery.map((item) => (
                <AnalyticsProgress
                  key={item.discipline}
                  label={item.discipline}
                  value={item.percentage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};
