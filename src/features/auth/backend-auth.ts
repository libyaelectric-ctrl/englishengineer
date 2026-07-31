import { getSupabaseClient } from './supabase.client';

let cachedOrgId: string | null = null;

export const getBackendAuthHeaders = async (
  localUserId?: string
): Promise<Record<string, string>> => {
  const client = getSupabaseClient();
  const headers: Record<string, string> = {};

  if (client) {
    const { data } = await client.auth.getSession();
    if (data.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`;

      if (!cachedOrgId) {
        try {
          const { data: membership } = await client
            .from('organization_members')
            .select('organization_id')
            .limit(1)
            .maybeSingle();
          if (membership?.organization_id) {
            cachedOrgId = membership.organization_id;
          }
        } catch {
          // Ignore and proceed without org context
        }
      }

      if (cachedOrgId) {
        headers['X-EngineerOS-Org-Id'] = cachedOrgId;
        headers['X-Corporation-Id'] = cachedOrgId;
      }
    }
  }

  if (localUserId) {
    headers['X-EngVox-User-Id'] = localUserId;
  }

  return headers;
};
