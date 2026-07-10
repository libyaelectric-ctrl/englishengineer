import assert from 'node:assert/strict';
import test from 'node:test';
import { createSupabaseBillingRepository } from '../src/supabase-billing-repository.js';

const config = {
  supabaseUrl: 'https://project.supabase.co',
  supabaseServiceRoleKey: 'service-role-test-key',
};

test('Supabase billing repository maps subscription rows', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify([
        {
          plan_id: 'pro',
          status: 'active',
          current_period_end: '2026-07-27T00:00:00.000Z',
          cancel_at_period_end: false,
          stripe_customer_id: 'cus_1',
          stripe_subscription_id: 'sub_1',
          updated_at: '2026-06-27T00:00:00.000Z',
          source: 'stripe_webhook',
        },
      ]),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };
  const repository = createSupabaseBillingRepository(config, fetchImpl);
  const snapshot = await repository.getSubscriptionStatus('user-1');

  assert.equal(snapshot.planId, 'pro');
  assert.equal(snapshot.stripeCustomerId, 'cus_1');
  assert.match(calls[0].url, /subscription_status\?.*user_id=eq\.user-1/);
  assert.equal(calls[0].init.headers.apikey, 'service-role-test-key');
  assert.equal(
    calls[0].init.headers.Authorization,
    'Bearer service-role-test-key'
  );
});

test('Supabase billing repository upserts subscriptions and Stripe events', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (init.method === 'GET') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, { status: 204 });
  };
  const repository = createSupabaseBillingRepository(config, fetchImpl);
  await repository.upsertSubscriptionStatus('user-1', {
    planId: 'pro',
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    updatedAt: '2026-06-27T00:00:00.000Z',
    source: 'stripe_webhook',
  });
  assert.equal(await repository.hasStripeEventBeenProcessed('evt_1'), false);
  await repository.markStripeEventProcessed('evt_1', {
    type: 'checkout.session.completed',
    processedAt: '2026-06-27T00:00:00.000Z',
  });

  const subscriptionBody = JSON.parse(calls[0].init.body);
  const eventBody = JSON.parse(calls[2].init.body);
  assert.equal(subscriptionBody.user_id, 'user-1');
  assert.equal(subscriptionBody.plan_id, 'pro');
  assert.equal(eventBody.stripe_event_id, 'evt_1');
  assert.equal(eventBody.event_type, 'checkout.session.completed');
  assert.match(calls[2].url, /stripe_processed_events\?.*on_conflict=/);
});

test('Supabase billing repository surfaces persistence failures', async () => {
  const repository = createSupabaseBillingRepository(
    config,
    async () => new Response('unavailable', { status: 503 })
  );
  await assert.rejects(
    repository.getSubscriptionStatus('user-1'),
    /failed with status 503/
  );
});
