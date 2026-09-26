/**
 * Every environment variable the backend reads has to be a decision, not an omission.
 *
 * `render.yaml` described less of the service than the service used: `BILLING_PROVIDER`,
 * `RATE_LIMIT_STORE`, the Upstash pair, `METRICS_TOKEN`, the Dodo webhook signing secret and
 * every Dodo product id were missing. None of those absences is visible in a green
 * `/api/health` — the code has a default for each of them — and the deployed service was
 * configured by hand, so the file and the running service disagreed in both directions:
 *
 *   - `RATE_LIMIT_STORE` — production defaults to `upstash` and `validateRateLimitStore`
 *     *throws* when Upstash is not configured, so a service provisioned from this file alone
 *     never finishes starting.
 *   - `BILLING_PROVIDER` — defaults to `stripe`, a provider this deployment does not sell;
 *     `/api/webhooks/dodo` would answer 404 while the live service answers `dodo`.
 *   - `DODO_PAYMENTS_WEBHOOK_KEY` — missing means `processWebhook` refuses every delivery
 *     with 503 `dodo_webhook_not_configured`: the customer is charged and the plan never
 *     activates. Checkout still succeeds, so nothing looks broken from the outside.
 *   - `FIREBASE_SERVICE_ACCOUNT_KEY` — declared here, read by nothing. It asked an operator
 *     for a private key that no code path touches, while the six variables that matter were
 *     absent; a blueprint that overstates its requirements is as misleading as one that
 *     understates them.
 *
 * So this check holds both directions: every variable `backend/src` reads is either declared
 * in `render.yaml` or listed below with the reason it is not, and every variable declared in
 * `render.yaml` is actually read. It parses the blueprint with a strict reader instead of a
 * YAML library — the file is one service with a list of `key`/`value`/`sync` triples, and a
 * shape this reader does not understand is a failure rather than a silent pass.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const BLUEPRINT = resolve('render.yaml');
const BACKEND_SRC = resolve('backend/src');

/** The ways a variable is read: `env.X` / `environment.X` / `process.env.X` / `env['X']`. */
const READ_PATTERNS = [
  /\b(?:process\.env|import\.meta\.env|environment|env)\s*\.\s*([A-Z][A-Z0-9_]*)/g,
  /\b(?:process\.env|import\.meta\.env|environment|env)\s*\[\s*['"]([A-Z][A-Z0-9_]*)['"]\s*\]/g,
];

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() && path.endsWith('.ts') ? [path] : [];
  });

const readEnvVars = () => {
  const found = new Map();
  for (const file of walk(BACKEND_SRC)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of READ_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const name = match[1];
          if (!found.has(name)) {
            const location = relative(process.cwd(), file).replace(/\\/g, '/');
            found.set(name, `${location}:${index + 1}`);
          }
        }
      }
    });
  }
  return found;
};

const FAILURE_PREFIX = 'FAILURE';

const failStructure = (message) => {
  console.error(`${FAILURE_PREFIX} render.yaml: ${message}`);
  console.error(
    'This guard reads a single service with an `envVars:` list of `key`/`value`/`sync` entries. ' +
      'Extend scripts/check-render-env.mjs before changing the shape of the file.'
  );
  process.exit(2);
};

const unquote = (raw) => {
  const value = raw.trim();
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

/**
 * Reads the `envVars:` entries in order: `- key: NAME` opens an entry, and `value:` / `sync:`
 * fill it in until the next entry. Anything list-shaped without a `key` is a shape this
 * reader does not know, so it stops instead of guessing.
 */
const parseBlueprint = (text) => {
  const entries = [];
  let current = null;
  let envVarBlocks = 0;
  // Service-level keys (`- type: web`, commit filters, …) sit before the `envVars:` list and
  // are outside this reader's concern; only entries inside that list have to be shaped like a
  // variable.
  let insideEnvVars = false;

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    if (raw.trim() === '' || /^\s*#/.test(raw)) return;
    if (/^\s*envVars:\s*$/.test(raw)) {
      envVarBlocks += 1;
      insideEnvVars = true;
      return;
    }
    const keyMatch = raw.match(/^\s*-\s+key:\s*(.+?)\s*$/);
    if (keyMatch) {
      current = { key: unquote(keyMatch[1]), line, value: undefined, sync: undefined };
      if (!/^[A-Z][A-Z0-9_]*$/.test(current.key)) {
        failStructure(`line ${line} declares a key that is not an env var name: ${current.key}`);
      }
      entries.push(current);
      return;
    }
    const attrMatch = raw.match(/^\s+(value|sync)\s*:\s*(.*?)\s*$/);
    if (attrMatch && current) {
      const [, attribute, rawValue] = attrMatch;
      if (attribute === 'sync') {
        if (!['true', 'false'].includes(unquote(rawValue))) {
          failStructure(`line ${line} has sync: ${rawValue}, which is neither true nor false`);
        }
        // Render reads `sync: false` as "this value is not in the file" — the dashboard owns
        // it. `sync` defaults to true, so anything else means the blueprint carries a value.
        current.sync = unquote(rawValue) !== 'false';
        return;
      }
      current.value = unquote(rawValue);
      return;
    }
    if (insideEnvVars && /^\s*-\s+/.test(raw)) {
      failStructure(`line ${line} is a list entry with no key: ${raw.trim()}`);
    }
  });

  if (envVarBlocks !== 1) {
    failStructure(`found ${envVarBlocks} envVars blocks; this reader expects exactly one`);
  }
  return entries;
};

/**
 * A literal value is fine for a URL, a bucket name or an account id, and never for a secret:
 * a signing key committed here is a key in every clone and in every CI log that prints the
 * file. Those values belong in the Render dashboard (`sync: false`), which is also where the
 * guard stops an operator from having to invent one.
 */
const looksLikeASecret = (name) => /(SECRET|TOKEN|PASSWORD|DSN|API_KEY|(^|_)KEY$)/.test(name);

/**
 * Variables the backend reads that deliberately do not appear in the blueprint. Each group
 * carries the reason instead of a bare name, so the next person can disagree with the reason
 * rather than guess at it.
 */
const NOT_DECLARED = [
  {
    reason: 'Render provides these itself; declaring them would create a second source of truth.',
    names: ['RENDER_EXTERNAL_URL'],
  },
  {
    reason:
      'Read only when BILLING_PROVIDER selects Stripe, which this deployment does not sell. Declare the group in the same change that switches the provider.',
    names: [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRICE_JUNIOR_MONTHLY',
      'STRIPE_PRICE_JUNIOR_ANNUAL',
      'STRIPE_PRICE_SENIOR_MONTHLY',
      'STRIPE_PRICE_SENIOR_ANNUAL',
      'STRIPE_PRICE_SPECIALIST_MONTHLY',
      'STRIPE_PRICE_SPECIALIST_ANNUAL',
      'STRIPE_PRICE_MASTER_MONTHLY',
      'STRIPE_PRICE_MASTER_ANNUAL',
      'STRIPE_PRICE_TEAM_MONTHLY',
      'STRIPE_PRICE_TEAM_ANNUAL',
      'STRIPE_EVENT_CACHE_TTL_MS',
      'STRIPE_EVENT_CACHE_MAX',
    ],
  },
  {
    reason:
      'A feature that stays switched off until it is configured, and the service runs without it: internal service auth, local Supabase JWT verification, and the vocabulary translation fallbacks.',
    names: [
      'ENGINEEROS_INTERNAL_API_SECRET',
      'ENGINEEROS_INTERNAL_SERVICE_ID',
      'ENGINEEROS_INTERNAL_SERVICE_EMAIL',
      'ENGINEEROS_INTERNAL_SERVICE_ROLE',
      'SUPABASE_JWT_SECRET',
      'SUPABASE_JWT_ISSUER',
      'SUPABASE_JWT_AUDIENCE',
      'LIBRETRANSLATE_URL',
      'LIBRETRANSLATE_API_KEY',
      'MYMEMORY_ENABLED',
    ],
  },
  {
    reason:
      'Escape hatches for local development. Setting one on the deployed service would switch off a production safety check, so the blueprint must not offer them.',
    names: [
      'ALLOW_INSECURE_DEV_AUTH',
      'ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION',
      'ALLOW_MEMORY_BILLING_REPOSITORY',
    ],
  },
  {
    reason:
      'Tuning knobs whose code default is the intended value; set one in the dashboard only while diagnosing something specific.',
    names: [
      'APP_VERSION',
      'APP_URL',
      'LOG_LEVEL',
      'AI_LEDGER_FILE',
      'AI_TIMEOUT_MS',
      'AI_RATE_LIMIT_WINDOW_MS',
      'AI_RATE_LIMIT_MAX',
      'RATE_LIMIT_WINDOW_MS',
      'RATE_LIMIT_MAX',
      'RATE_LIMIT_STORE_TIMEOUT_MS',
      'VOCABULARY_LOOKUP_TIMEOUT_MS',
      'VOCABULARY_LOOKUP_RATE_LIMIT_MAX',
      'DODO_EVENT_CACHE_TTL_MS',
      'DODO_EVENT_CACHE_MAX',
    ],
  },
];

const readVariables = readEnvVars();
const declared = parseBlueprint(readFileSync(BLUEPRINT, 'utf8'));
const declaredNames = new Set();

const failures = [];

for (const entry of declared) {
  if (declaredNames.has(entry.key)) {
    failures.push(`render.yaml declares ${entry.key} twice (line ${entry.line})`);
    continue;
  }
  declaredNames.add(entry.key);

  if (!readVariables.has(entry.key)) {
    failures.push(
      `render.yaml declares ${entry.key} (line ${entry.line}), but nothing under backend/src reads it — ` +
        'a value set for it in the dashboard has no effect, and it asks an operator for a secret no code path uses'
    );
    continue;
  }
  if (looksLikeASecret(entry.key) && entry.value !== undefined) {
    failures.push(
      `render.yaml gives ${entry.key} a literal value (line ${entry.line}); use \`sync: false\` so the secret stays in the Render dashboard`
    );
  }
  if (entry.value === '') {
    failures.push(
      `render.yaml declares an empty string for ${entry.key} (line ${entry.line}); omit \`value\` or set it to the real value`
    );
  }
  if (entry.sync !== false && entry.value === undefined) {
    failures.push(
      `render.yaml declares ${entry.key} (line ${entry.line}) with neither a value nor \`sync: false\`, so a new service would carry an empty one`
    );
  }
}

const explained = new Set();
for (const group of NOT_DECLARED) {
  for (const name of group.names) {
    if (explained.has(name)) {
      failures.push(`${name} is listed twice in scripts/check-render-env.mjs`);
      continue;
    }
    explained.add(name);
    if (!readVariables.has(name)) {
      failures.push(
        `${name} is listed here as not needing a blueprint entry, but nothing under backend/src reads it any more — drop it from the list`
      );
      continue;
    }
    if (declaredNames.has(name)) {
      failures.push(
        `${name} is declared in render.yaml and also listed here as deliberately absent; keep one of the two`
      );
    }
  }
}

for (const [name, location] of readVariables) {
  if (declaredNames.has(name) || explained.has(name)) continue;
  failures.push(
    `${name} is read at ${location}, but render.yaml does not declare it and scripts/check-render-env.mjs does not explain its absence — a service provisioned from the blueprint would not have it`
  );
}

const secretCount = declared.filter((entry) => looksLikeASecret(entry.key)).length;
const literalCount = declared.filter(
  (entry) => entry.value !== undefined && entry.value !== ''
).length;

if (failures.length > 0) {
  console.error('\nFAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `PASS render.yaml declares ${declared.length} of the ${readVariables.size} variables backend/src reads ` +
    `(${literalCount} literals, ${secretCount} of them secrets resolved from the dashboard).`
);
const explainedCount = NOT_DECLARED.reduce((total, group) => total + group.names.length, 0);
for (const group of NOT_DECLARED) {
  console.log(`PASS ${group.names.length} variables stay out of the blueprint: ${group.reason}`);
}
console.log(
  `PASS every declared variable is read by the backend, and every unset one is explained (${explainedCount} of ${readVariables.size - declared.length}).`
);
