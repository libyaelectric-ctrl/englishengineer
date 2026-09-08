import type { BackendConfig } from '../types.js';
import { ApiError } from './errors.js';

type ExportRow = Record<string, unknown>;

export interface ComplianceExportData {
  profile: ExportRow[];
  settings: ExportRow[];
  progressSnapshots: ExportRow[];
  assessments: ExportRow[];
  taskAttempts: ExportRow[];
  writingAttempts: ExportRow[];
  listeningAttempts: ExportRow[];
  speakingAttempts: ExportRow[];
  vocabularyReviews: ExportRow[];
  workspaces: ExportRow[];
  billingCustomers: ExportRow[];
  subscriptions: ExportRow[];
  aiSessions: ExportRow[];
  auditLogs: ExportRow[];
}

interface ExportSource {
  key: keyof ComplianceExportData;
  table: string;
  ownerColumn: 'id' | 'user_id';
}

const SOURCES: readonly ExportSource[] = [
  { key: 'profile', table: 'profiles', ownerColumn: 'id' },
  { key: 'settings', table: 'user_settings', ownerColumn: 'user_id' },
  { key: 'progressSnapshots', table: 'user_progress_snapshots', ownerColumn: 'user_id' },
  { key: 'assessments', table: 'assessment_snapshots', ownerColumn: 'user_id' },
  { key: 'taskAttempts', table: 'task_attempts', ownerColumn: 'user_id' },
  { key: 'writingAttempts', table: 'writing_attempts', ownerColumn: 'user_id' },
  { key: 'listeningAttempts', table: 'listening_attempts', ownerColumn: 'user_id' },
  { key: 'speakingAttempts', table: 'speaking_attempts', ownerColumn: 'user_id' },
  { key: 'vocabularyReviews', table: 'vocabulary_reviews', ownerColumn: 'user_id' },
  { key: 'workspaces', table: 'workspaces', ownerColumn: 'user_id' },
  { key: 'billingCustomers', table: 'billing_customers', ownerColumn: 'user_id' },
  { key: 'subscriptions', table: 'subscription_status', ownerColumn: 'user_id' },
  { key: 'aiSessions', table: 'ai_sessions', ownerColumn: 'user_id' },
  { key: 'auditLogs', table: 'audit_logs', ownerColumn: 'user_id' },
] as const;

const emptyExport = (): ComplianceExportData => ({
  profile: [],
  settings: [],
  progressSnapshots: [],
  assessments: [],
  taskAttempts: [],
  writingAttempts: [],
  listeningAttempts: [],
  speakingAttempts: [],
  vocabularyReviews: [],
  workspaces: [],
  billingCustomers: [],
  subscriptions: [],
  aiSessions: [],
  auditLogs: [],
});

export interface ComplianceExportRepository {
  exportUserData(userId: string): Promise<ComplianceExportData>;
}

export const createComplianceExportRepository = (
  config: Pick<BackendConfig, 'environment' | 'workspace'>,
  fetchImpl: typeof fetch = fetch
): ComplianceExportRepository => {
  const baseUrl = config.workspace.supabaseUrl?.trim().replace(/\/+$/, '') ?? null;
  const serviceRoleKey = config.workspace.supabaseServiceRoleKey?.trim() ?? null;

  const fetchAll = async (source: ExportSource, userId: string): Promise<ExportRow[]> => {
    if (!baseUrl || !serviceRoleKey) return [];
    const rows: ExportRow[] = [];
    const pageSize = 1_000;
    for (let offset = 0; ; offset += pageSize) {
      const url = new URL(`${baseUrl}/rest/v1/${source.table}`);
      url.searchParams.set('select', '*');
      url.searchParams.set(source.ownerColumn, `eq.${userId}`);
      const response = await fetchImpl(url, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/json',
          Range: `${offset}-${offset + pageSize - 1}`,
          'Range-Unit': 'items',
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        throw new ApiError(
          502,
          'compliance_export_source_failed',
          `User data export could not read ${source.key}.`
        );
      }
      const page = (await response.json()) as ExportRow[];
      rows.push(...page);
      if (page.length < pageSize) break;
    }
    return rows;
  };

  return {
    async exportUserData(userId) {
      if (!baseUrl || !serviceRoleKey) {
        if (config.environment === 'production') {
          throw new ApiError(
            503,
            'compliance_export_unavailable',
            'Persistent user data export is not configured.'
          );
        }
        return emptyExport();
      }
      const entries = await Promise.all(
        SOURCES.map(async (source) => [source.key, await fetchAll(source, userId)] as const)
      );
      return Object.fromEntries(entries) as unknown as ComplianceExportData;
    },
  };
};
