const USER_DAILY_LIMIT = 50;
const USER_MONTHLY_COST_LIMIT = 10.0;

interface UsageRecord {
  timestamp: string;
  userId: string;
}

const usage: UsageRecord[] = [];

const getUserDailyCount = (userId: string): number => {
  const today = new Date().toISOString().split('T')[0];
  return usage.filter(
    (r) => r.userId === userId && r.timestamp.startsWith(today)
  ).length;
};

const getUserMonthlyCost = (userId: string): number => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return usage.filter(
    (r) => r.userId === userId && new Date(r.timestamp) >= monthStart
  ).length;
};

export const checkUserLimits = (
  userId: string
): { allowed: boolean; reason?: string } => {
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
