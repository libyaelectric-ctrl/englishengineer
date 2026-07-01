# Stripe, Subscriptions & Commercial Platform

## PRC Kademe 3: Billing status UX

The Profile billing panel presents the backend subscription snapshot through a
single typed status presenter. It distinguishes the following states instead
of displaying a raw Stripe status value:

- Free: no paid subscription is active and Free limits apply.
- Active: paid entitlements are active and the next renewal date is shown.
- Trialing: trial entitlements are active and the trial end date is shown.
- Past due: the latest payment failed or is overdue; paid entitlements are
  shown as restricted and the Customer Portal action remains available.
- Canceled: paid entitlements are inactive and a new subscription can be
  started.
- Cancel at period end: access remains active until the displayed period end.
  The UI states: "Your subscription remains active until the end of the current
  billing period."

Plan, subscription status, entitlement status, period state and backend
verification are displayed separately. Customer Portal access is enabled only
when the billing backend is configured and the subscription snapshot includes
a Stripe customer identifier.

When `VITE_BILLING_API_URL` is absent, the UI always presents local Free access
as unverified. A cached paid snapshot is never presented as a verified paid
subscription in local mode. This protects the product's trust boundary; it does
not prove a live Stripe deployment.

## v4.0.1 P0 ownership and persistence boundary

Billing routes derive the customer identity from authenticated backend context. Query/body `userId` cannot override an authenticated production identity. Stripe webhooks remain public only at the HTTP routing layer and require Stripe signature verification over the raw body.

The bundled memory repository is limited to development and tests. It uses bounded TTL idempotency rather than an unbounded event set, but it is still process-local. Production startup blocks memory billing by default. Set `BILLING_REPOSITORY=supabase` to use the backend-only durable repository for `subscription_status` and `stripe_processed_events`. Applying the migration and collecting staging webhook evidence remain launch requirements.

## Test-mode deployment proof

Source contracts and backend tests do not prove a live Stripe connection. With test credentials configured on the backend, verify checkout creation, customer portal creation, webhook signature rejection/acceptance, duplicate event idempotency, payment failure, cancellation and active subscription state. Save Stripe event identifiers outside the source package; never commit secret keys or webhook secrets.

Current source version: **v4.0.1**. Stripe routes are backend-ready; live or
test-mode payment proof requires external Stripe credentials.

Stripe backend contract and webhook tests exist, but live checkout/webhook proof is not included in this package.

## v3.0.2 Backend Implementation

The optional `backend/` package now implements the documented Checkout,
Customer Portal, subscription-status, and Stripe webhook routes. Missing
Stripe configuration returns HTTP 503; the backend never fabricates a paid
subscription. Webhook signatures are verified with the official Stripe SDK,
and duplicate event IDs are ignored by the development idempotency adapter.

The included subscription and event stores are process-local development
adapters. Production deployment must replace them with a durable Supabase
repository and authenticate the requesting user before public billing launch.

## v2.6.0 Verification Note

Project Olympus verifies the frontend billing fallback state in a real browser. Live checkout, customer portal and webhook proof still require deployed backend endpoints and Stripe credentials; the frontend does not verify payments client-side.

## Purpose

Sprint 16 adds a commercial SaaS layer to EngineerOS without changing the learning engines. Billing is isolated in `src/features/billing/` and uses a backend-first Stripe architecture.

The frontend never stores Stripe secrets, never verifies payments locally, and never calls Stripe secret-key APIs. It only requests backend-created redirect URLs for Checkout and the Customer Portal.

## Architecture

Billing follows the EngineerOS feature standard:

- `billing.types.ts` defines plans, subscription snapshots, feature names and provider contracts.
- `billing.helpers.ts` defines Free, Pro and Enterprise plan metadata.
- `billing.entitlements.ts` centralizes feature access checks.
- `stripe.provider.ts` calls the backend billing API.
- `billing.service.ts` owns billing workflows and local fallback behavior.
- `billing.store.ts` exposes subscription state to the app.

UI components must not inspect Stripe state directly. Modules should ask the entitlement layer:

- `canAccessFeature()`
- `canUseAICoach()`
- `canCreateMission()`
- `canViewAdvancedAnalytics()`

## Environment

```env
VITE_BILLING_API_URL=
```

If `VITE_BILLING_API_URL` is missing, EngineerOS remains on the Free plan fallback and billing actions return a clear configuration message.

## Subscription Plans

### Free

- Limited Reading, Writing, Listening and Speaking
- Limited Vocabulary
- Daily AI Coach limit
- Basic Analytics
- Basic Gamification

### Pro

- Unlimited modules
- Unlimited AI Coach
- Advanced Analytics
- Full Gamification
- Unlimited Vocabulary
- Future AI features
- Priority updates

### Enterprise

Enterprise is future-ready for team billing, procurement, custom deployment, SSO and administration. It is defined in the plan system but not activated by frontend-only logic.

## Payment Flow

1. User clicks Upgrade in Profile.
2. Frontend calls the billing service.
3. Billing service calls the backend endpoint:

```text
POST /checkout-session
```

4. Backend creates a Stripe Checkout Session with secret Stripe credentials.
5. Backend returns `{ "url": "https://checkout.stripe.com/..." }`.
6. Frontend redirects to that URL.
7. Stripe redirects back to `/profile?billing=success` or `/profile?billing=cancelled`.
8. Backend webhooks update the authoritative subscription status.
9. Frontend refreshes subscription status from:

```text
GET /subscription-status?userId=...
```

When Stripe returns to `/profile?billing=success`, the Profile page refreshes the subscription snapshot automatically so the visible plan and entitlement state update without a manual reload.

## Customer Portal Flow

1. User clicks Manage Subscription.
2. Frontend calls:

```text
POST /create-customer-portal-session
```

3. Backend creates a Stripe Customer Portal session.
4. Frontend redirects to the returned portal URL.

The portal supports cancellation, renewal management, payment method updates and invoice history when enabled in Stripe.

## Backend API Contract

### Checkout Session

Request:

```json
{
  "userId": "user_123",
  "email": "engineer@example.com",
  "planId": "pro",
  "successUrl": "https://app.example.com/profile?billing=success",
  "cancelUrl": "https://app.example.com/profile?billing=cancelled"
}
```

Response:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Customer Portal

Request:

```json
{
  "userId": "user_123",
  "returnUrl": "https://app.example.com/profile"
}
```

Response:

```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Subscription Status

Response:

```json
{
  "planId": "pro",
  "status": "active",
  "currentPeriodEnd": "2026-07-26T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "stripeCustomerId": "cus_...",
  "stripeSubscriptionId": "sub_...",
  "updatedAt": "2026-06-26T00:00:00.000Z"
}
```

## Webhook Flow

The backend should listen to Stripe webhooks and update the entitlement source of truth:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Frontend entitlement state must come from backend subscription status, not from URL parameters.

## Entitlement System

Entitlements are plan-based and centralized in `billing.entitlements.ts`.

Examples:

- Free users can access core modules with limits.
- Pro users can access advanced analytics, full gamification, mission creation and future AI features.
- Enterprise remains future-ready and should be activated by backend subscription state.

Feature gates should degrade gracefully with upgrade messaging. They must never crash a learning module.

Sprint 16 final hardening connects entitlement enforcement to:

- AI Coach: Free users use the configured daily AI Coach limit; Pro unlocks unlimited coaching.
- Analytics: Free users keep basic summary metrics; advanced telemetry is gated behind Pro.
- Gamification: Free users keep basic visible progression; full mission chains, rewards and bonus systems are gated behind Pro.

UI components do not inspect Stripe directly. They read `billing.store.ts` and call entitlement helpers only.

## Timeout And Failure Handling

The Stripe billing provider uses an AbortController timeout of 15 seconds for subscription status, Checkout Session and Customer Portal requests.

Handled states:

- Timeout
- Network failure
- Backend unavailable
- Non-2xx backend responses

These states produce clear user-facing errors and do not crash the app.

## Security Model

- No Stripe secret key in frontend.
- No client-side subscription verification.
- No trusted payment state in localStorage.
- Backend owns Checkout Session creation, Customer Portal creation, webhook verification and authoritative subscription records.
- Frontend stores only a cached subscription snapshot for display and graceful fallback.

## Remaining Commercial Work

- Configure Stripe products and prices.
- Store authoritative subscriptions and webhook idempotency keys in Supabase.
- Enforce authenticated user identity on billing routes.
- Add invoice history endpoint.
- Add end-to-end tests against Stripe test mode.

## Titan Backend Contract

Production billing expects these backend routes:

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/create-customer-portal-session`
- `GET /api/billing/subscription-status`
- `POST /api/webhooks/stripe`

Frontend responsibilities:

- Request checkout and portal redirects from the backend.
- Refresh subscription status after billing return.
- Render entitlement state from the existing billing store and entitlement helpers.

Backend responsibilities:

- Create Stripe Checkout sessions.
- Create Stripe Customer Portal sessions.
- Validate Stripe webhook signatures.
- Store subscription status as the source of truth.
- Return server-confirmed entitlement state.

The frontend must never contain Stripe secret keys, webhook secrets, or client-side payment verification logic.

## Titan Webhook Proof States

The backend contract requires Stripe webhook signature verification before processing. The frontend contract tests reject webhook envelopes unless `signatureVerified=true`.

Supported webhook states:

- `checkout.session.completed` -> checkout completed
- `invoice.payment_failed` -> payment failed
- `customer.subscription.created` -> subscription active
- `customer.subscription.updated` -> subscription updated or grace period according to backend subscription payload
- `customer.subscription.deleted` -> subscription cancelled
- `customer.subscription.trial_will_end` -> grace period / trial ending warning

Idempotency:

- Backend must derive a stable idempotency key from Stripe `event.type` and `event.id`.
- Replayed Stripe events must not create duplicate subscription updates.
- Subscription status remains backend/source-of-truth.
