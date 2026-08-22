import { BarChart3, Footprints } from 'lucide-react';

import { Link, useParams } from 'react-router-dom';

import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';

import { ProgressNextStepsTab } from './ProgressNextStepsTab';
import { ProgressOverviewTab } from './ProgressOverviewTab';

const ProgressPage = () => {
  const { section } = useParams<{ section: string }>();
  const activeSection = section === 'next-steps' ? 'next-steps' : 'overview';

  return (
    <PageContainer className="space-y-6 pt-12 sm:pt-0">
      <PageHeader
        title="Progress & Roadmap"
        description="Track your engineering English skill development and next milestones."
      />

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <Link
          to="/progress/overview"
          className={`inline-flex items-center gap-2 rounded-[4px] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeSection === 'overview'
              ? 'bg-primary/10 text-primary border border-primary/25'
              : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Overview
        </Link>
        <Link
          to="/progress/next-steps"
          className={`inline-flex items-center gap-2 rounded-[4px] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeSection === 'next-steps'
              ? 'bg-primary/10 text-primary border border-primary/25'
              : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          <Footprints className="h-3.5 w-3.5" />
          Next Steps & Action Plan
        </Link>
      </div>

      <div className="mt-4">
        {activeSection === 'next-steps' ? <ProgressNextStepsTab /> : <ProgressOverviewTab />}
      </div>
    </PageContainer>
  );
};

export default ProgressPage;
