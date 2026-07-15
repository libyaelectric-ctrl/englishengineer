import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { DashboardSidebar } from './sidebar/DashboardSidebar';
import { CurriculumSidebar } from './sidebar/CurriculumSidebar';
import { VocabSidebar } from '@/features/vocabulary/components';
import { GrammarSidebar } from '@/features/grammar/components';
import { ReadingSidebar } from '@/features/reading/components';
import { WritingSidebar } from '@/features/writing/components';
import { ListeningSidebar } from '@/features/listening/components';
import { SpeakingSidebar } from '@/features/speaking/components';
import { ToolsSidebar } from '@/features/work-tools/components';
import { ProfileSidebar } from '@/features/profile/components';

function getContent(path: string): React.ReactNode {
  if (path === '/dashboard' || path === '/') return <DashboardSidebar />;
  if (path.startsWith('/vocabulary')) return <VocabSidebar />;
  if (path.startsWith('/grammar')) return <GrammarSidebar />;
  if (path.startsWith('/reading')) return <ReadingSidebar />;
  if (path.startsWith('/writing')) return <WritingSidebar />;
  if (path.startsWith('/listening')) return <ListeningSidebar />;
  if (path.startsWith('/speaking')) return <SpeakingSidebar />;
  if (path.startsWith('/curriculum')) return <CurriculumSidebar />;
  if (path.startsWith('/tools')) return <ToolsSidebar />;
  if (path.startsWith('/profile')) return <ProfileSidebar />;
  if (path.startsWith('/admin')) return <DashboardSidebar />;
  if (path.startsWith('/progress')) return <CurriculumSidebar />;
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
      {content}
    </aside>
  );
};
