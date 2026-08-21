import { PageContainer } from '@/shared/components/PageContainer';
import { PageHeader } from '@/shared/components/PageHeader';

import { ProgressOverviewTab } from './ProgressOverviewTab';

const ProgressPage = () => {
  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Progress"
        description="Track your engineering English skill development."
      />
      <div className="mt-6">
        <ProgressOverviewTab />
      </div>
    </PageContainer>
  );
};

export default ProgressPage;
