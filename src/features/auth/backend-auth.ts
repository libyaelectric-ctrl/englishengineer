import { getSupabaseClient } from './supabase.client';

export const getBackendAuthHeaders = async (
  localUserId?: string
): Promise<Record<string, string>> => {
  const client = getSupabaseClient();
  if (client) {
    const { data } = await client.auth.getSession();
    if (data.session?.access_token) {
      return { Authorization: `Bearer ${data.session.access_token}` };
    }
  }

  return localUserId ? { 'X-EngVox-User-Id': localUserId } : {};
};
