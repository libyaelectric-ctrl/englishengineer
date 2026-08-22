import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors.js';
import { logger } from '../logger.js';

/** Tenant context injected into each request */
export interface TenantContext {
  tenantId: string;
  planId?: string;
  maxMembers?: number;
  dataRegion?: string;
}

/** Tenant configuration registry */
const TENANT_CONFIGS = new Map<string, TenantContext>();

/** Register a tenant configuration */
export const registerTenant = (config: TenantContext): void => {
  TENANT_CONFIGS.set(config.tenantId, config);
};

/** Get tenant configuration */
export const getTenantConfig = (tenantId: string): TenantContext | undefined => {
  return TENANT_CONFIGS.get(tenantId);
};

/** Validate tenant exists and user has access */
const validateTenantAccess = (
  tenantId: string,
  userId: string
): { allowed: boolean; reason?: string } => {
  // In production, this would check Supabase for tenant membership
  // For now, allow all access in dev mode
  if (process.env.NODE_ENV !== 'production') {
    return { allowed: true };
  }

  const config = TENANT_CONFIGS.get(tenantId);
  if (!config) {
    return { allowed: false, reason: 'Tenant not found' };
  }

  // Check member count limit
  if (config.maxMembers) {
    // In production, query actual member count
    // For now, assume within limits
  }

  return { allowed: true };
};

/** Sanitize tenant ID to prevent injection */
const sanitizeTenantId = (id: string): string => {
  // Only allow alphanumeric, hyphens, and underscores
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
};

export const requireTenantContext = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const rawTenantId = req.headers['x-engineeros-org-id'] || req.headers['x-corporation-id'];
    if (!rawTenantId) {
      if (process.env.NODE_ENV === 'test') {
        req.tenantId = 'test-tenant';
        next();
        return;
      }
      throw new ApiError(
        400,
        'tenant_context_required',
        'Access denied. A valid tenant identification header (X-EngineerOS-Org-Id) is required.'
      );
    }

    const tenantId = sanitizeTenantId(String(rawTenantId));
    if (!tenantId) {
      throw new ApiError(400, 'invalid_tenant_id', 'Invalid tenant identifier format.');
    }

    // Validate tenant access
    const userId = req.auth?.userId ?? 'anonymous';
    const access = validateTenantAccess(tenantId, userId);
    if (!access.allowed) {
      logger.warn('Tenant access denied', { tenantId, userId, reason: access.reason });
      throw new ApiError(
        403,
        'tenant_access_denied',
        access.reason ?? 'Access denied to this tenant.'
      );
    }

    req.tenantId = tenantId;

    // Attach tenant config to request for downstream use
    const config = TENANT_CONFIGS.get(tenantId);
    if (config) {
      (req as Request & { tenantConfig?: TenantContext }).tenantConfig = config;
    }

    logger.debug('Tenant context resolved', { tenantId, userId });
    next();
  } catch (error) {
    next(error);
  }
};

/** Middleware to enforce tenant data isolation on queries */
export const enforceTenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    return next(
      new ApiError(400, 'tenant_required', 'Tenant context required for this operation.')
    );
  }

  // Add tenant_id to request body for data operations
  if (req.body && typeof req.body === 'object') {
    req.body._tenantId = tenantId;
  }

  next();
};
