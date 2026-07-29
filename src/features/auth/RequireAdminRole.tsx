import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth.store';

interface RequireAdminRoleProps {
  children: ReactNode;
}

export const RequireAdminRole = ({
  children,
}: RequireAdminRoleProps) => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'Super Administrator' ||
    currentUser?.isSuperUser === true;

  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
