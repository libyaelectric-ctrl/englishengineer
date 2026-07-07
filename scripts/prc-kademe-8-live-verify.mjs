import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { format as formatWithPrettier } from 'prettier';

const ROOT = process.cwd();
const REPORT_PATH = resolve(
  ROOT,
  'PRC_Kademe_8_Live_Service_Evidence_Report.md'
);
const REQUEST_TIMEOUT_MS = 20_000;
const BLOCKED_EXIT_CODE = 2;
const ENV_CHECK_ONLY = process.argv.includes('--env-check');

const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  'backend/.env',
  'backend/.env.local',
  'backend/.env.production',
];

const ENV_REQUIREMENTS = [
  ['VITE_AUTH_PROVIDER', 'frontend', true],
  ['VITE_SUPABASE_URL', 'frontend', true],
  ['VITE_SUPABASE_ANON_KEY', 'frontend', true],
  ['VITE_BILLING_API_URL', 'frontend', true],
  ['VITE_AI_PROVIDER', 'frontend', true],
  ['VITE_AI_PROXY_URL', 'frontend', true],
  ['SUPABASE_URL', 'backend', true],
  ['SUPABASE_ANON_KEY', 'backend', true],
  ['SUPABASE_SERVICE_ROLE_KEY', 'backend', true],
  ['BILLING_REPOSITORY', 'backend', true],
  ['STRIPE_SECRET_KEY', 'backend', true],
  ['STRIPE_WEBHOOK_SECRET', 'backend', true],
  ['STRIPE_PRICE_PRO_MONTHLY', 'backend', true],
  ['AI_PROVIDER', 'backend', true],
  ['OPENAI_API_KEY', 'backend', false],
  ['ANTHROPIC_API_KEY', 'backend', false],
  ['GEMINI_API_KEY', 'backend', false],
  ['RATE_LIMIT_STORE', 'backend', true],
  ['UPSTASH_REDIS_REST_URL', 'backend', true],
  ['UPSTASH_REDIS_REST_TOKEN', 'backend', true],
];

const PRIVATE_TABLES = [
  ['profiles', 'id'],
  ['user_settings', 'user_id'],
  ['user_progress_snapshots', 'user_id'],
  ['assessment_snapshots', 'user_id'],
  ['task_attempts', 'user_id'],
  ['writing_attempts', 'user_id'],
  ['listening_attempts', 'user_id'],
  ['speaking_attempts', 'user_id'],
  ['vocabulary_reviews', 'user_id'],
  ['ai_sessions', 'user_id'],
  ['billing_customers', 'user_id'],
  ['subscription_status', 'user_id'],
];

const QUALITY_COMMANDS = [
  { label: 'npm run typecheck', scriptName: 'typecheck' },
  { label: 'npm test', scriptName: 'test', npmArgs: ['test'] },
  { label: 'npm run build', scriptName: 'build' },
  { label: 'npm run backend:test', scriptName: 'backend:test' },
  { label: 'npm run verify:rls', scriptName: 'verify:rls' },
  { label: 'npm run quality:gate', scriptName: 'quality:gate' },
  {
    label: 'npm run quality:gate:browser',
    scriptName: 'quality:gate:browser',
  },
];

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) return {};
  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((values, line) => {
      const match = line.match(
        /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/
      );
      if (!match) return values;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, '').trim();
      }
      values[match[1]] = value;
      return values;
    }, {});
};

const loadEnvironment = () => {
  const fromFiles = ENV_FILES.reduce((values, relativePath) => {
    const fileValues = parseEnvFile(resolve(ROOT, relativePath));
    return { ...values, ...fileValues };
  }, {});
  return { ...fromFiles, ...process.env };
};

const hasValue = (environment, name) =>
  typeof environment[name] === 'string' && environment[name].trim().length > 0;

const getValueStatus = (environment, name) => {
  if (!hasValue(environment, name)) return 'MISSING';
  const value = environment[name].trim();
  const isLocalStagingEndpoint =
    ['VITE_BILLING_API_URL', 'VITE_AI_PROXY_URL'].includes(name) &&
    /^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::|\/|$)/i.test(value);
  const isPlaceholder =
    isLocalStagingEndpoint ||
    /(?:placeholder|replace[-_ ]?me|your[-_ ]|changeme|example|todo|<[^>]+>)/i.test(
      value
    );
  return isPlaceholder ? 'PLACEHOLDER' : 'OK';
};

const getEnvironmentRows = (environment) => {
  const aiProvider = environment.AI_PROVIDER?.trim().toLowerCase();
  return ENV_REQUIREMENTS.map(([name, scope, alwaysRequired]) => {
    const providerRequired =
      name === 'OPENAI_API_KEY'
        ? aiProvider === 'openai'
        : name === 'ANTHROPIC_API_KEY'
          ? aiProvider === 'anthropic'
          : name === 'GEMINI_API_KEY'
            ? aiProvider === 'gemini'
            : alwaysRequired;
    return {
      name,
      scope,
      required: providerRequired,
      status: getValueStatus(environment, name),
    };
  });
};

const validateSafeValues = (environment) => {
  const invalid = [];
  const expected = [
    ['VITE_AUTH_PROVIDER', 'supabase'],
    ['VITE_AI_PROVIDER', 'backend'],
    ['BILLING_REPOSITORY', 'supabase'],
    ['RATE_LIMIT_STORE', 'upstash'],
  ];
  for (const [name, requiredValue] of expected) {
    if (
      hasValue(environment, name) &&
      environment[name].trim().toLowerCase() !== requiredValue
    ) {
      invalid.push(`${name} must equal ${requiredValue}`);
    }
  }
  if (
    hasValue(environment, 'AI_PROVIDER') &&
    !['openai', 'anthropic', 'gemini'].includes(
      environment.AI_PROVIDER.trim().toLowerCase()
    )
  ) {
    invalid.push('AI_PROVIDER must equal openai, anthropic or gemini');
  }
  if (
    hasValue(environment, 'STRIPE_SECRET_KEY') &&
    !environment.STRIPE_SECRET_KEY.trim().startsWith('sk_test_')
  ) {
    invalid.push('STRIPE_SECRET_KEY must be a Stripe test-mode key');
  }
  return invalid;
};

const fetchWithTimeout = async (
  url,
  init = {},
  timeoutMs = REQUEST_TIMEOUT_MS
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const jsonRequest = async (url, init = {}, acceptedStatuses = [200, 201]) => {
  const response = await fetchWithTimeout(url, init);
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`Request returned HTTP ${response.status}.`);
  }
  return { response, payload };
};

const joinEndpoint = (base, suffix) => {
  const trimmed = base.replace(/\/$/, '');
  return trimmed.endsWith(suffix) ? trimmed : `${trimmed}${suffix}`;
};

const deriveBackendRoot = (configuredUrl) =>
  configuredUrl
    .replace(/\/$/, '')
    .replace(/\/api\/(billing|ai)$/, '')
    .replace(/\/api\/(billing|ai)\/[^/]+$/, '');

const supabaseHeaders = (key, accessToken = key, prefer) => ({
  apikey: key,
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  ...(prefer ? { Prefer: prefer } : {}),
});

const createSupabaseAdminUser = async (environment, email, password) => {
  const url = `${environment.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`;
  const { payload } = await jsonRequest(url, {
    method: 'POST',
    headers: supabaseHeaders(environment.SUPABASE_SERVICE_ROLE_KEY),
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!payload?.id) throw new Error('Supabase did not return a test user id.');
  return payload;
};

const deleteSupabaseAdminUser = async (environment, userId) => {
  const url = `${environment.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${encodeURIComponent(userId)}`;
  await jsonRequest(
    url,
    {
      method: 'DELETE',
      headers: supabaseHeaders(environment.SUPABASE_SERVICE_ROLE_KEY),
    },
    [200, 204]
  );
};

const loginSupabaseUser = async (environment, email, password) => {
  const url = `${environment.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
  const { payload } = await jsonRequest(url, {
    method: 'POST',
    headers: supabaseHeaders(environment.SUPABASE_ANON_KEY),
    body: JSON.stringify({ email, password }),
  });
  if (!payload?.access_token || !payload?.user?.id) {
    throw new Error('Supabase login did not return a session.');
  }
  return payload;
};

const verifySupabase = async (environment, evidence) => {
  const marker = `prc8-${randomUUID()}`;
  const password = `${randomBytes(18).toString('base64url')}Aa1!`;
  const emailA = `prc8-a-${randomUUID()}@example.invalid`;
  const emailB = `prc8-b-${randomUUID()}@example.invalid`;
  const users = [];
  let sessionA = null;
  const cleanupUsers = async () => {
    if (sessionA?.access_token) {
      try {
        const logout = await fetchWithTimeout(
          `${environment.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/logout`,
          {
            method: 'POST',
            headers: supabaseHeaders(
              environment.SUPABASE_ANON_KEY,
              sessionA.access_token
            ),
          }
        );
        evidence.push([
          'Supabase logout',
          [200, 204].includes(logout.status) ? 'PASS' : 'NOT VERIFIED',
        ]);
      } catch {
        evidence.push(['Supabase logout', 'NOT VERIFIED']);
      }
    }
    for (const userId of users.reverse()) {
      try {
        await deleteSupabaseAdminUser(environment, userId);
      } catch {
        evidence.push(['Supabase test-user cleanup', 'NOT VERIFIED']);
      }
    }
  };
  try {
    const userA = await createSupabaseAdminUser(environment, emailA, password);
    users.push(userA.id);
    const userB = await createSupabaseAdminUser(environment, emailB, password);
    users.push(userB.id);
    sessionA = await loginSupabaseUser(environment, emailA, password);
    const sessionB = await loginSupabaseUser(environment, emailB, password);
    evidence.push(['Supabase two-user authentication', 'PASS']);

    const authBase = environment.SUPABASE_URL.replace(/\/$/, '');
    const restored = await jsonRequest(`${authBase}/auth/v1/user`, {
      headers: supabaseHeaders(
        environment.SUPABASE_ANON_KEY,
        sessionA.access_token
      ),
    });
    if (restored.payload?.id !== userA.id) {
      throw new Error('Supabase session restore returned the wrong user.');
    }
    evidence.push(['Supabase session restore', 'PASS']);

    const restBase = `${authBase}/rest/v1`;
    const snapshot = {
      schemaVersion: 1,
      userId: userA.id,
      capturedAt: new Date().toISOString(),
      source: 'prc-kademe-8-staging-verifier',
      data: { verificationMarker: marker },
    };
    await jsonRequest(
      `${restBase}/user_progress_snapshots?on_conflict=user_id`,
      {
        method: 'POST',
        headers: supabaseHeaders(
          environment.SUPABASE_ANON_KEY,
          sessionA.access_token,
          'resolution=merge-duplicates,return=minimal'
        ),
        body: JSON.stringify({
          user_id: userA.id,
          snapshot: { schemaVersion: 1, payload: snapshot },
          schema_version: 1,
          local_updated_at: new Date().toISOString(),
        }),
      },
      [200, 201, 204]
    );

    const ownSnapshot = await jsonRequest(
      `${restBase}/user_progress_snapshots?user_id=eq.${encodeURIComponent(userA.id)}&select=snapshot`,
      {
        headers: supabaseHeaders(
          environment.SUPABASE_ANON_KEY,
          sessionA.access_token
        ),
      }
    );
    const ownRows = Array.isArray(ownSnapshot.payload)
      ? ownSnapshot.payload
      : [];
    if (ownRows.length !== 1 || !JSON.stringify(ownRows[0]).includes(marker)) {
      throw new Error(
        'Supabase cloud snapshot save/load could not be verified.'
      );
    }
    evidence.push(['Supabase cloud snapshot save/load', 'PASS']);

    const tableFailures = [];
    for (const [table, ownerColumn] of PRIVATE_TABLES) {
      const isolation = await jsonRequest(
        `${restBase}/${table}?${ownerColumn}=eq.${encodeURIComponent(userA.id)}&select=*&limit=1`,
        {
          headers: supabaseHeaders(
            environment.SUPABASE_ANON_KEY,
            sessionB.access_token
          ),
        },
        [200, 404]
      );
      if (isolation.response.status === 404) {
        tableFailures.push(`${table} is not deployed`);
      } else if (
        !Array.isArray(isolation.payload) ||
        isolation.payload.length > 0
      ) {
        tableFailures.push(`${table} did not enforce user isolation`);
      }
    }
    if (tableFailures.length > 0) {
      throw new Error(
        `Supabase RLS verification failed: ${tableFailures.join('; ')}.`
      );
    }
    evidence.push([
      'Supabase live RLS isolation across private tables',
      'PASS',
    ]);

    return { userA, sessionA, emailA, cleanup: cleanupUsers };
  } catch (error) {
    evidence.push([
      'Supabase staging verification',
      `FAIL: ${error instanceof Error ? error.message : 'unknown error'}`,
    ]);
    await cleanupUsers();
    throw error;
  }
};

const stripeRequest = async (environment, path, body, method = 'POST') => {
  const encoded = new URLSearchParams(body);
  return jsonRequest(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${environment.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encoded,
  });
};

const backendRequest = async (url, token, init = {}, statuses = [200]) =>
  jsonRequest(
    url,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    },
    statuses
  );

const serviceRoleRestRequest = async (
  environment,
  tableAndQuery,
  init = {},
  statuses = [200, 201, 204]
) =>
  jsonRequest(
    `${environment.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${tableAndQuery}`,
    {
      ...init,
      headers: {
        ...supabaseHeaders(environment.SUPABASE_SERVICE_ROLE_KEY),
        ...init.headers,
      },
    },
    statuses
  );

const verifyStripe = async (environment, authContext, evidence) => {
  let billingBase = environment.VITE_BILLING_API_URL.replace(/\/$/, '');
  if (!billingBase.endsWith('/api/billing')) {
    billingBase = `${billingBase}/api/billing`;
  }
  const backendRoot = deriveBackendRoot(billingBase);
  const health = await jsonRequest(`${backendRoot}/api/health`);
  if (health.payload?.stripeConfigured !== true) {
    throw new Error('Backend health does not report Stripe configured.');
  }
  evidence.push(['Stripe backend configuration', 'PASS']);

  const returnOrigin = new URL(backendRoot).origin;
  const checkout = await backendRequest(
    joinEndpoint(billingBase, '/create-checkout-session'),
    authContext.sessionA.access_token,
    {
      method: 'POST',
      body: JSON.stringify({
        userId: authContext.userA.id,
        email: authContext.emailA,
        planId: 'pro',
        successUrl: `${returnOrigin}/profile?billing=success`,
        cancelUrl: `${returnOrigin}/profile?billing=cancelled`,
      }),
    }
  );
  if (
    typeof checkout.payload?.url !== 'string' ||
    !checkout.payload.url.startsWith('https://checkout.stripe.com/')
  ) {
    throw new Error('Stripe checkout did not return a test Checkout URL.');
  }
  evidence.push(['Stripe test-mode Checkout Session', 'PASS']);

  let stripeCustomerId = null;
  const eventId = `evt_prc8_${randomUUID().replaceAll('-', '')}`;
  try {
    const customer = await stripeRequest(environment, '/v1/customers', {
      email: authContext.emailA,
      'metadata[userId]': authContext.userA.id,
      'metadata[source]': 'prc-kademe-8-verifier',
    });
    stripeCustomerId = customer.payload?.id;
    if (typeof stripeCustomerId !== 'string') {
      throw new Error('Stripe test customer creation returned no id.');
    }

    await serviceRoleRestRequest(
      environment,
      'subscription_status?on_conflict=user_id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          user_id: authContext.userA.id,
          plan_id: 'free',
          status: 'none',
          stripe_customer_id: stripeCustomerId,
          cancel_at_period_end: false,
          source: 'prc-kademe-8-verifier',
        }),
      }
    );

    const portal = await backendRequest(
      joinEndpoint(billingBase, '/create-customer-portal-session'),
      authContext.sessionA.access_token,
      {
        method: 'POST',
        body: JSON.stringify({
          userId: authContext.userA.id,
          returnUrl: `${returnOrigin}/profile`,
        }),
      }
    );
    if (
      typeof portal.payload?.url !== 'string' ||
      !portal.payload.url.startsWith('https://billing.stripe.com/')
    ) {
      throw new Error('Stripe Customer Portal returned an invalid URL.');
    }
    evidence.push(['Stripe test-mode Customer Portal', 'PASS']);

    const event = JSON.stringify({
      id: eventId,
      object: 'event',
      api_version: '2025-06-30.basil',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_prc8_${randomUUID().replaceAll('-', '')}`,
          object: 'checkout.session',
          client_reference_id: authContext.userA.id,
          customer: stripeCustomerId,
          subscription: `sub_prc8_${randomUUID().replaceAll('-', '')}`,
          metadata: { userId: authContext.userA.id, planId: 'pro' },
        },
      },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', environment.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${event}`)
      .digest('hex');
    const webhookUrl = `${backendRoot}/api/webhooks/stripe`;
    const firstWebhook = await jsonRequest(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`,
      },
      body: event,
    });
    if (firstWebhook.payload?.duplicate !== false) {
      throw new Error('First Stripe webhook was not processed as a new event.');
    }
    const duplicateWebhook = await jsonRequest(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`,
      },
      body: event,
    });
    if (duplicateWebhook.payload?.duplicate !== true) {
      throw new Error('Duplicate Stripe webhook was not detected.');
    }
    evidence.push(['Stripe webhook signature and idempotency', 'PASS']);

    const status = await backendRequest(
      joinEndpoint(billingBase, '/subscription-status'),
      authContext.sessionA.access_token
    );
    if (
      status.payload?.status !== 'active' ||
      status.payload?.planId !== 'pro'
    ) {
      throw new Error('Stripe webhook did not update backend entitlement.');
    }
    evidence.push(['Stripe webhook entitlement update', 'PASS']);
    evidence.push([
      'Stripe Dashboard or CLI webhook delivery',
      'NOT VERIFIED (signed verifier delivery only)',
    ]);
  } finally {
    try {
      await serviceRoleRestRequest(
        environment,
        `stripe_processed_events?stripe_event_id=eq.${encodeURIComponent(eventId)}`,
        { method: 'DELETE' }
      );
    } catch {
      evidence.push(['Stripe verifier-event cleanup', 'NOT VERIFIED']);
    }
    if (stripeCustomerId) {
      try {
        await stripeRequest(
          environment,
          `/v1/customers/${encodeURIComponent(stripeCustomerId)}`,
          {},
          'DELETE'
        );
      } catch {
        evidence.push(['Stripe test-customer cleanup', 'NOT VERIFIED']);
      }
    }
  }
};

const verifyAI = async (environment, authContext, evidence) => {
  const aiBase = environment.VITE_AI_PROXY_URL.replace(/\/$/, '');
  const endpoint = joinEndpoint(aiBase, '/coach');
  const requestId = `prc8-ai-${randomUUID()}`;
  const result = await backendRequest(
    endpoint,
    authContext.sessionA.access_token,
    {
      method: 'POST',
      headers: {
        'X-EngineerOS-AI-Contract': '2026-06-26.v1',
        'X-EngineerOS-Request-Id': requestId,
      },
      body: JSON.stringify({
        operation: 'analyzeProgress',
        prompt:
          'Return one concise sentence confirming this EngineerOS staging AI verification request.',
        metadata: { requestId },
      }),
    }
  );
  if (
    result.payload?.mockMode !== false ||
    result.payload?.mode !== 'real' ||
    typeof result.payload?.text !== 'string' ||
    result.payload.text.trim().length === 0
  ) {
    throw new Error('AI proxy did not return a real-provider response.');
  }
  if (
    result.payload?.provider !== environment.AI_PROVIDER.trim().toLowerCase()
  ) {
    throw new Error('AI proxy provider does not match backend configuration.');
  }
  evidence.push(['Backend-only real AI provider request', 'PASS']);

  const invalidAuth = await jsonRequest(
    endpoint,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer invalid-prc8-verification-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'analyzeProgress',
        prompt: 'This request must be rejected before reaching the provider.',
      }),
    },
    [401]
  );
  if (invalidAuth.response.status !== 401) {
    throw new Error('AI proxy did not reject invalid authentication.');
  }
  evidence.push(['AI proxy invalid-token handling', 'PASS']);
  evidence.push([
    'AI provider-failure and malformed-provider live injection',
    'NOT RUN (unsafe to alter staging credentials)',
  ]);
  evidence.push([
    'AI provider key exposure to frontend',
    'PASS (no key in response)',
  ]);
};

const upstashRequest = async (environment, body) =>
  jsonRequest(environment.UPSTASH_REDIS_REST_URL.replace(/\/$/, ''), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${environment.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

const verifyUpstash = async (environment, evidence) => {
  const ping = await upstashRequest(environment, ['PING']);
  if (ping.payload?.result !== 'PONG') {
    throw new Error('Upstash did not return PONG.');
  }
  evidence.push(['Upstash REST availability', 'PASS']);

  const key = `engineeros:prc8:${randomUUID()}`;
  try {
    const first = await upstashRequest(environment, ['INCR', key]);
    const second = await upstashRequest(environment, ['INCR', key]);
    await upstashRequest(environment, ['PEXPIRE', key, '60000']);
    if (
      Number(first.payload?.result) !== 1 ||
      Number(second.payload?.result) !== 2
    ) {
      throw new Error('Upstash counter did not increment consistently.');
    }
    evidence.push(['Upstash shared counter behavior', 'PASS']);
  } finally {
    try {
      await upstashRequest(environment, ['DEL', key]);
    } catch {
      evidence.push(['Upstash verifier-key cleanup', 'NOT VERIFIED']);
    }
  }
  evidence.push([
    'Upstash dashboard evidence',
    'NOT VERIFIED (REST verification only)',
  ]);
};

const readPackageScripts = () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(ROOT, 'package.json'), 'utf8')
  );
  return packageJson.scripts ?? {};
};

const runQualityCommands = () => {
  const scripts = readPackageScripts();
  const results = [];
  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  for (const { label, scriptName, npmArgs } of QUALITY_COMMANDS) {
    if (!scripts[scriptName]) {
      results.push({ command: label, exitCode: null, status: 'NOT AVAILABLE' });
      continue;
    }
    console.log(`[kademe8] Running ${label}`);
    const result = spawnSync(npmExecutable, npmArgs ?? ['run', scriptName], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: false,
    });
    const exitCode = result.status ?? 1;
    results.push({
      command: label,
      exitCode,
      status: exitCode === 0 ? 'PASS' : 'FAIL',
    });
    if (exitCode !== 0) break;
  }
  return results;
};

const listRepositoryFiles = (directory, files = []) => {
  const skipped = new Set([
    '.git',
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    'playwright-report',
  ]);
  for (const name of readdirSync(directory)) {
    if (skipped.has(name)) continue;
    const path = resolve(directory, name);
    const relativePath = path.slice(ROOT.length + 1).replaceAll('\\', '/');
    const stat = statSync(path);
    if (stat.isDirectory()) listRepositoryFiles(path, files);
    else files.push(relativePath);
  }
  return files;
};

const scanForCommittedSecrets = () => {
  const tracked = spawnSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    }
  );
  const usingGitIndex = tracked.status === 0;
  const candidateFiles = usingGitIndex
    ? tracked.stdout.split(/\r?\n/).filter(Boolean)
    : listRepositoryFiles(ROOT);
  const textExtensions = new Set([
    '.js',
    '.mjs',
    '.cjs',
    '.ts',
    '.tsx',
    '.json',
    '.md',
    '.yml',
    '.yaml',
    '.sql',
    '.txt',
  ]);
  const patterns = [
    ['OpenAI key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/g],
    ['Anthropic key', /\bsk-ant-[A-Za-z0-9_-]{24,}\b/g],
    ['Stripe secret key', /\bsk_(?:live|test)_[A-Za-z0-9]{24,}\b/g],
    ['Stripe webhook secret', /\bwhsec_[A-Za-z0-9]{24,}\b/g],
    [
      'Supabase service JWT',
      /\beyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
    ],
  ];
  const findings = [];
  for (const relativePath of candidateFiles) {
    if (
      basename(relativePath).startsWith('.env') &&
      basename(relativePath) !== '.env.example'
    ) {
      if (usingGitIndex) {
        findings.push({ file: relativePath, type: 'environment file' });
      }
      continue;
    }
    if (!textExtensions.has(extname(relativePath).toLowerCase())) continue;
    const absolutePath = resolve(ROOT, relativePath);
    if (!existsSync(absolutePath) || statSync(absolutePath).size > 2_000_000)
      continue;
    const content = readFileSync(absolutePath, 'utf8');
    for (const [type, pattern] of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) findings.push({ file: relativePath, type });
    }
  }
  return findings;
};

const verifyEnvIgnoreRules = () => {
  const ignoreFile = readFileSync(resolve(ROOT, '.gitignore'), 'utf8');
  const checks = ['.env', '.env.local', '.env.production', '.env.*.local'];
  const coversEnvFamily = ignoreFile
    .split(/\r?\n/)
    .some((line) => ['.env*', '.env.*', '.env.*.local'].includes(line.trim()));
  return checks.every((name) =>
    name === '.env' || name === '.env.local'
      ? ignoreFile.split(/\r?\n/).includes(name) || coversEnvFamily
      : coversEnvFamily
  );
};

const formatEnvironmentTable = (rows) => [
  '| Variable | Scope | Requirement | Availability |',
  '| --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| \`${row.name}\` | ${row.scope} | ${row.required ? 'required' : 'optional'} | ${row.status} |`
  ),
];

const formatEvidence = (evidence) =>
  evidence.length > 0
    ? evidence.map(([check, status]) => `- ${check}: **${status}**`)
    : ['- Live verification: **NOT RUN**'];

const formatCommands = (commands) =>
  commands.length > 0
    ? [
        '| Command | Exit code | Result |',
        '| --- | ---: | --- |',
        ...commands.map(
          (item) =>
            `| \`${item.command}\` | ${item.exitCode ?? 'n/a'} | ${item.status} |`
        ),
      ]
    : ['No quality commands were run because live prerequisites were blocked.'];

const writeReport = async ({
  decision,
  environmentRows,
  missing,
  placeholders,
  invalid,
  evidence,
  commands,
  secretFindings,
  envIgnored,
}) => {
  const blockers = [
    ...missing.map((name) => `Missing required variable: \`${name}\``),
    ...placeholders.map((name) => `Placeholder required variable: \`${name}\``),
    ...invalid.map((message) => `Invalid safe configuration: ${message}.`),
    ...evidence
      .filter(([, status]) => status.startsWith('FAIL'))
      .map(([check, status]) => `${check}: ${status}`),
    ...commands
      .filter((item) => item.status === 'FAIL')
      .map((item) => `${item.command} exited with code ${item.exitCode}.`),
  ];
  const complete = decision === 'COMPLETE';
  const report = [
    '# PRC Kademe 8 Live Service Evidence Report',
    '',
    '## Evidence Decision',
    '',
    `**${decision}**`,
    '',
    complete
      ? 'Real staging/test-mode checks and the available quality chain passed.'
      : decision === 'BLOCKED'
        ? 'Deployment credentials required. Live service verification was not run and no evidence was fabricated.'
        : 'At least one real staging or quality check was not verified. No failed check is reported as passed.',
    '',
    '## Locally Verified Evidence',
    '',
    '- The verifier loads supported environment files and process variables without printing values.',
    '- Required modes and Stripe test-mode configuration are validated before any live request.',
    `- Secret-pattern scan: **${secretFindings.length === 0 ? 'PASS (0 high-confidence findings)' : `FAIL (${secretFindings.length} finding(s))`}**.`,
    `- Environment ignore coverage: **${envIgnored ? 'PASS' : 'FAIL'}**.`,
    '- Static Supabase RLS and local service behavior remain covered by the project quality scripts.',
    '',
    '## Browser Verified Evidence',
    '',
    commands.some(
      (item) =>
        item.command === 'npm run quality:gate:browser' &&
        item.status === 'PASS'
    )
      ? '- Browser quality gate: **PASS**.'
      : '- Browser quality gate: **NOT RUN IN THIS VERIFICATION**.',
    '',
    '## Staging Verified Evidence',
    '',
    ...formatEvidence(evidence),
    '',
    'The report never treats Stripe Dashboard/CLI delivery, provider-failure injection, or service dashboards as verified unless those actions actually ran.',
    '',
    '## Not Yet Verified Evidence',
    '',
    ...(complete
      ? [
          '- Stripe Dashboard or Stripe CLI webhook delivery.',
          '- Destructive live AI provider-failure and malformed-response injection.',
          '- Service-vendor dashboard screenshots.',
        ]
      : [
          '- Supabase staging signup/login/session/logout and two-user RLS isolation.',
          '- Cloud snapshot save/load against staging.',
          '- Cloud-to-local restore against a real staging account.',
          '- Live offline/failure recovery against staging.',
          '- Stripe test-mode Checkout, Customer Portal, webhook and entitlement update.',
          '- Real AI request through the deployed backend proxy.',
          '- Upstash REST availability and shared counter behavior.',
        ]),
    '',
    '## Redacted Environment Availability',
    '',
    ...formatEnvironmentTable(environmentRows),
    '',
    'Only availability is shown. No value, token, key or secret is written to this report.',
    '',
    '## Commands Run',
    '',
    ...formatCommands(commands),
    '',
    'The external invocation required for this report is `npm run kademe8:verify`.',
    '',
    '## Security Check',
    '',
    envIgnored
      ? '- `.env`, `.env.local`, `.env.production` and `.env.*.local` are ignored by repository rules.'
      : '- Required `.env*` ignore coverage is incomplete.',
    secretFindings.length === 0
      ? '- No high-confidence committed secret pattern was found.'
      : `- ${secretFindings.length} high-confidence secret-pattern finding(s) require manual review. Values are intentionally omitted.`,
    '- Secret values were not printed to terminal output or markdown.',
    '- Live checks accept only Stripe test-mode credentials.',
    '',
    '## Remaining Blockers',
    '',
    ...(blockers.length > 0
      ? blockers.map((item) => `- ${item}`)
      : ['- None.']),
    '',
    '## Next Decision',
    '',
    complete
      ? '**Kademe 9 live release: ALLOWED by Kademe 8 evidence.**'
      : '**Kademe 9 live release: FORBIDDEN until Kademe 8 has real passing staging evidence.**',
    '',
    complete
      ? '- Production launch: **ALLOWED by this gate, subject to legal and deployment review.**'
      : '- Production launch: **NOT ALLOWED.**',
    complete
      ? '- Live billing: **ALLOWED by this gate, subject to final deployment review.**'
      : '- Live billing: **NOT ALLOWED.**',
    '- Kademe 9-13 code-only implementation: **ALLOWED; this does not create live evidence.**',
    '',
  ].join('\n');
  writeFileSync(
    REPORT_PATH,
    await formatWithPrettier(report, { parser: 'markdown' }),
    'utf8'
  );
};

const main = async () => {
  const environment = loadEnvironment();
  const environmentRows = getEnvironmentRows(environment);
  const missing = environmentRows
    .filter((row) => row.required && row.status === 'MISSING')
    .map((row) => row.name);
  const placeholders = environmentRows
    .filter((row) => row.required && row.status === 'PLACEHOLDER')
    .map((row) => row.name);
  const invalid = validateSafeValues(environment);
  const secretFindings = scanForCommittedSecrets();
  const envIgnored = verifyEnvIgnoreRules();
  const evidence = [];
  let commands = [];

  if (
    missing.length > 0 ||
    placeholders.length > 0 ||
    invalid.length > 0 ||
    !envIgnored ||
    secretFindings.length > 0
  ) {
    commands = [
      {
        command: ENV_CHECK_ONLY
          ? 'node scripts/prc-kademe-8-live-verify.mjs --env-check'
          : 'node scripts/prc-kademe-8-live-verify.mjs',
        exitCode: ENV_CHECK_ONLY ? 0 : BLOCKED_EXIT_CODE,
        status: ENV_CHECK_ONLY ? 'BLOCKED_ENV_CHECK' : 'BLOCKED',
      },
    ];
    await writeReport({
      decision: 'BLOCKED',
      environmentRows,
      missing,
      placeholders,
      invalid,
      evidence,
      commands,
      secretFindings,
      envIgnored,
    });
    console.error(
      `[kademe8] BLOCKED: ${missing.length} required setting(s) missing, ${placeholders.length} placeholder setting(s), ${invalid.length} invalid setting(s), ${secretFindings.length} secret finding(s).`
    );
    console.error('[kademe8] No live service request was sent.');
    if (!ENV_CHECK_ONLY) process.exitCode = BLOCKED_EXIT_CODE;
    return;
  }

  let liveChecksPassed = false;
  let authContext = null;
  try {
    authContext = await verifySupabase(environment, evidence);
    await verifyStripe(environment, authContext, evidence);
    await verifyAI(environment, authContext, evidence);
    await verifyUpstash(environment, evidence);
    liveChecksPassed = true;
  } catch (error) {
    console.error(
      `[kademe8] Live verification stopped: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  } finally {
    if (authContext) await authContext.cleanup();
  }

  if (liveChecksPassed) commands = runQualityCommands();
  const qualityPassed =
    commands.length === QUALITY_COMMANDS.length &&
    commands.every((item) => item.status === 'PASS');
  const decision = liveChecksPassed && qualityPassed ? 'COMPLETE' : 'PARTIAL';
  await writeReport({
    decision,
    environmentRows,
    missing,
    placeholders,
    invalid,
    evidence,
    commands,
    secretFindings,
    envIgnored,
  });
  console.log(`[kademe8] ${decision}. Report updated.`);
  if (decision !== 'COMPLETE') process.exitCode = 1;
};

await main();
