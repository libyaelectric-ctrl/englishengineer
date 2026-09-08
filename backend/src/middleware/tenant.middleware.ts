import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors.js';
import { logger } from '../logger.js';

export interface TenantContext {
  tenantId: string;
  planId?: string;
  maxMembers?: number;
  dataRegion?: string;
  memberRole?: 'owner' | 'manager' | 'member';
}

export type TenantAccessVerifier = (
  tenantId: string,
  userId: string
) => Promise<{ allowed: boolean; role?: TenantContext['memberRole']; reason?: string }>;

const TENANT_CONFIGS = new Map<string, TenantContext>();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let testVerifier: TenantAccessVerifier | null = null;

export const registerTenant = (config: TenantContext): void => {
  TENANT_CONFIGS.set(config.tenantId, config);
};

export const getTenantConfig = (tenantId: string): TenantContext | undefined =>
  TENANT_CONFIGS.get(tenantId);

export const setTenantAccessVerifierForTests = (verifier: TenantAccessVerifier | null): void => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tenant verifier overrides are only available in tests.');
  }
  testVerifier = verifier;
};

const verifyPersistentMembership: TenantAccessVerifier = async (tenantId, userId) => {
  if (!UUID_PATTERN.test(tenantId) || !UUID_PATTERN.test(userId)) {
    return { allowed: false, reason: 'Tenant and user identifiers must be UUIDs.' };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new ApiError(
      503,
      'tenant_authorization_unavailable',
      'Persistent tenant authorization is not configured.'
    );
  }

  const query = new URL(`${supabaseUrl}/rest/v1/organization_members`);
  query.searchParams.set('select', 'role');
  query.searchParams.set('organization_id', `eq.${tenantId}`);
  query.searchParams.set('user_id', `eq.${userId}`);
  query.searchParams.set('limit', '1');

  let response: globalThis.Response;
  try {
    response = await fetch(query, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    logger.error('Tenant membership lookup failed', { tenantId, userId }, error as Error);
    throw new ApiError(
      503,
      'tenant_authorization_unavailable',
      'Tenant membership could not be verified.'
    );
  }

  if (!response.ok) {
    logger.error('Tenant membership lookup rejected', {
      tenantId,
      userId,
      status: response.status,
    });
    throw new ApiError(
      503,
      'tenant_authorization_unavailable',
      'Tenant membership could not be verified.'
    );
  }

  const rows = (await response.json()) as Array<{ role?: string }>;
  const role = rows[0]?.role;
  if (role !== 'owner' && role !== 'manager' && role !== 'member') {
    return { allowed: false, reason: 'Authenticated user is not a tenant member.' };
  }
  return { allowed: true, role };
};

export const validateTenantAccess = async (
  tenantId: string,
  userId: string
): ReturnType<TenantAccessVerifier> => {
  if (process.env.NODE_ENV === 'test') {
    return testVerifier ? testVerifier(tenantId, userId) : { allowed: true, role: 'member' };
  }
  if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const registered = TENANT_CONFIGS.has(tenantId);
    return registered
      ? { allowed: true, role: 'member' }
      : { allowed: false, reason: 'Tenant is not registered in development.' };
  }
  return verifyPersistentMembership(tenantId, userId);
};

const parseTenantId = (value: unknown): string => {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value.trim())) {
    throw new ApiError(400, 'invalid_tenant_id', 'Tenant identifier must be a valid UUID.');
  }
  return value.trim().toLowerCase();
};

export const requireTenantContext = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawTenantId = req.headers['x-engineeros-org-id'] ?? req.headers['x-corporation-id'];
    if (!rawTenantId) {
      if (process.env.NODE_ENV === 'test') {
        req.tenantId = '00000000-0000-4000-8000-000000000001';
        next();
        return;
      }
      throw new ApiError(400, 'tenant_context_required', 'X-EngineerOS-Org-Id is required.');
    }

    const userId = req.auth?.userId;
    if (!userId) throw new ApiError(401, 'authentication_required', 'Authentication required.');
    const tenantId = parseTenantId(rawTenantId);
    const access = await validateTenantAccess(tenantId, userId);
    if (!access.allowed) {
      logger.warn('Tenant access denied', { tenantId, userId, reason: access.reason });
      throw new ApiError(403, 'tenant_access_denied', 'Access denied to this tenant.');
    }

    req.tenantId = tenantId;
    const registered = TENANT_CONFIGS.get(tenantId);
    (req as Request & { tenantConfig?: TenantContext }).tenantConfig = {
      ...(registered ?? { tenantId }),
      memberRole: access.role,
    };
    logger.debug('Tenant context resolved', { tenantId, userId, role: access.role });
    next();
  } catch (error) {
    next(error);
  }
};

export const enforceTenantIsolation = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.tenantId) {
    next(new ApiError(400, 'tenant_required', 'Tenant context required for this operation.'));
    return;
  }
  if (req.body && typeof req.body === 'object') req.body._tenantId = req.tenantId;
  next();
};
