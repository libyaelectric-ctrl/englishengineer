const slowQueries = [];
const SLOW_THRESHOLD_MS = 500;

export const logQuery = (query, durationMs, meta = {}) => {
  if (durationMs >= SLOW_THRESHOLD_MS) {
    const record = {
      timestamp: new Date().toISOString(),
      query: typeof query === 'string' ? query.slice(0, 200) : 'unknown',
      durationMs,
      ...meta,
    };
    slowQueries.push(record);
    if (slowQueries.length > 1000) slowQueries.splice(0, slowQueries.length - 1000);
    console.warn(`[SLOW-QUERY] ${durationMs}ms`, record);
  }
};

export const getSlowQueries = (limit = 50) => {
  return slowQueries.slice(-limit);
};
