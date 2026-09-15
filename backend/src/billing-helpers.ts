import type { Request } from 'express';

import type { PlanId } from '../types.js';
import { ApiError } from './errors.js';

export interface SubscriptionSnapshot {
  planId: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string;
  source: string;
  topupCredits: number;
  /** ISO timestamp when the grace period ends after a payment failure. null if not in grace. */
  gracePeriodEndsAt?: string | null;
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
  const authUserId = request.auth?.userId;
  if (typeof authUserId === 'string' && authUserId.trim()) {
    return authUserId.trim();
  }
  const bodyId = request.body?.userId;
  const queryId = typeof request.query?.userId === 'string' ? request.query.userId : undefined;
  const claimedUserId = (typeof bodyId === 'string' ? bodyId : undefined) ?? queryId;
  return typeof claimedUserId === 'string' && claimedUserId.trim() ? claimedUserId.trim() : null;
};

export const assertUserOwnership = (request: Request): string | null => {
  const userId = getRequestUserId(request);
  if (!userId) return null;
  const bodyId2 = request.body?.userId;
  const queryId2 = typeof request.query?.userId === 'string' ? request.query.userId : undefined;
  const claimedUserId = (typeof bodyId2 === 'string' ? bodyId2 : undefined) ?? queryId2;
  if (
    request.auth?.source !== 'dev-bypass' &&
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
