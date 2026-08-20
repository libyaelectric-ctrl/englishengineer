import { PageHeader } from '@/shared/components/PageHeader';

import { ProgressOverviewTab } from './ProgressOverviewTab';

const ProgressPage = () => {
  return (
    <div className="bg-background pb-16 text-foreground space-y-4 animate-in fade-in duration-300">
      <PageHeader
        title="Progress"
        description="Track your engineering English skill development."
      />
      <div className="mt-6">
        <ProgressOverviewTab />
      </div>
    </div>
  );
};

export default ProgressPage;
