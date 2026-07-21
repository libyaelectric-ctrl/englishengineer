import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

const DashboardSidebar = React.lazy(() =>
  import('./sidebar/DashboardSidebar').then((m) => ({
    default: m.DashboardSidebar,
  }))
);
const CurriculumSidebar = React.lazy(() =>
  import('./sidebar/CurriculumSidebar').then((m) => ({
    default: m.CurriculumSidebar,
  }))
);
const ReadingSidebar = React.lazy(() =>
  import('@/features/reading/components/ReadingSidebar').then((m) => ({
    default: m.ReadingSidebar,
  }))
);
const WritingSidebar = React.lazy(() =>
  import('@/features/writing/components/WritingSidebar').then((m) => ({
    default: m.WritingSidebar,
  }))
);
const ListeningSidebar = React.lazy(() =>
  import('@/features/listening/components/ListeningSidebar').then((m) => ({
    default: m.ListeningSidebar,
  }))
);
const SpeakingSidebar = React.lazy(() =>
  import('@/features/speaking/components/SpeakingSidebar').then((m) => ({
    default: m.SpeakingSidebar,
  }))
);
const ToolsSidebar = React.lazy(() =>
  import('@/features/work-tools/components/ToolsSidebar').then((m) => ({
    default: m.ToolsSidebar,
  }))
);
const ProfileSidebar = React.lazy(() =>
  import('@/features/profile/components/ProfileSidebar').then((m) => ({
    default: m.ProfileSidebar,
  }))
);

const EXACT_ROUTES: Record<string, React.FC> = {
  '/dashboard': DashboardSidebar,
  '/': DashboardSidebar,
};

const PREFIX_ROUTES: [string, React.FC][] = [
  ['/reading', ReadingSidebar],
  ['/writing', WritingSidebar],
  ['/listening', ListeningSidebar],
  ['/speaking', SpeakingSidebar],
  ['/curriculum', CurriculumSidebar],
  ['/tools', ToolsSidebar],
  ['/profile', ProfileSidebar],
  ['/admin', DashboardSidebar],
  ['/progress', CurriculumSidebar],
];

function getContent(path: string): React.ReactNode {
  if (EXACT_ROUTES[path]) {
    return React.createElement(EXACT_ROUTES[path]);
  }
  const match = PREFIX_ROUTES.find(([prefix]) => path.startsWith(prefix));
  if (match) {
    return React.createElement(match[1]);
  }
  return <DashboardSidebar />;
}

export const RightSidebar: React.FC = () => {
  const location = useLocation();
  const content = getContent(location.pathname);
  return (
    <aside
      className={cn(
        'hidden h-screen w-64 shrink-0 flex-col border-l border-border-hover bg-surface overflow-y-auto custom-scrollbar',
        content ? 'lg:flex' : 'lg:hidden'
      )}
    >
      <Suspense fallback={null}>{content}</Suspense>
    </aside>
  );
};
