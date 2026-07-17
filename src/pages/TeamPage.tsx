import { lazy, Suspense } from 'react';

const TeamDashboard = lazy(() =>
  import('@/features/team').then((m) => ({ default: m.TeamDashboard }))
);

const TeamPage = () => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-soft border-t-primary" />
      </div>
    }
  >
    <TeamDashboard />
  </Suspense>
);

export default TeamPage;
