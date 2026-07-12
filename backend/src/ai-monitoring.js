/**
 * AI Monitoring & Analytics Service
 * Tracks AI usage, performance, and costs
 */

const metrics = {
  requests: [],
  usage: {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    byModel: {},
    byHour: {},
  },
};

export const trackAIRequest = ({
  userId,
  model,
  inputTokens,
  outputTokens,
  latencyMs,
  success,
  error,
}) => {
  const timestamp = new Date().toISOString();
  const cost = calculateCost(model, inputTokens, outputTokens);

  metrics.requests.push({
    timestamp,
    userId,
    model,
    inputTokens,
    outputTokens,
    latencyMs,
    success,
    error,
    cost,
  });

  // Keep only last 1000 requests in memory
  if (metrics.requests.length > 1000) {
    metrics.requests = metrics.requests.slice(-1000);
  }

  // Update aggregates
  metrics.usage.totalRequests++;
  metrics.usage.totalTokens += inputTokens + outputTokens;
  metrics.usage.totalCost += cost;

  // By model
  if (!metrics.usage.byModel[model]) {
    metrics.usage.byModel[model] = { requests: 0, tokens: 0, cost: 0 };
  }
  metrics.usage.byModel[model].requests++;
  metrics.usage.byModel[model].tokens += inputTokens + outputTokens;
  metrics.usage.byModel[model].cost += cost;

  // By hour
  const hour = timestamp.slice(0, 13);
  if (!metrics.usage.byHour[hour]) {
    metrics.usage.byHour[hour] = { requests: 0, tokens: 0, cost: 0 };
  }
  metrics.usage.byHour[hour].requests++;
  metrics.usage.byHour[hour].tokens += inputTokens + outputTokens;
  metrics.usage.byHour[hour].cost += cost;

  return { timestamp, cost };
};

export const getAIMetrics = (timeRange = '24h') => {
  const now = new Date();
  const cutoff = new Date(now);

  switch (timeRange) {
    case '1h':
      cutoff.setHours(cutoff.getHours() - 1);
      break;
    case '24h':
      cutoff.setDate(cutoff.getDate() - 1);
      break;
    case '7d':
      cutoff.setDate(cutoff.getDate() - 7);
      break;
    case '30d':
      cutoff.setDate(cutoff.getDate() - 30);
      break;
  }

  const filteredRequests = metrics.requests.filter(
    (r) => new Date(r.timestamp) >= cutoff
  );

  const filteredUsage = {
    totalRequests: filteredRequests.length,
    totalTokens: filteredRequests.reduce(
      (sum, r) => sum + r.inputTokens + r.outputTokens,
      0
    ),
    totalCost: filteredRequests.reduce((sum, r) => sum + r.cost, 0),
    successRate:
      filteredRequests.length > 0
        ? (filteredRequests.filter((r) => r.success).length /
            filteredRequests.length) *
          100
        : 100,
    avgLatency:
      filteredRequests.length > 0
        ? filteredRequests.reduce((sum, r) => sum + r.latencyMs, 0) /
          filteredRequests.length
        : 0,
  };

  return {
    timeRange,
    summary: filteredUsage,
    recentErrors: filteredRequests.filter((r) => !r.success).slice(-10),
  };
};

export const getUserAIUsage = (userId) => {
  const userRequests = metrics.requests.filter((r) => r.userId === userId);
  return {
    userId,
    totalRequests: userRequests.length,
    totalTokens: userRequests.reduce(
      (sum, r) => sum + r.inputTokens + r.outputTokens,
      0
    ),
    totalCost: userRequests.reduce((sum, r) => sum + r.cost, 0),
    lastRequest:
      userRequests.length > 0
        ? userRequests[userRequests.length - 1].timestamp
        : null,
  };
};

const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = {
    'claude-haiku-4-5': { input: 0.00025, output: 0.00125 },
    'claude-sonnet-4': { input: 0.003, output: 0.015 },
    'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
  };

  const rates = pricing[model] || pricing['claude-haiku-4-5'];
  return (inputTokens * rates.input + outputTokens * rates.output) / 1000;
};
