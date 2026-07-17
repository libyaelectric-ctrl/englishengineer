import { Queue, Worker } from 'bullmq';
import { logger } from '../logger.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

export const emailQueue = new Queue('email-sending', { connection });
export const aiProcessingQueue = new Queue('ai-processing', { connection });
export const auditCleanupQueue = new Queue('audit-cleanup', { connection });

export const JOB_TYPES = {
  EMAIL_WELCOME: 'email-welcome',
  EMAIL_BILLING: 'email-billing',
  AI_HEAVY_PROCESSING: 'ai-heavy-processing',
  AUDIT_LOG_CLEANUP: 'audit-cleanup',
} as const;

interface EmailJobData {
  type: string;
  to: string;
  data: Record<string, unknown>;
}

const createEmailWorker = (): Worker => {
  const worker = new Worker(
    'email-sending',
    async (job) => {
      const { type, to, data } = job.data as EmailJobData;
      logger.info('Processing email', { worker: 'email', type, to });
      await job.updateProgress(100);
      return { success: true, type, to };
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error('Job failed', { worker: 'email', jobId: job?.id }, err);
  });

  worker.on('completed', (job) => {
    logger.info('Job completed', { worker: 'email', jobId: job.id });
  });

  return worker;
};

interface AiJobData {
  type: string;
  payload: Record<string, unknown>;
}

const createAIWorker = (): Worker => {
  const worker = new Worker(
    'ai-processing',
    async (job) => {
      const { type, payload } = job.data as AiJobData;
      logger.info('Processing AI job', { worker: 'ai', type });
      await job.updateProgress(50);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await job.updateProgress(100);
      return { success: true, type };
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error('Job failed', { worker: 'ai', jobId: job?.id }, err);
  });

  return worker;
};

interface AuditCleanupJobData {
  retentionDays?: number;
}

const createAuditCleanupWorker = (): Worker => {
  const worker = new Worker(
    'audit-cleanup',
    async (job) => {
      const { retentionDays = 90 } = job.data as AuditCleanupJobData;
      logger.info('Cleaning audit logs', { worker: 'audit', retentionDays });
      await job.updateProgress(100);
      return { success: true, retentionDays };
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error('Job failed', { worker: 'audit', jobId: job?.id }, err);
  });

  return worker;
};

export const startWorkers = () => {
  logger.info('Starting BullMQ workers');

  const emailWorker = createEmailWorker();
  const aiWorker = createAIWorker();
  const auditCleanupWorker = createAuditCleanupWorker();

  return { emailWorker, aiWorker, auditCleanupWorker };
};

export const addEmailJob = async (
  type: string,
  to: string,
  data: Record<string, unknown> = {}
) => {
  return emailQueue.add(
    type,
    { type, to, data },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    }
  );
};

export const addAIJob = async (
  type: string,
  payload: Record<string, unknown>
) => {
  return aiProcessingQueue.add(
    type,
    { type, payload },
    {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
    }
  );
};

export const addAuditCleanupJob = async (retentionDays: number = 90) => {
  return auditCleanupQueue.add(
    JOB_TYPES.AUDIT_LOG_CLEANUP,
    { retentionDays },
    {
      attempts: 1,
    }
  );
};
