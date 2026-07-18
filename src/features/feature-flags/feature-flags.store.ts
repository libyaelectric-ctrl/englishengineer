import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FEATURE_FLAGS, getDefaultFlags } from '@/config/feature-flags.config';
import { useBillingStore } from '@/features/billing';
import { useAuthStore } from '@/features/auth';

interface FeatureFlagsState {
  flags: Record<string, boolean>;
  setFlag: (key: string, enabled: boolean) => void;
  isFeatureEnabled: (key: string) => boolean;
}

const isFlagEligible = (
  flagConfig: (typeof FEATURE_FLAGS)[string] | undefined,
  subscription: { planId?: string } | null,
  currentUser: { id?: string } | null,
  userId: string | undefined,
  key: string
): boolean => {
  if (!flagConfig) return false;
  if (isPlanBlocked(flagConfig, subscription)) return false;
  if (isUserBlocked(flagConfig, currentUser)) return false;
  if (isRolloutBlocked(flagConfig, userId, key)) return false;
  return true;
};

const isPlanBlocked = (
  flagConfig: (typeof FEATURE_FLAGS)[string],
  subscription: { planId?: string } | null
): boolean =>
  Boolean(
    flagConfig.allowedPlans &&
    subscription?.planId &&
    !flagConfig.allowedPlans.includes(subscription.planId)
  );

const isUserBlocked = (
  flagConfig: (typeof FEATURE_FLAGS)[string],
  currentUser: { id?: string } | null
): boolean =>
  Boolean(
    flagConfig.allowedUsers &&
    currentUser?.id &&
    !flagConfig.allowedUsers.includes(currentUser.id)
  );

const isRolloutBlocked = (
  flagConfig: (typeof FEATURE_FLAGS)[string],
  userId: string | undefined,
  key: string
): boolean => {
  if (flagConfig.rolloutPercentage === undefined) return false;
  const hash = userId ? hashString(userId + key) : Math.random() * 100;
  return hash % 100 >= flagConfig.rolloutPercentage;
};

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      flags: getDefaultFlags(),

      setFlag: (key, enabled) =>
        set((state) => ({
          flags: { ...state.flags, [key]: enabled },
        })),

      isFeatureEnabled: (key) => {
        const { flags } = get();
        const flagConfig = FEATURE_FLAGS[key];
        const baseEnabled = flags[key] ?? flagConfig?.enabled;
        if (!baseEnabled) return false;
        const { subscription } = useBillingStore.getState();
        const { currentUser } = useAuthStore.getState();
        return isFlagEligible(
          flagConfig,
          subscription,
          currentUser,
          currentUser?.id,
          key
        );
      },
    }),
    {
      name: 'feature-flags',
      partialize: (state) => ({ flags: state.flags }),
    }
  )
);

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export const useFeatureFlag = (key: string): boolean => {
  return useFeatureFlagsStore((state) => state.isFeatureEnabled(key));
};
