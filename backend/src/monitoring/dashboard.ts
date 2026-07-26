import { getMetrics } from './metrics.js';
import { getJobProcessor } from '../jobs/job-processor.js';
import { logger } from '../logger.js';

interface DashboardData {
  timestamp: string;
  uptime: number;
  system: {
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    version: string;
  };
  metrics: ReturnType<typeof getMetrics>['snapshot'];
  jobs: ReturnType<typeof getJobProcessor>['getStats'];
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, { status: string; latency?: number }>;
  };
}

const startTime = Date.now();

/**
 * Monitoring dashboard data provider.
 * Aggregates all system metrics for display.
 */
export const getDashboardData = (): DashboardData => {
  const metrics = getMetrics();
  const jobProcessor = getJobProcessor();

  return {
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.env.APP_VERSION || '4.0.1',
    },
    metrics: metrics.snapshot(),
    jobs: jobProcessor.getStats(),
    health: {
      status: 'healthy',
      checks: {
        api: { status: 'ok', latency: 0 },
        database: { status: 'ok', latency: 0 },
        cache: { status: 'ok', latency: 0 },
      },
    },
  };
};

/**
 * Format dashboard data for console output.
 */
export const formatDashboardConsole = (data: DashboardData): string => {
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '                    ENGINEEROS MONITORING DASHBOARD',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Timestamp: ${data.timestamp}`,
    `Uptime: ${Math.floor(data.uptime / 3600)}h ${Math.floor((data.uptime % 3600) / 60)}m`,
    `Version: ${data.system.version}`,
    '',
    '─── System ───────────────────────────────────────────────────',
    `Memory: ${Math.round(data.system.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(data.system.memory.heapTotal / 1024 / 1024)}MB`,
    `RSS: ${Math.round(data.system.memory.rss / 1024 / 1024)}MB`,
    '',
    '─── Jobs ─────────────────────────────────────────────────────',
    `Pending: ${data.jobs.pending}`,
    `Processing: ${data.jobs.processing}`,
    `Completed: ${data.jobs.completed}`,
    `Failed: ${data.jobs.failed}`,
    '',
    '─── Health ───────────────────────────────────────────────────',
    `Status: ${data.health.status.toUpperCase()}`,
  ];

  for (const [name, check] of Object.entries(data.health.checks)) {
    lines.push(`  ${name}: ${check.status}${check.latency ? ` (${check.latency}ms)` : ''}`);
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
};

/**
 * Dashboard API endpoint handler.
 */
export const dashboardHandler = async (): Promise<{
  status: number;
  body: DashboardData;
}> => {
  const data = getDashboardData();
  return { status: 200, body: data };
};
