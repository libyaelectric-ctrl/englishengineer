import { ApiError } from './errors.js';

export const requireText = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'invalid_request', `${field} is required.`);
  }
  return value.trim();
};

export const emptySubscription = () => ({
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

const getRequestUserId = (request) => {
  const authUserId = request.auth?.userId;
  if (typeof authUserId === 'string' && authUserId.trim()) {
    return authUserId.trim();
  }
  const claimedUserId = request.body?.userId ?? request.query?.userId;
  return typeof claimedUserId === 'string' && claimedUserId.trim()
    ? claimedUserId.trim()
    : null;
};

export const assertUserOwnership = (request) => {
  const userId = getRequestUserId(request);
  if (!userId) return null;
  const claimedUserId = request.body?.userId ?? request.query?.userId;
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
