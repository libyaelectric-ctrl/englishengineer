import { logger } from '@/shared/logger';
import { useAuthStore } from '@/features/auth';
import { getBillingApiUrl } from './billing.helpers';

const API_BASE = () => {
  const billingUrl = getBillingApiUrl();
  return billingUrl ? billingUrl.replace(/\/$/, '') : null;
};

export interface WorkspaceDocument {
  id: string;
  name: string;
  content: string;
  uploaded_at: string;
}

export interface WorkspaceSession {
  id: string;
  started_at: string;
  message_count: number;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  memory: Record<string, string>;
  documents: WorkspaceDocument[];
  sessions: WorkspaceSession[];
  created_at: string;
}

export interface WorkspaceApiResponse<T = Workspace | Workspace[] | null> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all workspaces for the current user
 */
export async function fetchWorkspaces(): Promise<WorkspaceApiResponse<Workspace[]>> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces`, {
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error fetching workspaces:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch workspaces' };
  }
}

/**
 * Get a single workspace by ID
 */
export async function fetchWorkspace(workspaceId: string): Promise<WorkspaceApiResponse<Workspace>> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error fetching workspace:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch workspace' };
  }
}

/**
 * Create a new workspace
 */
export async function createWorkspace(name: string, planId: string): Promise<WorkspaceApiResponse<Workspace>> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, planId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error creating workspace:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create workspace' };
  }
}

/**
 * Update workspace memory
 */
export async function updateWorkspaceMemory(
  workspaceId: string,
  key: string,
  value: string
): Promise<WorkspaceApiResponse<Workspace>> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces/${workspaceId}/memory`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error updating workspace memory:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update workspace memory' };
  }
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(workspaceId: string): Promise<WorkspaceApiResponse> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error deleting workspace:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete workspace' };
  }
}

/**
 * Add document to workspace
 */
export async function addDocumentToWorkspace(
  workspaceId: string,
  docName: string,
  docContent: string
): Promise<WorkspaceApiResponse<Workspace>> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces/${workspaceId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ docName, docContent }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error adding document to workspace:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add document' };
  }
}

/**
 * Delete document from workspace
 */
export async function deleteDocumentFromWorkspace(
  workspaceId: string,
  docId: string
): Promise<WorkspaceApiResponse<Workspace>> {
  const apiBase = API_BASE();
  if (!apiBase) {
    return { success: false, error: 'Backend not configured' };
  }

  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const response = await fetch(`${apiBase}/api/workspaces/${workspaceId}/documents/${docId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.e('Error deleting document from workspace:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete document' };
  }
}
