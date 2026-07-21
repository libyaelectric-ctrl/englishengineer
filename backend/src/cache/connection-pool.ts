import { logger } from '../logger.js';

interface PoolConfig {
  maxConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: 10,
  connectionTimeoutMs: 10_000,
  idleTimeoutMs: 30_000,
};

let activeConnections = 0;
let lastPruneAt = Date.now();

export const getPoolConfig = (overrides?: Partial<PoolConfig>): PoolConfig => ({
  ...DEFAULT_POOL_CONFIG,
  ...overrides,
});

export const acquireConnection = (config: PoolConfig): boolean => {
  if (activeConnections >= config.maxConnections) {
    logger.warn('[Pool] Max connections reached', {
      active: activeConnections,
      max: config.maxConnections,
    });
    return false;
  }
  activeConnections += 1;
  return true;
};

export const releaseConnection = (): void => {
  if (activeConnections > 0) activeConnections -= 1;
};

export const getPoolStats = () => ({
  active: activeConnections,
  idle: 0,
});
