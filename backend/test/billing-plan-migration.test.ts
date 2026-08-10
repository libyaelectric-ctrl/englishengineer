import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizePlanId } from '../src/billing-plan-migration.js';

test('normalizes legacy subscription plan IDs at the compatibility boundary', () => {
  assert.equal(normalizePlanId('lite'), 'free');
  assert.equal(normalizePlanId('pro'), 'junior');
  assert.equal(normalizePlanId('project'), 'senior');
  assert.equal(normalizePlanId('max'), 'specialist');
  assert.equal(normalizePlanId('exec'), 'master');
  assert.equal(normalizePlanId('private'), 'team');
});

test('preserves canonical plan IDs and rejects unknown values safely', () => {
  assert.equal(normalizePlanId('junior'), 'junior');
  assert.equal(normalizePlanId('team'), 'team');
  assert.equal(normalizePlanId('unknown-plan'), 'free');
  assert.equal(normalizePlanId(null), 'free');
});
