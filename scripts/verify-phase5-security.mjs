import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [auth, app, tenant, speaking, audit, exportRoutes, exportRepo, types] = await Promise.all([
  read('backend/src/auth.ts'),
  read('backend/src/app.ts'),
  read('backend/src/middleware/tenant.middleware.ts'),
  read('backend/src/speaking-routes.ts'),
  read('backend/src/audit-log.ts'),
  read('backend/src/export-routes.ts'),
  read('backend/src/compliance-export-repository.ts'),
  read('backend/types.d.ts'),
]);

assert.match(auth, /header\.alg !== 'HS256'/);
assert.match(auth, /header\.typ !== 'JWT'/);
for (const claim of ['payload.exp', 'payload.iat', 'payload.iss', 'payload.aud']) {
  assert.ok(auth.includes(claim));
}

const internalBlock = auth.slice(
  auth.indexOf('authenticateInternalSecret'),
  auth.indexOf('getRequestedUserId')
);
assert.doesNotMatch(internalBlock, /x-engineeros-user-(id|email|role)/);
assert.match(types, /internalServiceId: string \| null/);

const operationsBlock = app.slice(
  app.indexOf('const metricsToken'),
  app.indexOf("app.get('/api-docs.json'")
);
assert.doesNotMatch(operationsBlock, /query\.token|req\.query/);
assert.match(operationsBlock, /operations_auth_unavailable/);
assert.match(operationsBlock, /operations_unauthorized/);
assert.match(app, /app\.get\('\/api\/diagnostics', requireOperationsToken, diagnosticsHandler\)/);
assert.match(app, /app\.get\('\/api\/metrics', requireOperationsToken/);

const livenessBlock = app.slice(
  app.indexOf('const livenessHandler'),
  app.indexOf('const diagnosticsHandler')
);
assert.match(livenessBlock, /toPublicHealth\(config\)/);
for (const privateDetail of [
  'process.memoryUsage',
  'getPoolMetrics',
  'process.version',
  'responseTimeMs',
]) {
  assert.ok(!livenessBlock.includes(privateDetail), `Public liveness exposes ${privateDetail}`);
}

const diagnosticsBlock = app.slice(
  app.indexOf('const diagnosticsHandler'),
  app.indexOf("v1Router.get('/health'")
);
for (const privateDetail of [
  'process.memoryUsage',
  'getPoolMetrics',
  'process.version',
  'responseTimeMs',
]) {
  assert.ok(diagnosticsBlock.includes(privateDetail), `Private diagnostics lost ${privateDetail}`);
}
assert.match(diagnosticsBlock, /getAuditLogStatus\(\)/);

assert.match(tenant, /organization_members/);
assert.match(tenant, /organization_id/);
assert.match(tenant, /user_id/);
assert.match(speaking, /audio_signature_mismatch/);
assert.match(speaking, /audio_storage_unavailable/);
assert.match(audit, /audit_log_unavailable/);
assert.match(audit, /healthCheck/);
for (const section of [
  'progressSnapshots',
  'workspaces',
  'billingCustomers',
  'aiSessions',
  'auditLogs',
]) {
  assert.ok(exportRepo.includes(section) && exportRoutes.includes(section));
}

console.log('PHASE5_SECURITY_CONTRACT_OK');
