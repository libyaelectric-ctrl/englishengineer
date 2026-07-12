import { ApiError } from '../errors.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has one of the required roles.
 *
 * Usage:
 * app.get('/api/admin/data', requireBackendAuth, requireRole(['admin', 'team_lead']), handler)
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.auth?.role || 'user'; // Varsayilan rol: user

      // 'admin' rolu genelde tum route'lara erisebilir, ekstra esneklik.
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
