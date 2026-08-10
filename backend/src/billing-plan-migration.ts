import type { PlanId } from '../types.js';

/**
 * Compatibility boundary for subscription rows created before the current
 * Junior/Senior/Specialist/Master/Team catalog was introduced.
 *
 * Legacy identifiers are accepted only while reading old persisted data or
 * webhook metadata; every caller receives the canonical PlanId afterwards.
 */
const LEGACY_PLAN_MIGRATION: Record<string, PlanId> = {
  lite: 'free',
  pro: 'junior',
  project: 'senior',
  max: 'specialist',
  exec: 'master',
  private: 'team',
};

const CANONICAL_PLAN_IDS = new Set<PlanId>([
  'free',
  'junior',
  'senior',
  'specialist',
  'master',
  'team',
]);

export const normalizePlanId = (value: unknown): PlanId => {
  if (typeof value !== 'string') return 'free';
  const normalized = value.trim().toLowerCase();
  if (CANONICAL_PLAN_IDS.has(normalized as PlanId)) return normalized as PlanId;
  return LEGACY_PLAN_MIGRATION[normalized] ?? 'free';
};
