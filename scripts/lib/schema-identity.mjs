/**
 * The columns the runtime writes the signed-in user's id into.
 *
 * The app signs users in with Firebase and the backend reads the id straight out of the
 * token (`backend/src/auth.ts` → `payload.sub`) — an opaque string, never a uuid. Every
 * table in this list is written with that string, so every one of these columns has to be
 * `text` and must not carry a foreign key into `auth.users` (the app's users are not in
 * that table).
 *
 * Two readers share this list, and that is the point of the file:
 *
 *   `scripts/check-schema-identity.mjs` — reads the migrations, fails CI on a mismatch.
 *   `scripts/apply-schema-identity.mjs` — reads the live database, converts and verifies.
 *
 * The static guard and the live applier used to be able to disagree about which columns
 * matter, which is how a column can pass one and be broken in the other.
 */

/** Columns that must be `text` for the runtime's writes to land. Enforced by both scripts. */
export const IDENTITY_COLUMNS = [
  ['audit_logs', 'user_id'],
  ['subscription_status', 'user_id'],
  ['billing_customers', 'user_id'],
  ['ai_credit_consumptions', 'user_id'],
];

/** Columns carrying the same id that are not yet enforced; reported, never converted. */
export const REPORTED_COLUMNS = [
  ['ai_sessions', 'user_id'],
  ['knowledge_pool_entries', 'user_id'],
  ['content_generation_log', 'user_id'],
];
