import { useBilling } from './useBilling';

export const useSubscription = () => {
  const { subscription, isLoading, error, upgrade, manageSubscription } =
    useBilling();

  const isActive = subscription?.status === 'active';
  const isFree = !subscription || subscription.planId === 'free';
  const isPro = subscription?.planId === 'pro';

  return {
    subscription,
    isActive,
    isFree,
    isPro,
    isLoading,
    error,
    upgrade,
    manageSubscription,
  };
};
