#!/usr/bin/env node
// Creates the EngVox product catalog in Dodo Payments (test or live mode)
// and prints the env variables to wire into the backend.
//
// Usage:
//   DODO_API_KEY=... node scripts/create-dodo-products.mjs            # test mode
//   DODO_API_KEY=... node scripts/create-dodo-products.mjs --live     # live mode
//
// Prices mirror the existing Stripe catalog (USD):
//   Junior $29 / Senior $59 / Specialist $79 / Master $99 / Team $999 (monthly)
//   Annual = 20% off (matches the old Stripe annual discount)
//   AI Coach Top-up: $5 for 50 credits (one-time)
import { writeFileSync } from 'node:fs';

const isLive = process.argv.includes('--live');
const baseUrl = isLive ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
const apiKey = process.env.DODO_API_KEY;
if (!apiKey) {
  console.error('DODO_API_KEY environment variable is required.');
  process.exit(1);
}

const PLANS = [
  { id: 'junior', name: 'EngVox Junior', monthly: 2900 },
  { id: 'senior', name: 'EngVox Senior', monthly: 5900 },
  { id: 'specialist', name: 'EngVox Specialist', monthly: 7900 },
  { id: 'master', name: 'EngVox Master', monthly: 9900 },
  { id: 'team', name: 'EngVox Team', monthly: 99900 },
];

const annualOf = (cents) => Math.round(cents * 12 * 0.8);

const buildPrice = (kind, interval, cents) => {
  if (kind === 'one_time') {
    return {
      type: 'one_time_price',
      currency: 'USD',
      price: cents,
      discount: 0,
      purchasing_power_parity: false,
      tax_inclusive: false,
    };
  }
  return {
    type: 'recurring_price',
    currency: 'USD',
    price: cents,
    discount: 0,
    purchasing_power_parity: false,
    tax_inclusive: false,
    payment_frequency_interval: interval === 'year' ? 'Year' : 'Month',
    payment_frequency_count: 1,
    subscription_period_interval: interval === 'year' ? 'Year' : 'Month',
    subscription_period_count: 1,
  };
};

const createProduct = async (name, price, metadata) => {
  const response = await fetch(`${baseUrl}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ name, price, metadata, tax_category: 'edtech' }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`FAILED [${response.status}] ${name}: ${JSON.stringify(body)}`);
    process.exitCode = 1;
    return null;
  }
  console.log(`created ${name} -> ${body.product_id}`);
  return body;
};

const products = [];
for (const plan of PLANS) {
  products.push(
    await createProduct(`${plan.name} — Monthly`, buildPrice('sub', 'month', plan.monthly), {
      engineeros_plan: plan.id,
      billing_interval: 'month',
    })
  );
  products.push(
    await createProduct(
      `${plan.name} — Annual (20% off)`,
      buildPrice('sub', 'year', annualOf(plan.monthly)),
      { engineeros_plan: plan.id, billing_interval: 'year' }
    )
  );
}
products.push(
  await createProduct('AI Coach Top-up — 50 Credits', buildPrice('one_time', null, 500), {
    type: 'topup',
    credits: '50',
  })
);

const envKeyFor = (product) => {
  if (!product) return null;
  const plan = product.metadata?.engineeros_plan;
  const interval = product.metadata?.billing_interval;
  if (plan && interval) {
    return `DODO_PRODUCT_${plan.toUpperCase()}_${interval === 'year' ? 'ANNUAL' : 'MONTHLY'}`;
  }
  if (product.metadata?.type === 'topup') return 'DODO_PRODUCT_TOPUP';
  return null;
};

const envLines = products
  .map((product) => {
    const key = envKeyFor(product);
    return key ? `${key}=${product.product_id}` : null;
  })
  .filter(Boolean);

console.log('\n=== ENV (backend/.env or Render) ===');
console.log(envLines.join('\n'));

const outFile = `dodo-products-${isLive ? 'live' : 'test'}.env`;
writeFileSync(outFile, `${envLines.join('\n')}\n`);
console.log(`\nWrote ${outFile}`);
