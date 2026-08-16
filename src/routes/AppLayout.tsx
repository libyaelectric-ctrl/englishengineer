import { AppShell } from '@/layouts/AppShell';
import { QueryProvider } from '@/providers/QueryProvider';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { CloudSyncCoordinator } from '@/features/auth/CloudSyncCoordinator';
import { OnboardingGate } from '@/features/profile';

export default function AppLayout() {
  return (
    <QueryProvider>
      <AuthGuard>
        <OnboardingGate>
          <CloudSyncCoordinator />
          <AppShell />
        </OnboardingGate>
      </AuthGuard>
    </QueryProvider>
  );
}
