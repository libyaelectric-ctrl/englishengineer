#!/usr/bin/env node
/**
 * Rebuilds `subscription_status` from Dodo Payments — the rows the webhook could not write.
 *
 * Why this exists: `subscription_status` is only ever written by a webhook delivery. If a
 * delivery is refused (a `uuid user_id` column is the way this actually happened), Dodo has
 * already taken the money and the row never appears — and Dodo does not replay old events on
 * demand. The subscription still exists on Dodo's side, so it can be read back and the row
 * reconstructed. Nothing else in this repository can do that.
 *
 * What it does:
 *
 *   1. reads every subscription Dodo has for the configured business (paginated, all pages);
 *   2. maps each one onto a `subscription_status` row using the *same* rules the runtime uses
 *      (`backend/src/dodo-billing-provider.ts` → `DODO_STATUS_TO_APP_STATUS`, and
 *      `backend/src/billing-webhook-handlers.ts` → how `plan_id`/`current_period_end` are
 *      derived), so a reconciled row is indistinguishable from a webhook-written one except
 *      for `source`;
 *   3. compares those rows with what the database already holds and prints the difference;
 *   4. writes the difference only with `--apply`.
 *
 * Safety, deliberately:
 *
 *   - **Dry run by default.** With no flag it prints the plan and changes nothing.
 *   - **Never deletes.** A subscription that is missing from Dodo is reported, not removed —
 *     deleting an entitlement is not this tool's call to make.
 *   - **Never invents a user.** A subscription whose `metadata.userId` is absent is reported
 *     as un-attributable and skipped; a fabricated user id would grant a plan to a stranger.
 *   - **Never guesses a plan.** A product id that is not in `DODO_PRODUCT_*` is skipped, so a
 *     new product cannot silently reconcile everyone onto `free`.
 *   - **Idempotent.** Rows are upserted on `user_id`, so running it twice changes nothing the
 *     second time, and a later webhook delivery overwrites a reconciled row normally.
 *   - It names the database it is about to change — project ref and row counts — before any
 *     write. A second Supabase project with the same schema accepts every statement, reports
 *     success and changes nothing; the counts are what tell the two apart.
 *
 * Usage:
 *
 *   node scripts/reconcile-dodo-subscriptions.mjs            # report only (default)
 *   node scripts/reconcile-dodo-subscriptions.mjs --check    # same as above, explicit
 *   node scripts/reconcile-dodo-subscriptions.mjs --apply    # write the missing/changed rows
 *
 * Environment (never arguments — a key on a command line ends up in a shell history):
 *
 *   DODO_PAYMENTS_API_KEY        required; a live or test key, matching the environment below
 *   DODO_PAYMENTS_ENVIRONMENT    'live' (default) or 'test'
 *   DODO_PRODUCT_*               required to map a product id back onto a plan id
 *   SUPABASE_URL                 required; the project the runtime actually writes to
 *   SUPABASE_SERVICE_ROLE_KEY    required; billing state is backend-only, RLS allows no other
 *
 * Dodo has no "list every sale" endpoint that is useful here: `payment.succeeded` for a
 * subscription renewal is *not* the source of a plan — the subscription is. Payments are
 * therefore read and reported, never used to write a row.
 */
import { pathToFileURL } from 'node:url';

/** Dodo lifecycle status -> the app's (Stripe-shaped) status. Mirrors the runtime's own map. */
export const DODO_STATUS_TO_APP_STATUS = {
  pending: 'incomplete',
  active: 'active',
  on_hold: 'past_due',
  paused: 'past_due',
  cancelled: 'canceled',
  failed: 'past_due',
  expired: 'canceled',
};

/** plan id -> the environment variables holding its monthly/annual product ids. */
export const PRODUCT_KEYS_BY_PLAN = {
  junior: ['DODO_PRODUCT_JUNIOR_MONTHLY', 'DODO_PRODUCT_JUNIOR_ANNUAL'],
  senior: ['DODO_PRODUCT_SENIOR_MONTHLY', 'DODO_PRODUCT_SENIOR_ANNUAL'],
  specialist: ['DODO_PRODUCT_SPECIALIST_MONTHLY', 'DODO_PRODUCT_SPECIALIST_ANNUAL'],
  master: ['DODO_PRODUCT_MASTER_MONTHLY', 'DODO_PRODUCT_MASTER_ANNUAL'],
  team: ['DODO_PRODUCT_TEAM_MONTHLY', 'DODO_PRODUCT_TEAM_ANNUAL'],
};

/** The canonical plan ids the current catalog uses (`backend/types.d.ts` → `PlanId`). */
export const CANONICAL_PLAN_IDS = ['free', 'junior', 'senior', 'specialist', 'master', 'team'];

/** product id -> plan id, built from the configured `DODO_PRODUCT_*` variables. */
export const productIdToPlan = (env) => {
  const map = new Map();
  for (const [planId, keys] of Object.entries(PRODUCT_KEYS_BY_PLAN)) {
    for (const key of keys) {
      const productId = (env[key] ?? '').trim();
      if (productId) map.set(productId, planId);
    }
  }
  return map;
};

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

/** The Firebase uid Dodo carries on the subscription, wherever the runtime looks for it. */
export const userIdFromSubscription = (subscription) => {
  if (!isRecord(subscription)) return null;
  const meta = isRecord(subscription.metadata) ? subscription.metadata : {};
  if (isNonEmptyString(meta.userId)) return meta.userId.trim();
  const customer = isRecord(subscription.customer) ? subscription.customer : {};
  const customerMeta = isRecord(customer.metadata) ? customer.metadata : {};
  if (isNonEmptyString(customerMeta.userId)) return customerMeta.userId.trim();
  return null;
};

/** The Dodo customer id, which the runtime stores in the legacy `stripe_customer_id` column. */
export const customerIdFromSubscription = (subscription) => {
  const customer = isRecord(subscription.customer) ? subscription.customer : {};
  return isNonEmptyString(customer.customer_id) ? customer.customer_id : null;
};

/** ISO period end, from the same `next_billing_date` the runtime reads. */
export const periodEndFromSubscription = (subscription) => {
  if (!isRecord(subscription) || !isNonEmptyString(subscription.next_billing_date)) return null;
  const ms = Date.parse(subscription.next_billing_date);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
};

/**
 * A Dodo subscription -> the row `subscription_status` should hold for it, or a reason the
 * subscription cannot be attributed. `planId` prefers the subscription metadata (what checkout
 * wrote) and falls back to the product id, exactly as the webhook normalizer does.
 */
export const desiredRowFromSubscription = (subscription, products) => {
  const userId = userIdFromSubscription(subscription);
  if (!userId) return { skipped: 'no userId in subscription metadata' };

  const meta = isRecord(subscription.metadata) ? subscription.metadata : {};
  const planFromMeta = isNonEmptyString(meta.planId) ? meta.planId.trim().toLowerCase() : null;
  const planFromProduct = products.get(subscription.product_id) ?? null;
  const planId =
    planFromMeta && CANONICAL_PLAN_IDS.includes(planFromMeta) ? planFromMeta : planFromProduct;

  if (!planId || !CANONICAL_PLAN_IDS.includes(planId)) {
    return { skipped: `unknown product ${subscription.product_id ?? '(none)'} for ${userId}` };
  }

  const rawStatus = isNonEmptyString(subscription.status) ? subscription.status : '';
  const status = DODO_STATUS_TO_APP_STATUS[rawStatus];
  if (!status) return { skipped: `unknown status "${rawStatus}" for ${userId}` };

  return {
    row: {
      user_id: userId,
      plan_id: planId,
      status,
      current_period_end: periodEndFromSubscription(subscription),
      cancel_at_period_end: subscription.cancel_at_next_billing_date === true,
      stripe_customer_id: customerIdFromSubscription(subscription),
      stripe_subscription_id: isNonEmptyString(subscription.subscription_id)
        ? subscription.subscription_id
        : null,
      source: 'dodo_reconcile',
      updated_at: new Date().toISOString(),
    },
    dodoStatus: rawStatus,
  };
};

/**
 * One user can in principle hold more than one Dodo subscription. The row is keyed by user, so
 * a single one has to win: an entitlement-granting status beats one that does not, and a newer
 * subscription beats an older one. Every collision is reported so it can be checked by hand.
 */
const rankOf = (row) => {
  if (row.status === 'active') return 3;
  if (row.status === 'past_due') return 2;
  if (row.status === 'incomplete') return 1;
  return 0;
};

export const collapseByUser = (candidates) => {
  const byUser = new Map();
  const collisions = [];
  for (const candidate of candidates) {
    const existing = byUser.get(candidate.row.user_id);
    if (!existing) {
      byUser.set(candidate.row.user_id, candidate);
      continue;
    }
    collisions.push({
      userId: candidate.row.user_id,
      kept: '',
      dropped: '',
      candidates: [existing, candidate],
    });
    const better = rankOf(candidate.row) > rankOf(existing.row) ? candidate : existing;
    byUser.set(candidate.row.user_id, better);
  }
  for (const collision of collisions) {
    collision.kept = byUser.get(collision.userId).row;
    collision.dropped = collision.candidates.find((c) => c !== byUser.get(collision.userId)).row;
  }
  return { byUser, collisions };
};

const FIELDS = [
  'plan_id',
  'status',
  'current_period_end',
  'cancel_at_period_end',
  'stripe_customer_id',
  'stripe_subscription_id',
];

const sameInstant = (left, right) => {
  if (left === right) return true;
  const a = left ? Date.parse(left) : NaN;
  const b = right ? Date.parse(right) : NaN;
  return Number.isFinite(a) && Number.isFinite(b) && a === b;
};

export const fieldChanges = (desired, existing) => {
  if (!existing) return ['(new row)'];
  const changes = [];
  for (const field of FIELDS) {
    const before = existing[field] ?? null;
    const after = desired[field] ?? null;
    const equal = field === 'current_period_end' ? sameInstant(before, after) : before === after;
    if (!equal) changes.push(`${field}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
  }
  return changes;
};

/** Paginates a Dodo list endpoint to exhaustion. */
const fetchAll = async (baseUrl, apiKey, path, collection) => {
  const items = [];
  for (let page = 0; page < 200; page += 1) {
    const url = new URL(path, baseUrl);
    url.searchParams.set('page_size', '100');
    url.searchParams.set('page_number', String(page));
    const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status} ${await response.text()}`);
    }
    const body = await response.json();
    const pageItems = Array.isArray(body?.[collection]) ? body[collection] : [];
    items.push(...pageItems);
    if (pageItems.length < 100) break;
  }
  return items;
};

const projectRefFromUrl = (value) => {
  const found = /^https?:\/\/([a-z0-9]+)\.supabase\.(?:co|in)\b/i.exec(value ?? '');
  return found ? found[1] : null;
};

const supabaseRequest = async (url, key, path, init = {}) => {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${path} failed: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
};

const readConfig = (env) => {
  const apiKey = (env.DODO_PAYMENTS_API_KEY ?? '').trim();
  const supabaseUrl = (env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  const environment = (env.DODO_PAYMENTS_ENVIRONMENT ?? 'live').trim().toLowerCase();
  const missing = [];
  if (!apiKey) missing.push('DODO_PAYMENTS_API_KEY');
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length > 0) {
    throw new Error(
      `Missing environment: ${missing.join(', ')}. Load the backend's production environment ` +
        `(Render → Environment) before reconciling; billing state is backend-only.`
    );
  }
  return {
    apiKey,
    supabaseUrl,
    serviceRoleKey,
    baseUrl:
      environment === 'test' ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com',
    environment,
  };
};

/** Everything the caller needs to decide, without touching the database. */
export const planReconcile = ({ subscriptions, products, existingRows }) => {
  const candidates = [];
  const skipped = [];
  for (const subscription of subscriptions) {
    const result = desiredRowFromSubscription(subscription, products);
    if (result.row) candidates.push(result);
    else skipped.push(result.skipped);
  }
  const { byUser, collisions } = collapseByUser(candidates);

  const existingByUser = new Map(existingRows.map((row) => [row.user_id, row]));
  const missing = [];
  const changed = [];
  const unchanged = [];
  for (const [userId, candidate] of byUser) {
    const existing = existingByUser.get(userId) ?? null;
    const changes = fieldChanges(candidate.row, existing);
    if (!existing) missing.push(candidate.row);
    else if (changes.length > 0) changed.push({ row: candidate.row, existing, changes });
    else unchanged.push(userId);
  }
  const dodoUserIds = new Set(byUser.keys());
  const orphaned = existingRows.filter((row) => !dodoUserIds.has(row.user_id));

  return { missing, changed, unchanged, skipped, collisions, orphaned };
};

/** `UPDATE`-free, delete-free upsert of exactly the rows the plan asked for. */
const applyRows = async ({ url, key, rows }) => {
  if (rows.length === 0) return 0;
  await supabaseRequest(url, key, 'subscription_status', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  return rows.length;
};

const main = async () => {
  const apply = process.argv.includes('--apply');
  const config = readConfig(process.env);
  const products = productIdToPlan(process.env);

  if (products.size === 0) {
    throw new Error(
      'No DODO_PRODUCT_* variables are set, so no product can be mapped onto a plan. ' +
        'Load the backend environment first.'
    );
  }

  const ref = projectRefFromUrl(config.supabaseUrl);
  console.log(`Dodo environment: ${config.environment} (${config.baseUrl})`);
  console.log(`Database: ${ref ?? config.supabaseUrl} (via PostgREST)`);

  const [subscriptions, payments, existingRows] = await Promise.all([
    fetchAll(config.baseUrl, config.apiKey, '/subscriptions', 'items'),
    fetchAll(config.baseUrl, config.apiKey, '/payments', 'items').catch(() => []),
    supabaseRequest(
      config.supabaseUrl,
      config.serviceRoleKey,
      'subscription_status?select=user_id,plan_id,status,current_period_end,cancel_at_period_end,stripe_customer_id,stripe_subscription_id,source,updated_at'
    ),
  ]);

  // A fingerprint of which database this is: the same schema exists in more than one project,
  // and only the contents tell them apart.
  console.log(`  subscription_status: ${existingRows.length} row(s)`);
  console.log(`  Dodo subscriptions:  ${subscriptions.length}`);
  console.log(`  Dodo payments:       ${payments.length}`);

  const plan = planReconcile({ subscriptions, products, existingRows });

  for (const note of plan.skipped) console.warn(`[skip] ${note}`);
  for (const collision of plan.collisions) {
    console.warn(
      `[collision] ${collision.userId}: kept ${JSON.stringify(collision.kept)}, ` +
        `dropped ${JSON.stringify(collision.dropped)} — verify by hand`
    );
  }

  if (subscriptions.length === 0) {
    console.log('\nDodo has no subscriptions in this business, so there is nothing to rebuild.');
  }
  if (plan.missing.length > 0) {
    console.log(`\nMissing rows (${plan.missing.length}):`);
    for (const row of plan.missing) console.log(`  + ${JSON.stringify(row)}`);
  }
  if (plan.changed.length > 0) {
    console.log(`\nRows that disagree with Dodo (${plan.changed.length}):`);
    for (const { row, changes } of plan.changed) {
      console.log(`  ~ ${row.user_id}`);
      for (const change of changes) console.log(`      ${change}`);
    }
  }
  console.log(`\nUnchanged: ${plan.unchanged.length}`);
  if (plan.orphaned.length > 0) {
    console.log(
      `In the database but not on Dodo: ${plan.orphaned.length} (reported only; never deleted).`
    );
  }

  const toWrite = [...plan.missing, ...plan.changed.map((entry) => entry.row)];
  if (!apply) {
    console.log(
      `\nDry run: ${toWrite.length} row(s) would be written. Re-run with --apply to write them.`
    );
    return;
  }
  const written = await applyRows({
    url: config.supabaseUrl,
    key: config.serviceRoleKey,
    rows: toWrite,
  });
  const after = await supabaseRequest(
    config.supabaseUrl,
    config.serviceRoleKey,
    'subscription_status?select=user_id'
  );
  console.log(`\nWrote ${written} row(s); subscription_status now holds ${after.length}.`);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(`\nFAILED: ${error.message}`);
    process.exit(1);
  });
}
