import { ApiError } from './errors.js';
import type { Request } from 'express';

export interface SubscriptionSnapshot {
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string;
  source: string;
  topupCredits: number;
}

export const requireText = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'invalid_request', `${field} is required.`);
  }
  return value.trim();
};

export const emptySubscription = (): SubscriptionSnapshot => ({
  planId: 'free',
  status: 'none',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  updatedAt: new Date().toISOString(),
  source: 'backend',
  topupCredits: 0,
});

const getRequestUserId = (request: Request): string | null => {
  const authUserId = (request as any).auth?.userId;
  if (typeof authUserId === 'string' && authUserId.trim()) {
    return authUserId.trim();
  }
  const claimedUserId = request.body?.userId ?? request.query?.userId;
  return typeof claimedUserId === 'string' && claimedUserId.trim()
    ? claimedUserId.trim()
    : null;
};

export const assertUserOwnership = (request: Request): string | null => {
  const userId = getRequestUserId(request);
  if (!userId) return null;
  const claimedUserId = request.body?.userId ?? request.query?.userId;
  if (
    (request as any).auth?.source !== 'dev-bypass' &&
    typeof claimedUserId === 'string' &&
    claimedUserId.trim() !== userId
  ) {
    throw new ApiError(
      403,
      'billing_user_mismatch',
      'Billing requests cannot target another user.'
    );
  }
  return userId;
};
