interface UsageRecord {
  timestamp: string;
  model: string;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: string;
  outputCost: string;
  totalCost: string;
}

const usage: UsageRecord[] = [];

const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5': { input: 0.00025, output: 0.00125 },
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
  'gemini-2.0-flash': { input: 0.000075, output: 0.0003 },
};

interface TrackAiUsageOpts {
  model: string;
  inputTokens: number;
  outputTokens: number;
  userId: string;
}

export const trackAIUsage = ({
  model,
  inputTokens,
  outputTokens,
  userId,
}: TrackAiUsageOpts): UsageRecord => {
  const costs =
    COST_PER_1K_TOKENS[model] || COST_PER_1K_TOKENS['claude-haiku-4-5'];
  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;
  const totalCost = inputCost + outputCost;

  const record: UsageRecord = {
    timestamp: new Date().toISOString(),
    model,
    userId,
    inputTokens,
    outputTokens,
    inputCost: inputCost.toFixed(6),
    outputCost: outputCost.toFixed(6),
    totalCost: totalCost.toFixed(6),
  };

  usage.push(record);
  if (usage.length > 10000) usage.splice(0, usage.length - 10000);

  return record;
};

interface UsageSummary {
  period: string;
  requests: number;
  totalCost: string;
  byModel: Record<string, number>;
}

export const getUsageSummary = (hours: number = 24): UsageSummary => {
  const since = Date.now() - hours * 3600000;
  const recent = usage.filter((r) => new Date(r.timestamp).getTime() >= since);

  return {
    period: `${hours}h`,
    requests: recent.length,
    totalCost: recent
      .reduce((sum, r) => sum + parseFloat(r.totalCost), 0)
      .toFixed(4),
    byModel: recent.reduce((acc, r) => {
      acc[r.model] = (acc[r.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
};
