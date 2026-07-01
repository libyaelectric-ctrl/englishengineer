import {
  BarChart3,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useBetaStore } from '@/features/beta';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';

const BetaProgramPage = () => {
  const { analyticsSummary, feedbackEntries, onboardingProfile, trackEvent } =
    useBetaStore();
  const metrics = [
    ['Daily active user signal', analyticsSummary.dailyActiveUsers],
    ['Returning user signal', analyticsSummary.returningUsers],
    ['Templates used', analyticsSummary.templatesUsed],
    ['Quick AI actions', analyticsSummary.quickAIActionsUsed],
    ['Daily tasks completed', analyticsSummary.dailyTasksCompleted],
    ['7-day reports generated', analyticsSummary.sevenDayReportsGenerated],
  ] as const;

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Closed Beta Program"
        description="Local, privacy-conscious validation signals for a controlled group of professional engineers."
        badgeText="20-50 engineers"
        badgeColor="cyan"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card hoverEffect={false}>
          <Users className="h-5 w-5 text-blue-700" />
          <p className="mt-4 text-2xl font-bold text-slate-950">Closed beta</p>
          <p className="mt-1 text-sm text-slate-600">
            Electrical, MEP, commissioning, QA/QC and project teams.
          </p>
        </Card>
        <Card hoverEffect={false}>
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {feedbackEntries.length}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Feedback entries on this device
          </p>
        </Card>
        <Card hoverEffect={false}>
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          <p className="mt-4 text-lg font-bold text-slate-950">
            Local analytics
          </p>
          <p className="mt-1 text-sm text-slate-600">
            No third-party analytics endpoint is configured.
          </p>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="space-y-5" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-700" />
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Beta usage evidence
              </h2>
              <p className="text-sm text-slate-600">
                Anonymous counters stored only in this browser.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[12px] border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-[12px] border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-800">
              Retention indicators
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {analyticsSummary.retentionIndicators.join(' · ')}
            </p>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            These values describe activity in the current browser profile. They
            are not server-wide DAU, WAU or retention proof until a consented
            production analytics backend is deployed.
          </p>
        </Card>
        <Card className="space-y-5" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Beta pricing research
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                $0-$5 / month
              </h2>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            {[
              'Full closed-beta learning access',
              'Work Tools and offline content',
              'Provider-labelled AI fallback',
              'No charge without Stripe confirmation',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            onClick={() => trackEvent('beta_payment_intent', '/beta-program')}
          >
            I would consider this price
          </Button>
          <p className="text-xs leading-5 text-slate-500">
            This records local interest only. It does not start checkout or
            create a subscription.
          </p>
        </Card>
      </div>
      <Card hoverEffect={false}>
        <h2 className="text-xl font-bold text-slate-950">Onboarding status</h2>
        <p className="mt-2 text-sm text-slate-600">
          {onboardingProfile
            ? `${onboardingProfile.engineeringDiscipline} · ${onboardingProfile.currentEnglishLevel} to ${onboardingProfile.targetEnglishLevel} · ${onboardingProfile.dailyStudyGoal}`
            : 'Complete the closed-beta onboarding to calibrate local recommendations.'}
        </p>
      </Card>
    </div>
  );
};

export default BetaProgramPage;
