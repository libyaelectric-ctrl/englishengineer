import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingService } from '../billing.service';
import type { BillingPlanId } from '../billing.types';

export const BILLING_KEYS = {
  all: ['billing'] as const,
  subscription: (userId: string | null) =>
    [...BILLING_KEYS.all, 'subscription', userId] as const,
  providerStatus: () => [...BILLING_KEYS.all, 'providerStatus'] as const,
};

export function useBillingSubscription(userId: string | null) {
  return useQuery({
    queryKey: BILLING_KEYS.subscription(userId),
    queryFn: () => BillingService.refreshSubscription(userId),
    enabled: userId !== undefined,
  });
}

export function useBillingProviderStatus() {
  return useQuery({
    queryKey: BILLING_KEYS.providerStatus(),
    queryFn: () => BillingService.getProviderStatus(),
  });
}

export function useStartCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      email,
      planId,
    }: {
      userId: string;
      email: string;
      planId: BillingPlanId;
    }) => BillingService.startCheckout(userId, email, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.all });
    },
  });
}

export function useOpenCustomerPortal() {
  return useMutation({
    mutationFn: (userId: string) => BillingService.openCustomerPortal(userId),
  });
}

export function useStartTopupCheckout() {
  return useMutation({
    mutationFn: ({ userId, email }: { userId: string; email: string }) =>
      BillingService.startTopupCheckout(userId, email),
  });
}
