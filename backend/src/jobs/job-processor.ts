import { logger } from '../logger.js';

interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retries: number;
  maxRetries: number;
}

type JobHandler<T = unknown> = (data: T) => Promise<void>;

interface JobProcessorConfig {
  maxRetries: number;
  retryDelayMs: number;
  maxConcurrent: number;
  cleanupIntervalMs: number;
}

const defaultConfig: JobProcessorConfig = {
  maxRetries: 3,
  retryDelayMs: 1000,
  maxConcurrent: 5,
  cleanupIntervalMs: 60000,
};

/**
 * Background job processor with retry logic.
 */
export class JobProcessor {
  private jobs = new Map<string, Job>();
  private handlers = new Map<string, JobHandler>();
  private config: JobProcessorConfig;
  private processingCount = 0;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<JobProcessorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.startCleanup();
  }

  /**
   * Register a job handler.
   */
  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler);
    logger.i(`Job handler registered: ${type}`);
  }

  /**
   * Enqueue a job.
   */
  enqueue<T>(type: string, data: T, options?: { maxRetries?: number }): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const job: Job<T> = {
      id: jobId,
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      retries: 0,
      maxRetries: options?.maxRetries ?? this.config.maxRetries,
    };

    this.jobs.set(jobId, job);
    logger.i(`Job enqueued: ${type}`, { jobId });

    // Start processing if under concurrency limit
    this.processNext();

    return jobId;
  }

  /**
   * Get job status.
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Cancel a job.
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'processing') {
      return false;
    }

    job.status = 'failed';
    job.error = 'Cancelled by user';
    job.completedAt = new Date();
    return true;
  }

  /**
   * Process next pending job.
   */
  private async processNext(): Promise<void> {
    if (this.processingCount >= this.config.maxConcurrent) {
      return;
    }

    const pendingJob = Array.from(this.jobs.values()).find(
      (j) => j.status === 'pending'
    );

    if (!pendingJob) {
      return;
    }

    const handler = this.handlers.get(pendingJob.type);
    if (!handler) {
      pendingJob.status = 'failed';
      pendingJob.error = `No handler for job type: ${pendingJob.type}`;
      pendingJob.completedAt = new Date();
      return;
    }

    pendingJob.status = 'processing';
    pendingJob.startedAt = new Date();
    this.processingCount++;

    try {
      await handler(pendingJob.data);
      pendingJob.status = 'completed';
      pendingJob.completedAt = new Date();
      logger.i(`Job completed: ${pendingJob.type}`, { jobId: pendingJob.id });
    } catch (error) {
      pendingJob.retries++;

      if (pendingJob.retries < pendingJob.maxRetries) {
        pendingJob.status = 'pending';
        logger.w(`Job failed, retrying (${pendingJob.retries}/${pendingJob.maxRetries})`, {
          jobId: pendingJob.id,
          error: error instanceof Error ? error.message : String(error),
        });

        // Delay before retry
        setTimeout(() => this.processNext(), this.config.retryDelayMs);
      } else {
        pendingJob.status = 'failed';
        pendingJob.error = error instanceof Error ? error.message : String(error);
        pendingJob.completedAt = new Date();
        logger.e(`Job failed permanently: ${pendingJob.type}`, {
          jobId: pendingJob.id,
          error: pendingJob.error,
        });
      }
    } finally {
      this.processingCount--;
      this.processNext();
    }
  }

  /**
   * Start periodic cleanup of old jobs.
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldJobs();
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Remove completed/failed jobs older than 1 hour.
   */
  private cleanupOldJobs(): void {
    const oneHourAgo = Date.now() - 3600000;
    let cleaned = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.completedAt &&
        job.completedAt.getTime() < oneHourAgo
      ) {
        this.jobs.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.i(`Cleaned ${cleaned} old jobs`);
    }
  }

  /**
   * Get processor stats.
   */
  getStats(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case 'pending':
          pending++;
          break;
        case 'processing':
          processing++;
          break;
        case 'completed':
          completed++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }

    return { pending, processing, completed, failed };
  }

  /**
   * Stop the processor.
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Global processor instance
let instance: JobProcessor | null = null;

export const getJobProcessor = (config?: Partial<JobProcessorConfig>): JobProcessor => {
  if (!instance) {
    instance = new JobProcessor(config);
  }
  return instance;
};
