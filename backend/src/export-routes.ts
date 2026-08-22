import type { Express, NextFunction, Request, RequestHandler, Response } from 'express';

import { ApiError } from './errors.js';
import { logger } from './logger.js';

/**
 * Register GDPR-compliant data export endpoints.
 *
 * GET /api/v1/export/me — Returns all user data as downloadable JSON
 * GET /api/v1/export/me/summary — Returns a human-readable summary
 */

interface ExportData {
  exportedAt: string;
  userId: string;
  profile: Record<string, unknown> | null;
  subscriptions: Record<string, unknown> | null;
  aiSessions: Record<string, unknown>[] | null;
  auditLogs: Record<string, unknown>[] | null;
}

/**
 * Fetch all user data from Supabase for GDPR export.
 */
const buildExport = async (
  userId: string,
  config: {
    workspace?: { configured?: boolean; supabaseUrl?: string; supabaseServiceRoleKey?: string };
  }
): Promise<ExportData> => {
  const data: ExportData = {
    exportedAt: new Date().toISOString(),
    userId,
    profile: null,
    subscriptions: null,
    aiSessions: null,
    auditLogs: null,
  };

  if (
    !config.workspace?.configured ||
    !config.workspace?.supabaseUrl ||
    !config.workspace?.supabaseServiceRoleKey
  ) {
    return data;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      config.workspace.supabaseUrl,
      config.workspace.supabaseServiceRoleKey,
      {
        auth: { persistSession: false },
      }
    );

    // Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    data.profile = profile as Record<string, unknown> | null;

    // Subscriptions
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    data.subscriptions = sub as Record<string, unknown> | null;

    // AI sessions
    const { data: aiSessions } = await supabase
      .from('ai_sessions')
      .select('*')
      .eq('user_id', userId);
    data.aiSessions = (aiSessions as Record<string, unknown>[]) ?? [];

    // Audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);
    data.auditLogs = (auditLogs as Record<string, unknown>[]) ?? [];
  } catch (err: unknown) {
    logger.error('Export query error', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return data;
};

/**
 * Build a human-readable summary of user data.
 */
const buildSummary = (data: ExportData): Record<string, unknown> => ({
  userId: data.userId,
  exportedAt: data.exportedAt,
  summary: {
    hasProfile: data.profile !== null,
    subscriptionPlan: (data.subscriptions as Record<string, unknown>)?.plan_id ?? 'free',
    subscriptionStatus: (data.subscriptions as Record<string, unknown>)?.status ?? 'none',
    totalAiSessions: data.aiSessions?.length ?? 0,
    totalAuditLogs: data.auditLogs?.length ?? 0,
  },
});

export const registerExportRoutes = (
  app: Express,
  requireAuth: RequestHandler,
  config?: { workspace?: Record<string, unknown> }
): void => {
  // Full data export (GDPR compliance)
  app.get(
    '/api/v1/export/me',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth?.userId;
        if (!userId) {
          throw new ApiError(401, 'unauthorized', 'Authentication required for data export.');
        }

        logger.info('Data export requested', { userId, requestId: req.id });

        const data = await buildExport(
          userId,
          config as {
            workspace?: {
              configured?: boolean;
              supabaseUrl?: string;
              supabaseServiceRoleKey?: string;
            };
          }
        );

        // Set headers for file download
        const filename = `engvox-data-export-${userId}-${Date.now()}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-store');

        res.json(data);
      } catch (err) {
        next(err);
      }
    }
  );

  // Summary only (lighter endpoint)
  app.get(
    '/api/v1/export/me/summary',
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth?.userId;
        if (!userId) {
          throw new ApiError(401, 'unauthorized', 'Authentication required.');
        }

        const data = await buildExport(
          userId,
          config as {
            workspace?: {
              configured?: boolean;
              supabaseUrl?: string;
              supabaseServiceRoleKey?: string;
            };
          }
        );
        const summary = buildSummary(data);

        res.json(summary);
      } catch (err) {
        next(err);
      }
    }
  );
};
