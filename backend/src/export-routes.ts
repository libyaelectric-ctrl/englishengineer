import type { Request, RequestHandler, Response } from 'express';
import type { RouteRegistrar } from './route-registrar.js';

import type { BackendConfig } from '../types.js';

import { auditLog, AUDIT_ACTIONS } from './audit-log.js';
import { createComplianceExportRepository } from './compliance-export-repository.js';
import { ApiError } from './errors.js';
import { getLearningRepository } from './learning-repository.js';

const csvEscape = (value: unknown): string => {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const defaultExportConfig = (): Pick<BackendConfig, 'environment' | 'workspace'> => ({
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  workspace: {
    configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseUrl: process.env.SUPABASE_URL ?? null,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
  },
});

export const registerExportRoutes = (
  app: RouteRegistrar,
  requireBackendAuth: RequestHandler,
  config: Pick<BackendConfig, 'environment' | 'workspace'> = defaultExportConfig(),
  fetchImpl: typeof fetch = fetch
): void => {
  const complianceRepository = createComplianceExportRepository(config, fetchImpl);
  app.get('/api/export/user-data', requireBackendAuth, async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    if (!userId) throw new ApiError(401, 'authentication_required', 'Authentication required.');

    const requestedFormat = typeof req.query.format === 'string' ? req.query.format : 'json';
    if (requestedFormat !== 'json' && requestedFormat !== 'csv') {
      throw new ApiError(400, 'invalid_export_format', 'Export format must be json or csv.');
    }

    const [learning, persisted] = await Promise.all([
      getLearningRepository().exportUserData(userId),
      complianceRepository.exportUserData(userId),
    ]);
    const userData = {
      schemaVersion: '2026-09-07.v2',
      identity: { id: userId, email: req.auth?.email ?? null },
      profile: persisted.profile,
      preferences: persisted.settings,
      progressSnapshots: persisted.progressSnapshots,
      assessments: persisted.assessments,
      taskAttempts: persisted.taskAttempts,
      writingAttempts: persisted.writingAttempts,
      listeningAttempts: persisted.listeningAttempts,
      speakingAttempts: persisted.speakingAttempts,
      vocabularyReviews: persisted.vocabularyReviews,
      workspaces: persisted.workspaces,
      billing: {
        customers: persisted.billingCustomers,
        subscriptions: persisted.subscriptions,
      },
      aiSessions: persisted.aiSessions,
      auditLogs: persisted.auditLogs,
      learning,
      exportDate: new Date().toISOString(),
    };

    auditLog({
      action: AUDIT_ACTIONS.DATA_EXPORTED,
      userId,
      details: { format: requestedFormat, schemaVersion: userData.schemaVersion },
      severity: 'info',
    });

    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (requestedFormat === 'csv') {
      const rows = [
        ['section', 'payload'],
        ['identity', userData.identity],
        ['profile', userData.profile],
        ['preferences', userData.preferences],
        ['progress_snapshots', userData.progressSnapshots],
        ['assessments', userData.assessments],
        ['task_attempts', userData.taskAttempts],
        ['writing_attempts', userData.writingAttempts],
        ['listening_attempts', userData.listeningAttempts],
        ['speaking_attempts', userData.speakingAttempts],
        ['vocabulary_reviews', userData.vocabularyReviews],
        ['workspaces', userData.workspaces],
        ['billing', userData.billing],
        ['ai_sessions', userData.aiSessions],
        ['audit_logs', userData.auditLogs],
        ['learning_progress_events', learning.progressEvents],
        ['learning_writing_submissions', learning.writingSubmissions],
        ['learning_speaking_submissions', learning.speakingSubmissions],
        [
          'export_metadata',
          { schemaVersion: userData.schemaVersion, exportDate: userData.exportDate },
        ],
      ];
      const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="user-data.csv"');
      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="user-data.json"');
    return res.json(userData);
  });
};
