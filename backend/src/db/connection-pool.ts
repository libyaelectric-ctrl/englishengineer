import { logger } from '../logger.js';

interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
  maxRetries: number;
}

interface Connection {
  id: string;
  createdAt: number;
  lastUsedAt: number;
  inUse: boolean;
}

const defaultConfig: PoolConfig = {
  maxConnections: 20,
  minConnections: 5,
  connectionTimeoutMs: 10000,
  idleTimeoutMs: 300000, // 5 minutes
  maxRetries: 3,
};

/**
 * Connection pool manager.
 * Manages database connections efficiently.
 */
export class ConnectionPool {
  private connections: Connection[] = [];
  private config: PoolConfig;
  private waitingQueue: Array<{
    resolve: (connection: Connection) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initialize();
    this.startCleanup();
  }

  /**
   * Initialize pool with minimum connections.
   */
  private initialize(): void {
    for (let i = 0; i < this.config.minConnections; i++) {
      this.createConnection();
    }
    logger.i(`Connection pool initialized with ${this.config.minConnections} connections`);
  }

  /**
   * Create a new connection.
   */
  private createConnection(): Connection {
    const connection: Connection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      inUse: false,
    };

    this.connections.push(connection);
    return connection;
  }

  /**
   * Acquire a connection from the pool.
   */
  async acquire(): Promise<Connection> {
    // Try to get an idle connection
    const idleConnection = this.connections.find((c) => !c.inUse);
    if (idleConnection) {
      idleConnection.inUse = true;
      idleConnection.lastUsedAt = Date.now();
      return idleConnection;
    }

    // Create new connection if under limit
    if (this.connections.length < this.config.maxConnections) {
      const newConnection = this.createConnection();
      newConnection.inUse = true;
      newConnection.lastUsedAt = Date.now();
      return newConnection;
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(
          (w) => w.resolve === resolve
        );
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection pool timeout'));
      }, this.config.connectionTimeoutMs);

      this.waitingQueue.push({
        resolve: (conn) => {
          clearTimeout(timeout);
          resolve(conn);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        },
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Release a connection back to the pool.
   */
  release(connection: Connection): void {
    connection.inUse = false;
    connection.lastUsedAt = Date.now();

    // Release to waiting request if any
    if (this.waitingQueue.length > 0) {
      const waiting = this.waitingQueue.shift();
      if (waiting) {
        connection.inUse = true;
        waiting.resolve(connection);
      }
    }
  }

  /**
   * Get pool statistics.
   */
  getStats(): {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  } {
    const active = this.connections.filter((c) => c.inUse).length;
    return {
      total: this.connections.length,
      active,
      idle: this.connections.length - active,
      waiting: this.waitingQueue.length,
    };
  }

  /**
   * Clean up idle connections.
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    const before = this.connections.length;

    this.connections = this.connections.filter((conn) => {
      if (conn.inUse) return true;
      if (now - conn.lastUsedAt > this.config.idleTimeoutMs) {
        // Don't remove if below minimum
        if (this.connections.length > this.config.minConnections) {
          return false;
        }
      }
      return true;
    });

    const cleaned = before - this.connections.length;
    if (cleaned > 0) {
      logger.i(`Cleaned ${cleaned} idle connections`);
    }
  }

  /**
   * Start periodic cleanup.
   */
  private startCleanup(): void {
    setInterval(() => {
      this.cleanupIdleConnections();
    }, 60000); // Every minute
  }

  /**
   * Drain the pool (for graceful shutdown).
   */
  async drain(): Promise<void> {
    // Wait for all active connections to be released
    const maxWait = 30000;
    const start = Date.now();

    while (this.connections.some((c) => c.inUse) && Date.now() - start < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Clear waiting queue
    for (const waiting of this.waitingQueue) {
      waiting.reject(new Error('Pool draining'));
    }
    this.waitingQueue = [];

    // Clear connections
    this.connections = [];

    logger.i('Connection pool drained');
  }
}

// Global pool instance
let instance: ConnectionPool | null = null;

export const getConnectionPool = (config?: Partial<PoolConfig>): ConnectionPool => {
  if (!instance) {
    instance = new ConnectionPool(config);
  }
  return instance;
};
