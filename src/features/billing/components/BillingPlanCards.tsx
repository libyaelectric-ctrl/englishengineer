import { Mic } from 'lucide-react';

import { ProgressBar } from '@/shared/components/ProgressBar';

import { BILLING_PLANS } from '@/features/billing';
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

const UsageCard = ({ label, display, value, max, color, helpText }: UsageCardProps) => (
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
  uploadedDocsCount,
  maxDocs,
}: {
  isFree: boolean;
  uploadedDocsCount: number;
  maxDocs: number;
}) => {
  const isUnlimited = maxDocs >= 999;
  const numericMax = isUnlimited ? 0 : maxDocs;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-foreground">Monthly Document Uploads</span>
        <span className="font-bold text-foreground">
          {isFree
            ? 'Blocked'
            : isUnlimited
              ? `${uploadedDocsCount} / Unlimited`
              : `${uploadedDocsCount} / ${numericMax} uploads`}
        </span>
      </div>
      <ProgressBar
        value={isFree ? 0 : isUnlimited ? Math.min(100, (uploadedDocsCount / 10) * 100) : Math.min(100, (uploadedDocsCount / numericMax) * 100)}
        color={isFree ? 'rose' : !isUnlimited && uploadedDocsCount >= numericMax ? 'amber' : 'primary'}
      />
      <p className="text-[10px] text-muted-copy">
        {isFree
          ? 'Upgrade your plan to upload technical documents.'
          : isUnlimited
            ? '✓ Unlimited document uploads enabled.'
            : `✓ Upload documents inside the AI Copilot tab.`}
      </p>
    </div>
  );
};

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
        <Mic className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Monthly Voice Minutes
      </span>
      <span className="font-bold text-foreground">
        {planId === 'master' ? `${voiceMinutesUsed} / 300 min` : 'Unlimited'}
      </span>
    </div>
    <ProgressBar
      value={planId === 'master' ? Math.min(100, (voiceMinutesUsed / 300) * 100) : 100}
      color={
        planId !== 'master'
          ? 'cyan'
          : voiceMinutesUsed >= 270
            ? 'rose'
            : voiceMinutesUsed >= 210
              ? 'amber'
              : 'cyan'
      }
    />
    <p className="text-[10px] text-muted-copy">
      {planId === 'master'
        ? voiceMinutesUsed >= 300
          ? '⚠️ Monthly voice minute quota reached. Upgrade to Private for unlimited minutes.'
          : `✓ ${300 - voiceMinutesUsed} voice minutes remaining this month. Usage resets on the 1st.`
        : '✓ Unlimited voice minutes included in your plan.'}
    </p>
  </div>
);

const formatLimit = (value: number | 'unlimited'): string =>
  value === 'unlimited' ? 'Unlimited' : String(value);

export const BillingPlanCards = ({
  subscription,
  todaysCoachSessions,
  todaysAttempts,
  todaysReviews,
  uploadedDocsCount,
  voiceMinutesUsed,
}: BillingPlanCardsProps) => {
  const plan = BILLING_PLANS[subscription.planId];
  const { limits } = plan;
  const isUnlimitedAI = limits.dailyAICoachRequests === 'unlimited';
  const isUnlimitedAttempts = limits.moduleAttemptsPerDay === 'unlimited';
  const isUnlimitedReviews = limits.vocabularyReviewsPerDay === 'unlimited';
  const aiMax = limits.dailyAICoachRequests === 'unlimited' ? 999 : limits.dailyAICoachRequests;
  const attemptsMax = limits.moduleAttemptsPerDay === 'unlimited' ? 999 : limits.moduleAttemptsPerDay;
  const reviewsMax = limits.vocabularyReviewsPerDay === 'unlimited' ? 999 : limits.vocabularyReviewsPerDay;
  const isMaxTier = subscription.planId === 'master' || subscription.planId === 'team';

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {isUnlimitedAI ? (
        <UnlimitedCard
          label="Daily AI Coach Requests"
          color="cyan"
          helpText="✓ You have unlimited access to the AI Coach."
        />
      ) : (
        <UsageCard
          label="Daily AI Coach Requests"
          display={`${todaysCoachSessions} / ${formatLimit(limits.dailyAICoachRequests)} daily requests`}
          value={todaysCoachSessions}
          max={aiMax}
          color={todaysCoachSessions >= aiMax ? 'rose' : 'cyan'}
          helpText="Upgrade your plan to unlock more daily AI coaching feedback."
        />
      )}

      {isUnlimitedAttempts ? (
        <UnlimitedCard
          label="Daily Module Attempts"
          color="emerald"
          helpText="✓ You have unlimited module attempts."
        />
      ) : (
        <UsageCard
          label="Daily Module Attempts"
          display={`${todaysAttempts} / ${formatLimit(limits.moduleAttemptsPerDay)} daily attempts`}
          value={todaysAttempts}
          max={attemptsMax}
          color={todaysAttempts >= attemptsMax ? 'rose' : 'emerald'}
          helpText="Upgrade your plan to unlock more daily technical attempts."
        />
      )}

      {isUnlimitedReviews ? (
        <UnlimitedCard
          label="Daily Vocabulary Reviews"
          color="cyan"
          helpText="✓ You have unlimited vocabulary reviews."
        />
      ) : (
        <UsageCard
          label="Daily Vocabulary Reviews"
          display={`${todaysReviews} / ${formatLimit(limits.vocabularyReviewsPerDay)} reviews`}
          value={todaysReviews}
          max={reviewsMax}
          color={todaysReviews >= reviewsMax ? 'rose' : 'cyan'}
          helpText="Upgrade your plan to review more terms per day."
        />
      )}

      <DocumentUploadCard isFree={limits.documentUploadsPerMonth === 0} uploadedDocsCount={uploadedDocsCount} maxDocs={typeof limits.documentUploadsPerMonth === 'number' ? limits.documentUploadsPerMonth : 999} />

      {isMaxTier && (
        <VoiceMinutesCard planId={subscription.planId} voiceMinutesUsed={voiceMinutesUsed} />
      )}
    </div>
  );
};
