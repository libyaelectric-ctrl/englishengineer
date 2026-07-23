import {
  BillingPortalRequest,
  BillingRedirectResponse,
  BillingSessionRequest,
  SubscriptionSnapshot,
} from './billing.types';
import { getBackendAuthHeaders } from '@/features/auth/backend-auth';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';

interface BillingBackendErrorResponse {
  error?: string | { code?: string; message?: string };
  message?: string;
}

const BILLING_TIMEOUT_MS = 15_000;

const mapRequestError = (error: unknown): Error => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new Error('Billing backend timed out after 15 seconds.');
  }

  if (error instanceof TypeError) {
    return new Error(
      'Billing service is currently unreachable. Please check your connection or try again later.'
    );
  }

  return error instanceof Error
    ? error
    : new Error('Billing backend request failed.');
};

const fetchWithTimeout = async (
  endpoint: string,
  init?: RequestInit
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    BILLING_TIMEOUT_MS
  );

  try {
    return await fetch(endpoint, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    throw mapRequestError(error);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as BillingBackendErrorResponse;
    if (typeof data.error === 'string') return data.error;
    if (data.error?.message) return data.error.message;
    return data.message || `Billing backend returned ${response.status}.`;
  } catch {
    return `Billing backend returned ${response.status}.`;
  }
};

const buildBillingEndpoint = (billingApiUrl: string, route: string) =>
  `${billingApiUrl.replace(/\/$/, '')}/api/billing/${route}`;

const postJson = async <TResponse, TBody extends object>(
  endpoint: string,
  body: TBody,
  userId?: string
): Promise<TResponse> => {
  const authHeaders = await getBackendAuthHeaders(userId);
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: await parseErrorMessage(response),
    });
  }

  return response.json() as Promise<TResponse>;
};

const getJson = async <TResponse>(
  endpoint: string,
  userId?: string
): Promise<TResponse> => {
  const response = await fetchWithTimeout(endpoint, {
    headers: await getBackendAuthHeaders(userId),
  });

  if (!response.ok) {
    throw new AppError({
      code: ErrorCode.NETWORK,
      message: await parseErrorMessage(response),
    });
  }

  return response.json() as Promise<TResponse>;
};

export class StripeBillingProvider {
  constructor(private readonly billingApiUrl: string) {}

  getSubscriptionStatus(userId: string): Promise<SubscriptionSnapshot> {
    return getJson<SubscriptionSnapshot>(
      buildBillingEndpoint(this.billingApiUrl, 'subscription-status'),
      userId
    );
  }

  async createCheckoutSession(
    request: BillingSessionRequest
  ): Promise<BillingRedirectResponse> {
    const authHeaders = await getBackendAuthHeaders(request.userId);
    if (!authHeaders.Authorization) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'Please sign in with your account before upgrading to Pro.',
      });
    }

    return postJson<BillingRedirectResponse, BillingSessionRequest>(
      buildBillingEndpoint(this.billingApiUrl, 'create-checkout-session'),
      request,
      request.userId
    );
  }

  async createCustomerPortalSession(
    request: BillingPortalRequest
  ): Promise<BillingRedirectResponse> {
    const authHeaders = await getBackendAuthHeaders(request.userId);
    if (!authHeaders.Authorization) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message:
          'Please sign in with your account before opening the customer portal.',
      });
    }

    return postJson<BillingRedirectResponse, BillingPortalRequest>(
      buildBillingEndpoint(
        this.billingApiUrl,
        'create-customer-portal-session'
      ),
      request,
      request.userId
    );
  }

  async createTopupCheckoutSession(
    request: Omit<BillingSessionRequest, 'planId'>
  ): Promise<BillingRedirectResponse> {
    const authHeaders = await getBackendAuthHeaders(request.userId);
    if (!authHeaders.Authorization) {
      throw new AppError({
        code: ErrorCode.AUTH,
        message: 'Please sign in with your account before purchasing credits.',
      });
    }

    return postJson<
      BillingRedirectResponse,
      Omit<BillingSessionRequest, 'planId'>
    >(
      buildBillingEndpoint(this.billingApiUrl, 'create-topup-session'),
      request,
      request.userId
    );
  }
}
