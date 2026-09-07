import type { Express, Request, RequestHandler, Response } from 'express';

import { auditLog, AUDIT_ACTIONS } from './audit-log.js';
import { ApiError } from './errors.js';
import { getLearningRepository } from './learning-repository.js';

const csvEscape = (value: unknown): string => {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export const registerExportRoutes = (
  app: Express,
  requireBackendAuth: RequestHandler,
  _config?: { workspace?: Record<string, unknown> }
): void => {
  app.get('/api/export/user-data', requireBackendAuth, async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    if (!userId) throw new ApiError(401, 'authentication_required', 'Authentication required.');

    const requestedFormat = typeof req.query.format === 'string' ? req.query.format : 'json';
    if (requestedFormat !== 'json' && requestedFormat !== 'csv') {
      throw new ApiError(400, 'invalid_export_format', 'Export format must be json or csv.');
    }

    const learning = await getLearningRepository().exportUserData(userId);
    const userData = {
      schemaVersion: '2026-09-07',
      profile: { id: userId, email: req.auth?.email ?? null },
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
        ['profile', userData.profile],
        ['learning_progress_events', learning.progressEvents],
        ['learning_writing_submissions', learning.writingSubmissions],
        ['learning_speaking_submissions', learning.speakingSubmissions],
        ['export_metadata', { schemaVersion: userData.schemaVersion, exportDate: userData.exportDate }],
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
