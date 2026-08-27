const USER_DAILY_LIMIT = 50;
const USER_MONTHLY_COST_LIMIT = 10.0;
const PRUNE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

// Model-specific cost rates (USD per 1K tokens)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
};

interface UsageRecord {
  timestamp: string;
  userId: string;
  tokensInput?: number;
  tokensOutput?: number;
  model?: string;
  estimatedCostUsd?: number;
}

const usage: UsageRecord[] = [];

const pruneOldRecords = (): void => {
  const cutoff = Date.now() - PRUNE_AFTER_MS;
  const cutoffIso = new Date(cutoff).toISOString();
  while (usage.length > 0 && usage[0].timestamp < cutoffIso) {
    usage.shift();
  }
};

const getUserDailyCount = (userId: string): number => {
  const today = new Date().toISOString().split('T')[0];
  return usage.filter((r) => r.userId === userId && r.timestamp.startsWith(today)).length;
};

const getUserMonthlyCost = (userId: string): number => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return usage.filter((r) => r.userId === userId && new Date(r.timestamp) >= monthStart).length;
};

/** Calculate estimated cost for a given model and token counts */
export const estimateTokenCost = (
  model: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const rates = MODEL_COSTS[model] ?? MODEL_COSTS['gpt-4o-mini'];
  return (inputTokens * rates.input + outputTokens * rates.output) / 1000;
};

export const checkUserLimits = (userId: string): { allowed: boolean; reason?: string } => {
  pruneOldRecords();

  const dailyCount = getUserDailyCount(userId);
  if (dailyCount >= USER_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `Daily limit reached (${USER_DAILY_LIMIT} requests/day). Try again tomorrow.`,
    };
  }

  const monthlyCount = getUserMonthlyCost(userId);
  if (monthlyCount >= USER_MONTHLY_COST_LIMIT) {
    return {
      allowed: false,
      reason: `Monthly cost limit reached ($${USER_MONTHLY_COST_LIMIT}/month). Contact support.`,
    };
  }

  return { allowed: true };
};
