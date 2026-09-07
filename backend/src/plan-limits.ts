import type { PlanId } from '../types.js';

export const PLAN_AI_LIMITS: Record<PlanId, { daily: number | null; monthly: number }> = {
  free: { daily: 3, monthly: 0 },
  junior: { daily: null, monthly: 50 },
  senior: { daily: null, monthly: 150 },
  specialist: { daily: null, monthly: 300 },
  master: { daily: null, monthly: 600 },
  team: { daily: null, monthly: 1500 },
};

export const DEFAULT_PLAN_LIMITS: { daily: number | null; monthly: number } = {
  daily: 3,
  monthly: 0,
};
