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

        if (!flagConfig) return false;

        const baseEnabled = flags[key] ?? flagConfig.enabled;
        if (!baseEnabled) return false;

        const { subscription } = useBillingStore.getState();
        const { currentUser } = useAuthStore.getState();

        if (flagConfig.allowedPlans && subscription?.planId) {
          if (!flagConfig.allowedPlans.includes(subscription.planId)) {
            return false;
          }
        }

        if (flagConfig.allowedUsers && currentUser?.id) {
          if (!flagConfig.allowedUsers.includes(currentUser.id)) {
            return false;
          }
        }

        if (flagConfig.rolloutPercentage !== undefined) {
          const hash = currentUser?.id
            ? hashString(currentUser.id + key)
            : Math.random() * 100;
          if (hash % 100 >= flagConfig.rolloutPercentage) {
            return false;
          }
        }

        return true;
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
