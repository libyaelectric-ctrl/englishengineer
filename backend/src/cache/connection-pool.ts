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

export const getPoolConfig = (overrides?: Partial<PoolConfig>): PoolConfig => ({
  ...DEFAULT_POOL_CONFIG,
  ...overrides,
});
