import { type ComponentType, Suspense, lazy } from 'react';

import { LoadingState } from '@/shared/components/LoadingState';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { RequireAdminRole } from '@/features/auth/RequireAdminRole';

const Admin = lazy(() => import('@/pages/AdminPage'));

export default function AdminLayout() {
  const Component: ComponentType = Admin;
  return (
    <AuthGuard>
      <RequireAdminRole>
        <Suspense fallback={<LoadingState />}>
          <Component />
        </Suspense>
      </RequireAdminRole>
    </AuthGuard>
  );
}
