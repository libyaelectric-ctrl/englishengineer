import { useState, useEffect } from 'react';

import { ContentAggregatorService, type Discipline } from '@/shared/services/content-aggregator.service';
import { useLocalizationStore } from '@/features/localization';

interface ContentPreviewProps {
  discipline: Discipline;
}

export const ContentPreview = ({ discipline }: ContentPreviewProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCount = async () => {
      setIsLoading(true);
      try {
        const pool = await ContentAggregatorService.buildContentPool(discipline);
        if (active) {
          setCount(pool.totalCount);
        }
      } catch {
        if (active) {
          setCount(0);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadCount();

    return () => {
      active = false;
    };
  }, [discipline]);

  if (isLoading) {
    return (
      <div className="mt-4 p-4 rounded-lg border border-border-soft bg-surface-hover animate-pulse">
        <div className="h-4 w-32 bg-surface-hover rounded" />
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10">
      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
        {translate('onboarding.contentReady') ?? 'Your content pool is ready:'}
      </p>
      <p className="mt-1 text-lg font-extrabold text-blue-700 dark:text-blue-300">
        {count?.toLocaleString() ?? '0'}+ {translate('onboarding.items') ?? 'items'}
      </p>
      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
        {translate('onboarding.includesGeneral') ?? 'Includes General English + Common Engineering +'}{' '}
        <span className="font-bold uppercase">{discipline}</span>
      </p>
    </div>
  );
};

export default ContentPreview;