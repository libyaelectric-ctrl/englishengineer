import { logger } from '../logger.js';

interface BackupConfig {
  enabled: boolean;
  intervalMs: number;
  retentionDays: number;
  maxBackups: number;
}

interface BackupRecord {
  id: string;
  timestamp: string;
  size: number;
  status: 'success' | 'failed';
  duration: number;
  error?: string;
}

const defaultConfig: BackupConfig = {
  enabled: true,
  intervalMs: 24 * 60 * 60 * 1000, // Daily
  retentionDays: 30,
  maxBackups: 30,
};

/**
 * Backup automation manager.
 * Handles scheduled backups and retention.
 */
export class BackupAutomation {
  private config: BackupConfig;
  private backups: BackupRecord[] = [];
  private backupTimer?: NodeJS.Timeout;

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Start scheduled backups.
   */
  start(): void {
    if (!this.config.enabled) {
      logger.i('Backup automation disabled');
      return;
    }

    this.backupTimer = setInterval(() => {
      this.runBackup();
    }, this.config.intervalMs);

    logger.i(`Backup automation started (interval: ${this.config.intervalMs / 1000 / 60} minutes)`);
  }

  /**
   * Stop scheduled backups.
   */
  stop(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = undefined;
    }
    logger.i('Backup automation stopped');
  }

  /**
   * Run a backup immediately.
   */
  async runBackup(): Promise<BackupRecord> {
    const startTime = Date.now();
    const backupId = `backup_${Date.now()}`;

    logger.i('Starting backup', { backupId });

    try {
      // In production, this would call Supabase backup API
      // For now, simulate backup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const record: BackupRecord = {
        id: backupId,
        timestamp: new Date().toISOString(),
        size: 0,
        status: 'success',
        duration: Date.now() - startTime,
      };

      this.backups.push(record);
      this.cleanupOldBackups();

      logger.i('Backup completed', { backupId, duration: record.duration });
      return record;
    } catch (error) {
      const record: BackupRecord = {
        id: backupId,
        timestamp: new Date().toISOString(),
        size: 0,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };

      this.backups.push(record);
      logger.e('Backup failed', { backupId, error: record.error });
      return record;
    }
  }

  /**
   * Get backup history.
   */
  getBackups(limit = 10): BackupRecord[] {
    return this.backups
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get backup statistics.
   */
  getStats(): {
    total: number;
    successful: number;
    failed: number;
    lastBackup: string | null;
    averageDuration: number;
  } {
    const successful = this.backups.filter((b) => b.status === 'success').length;
    const failed = this.backups.filter((b) => b.status === 'failed').length;
    const lastBackup = this.backups.length > 0 ? this.backups[this.backups.length - 1].timestamp : null;

    const durations = this.backups.map((b) => b.duration);
    const averageDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    return {
      total: this.backups.length,
      successful,
      failed,
      lastBackup,
      averageDuration,
    };
  }

  /**
   * Clean up old backups based on retention policy.
   */
  private cleanupOldBackups(): void {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const before = this.backups.length;

    this.backups = this.backups.filter(
      (b) => new Date(b.timestamp).getTime() >= cutoff
    );

    // Also enforce max backups
    if (this.backups.length > this.config.maxBackups) {
      this.backups = this.backups.slice(-this.config.maxBackups);
    }

    const cleaned = before - this.backups.length;
    if (cleaned > 0) {
      logger.i(`Cleaned ${cleaned} old backups`);
    }
  }

  /**
   * Verify backup integrity.
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    const backup = this.backups.find((b) => b.id === backupId);
    if (!backup) {
      return false;
    }

    // In production, this would verify backup integrity
    return backup.status === 'success';
  }
}

// Global instance
let instance: BackupAutomation | null = null;

export const getBackupAutomation = (config?: Partial<BackupConfig>): BackupAutomation => {
  if (!instance) {
    instance = new BackupAutomation(config);
  }
  return instance;
};
