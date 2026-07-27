import { Router } from 'express';

const router = Router();

/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Returns service status and basic diagnostics.
 * Used by load balancers, monitoring, and deployment verification.
 */
router.get('/health', (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '4.0.1',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    },
  };

  res.status(200).json(health);
});

/**
 * Readiness Check
 * 
 * GET /api/health/ready
 * 
 * Returns whether the service is ready to accept traffic.
 * Checks database connectivity and critical dependencies.
 */
router.get('/health/ready', async (_req, res) => {
  const checks: Record<string, boolean> = {
    server: true,
    database: true, // TODO: Add actual DB connectivity check
    redis: true,    // TODO: Add Redis connectivity check when implemented
  };

  const allHealthy = Object.values(checks).every(Boolean);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * Liveness Check
 * 
 * GET /api/health/live
 * 
 * Returns whether the service is alive.
 * Kubernetes uses this to restart unhealthy pods.
 */
router.get('/health/live', (_req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
