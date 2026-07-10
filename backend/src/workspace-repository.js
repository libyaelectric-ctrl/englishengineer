import { createClient } from '@supabase/supabase-js';
import { ApiError } from './errors.js';

export const createSupabaseWorkspaceRepository = (config) => {
  if (!config?.configured) {
    throw new ApiError(
      503,
      'supabase_not_configured',
      'Workspace backend requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { persistSession: false } }
  );

  return {
    async getWorkspaces(userId) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to fetch workspaces: ${error.message}`);
      }
      return data ?? [];
    },

    async getWorkspace(workspaceId, userId) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new ApiError(502, 'workspace_db_error', `Failed to fetch workspace: ${error.message}`);
      }
      return data ?? null;
    },

    async createWorkspace(userId, name, memory) {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          user_id: userId,
          name,
          memory: memory ?? {},
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to create workspace: ${error.message}`);
      }
      return data;
    },

    async updateWorkspaceMemory(workspaceId, userId, memory) {
      const { data, error } = await supabase
        .from('workspaces')
        .update({ memory })
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to update workspace: ${error.message}`);
      }
      return data;
    },

    async deleteWorkspace(workspaceId, userId) {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)
        .eq('user_id', userId);

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to delete workspace: ${error.message}`);
      }
    },

    async countWorkspaces(userId) {
      const { count, error } = await supabase
        .from('workspaces')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to count workspaces: ${error.message}`);
      }
      return count ?? 0;
    },

    async addDocument(workspaceId, userId, doc) {
      const current = await this.getWorkspace(workspaceId, userId);
      if (!current) return null;

      const updatedDocs = [...(current.documents || []), doc];
      const { data, error } = await supabase
        .from('workspaces')
        .update({ documents: updatedDocs })
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to add document: ${error.message}`);
      }
      return data;
    },

    async deleteDocument(workspaceId, userId, docId) {
      const current = await this.getWorkspace(workspaceId, userId);
      if (!current) return null;

      const updatedDocs = (current.documents || []).filter((doc) => doc.id !== docId);
      const { data, error } = await supabase
        .from('workspaces')
        .update({ documents: updatedDocs })
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new ApiError(502, 'workspace_db_error', `Failed to delete document: ${error.message}`);
      }
      return data;
    },
  };
};
