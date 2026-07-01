import { ProductAnalyticsEvent, ProductAnalyticsSummary } from './beta.types';

export const BETA_ONBOARDING_OPTIONS = {
  engineeringDisciplines: [
    'Electrical Engineering',
    'MEP Engineering',
    'Commissioning',
    'QA/QC',
    'Project Engineering',
    'Construction Management',
    'Hospital Engineering',
    'Data Center Engineering',
  ],
  experienceLevels: ['0-2 years', '3-5 years', '6-10 years', '10+ years'],
  englishLevels: [
    'A1',
    'A2',
    'B1-',
    'B1',
    'B1+',
    'B2-',
    'B2',
    'B2+',
    'C1-',
    'C1',
    'C1+',
    'C2',
  ],
  industries: [
    'Hospital Projects',
    'Data Centers',
    'Commercial Buildings',
    'Infrastructure',
    'Oil & Gas',
    'Industrial Projects',
  ],
  dailyGoals: ['10 minutes', '15 minutes', '20 minutes', '30 minutes'],
  careerGoals: [
    'Lead meetings confidently',
    'Write better technical reports',
    'Handle consultant comments',
    'Prepare for commissioning discussions',
    'Improve site communication',
  ],
};

const unique = (items: string[]): string[] => Array.from(new Set(items));

export const calculateProductAnalyticsSummary = (
  events: ProductAnalyticsEvent[]
): ProductAnalyticsSummary => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const recentDayEvents = events.filter(
    (event) => now - new Date(event.timestamp).getTime() <= dayMs
  );
  const recentWeekEvents = events.filter(
    (event) => now - new Date(event.timestamp).getTime() <= weekMs
  );
  const screenCounts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.screen] = (acc[event.screen] || 0) + 1;
    return acc;
  }, {});
  const sortedScreens = Object.entries(screenCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const sessionDurations = events
    .map((event) => event.durationSeconds || 0)
    .filter((duration) => duration > 0);
  const averageSessionDurationSeconds =
    sessionDurations.length > 0
      ? Math.round(
          sessionDurations.reduce((sum, duration) => sum + duration, 0) /
            sessionDurations.length
        )
      : 0;
  const completionEvents = events.filter((event) =>
    event.name.includes('completed')
  );
  const completionRate =
    events.length > 0
      ? Math.round((completionEvents.length / events.length) * 100)
      : 0;
  const countEvent = (name: string) =>
    events.filter((event) => event.name === name).length;
  const activeDates = unique(
    recentWeekEvents.map((event) => event.timestamp.slice(0, 10))
  );

  return {
    dailyActiveUsers: recentDayEvents.length > 0 ? 1 : 0,
    weeklyActiveUsers: recentWeekEvents.length > 0 ? 1 : 0,
    missionCompletionRate: completionRate,
    writingCompletionRate: completionRate,
    listeningCompletionRate: completionRate,
    speakingCompletionRate: completionRate,
    vocabularyCompletionRate: completionRate,
    averageSessionDurationSeconds,
    averageMissionsPerSession: completionEvents.length,
    dropOffScreens: sortedScreens.slice(-3).map(([screen]) => screen),
    mostUsedFeatures: sortedScreens.slice(0, 3).map(([screen]) => screen),
    leastUsedFeatures: sortedScreens.slice(-3).map(([screen]) => screen),
    retentionIndicators: unique([
      recentDayEvents.length > 0
        ? 'Day-1 activity present'
        : 'No Day-1 signal yet',
      recentWeekEvents.length > 0
        ? 'Week activity present'
        : 'No Week signal yet',
    ]),
    returningUsers: activeDates.length > 1 ? 1 : 0,
    templatesUsed: countEvent('template_used'),
    quickAIActionsUsed: countEvent('quick_ai_action_used'),
    dailyTasksCompleted: countEvent('daily_task_completed'),
    sevenDayReportsGenerated: countEvent('seven_day_report_generated'),
    paymentIntent: countEvent('beta_payment_intent'),
  };
};
