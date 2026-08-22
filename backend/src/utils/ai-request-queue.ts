/**
 * AI Request Queue
 *
 * Manages concurrent AI requests per-user with priority levels.
 * Prevents API cost overruns and ensures fair resource allocation.
 */
import { logger } from '../logger.js';

type Priority = 'critical' | 'high' | 'normal' | 'low';

interface QueuedRequest {
  id: string;
  userId: string;
  planId: string;
  priority: Priority;
  operation: string;
  enqueuedAt: number;
  resolve: (value: { position: number; waitMs: number }) => void;
  reject: (error: Error) => void;
}

interface QueueMetrics {
  totalEnqueued: number;
  totalProcessed: number;
  totalRejected: number;
  averageWaitMs: number;
  activeRequests: number;
  queuedRequests: number;
}

const PLAN_CONCURRENCY: Record<string, number> = {
  free: 1,
  junior: 1,
  senior: 2,
  specialist: 3,
  master: 5,
  team: 10,
};

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const MAX_QUEUE_SIZE = 100;
const QUEUE_TIMEOUT_MS = 60_000; // 1 minute max wait

export class AiRequestQueue {
  private queue: QueuedRequest[] = [];
  private activeByUser = new Map<string, Set<string>>();
  private metrics: QueueMetrics = {
    totalEnqueued: 0,
    totalProcessed: 0,
    totalRejected: 0,
    averageWaitMs: 0,
    activeRequests: 0,
    queuedRequests: 0,
  };
  private waitSamples: number[] = [];

  constructor(
    private getMaxConcurrency: (planId: string) => number = (planId) =>
      PLAN_CONCURRENCY[planId] ?? 2
  ) {}

  /**
   * Enqueue an AI request. Returns a promise that resolves when the request
   * is dequeued (granted a slot), with position and estimated wait time.
   */
  async enqueue(
    userId: string,
    planId: string,
    operation: string,
    priority: Priority = 'normal'
  ): Promise<{ position: number; waitMs: number }> {
    this.metrics.totalEnqueued++;
    this.metrics.queuedRequests = this.queue.length;

    // Reject if queue is full
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.metrics.totalRejected++;
      throw new Error('AI request queue is full. Please try again later.');
    }

    // Check if user already at max concurrency
    const maxConcurrent = this.getMaxConcurrency(planId);
    const userActive = this.activeByUser.get(userId);
    if (userActive && userActive.size >= maxConcurrent) {
      // Queue the request
    }

    return new Promise<{ position: number; waitMs: number }>((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const request: QueuedRequest = {
        id,
        userId,
        planId,
        priority,
        operation,
        enqueuedAt: Date.now(),
        resolve,
        reject,
      };

      // Insert in priority order
      const insertIdx = this.queue.findIndex(
        (r) => PRIORITY_ORDER[r.priority] > PRIORITY_ORDER[priority]
      );
      if (insertIdx === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIdx, 0, request);
      }

      this.metrics.queuedRequests = this.queue.length;

      // Set timeout
      setTimeout(() => {
        const idx = this.queue.findIndex((r) => r.id === id);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          this.metrics.totalRejected++;
          this.metrics.queuedRequests = this.queue.length;
          reject(new Error(`AI request timed out after ${QUEUE_TIMEOUT_MS}ms`));
        }
      }, QUEUE_TIMEOUT_MS);

      this.tryProcessQueue();
    });
  }

  /**
   * Mark a request as completed, freeing up a slot.
   */
  release(userId: string, requestId: string): void {
    const userActive = this.activeByUser.get(userId);
    if (userActive) {
      userActive.delete(requestId);
      if (userActive.size === 0) {
        this.activeByUser.delete(userId);
      }
    }
    this.metrics.activeRequests = Math.max(0, this.metrics.activeRequests - 1);
    this.tryProcessQueue();
  }

  /**
   * Get current queue metrics.
   */
  getMetrics(): QueueMetrics {
    const avgWait =
      this.waitSamples.length > 0
        ? this.waitSamples.reduce((a, b) => a + b, 0) / this.waitSamples.length
        : 0;
    return {
      ...this.metrics,
      averageWaitMs: Math.round(avgWait),
      activeRequests: this.metrics.activeRequests,
      queuedRequests: this.queue.length,
    };
  }

  /**
   * Get queue status for a specific user.
   */
  getUserStatus(userId: string): {
    activeRequests: number;
    maxConcurrency: number;
    queuedRequests: number;
  } {
    const userActive = this.activeByUser.get(userId);
    const queued = this.queue.filter((r) => r.userId === userId).length;
    return {
      activeRequests: userActive?.size ?? 0,
      maxConcurrency: 2, // Default, overridden per-request
      queuedRequests: queued,
    };
  }

  /**
   * Clear all queued requests (for testing or emergency).
   */
  clear(): void {
    for (const req of this.queue) {
      req.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    this.activeByUser.clear();
    this.metrics.queuedRequests = 0;
  }

  private tryProcessQueue(): void {
    for (let i = 0; i < this.queue.length; i++) {
      const request = this.queue[i];
      if (!request) continue;

      const maxConcurrent = this.getMaxConcurrency(request.planId);
      const userActive = this.activeByUser.get(request.userId);
      const activeCount = userActive?.size ?? 0;

      if (activeCount >= maxConcurrent) continue;

      // Dequeue this request
      this.queue.splice(i, 1);
      i--; // Adjust index

      if (!userActive) {
        this.activeByUser.set(request.userId, new Set());
      }
      this.activeByUser.get(request.userId)!.add(request.id);
      this.metrics.activeRequests++;
      this.metrics.totalProcessed++;
      this.metrics.queuedRequests = this.queue.length;

      const waitMs = Date.now() - request.enqueuedAt;
      this.waitSamples.push(waitMs);
      if (this.waitSamples.length > 100) this.waitSamples.shift();

      request.resolve({ position: 0, waitMs });

      logger.info('AI request dequeued', {
        userId: request.userId,
        operation: request.operation,
        priority: request.priority,
        waitMs,
        queueLength: this.queue.length,
      });
    }
  }
}

// Singleton queue instance
let globalQueue: AiRequestQueue | null = null;

export const getAiRequestQueue = (): AiRequestQueue => {
  if (!globalQueue) {
    globalQueue = new AiRequestQueue();
  }
  return globalQueue;
};

export const resetAiRequestQueue = (): void => {
  if (globalQueue) {
    globalQueue.clear();
    globalQueue = null;
  }
};
