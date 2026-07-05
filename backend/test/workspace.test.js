import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createApp } from '../src/app.js';
import { createBackendConfig } from '../src/config.js';

const servers = [];

afterEach(() => {
  servers.splice(0).forEach((server) => server.close());
});

let idCounter = 0;
const createMockRepository = () => {
  const db = { workspaces: [] };
  return {
    db,
    async getWorkspaces(userId) {
      return db.workspaces.filter((w) => w.user_id === userId);
    },
    async getWorkspace(workspaceId, userId) {
      return db.workspaces.find(
        (w) => w.id === workspaceId && w.user_id === userId
      ) ?? null;
    },
    async createWorkspace(userId, name, memory) {
      idCounter += 1;
      const ws = {
        id: `ws_${idCounter}_${Date.now()}`,
        user_id: userId,
        name,
        memory: memory ?? {},
        documents: [],
        created_at: new Date().toISOString(),
      };
      db.workspaces.push(ws);
      return ws;
    },
    async updateWorkspaceMemory(workspaceId, userId, memory) {
      const ws = db.workspaces.find(
        (w) => w.id === workspaceId && w.user_id === userId
      );
      if (!ws) return null;
      ws.memory = memory;
      return ws;
    },
    async deleteWorkspace(workspaceId, userId) {
      db.workspaces = db.workspaces.filter(
        (w) => !(w.id === workspaceId && w.user_id === userId)
      );
    },
    async countWorkspaces(userId) {
      return db.workspaces.filter((w) => w.user_id === userId).length;
    },
    async addDocument(workspaceId, userId, doc) {
      const ws = db.workspaces.find(
        (w) => w.id === workspaceId && w.user_id === userId
      );
      if (!ws) return null;
      ws.documents = [...(ws.documents || []), doc];
      return ws;
    },
    async deleteDocument(workspaceId, userId, docId) {
      const ws = db.workspaces.find(
        (w) => w.id === workspaceId && w.user_id === userId
      );
      if (!ws) return null;
      ws.documents = (ws.documents || []).filter((d) => d.id !== docId);
      return ws;
    },
  };
};

const start = async (environment = {}, dependencies = {}) => {
  const config = createBackendConfig({
    NODE_ENV: 'test',
    ALLOW_INSECURE_DEV_AUTH: 'true',
    ...environment,
  });
  const app = createApp({ config, ...dependencies });
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

const devHeaders = (userId = 'workspace-test-user') => ({
  'Content-Type': 'application/json',
  'X-EngineerOS-User-Id': userId,
});

test('workspace routes are not registered when Supabase is not configured', async () => {
  const url = await start({});
  const response = await fetch(`${url}/api/workspaces`, {
    headers: devHeaders(),
  });
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.error.code, 'route_not_found');
});

test('workspace list returns empty array for new user', async () => {
  const repo = createMockRepository();
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces`, {
    headers: devHeaders('user-123'),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.deepEqual(body.data, []);
});

test('workspace create returns new workspace', async () => {
  const repo = createMockRepository();
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces`, {
    method: 'POST',
    headers: devHeaders('user-create'),
    body: JSON.stringify({ name: 'My Workspace', planId: 'free' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.name, 'My Workspace');
  assert.equal(body.data.user_id, 'user-create');
});

test('workspace create enforces plan limits', async () => {
  const repo = createMockRepository();
  await repo.createWorkspace('user-limit', 'Existing', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces`, {
    method: 'POST',
    headers: devHeaders('user-limit'),
    body: JSON.stringify({ name: 'Extra Workspace', planId: 'free' }),
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error.code, 'workspace_limit_reached');
});

test('workspace create allows project plan with 3 workspaces', async () => {
  const repo = createMockRepository();
  await repo.createWorkspace('user-proj', 'WS 1', {});
  await repo.createWorkspace('user-proj', 'WS 2', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces`, {
    method: 'POST',
    headers: devHeaders('user-proj'),
    body: JSON.stringify({ name: 'WS 3', planId: 'project' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(repo.db.workspaces.filter((w) => w.user_id === 'user-proj').length, 3);
});

test('workspace delete prevents deleting the last workspace', async () => {
  const repo = createMockRepository();
  const ws = await repo.createWorkspace('user-delete', 'Only Workspace', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/${ws.id}`, {
    method: 'DELETE',
    headers: devHeaders('user-delete'),
  });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error.code, 'cannot_delete_last_workspace');
});

test('workspace delete succeeds when multiple workspaces exist', async () => {
  const repo = createMockRepository();
  const ws1 = await repo.createWorkspace('user-del2', 'WS 1', {});
  await repo.createWorkspace('user-del2', 'WS 2', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/${ws1.id}`, {
    method: 'DELETE',
    headers: devHeaders('user-del2'),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(repo.db.workspaces.filter((w) => w.user_id === 'user-del2').length, 1);
});

test('workspace memory update merges keys correctly', async () => {
  const repo = createMockRepository();
  const ws = await repo.createWorkspace('user-mem', 'Memory WS', {
    existing: 'value',
  });
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/${ws.id}/memory`, {
    method: 'PUT',
    headers: devHeaders('user-mem'),
    body: JSON.stringify({ key: 'newKey', value: 'newValue' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.memory.existing, 'value');
  assert.equal(body.data.memory.newKey, 'newValue');
});

test('workspace memory update returns 400 without key', async () => {
  const repo = createMockRepository();
  const ws = await repo.createWorkspace('user-mem2', 'WS', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/${ws.id}/memory`, {
    method: 'PUT',
    headers: devHeaders('user-mem2'),
    body: JSON.stringify({ value: 'someValue' }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'invalid_request');
});

test('workspace document add creates document with correct structure', async () => {
  const repo = createMockRepository();
  const ws = await repo.createWorkspace('user-doc', 'Doc WS', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/${ws.id}/documents`, {
    method: 'POST',
    headers: devHeaders('user-doc'),
    body: JSON.stringify({ docName: 'Test Doc', docContent: 'Hello' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.documents.length, 1);
  assert.equal(body.data.documents[0].name, 'Test Doc');
  assert.equal(body.data.documents[0].content, 'Hello');
  assert.ok(body.data.documents[0].id.startsWith('doc_'));
});

test('workspace document add requires docName', async () => {
  const repo = createMockRepository();
  const ws = await repo.createWorkspace('user-doc2', 'WS', {});
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/${ws.id}/documents`, {
    method: 'POST',
    headers: devHeaders('user-doc2'),
    body: JSON.stringify({ docContent: 'content' }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error.code, 'invalid_request');
});

test('workspace 404 returns correct error for non-existent workspace', async () => {
  const repo = createMockRepository();
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(`${url}/api/workspaces/non-existent-id`, {
    headers: devHeaders('user-404'),
  });
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.error.code, 'workspace_not_found');
});

test('workspace document delete removes the correct document', async () => {
  const repo = createMockRepository();
  const ws = await repo.createWorkspace('user-docdel', 'WS', {});
  const added = await repo.addDocument(ws.id, 'user-docdel', {
    id: 'doc_keep',
    name: 'Keep',
    content: 'k',
  });
  await repo.addDocument(ws.id, 'user-docdel', {
    id: 'doc_remove',
    name: 'Remove',
    content: 'r',
  });
  const url = await start({}, { workspaceRepository: repo });
  const response = await fetch(
    `${url}/api/workspaces/${ws.id}/documents/doc_remove`,
    {
      method: 'DELETE',
      headers: devHeaders('user-docdel'),
    }
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.documents.length, 1);
  assert.equal(body.data.documents[0].id, 'doc_keep');
});

test('workspace list isolates users from each other', async () => {
  const repo = createMockRepository();
  await repo.createWorkspace('user-a', 'A Workspace', {});
  await repo.createWorkspace('user-b', 'B Workspace', {});
  const url = await start({}, { workspaceRepository: repo });

  const responseA = await fetch(`${url}/api/workspaces`, {
    headers: devHeaders('user-a'),
  });
  const bodyA = await responseA.json();
  assert.equal(bodyA.data.length, 1);
  assert.equal(bodyA.data[0].name, 'A Workspace');

  const responseB = await fetch(`${url}/api/workspaces`, {
    headers: devHeaders('user-b'),
  });
  const bodyB = await responseB.json();
  assert.equal(bodyB.data.length, 1);
  assert.equal(bodyB.data[0].name, 'B Workspace');
});
