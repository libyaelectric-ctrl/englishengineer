import type { ApiResponse } from '../types.js';

export const API_CONTRACT_VERSION = '2026-09-07.v1' as const;

export const apiSuccess = <T>(data: T): ApiResponse<T> => ({
  ok: true,
  data,
  meta: { contractVersion: API_CONTRACT_VERSION },
});
