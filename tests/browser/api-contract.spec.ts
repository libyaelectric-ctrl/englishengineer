import { test, expect } from '@playwright/test';

const API_BASE = process.env.BACKEND_URL || 'http://localhost:8787';

test.describe('API Contract Tests', () => {
  test('health endpoint returns valid structure', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('checks');
    expect(body.checks).toHaveProperty('ai');
    expect(body.checks).toHaveProperty('stripe');
    expect(body.checks).toHaveProperty('supabase');
  });

  test('health endpoint returns v1 path', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/v1/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('non-existent route returns 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/nonexistent`);
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('route_not_found');
  });

  test('AI endpoint requires authentication', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/ai/coach`, {
      data: { prompt: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('billing endpoint requires authentication', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/billing/checkout`, {
      data: {
        email: 'test@test.com',
        successUrl: 'http://localhost',
        cancelUrl: 'http://localhost',
      },
    });
    expect(response.status()).toBe(401);
  });
});
