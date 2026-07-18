import { ApiError } from '../errors.js';
import type { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRole = (req.auth as Record<string, unknown>)?.role || 'user';

      if (userRole === 'admin' || allowedRoles.includes(userRole)) {
        return next();
      }

      throw new ApiError(
        403,
        'forbidden_role',
        `Access denied. Requires one of: ${allowedRoles.join(', ')}`
      );
    } catch (error) {
      next(error);
    }
  };
};
