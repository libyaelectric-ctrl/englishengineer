interface EndpointMetricData {
  count: number;
  totalTime: number;
  errors: number;
}

interface EndpointMetricResult {
  endpoint: string;
  count: number;
  avgTime: number;
  errorRate: string;
}

const endpointMetrics = new Map<string, EndpointMetricData>();

export const recordEndpoint = (
  method: string,
  path: string,
  duration: number,
  isError: boolean
): void => {
  const endpoint = `${method} ${path}`;

  if (!endpointMetrics.has(endpoint)) {
    endpointMetrics.set(endpoint, { count: 0, totalTime: 0, errors: 0 });
  }

  const data = endpointMetrics.get(endpoint)!;
  data.count++;
  data.totalTime += duration;
  if (isError) data.errors++;
};

export const getEndpointMetrics = (): EndpointMetricResult[] => {
  const results: EndpointMetricResult[] = [];

  for (const [endpoint, data] of endpointMetrics.entries()) {
    const avgTime = data.count > 0 ? data.totalTime / data.count : 0;
    const errorRate = data.count > 0 ? (data.errors / data.count) * 100 : 0;

    results.push({
      endpoint,
      count: data.count,
      avgTime: Math.round(avgTime),
      errorRate: errorRate.toFixed(2) + '%',
    });
  }

  return results.sort((a, b) => b.count - a.count);
};
