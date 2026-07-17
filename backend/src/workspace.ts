import { ApiError } from './errors.js';
import {
  validateBody,
  WorkspaceCreateBodySchema,
  WorkspaceMemoryBodySchema,
  WorkspaceDocumentBodySchema,
} from './validation.js';
import { createSupabaseWorkspaceRepository } from './workspace-repository.js';
import type { WorkspaceRepository } from './workspace-repository.js';
import type { Request, Response, NextFunction } from 'express';

export const createWorkspaceRepository = (
  config: Record<string, any>,
  fetchImpl: typeof fetch = fetch
): WorkspaceRepository => {
  return createSupabaseWorkspaceRepository(config.workspace);
};

const getWorkspaceLimit = (planId: string): number => {
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
  app: any,
  requireBackendAuth: any,
  rateLimiter: any,
  { repository }: { repository: WorkspaceRepository | null }
): void => {
  if (!repository) return;

  const getUserId = (req: Request): string | undefined =>
    (req as any).auth?.userId;

  app.get(
    '/api/workspaces',
    requireBackendAuth,
    rateLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
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
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const data = await repository.getWorkspace(
          req.params.id as string,
          userId
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

  app.post(
    '/api/workspaces',
    requireBackendAuth,
    rateLimiter,
    validateBody(WorkspaceCreateBodySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const { name, planId } = (req as any).validatedBody;

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
    validateBody(WorkspaceMemoryBodySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const { key, value } = (req as any).validatedBody;
        if (!key) {
          throw new ApiError(400, 'invalid_request', 'Memory key is required.');
        }

        const existing = await repository.getWorkspace(
          req.params.id as string,
          userId
        );
        if (!existing) {
          throw new ApiError(
            404,
            'workspace_not_found',
            'Workspace not found.'
          );
        }

        const updatedMemory = { ...(existing.memory || {}), [key]: value };
        const data = await repository.updateWorkspaceMemory(
          req.params.id as string,
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
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }

        const existing = await repository.getWorkspace(
          req.params.id as string,
          userId
        );
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

        await repository.deleteWorkspace(req.params.id as string, userId);
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
    validateBody(WorkspaceDocumentBodySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = getUserId(req);
        if (!userId) {
          throw new ApiError(
            401,
            'authentication_required',
            'User ID is required.'
          );
        }
        const { docName, docContent } = (req as any).validatedBody;
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

        const data = await repository.addDocument(
          req.params.id as string,
          userId,
          doc
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

  app.delete(
    '/api/workspaces/:id/documents/:docId',
    requireBackendAuth,
    rateLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
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
          req.params.id as string,
          userId,
          req.params.docId as string
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
