import { useCallback, useEffect, useState } from 'react';

import type { ContentPool, Discipline } from '@/shared/services/content-aggregator.service';
import { ContentAggregatorService } from '@/shared/services/content-aggregator.service';

interface UseContentPoolOptions {
  discipline: Discipline;
  enabled?: boolean;
}

interface UseContentPoolResult {
  data: ContentPool | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useContentPool = ({
  discipline,
  enabled = true,
}: UseContentPoolOptions): UseContentPoolResult => {
  const [data, setData] = useState<ContentPool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPool = useCallback(async () => {
    if (!enabled || !discipline) return;

    setIsLoading(true);
    setError(null);

    try {
      const pool = await ContentAggregatorService.buildContentPool(discipline);
      setData(pool);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content pool'));
    } finally {
      setIsLoading(false);
    }
  }, [discipline, enabled]);

  useEffect(() => {
    void fetchPool();
  }, [fetchPool]);

  return { data, isLoading, error, refetch: fetchPool };
};

export default useContentPool;
