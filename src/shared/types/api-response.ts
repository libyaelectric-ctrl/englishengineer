export const API_CONTRACT_VERSION = '2026-09-07.v1' as const;

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  meta: { contractVersion: typeof API_CONTRACT_VERSION };
}

export interface ApiFailureResponse {
  ok: false;
  error: { code: string; message: string; details?: unknown };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const unwrapApiSuccess = <T>(value: unknown): T => {
  if (!isRecord(value) || value.ok !== true || !('data' in value)) {
    throw new Error('Backend response does not match the versioned success envelope.');
  }
  const meta = value.meta;
  if (!isRecord(meta) || meta.contractVersion !== API_CONTRACT_VERSION) {
    throw new Error('Backend response contract version is unsupported.');
  }
  return value.data as T;
};
