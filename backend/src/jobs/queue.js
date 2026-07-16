import { Queue, Worker } from 'bullmq';
import { logger } from '../logger.js';

// BullMQ Background Job System
// Uses Upstash Redis for production, local Redis for development

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

// Queues
export const emailQueue = new Queue('email-sending', { connection });
export const aiProcessingQueue = new Queue('ai-processing', { connection });
export const auditCleanupQueue = new Queue('audit-cleanup', { connection });

// Job Types
export const JOB_TYPES = {
  EMAIL_WELCOME: 'email-welcome',
  EMAIL_BILLING: 'email-billing',
  AI_HEAVY_PROCESSING: 'ai-heavy-processing',
  AUDIT_LOG_CLEANUP: 'audit-cleanup',
};

// Worker: Email Sending
const createEmailWorker = () => {
  const worker = new Worker(
    'email-sending',
    async (job) => {
      const { type, to, data } = job.data;
      logger.info('Processing email', { worker: 'email', type, to });

      // Email sending logic would go here
      // For now, just log the attempt
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

// Worker: AI Heavy Processing
const createAIWorker = () => {
  const worker = new Worker(
    'ai-processing',
    async (job) => {
      const { type, payload } = job.data;
      logger.info('Processing AI job', { worker: 'ai', type });

      // Heavy AI processing logic
      await job.updateProgress(50);

      // Simulate processing time
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

// Worker: Audit Log Cleanup
const createAuditCleanupWorker = () => {
  const worker = new Worker(
    'audit-cleanup',
    async (job) => {
      const { retentionDays = 90 } = job.data;
      logger.info('Cleaning audit logs', { worker: 'audit', retentionDays });

      // Audit log cleanup logic
      // Would delete logs from Supabase older than retention period
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

// Start all workers
export const startWorkers = () => {
  logger.info('Starting BullMQ workers');

  const emailWorker = createEmailWorker();
  const aiWorker = createAIWorker();
  const auditCleanupWorker = createAuditCleanupWorker();

  return { emailWorker, aiWorker, auditCleanupWorker };
};

// Job helpers
export const addEmailJob = async (type, to, data = {}) => {
  return emailQueue.add(
    type,
    { type, to, data },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    }
  );
};

export const addAIJob = async (type, payload) => {
  return aiProcessingQueue.add(
    type,
    { type, payload },
    {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
    }
  );
};

export const addAuditCleanupJob = async (retentionDays = 90) => {
  return auditCleanupQueue.add(
    JOB_TYPES.AUDIT_LOG_CLEANUP,
    { retentionDays },
    {
      attempts: 1,
    }
  );
};
