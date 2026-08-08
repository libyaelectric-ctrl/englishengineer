import { ProgressOverviewTab } from './ProgressOverviewTab';

const ProgressPage = () => {
  return (
    <div className="bg-background pb-16 text-foreground space-y-4 animate-in fade-in duration-300">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-border-soft bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-base font-bold tracking-tight text-foreground">Progress</h1>
      </div>
      <div className="mt-6">
        <ProgressOverviewTab />
      </div>
    </div>
  );
};

export default ProgressPage;
