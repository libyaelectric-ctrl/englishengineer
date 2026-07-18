import { ProgressBar } from '@/shared/components/ProgressBar';
import type { SubscriptionSnapshot } from '@/features/billing';

interface BillingPlanCardsProps {
  subscription: SubscriptionSnapshot;
  todaysCoachSessions: number;
  todaysAttempts: number;
  todaysReviews: number;
  uploadedDocsCount: number;
  voiceMinutesUsed: number;
}

interface UsageCardProps {
  label: string;
  display: string;
  value: number;
  max: number;
  color: 'primary' | 'cyan' | 'emerald' | 'rose' | 'amber';
  helpText: string;
}

const UsageCard = ({
  label,
  display,
  value,
  max,
  color,
  helpText,
}: UsageCardProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="font-bold text-foreground">{label}</span>
      <span className="font-bold text-foreground">{display}</span>
    </div>
    <ProgressBar value={Math.min(100, (value / max) * 100)} color={color} />
    <p className="text-[10px] text-muted-copy">{helpText}</p>
  </div>
);

const UnlimitedCard = ({
  label,
  color,
  helpText,
}: {
  label: string;
  color: 'cyan' | 'emerald';
  helpText: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="font-bold text-foreground">{label}</span>
      <span className="font-bold text-foreground">Unlimited</span>
    </div>
    <ProgressBar value={100} color={color} />
    <p className="text-[10px] text-muted-copy">{helpText}</p>
  </div>
);

const DocumentUploadCard = ({
  isFree,
  isPro,
  uploadedDocsCount,
}: {
  isFree: boolean;
  isPro: boolean;
  uploadedDocsCount: number;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="font-bold text-foreground">
        Monthly Document Uploads
      </span>
      <span className="font-bold text-foreground">
        {isFree
          ? 'Blocked'
          : isPro
            ? `${uploadedDocsCount} / 2 uploads`
            : `${uploadedDocsCount} / Unlimited`}
      </span>
    </div>
    <ProgressBar
      value={
        isFree ? 0 : isPro ? Math.min(100, (uploadedDocsCount / 2) * 100) : 100
      }
      color={isFree ? 'rose' : uploadedDocsCount >= 2 ? 'amber' : 'primary'}
    />
    <p className="text-[10px] text-muted-copy">
      {isFree
        ? 'Upgrade to Pro to upload up to 2 technical documents/month.'
        : isPro
          ? '✓ Upload documents inside the AI Copilot tab.'
          : '✓ Unlimited document uploads enabled.'}
    </p>
  </div>
);

const VoiceMinutesCard = ({
  planId,
  voiceMinutesUsed,
}: {
  planId: string;
  voiceMinutesUsed: number;
}) => (
  <div className="col-span-full space-y-1.5 mt-1">
    <div className="flex justify-between text-xs">
      <span className="font-bold text-foreground flex items-center gap-1.5">
        🎙️ Monthly Voice Minutes
      </span>
      <span className="font-bold text-foreground">
        {planId === 'max' ? `${voiceMinutesUsed} / 120 min` : 'Unlimited'}
      </span>
    </div>
    <ProgressBar
      value={
        planId === 'max' ? Math.min(100, (voiceMinutesUsed / 120) * 100) : 100
      }
      color={
        planId !== 'max'
          ? 'cyan'
          : voiceMinutesUsed >= 108
            ? 'rose'
            : voiceMinutesUsed >= 84
              ? 'amber'
              : 'cyan'
      }
    />
    <p className="text-[10px] text-muted-copy">
      {planId === 'max'
        ? voiceMinutesUsed >= 120
          ? '⚠️ Monthly voice minute quota reached. Upgrade to Exec for unlimited minutes.'
          : `✓ ${120 - voiceMinutesUsed} voice minutes remaining this month. Usage resets on the 1st.`
        : '✓ Unlimited voice minutes included in your plan.'}
    </p>
  </div>
);

export const BillingPlanCards = ({
  subscription,
  todaysCoachSessions,
  todaysAttempts,
  todaysReviews,
  uploadedDocsCount,
  voiceMinutesUsed,
}: BillingPlanCardsProps) => {
  const isPro = subscription.planId === 'pro';
  const isFree = subscription.planId === 'free';
  const isMaxTier =
    subscription.planId === 'max' ||
    subscription.planId === 'exec' ||
    subscription.planId === 'private';

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {isPro ? (
        <UnlimitedCard
          label="Daily AI Coach Requests"
          color="cyan"
          helpText="✓ You have unlimited access to the AI Coach."
        />
      ) : (
        <UsageCard
          label="Daily AI Coach Requests"
          display={`${todaysCoachSessions} / 3 daily requests`}
          value={todaysCoachSessions}
          max={3}
          color={todaysCoachSessions >= 3 ? 'rose' : 'cyan'}
          helpText="Upgrade to Pro to unlock unlimited daily AI coaching feedback."
        />
      )}

      {isPro ? (
        <UnlimitedCard
          label="Daily Module Attempts"
          color="emerald"
          helpText="✓ You have unlimited module attempts."
        />
      ) : (
        <UsageCard
          label="Daily Module Attempts"
          display={`${todaysAttempts} / 5 daily attempts`}
          value={todaysAttempts}
          max={5}
          color={todaysAttempts >= 5 ? 'rose' : 'emerald'}
          helpText="Upgrade to Pro to unlock unlimited daily technical attempts."
        />
      )}

      {isPro ? (
        <UnlimitedCard
          label="Daily Vocabulary Reviews"
          color="cyan"
          helpText="✓ You have unlimited vocabulary reviews."
        />
      ) : (
        <UsageCard
          label="Daily Vocabulary Reviews"
          display={`${todaysReviews} / 25 reviews`}
          value={todaysReviews}
          max={25}
          color={todaysReviews >= 25 ? 'rose' : 'cyan'}
          helpText="Upgrade to Pro to review more than 25 terms per day."
        />
      )}

      <DocumentUploadCard
        isFree={isFree}
        isPro={isPro}
        uploadedDocsCount={uploadedDocsCount}
      />

      {isMaxTier && (
        <VoiceMinutesCard
          planId={subscription.planId}
          voiceMinutesUsed={voiceMinutesUsed}
        />
      )}
    </div>
  );
};
