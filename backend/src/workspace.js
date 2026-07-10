import { ApiError } from './errors.js';

const createHeaders = (serviceRoleKey) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
});

export const createWorkspaceRepository = (config, fetchImpl = fetch) => {
  if (!config.workspace?.configured) {
    throw new ApiError(
      503,
      'supabase_not_configured',
      'Workspace backend requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  const restUrl = `${config.workspace.supabaseUrl.replace(/\/$/, '')}/rest/v1`;
  const headers = createHeaders(config.workspace.supabaseServiceRoleKey);

  const request = async (path, init = {}) => {
    const response = await fetchImpl(`${restUrl}/${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
    });
    if (!response.ok) {
      let errorBody = 'N/A';
      try {
        errorBody = await response.text();
      } catch {}
      throw new ApiError(
        response.status >= 400 && response.status < 500 ? response.status : 502,
        'workspace_db_error',
        `Workspace database request failed with status ${response.status}.`
      );
    }
    return response;
  };

  return {
    async getWorkspaces(userId) {
      const response = await request(
        `workspaces?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`
      );
      return response.json();
    },

    async getWorkspace(workspaceId, userId) {
      const response = await request(
        `workspaces?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`
      );
      const rows = await response.json();
      return Array.isArray(rows) ? (rows[0] ?? null) : null;
    },

    async createWorkspace(userId, name, memory) {
      const response = await request('workspaces', {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify({
          user_id: userId,
          name,
          memory: memory ?? {},
          created_at: new Date().toISOString(),
        }),
      });
      const rows = await response.json();
      return Array.isArray(rows) ? rows[0] : rows;
    },

    async updateWorkspaceMemory(workspaceId, userId, memory) {
      const response = await request(
        `workspaces?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          prefer: 'return=representation',
          body: JSON.stringify({ memory }),
        }
      );
      const rows = await response.json();
      return Array.isArray(rows) ? rows[0] : rows;
    },

    async deleteWorkspace(workspaceId, userId) {
      await request(
        `workspaces?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`
      );
    },

    async countWorkspaces(userId) {
      const response = await request(
        `workspaces?user_id=eq.${encodeURIComponent(userId)}&select=id`
      );
      const rows = await response.json();
      return Array.isArray(rows) ? rows.length : 0;
    },

    async addDocument(workspaceId, userId, doc) {
      const current = await this.getWorkspace(workspaceId, userId);
      if (!current) return null;
      const updatedDocs = [...(current.documents || []), doc];
      const response = await request(
        `workspaces?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          prefer: 'return=representation',
          body: JSON.stringify({ documents: updatedDocs }),
        }
      );
      const rows = await response.json();
      return Array.isArray(rows) ? rows[0] : rows;
    },

    async deleteDocument(workspaceId, userId, docId) {
      const current = await this.getWorkspace(workspaceId, userId);
      if (!current) return null;
      const updatedDocs = (current.documents || []).filter(
        (doc) => doc.id !== docId
      );
      const response = await request(
        `workspaces?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          prefer: 'return=representation',
          body: JSON.stringify({ documents: updatedDocs }),
        }
      );
      const rows = await response.json();
      return Array.isArray(rows) ? rows[0] : rows;
    },
  };
};

const getWorkspaceLimit = (planId) => {
  switch (planId) {
    case 'free':
    case 'pro':
      return 1;
    case 'project':
      return 3;
    case 'exec':
    case 'private':
      return Infinity;
    default:
      return 1;
  }
};

export const registerWorkspaceRoutes = (
  app,
  requireBackendAuth,
  rateLimiter,
  { repository }
) => {
  if (!repository) return;

  const getUserId = (req) => req.auth?.userId;

  app.get(
    '/api/workspaces',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const data = await repository.getWorkspaces(userId);
        res.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    }
  );

  app.get(
    '/api/workspaces/:id',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const data = await repository.getWorkspace(req.params.id, userId);
        if (!data) {
          throw new ApiError(
            404,
            'workspace_not_found',
            'Workspace not found.'
          );
        }
        res.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/workspaces',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const { name, planId } = req.body ?? {};

        const existingCount = await repository.countWorkspaces(userId);
        const limit = getWorkspaceLimit(planId || 'free');
        if (existingCount >= limit) {
          throw new ApiError(
            403,
            'workspace_limit_reached',
            `Workspace limit (${limit}) reached for your plan.`
          );
        }

        const workspaceName = name || `Workspace ${existingCount + 1}`;
        const data = await repository.createWorkspace(
          userId,
          workspaceName,
          {}
        );
        res.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    }
  );

  app.put(
    '/api/workspaces/:id/memory',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const { key, value } = req.body ?? {};
        if (!key) {
          throw new ApiError(400, 'invalid_request', 'Memory key is required.');
        }

        const existing = await repository.getWorkspace(req.params.id, userId);
        if (!existing) {
          throw new ApiError(
            404,
            'workspace_not_found',
            'Workspace not found.'
          );
        }

        const updatedMemory = { ...(existing.memory || {}), [key]: value };
        const data = await repository.updateWorkspaceMemory(
          req.params.id,
          userId,
          updatedMemory
        );
        res.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete(
    '/api/workspaces/:id',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }

        const existing = await repository.getWorkspace(req.params.id, userId);
        if (!existing) {
          throw new ApiError(
            404,
            'workspace_not_found',
            'Workspace not found.'
          );
        }

        const count = await repository.countWorkspaces(userId);
        if (count <= 1) {
          throw new ApiError(
            403,
            'cannot_delete_last_workspace',
            'Cannot delete the only workspace.'
          );
        }

        await repository.deleteWorkspace(req.params.id, userId);
        res.json({ success: true });
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/api/workspaces/:id/documents',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const { docName, docContent } = req.body ?? {};
        if (!docName) {
          throw new ApiError(
            400,
            'invalid_request',
            'Document name is required.'
          );
        }

        const doc = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: docName,
          content: docContent || '',
          uploaded_at: new Date().toISOString(),
        };

        const data = await repository.addDocument(req.params.id, userId, doc);
        if (!data) {
          throw new ApiError(
            404,
            'workspace_not_found',
            'Workspace not found.'
          );
        }
        res.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete(
    '/api/workspaces/:id/documents/:docId',
    requireBackendAuth,
    rateLimiter,
    async (req, res, next) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }

        const data = await repository.deleteDocument(
          req.params.id,
          userId,
          req.params.docId
        );
        if (!data) {
          throw new ApiError(
            404,
            'workspace_not_found',
            'Workspace not found.'
          );
        }
        res.json({ success: true, data });
      } catch (error) {
        next(error);
      }
    }
  );
};
