import { logger } from './logger.js';

/**
 * Content Freshness Tracking
 *
 * Monitors when vocabulary, grammar, and reading content was last updated.
 * Flags stale content that may need review or re-validation.
 *
 * Use cases:
 * - Detect grammar rules that haven't been reviewed in 6+ months
 * - Flag vocabulary entries with outdated translations
 * - Alert on reading passages with deprecated terminology
 */

interface ContentItem {
  id: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening';
  lastUpdatedAt: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface FreshnessConfig {
  /** Max age in days before content is considered stale */
  staleAfterDays: number;
  /** Max age in days before content is considered critical */
  criticalAfterDays: number;
}

const DEFAULT_CONFIG: FreshnessConfig = {
  staleAfterDays: 90, // 3 months
  criticalAfterDays: 180, // 6 months
};

interface FreshnessReport {
  generatedAt: string;
  totalItems: number;
  fresh: number;
  stale: number;
  critical: number;
  byType: Record<string, { total: number; fresh: number; stale: number; critical: number }>;
  oldestItems: Array<{ id: string; type: string; lastUpdatedAt: string; ageDays: number }>;
  recommendations: string[];
}

/**
 * Calculate age in days from a date string.
 */
const ageDays = (dateStr: string): number => {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
};

/**
 * Classify content freshness based on age.
 */
const classify = (ageDays: number, config: FreshnessConfig): 'fresh' | 'stale' | 'critical' => {
  if (ageDays >= config.criticalAfterDays) return 'critical';
  if (ageDays >= config.staleAfterDays) return 'stale';
  return 'fresh';
};

/**
 * Generate a freshness report for a collection of content items.
 */
export const generateFreshnessReport = (
  items: ContentItem[],
  config: Partial<FreshnessConfig> = {}
): FreshnessReport => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = new Date().toISOString();

  let fresh = 0;
  let stale = 0;
  let critical = 0;

  const byType: Record<string, { total: number; fresh: number; stale: number; critical: number }> =
    {};

  for (const item of items) {
    const age = ageDays(item.lastUpdatedAt);
    const classification = classify(age, cfg);

    if (classification === 'fresh') fresh++;
    else if (classification === 'stale') stale++;
    else critical++;

    if (!byType[item.type]) {
      byType[item.type] = { total: 0, fresh: 0, stale: 0, critical: 0 };
    }
    byType[item.type].total++;
    byType[item.type][classification]++;
  }

  // Oldest items
  const oldestItems = items
    .map((item) => ({
      id: item.id,
      type: item.type,
      lastUpdatedAt: item.lastUpdatedAt,
      ageDays: ageDays(item.lastUpdatedAt),
    }))
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 10);

  // Recommendations
  const recommendations: string[] = [];
  if (critical > 0) {
    recommendations.push(
      `${critical} items are critically outdated (>${cfg.criticalAfterDays} days). Priority review needed.`
    );
  }
  if (stale > 0) {
    recommendations.push(
      `${stale} items are stale (>${cfg.staleAfterDays} days). Schedule review.`
    );
  }
  if (byType.vocabulary && byType.vocabulary.critical > 0) {
    recommendations.push(
      `Vocabulary: ${byType.vocabulary.critical} entries need urgent update (possible outdated translations).`
    );
  }
  if (byType.grammar && byType.grammar.stale > 0) {
    recommendations.push(`Grammar: ${byType.grammar.stale} rules need review for accuracy.`);
  }
  if (byType.reading && byType.reading.critical > 0) {
    recommendations.push(
      `Reading: ${byType.reading.critical} passages may contain deprecated terminology.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push('All content is fresh. No action needed.');
  }

  return {
    generatedAt: now,
    totalItems: items.length,
    fresh,
    stale,
    critical,
    byType,
    oldestItems,
    recommendations,
  };
};

/**
 * In-memory content freshness tracker.
 * In production, this would query Supabase for actual content timestamps.
 */
const trackedContent: Map<string, ContentItem> = new Map();

export const trackContent = (item: ContentItem): void => {
  trackedContent.set(item.id, item);
};

export const getFreshnessReport = (config?: Partial<FreshnessConfig>): FreshnessReport => {
  return generateFreshnessReport([...trackedContent.values()], config);
};

/**
 * Log freshness warnings for stale/critical content.
 */
export const logFreshnessWarnings = (config?: Partial<FreshnessConfig>): void => {
  const report = getFreshnessReport(config);
  if (report.critical > 0) {
    logger.warn('[ContentFreshness] Critical stale content detected', {
      critical: report.critical,
      stale: report.stale,
      total: report.totalItems,
      recommendations: report.recommendations,
    });
  } else if (report.stale > 0) {
    logger.info('[ContentFreshness] Stale content detected', {
      stale: report.stale,
      total: report.totalItems,
    });
  }
};
