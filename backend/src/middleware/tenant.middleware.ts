import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors.js';

export const requireTenantContext = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const tenantId = req.headers['x-engineeros-org-id'] || req.headers['x-corporation-id'];
    if (!tenantId) {
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
    req.tenantId = String(tenantId);
    next();
  } catch (error) {
    next(error);
  }
};
