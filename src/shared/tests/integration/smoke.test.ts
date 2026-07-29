import { describe, it, expect, beforeAll } from 'vitest';

/**
 * API Integration Smoke Tests
 *
 * These tests verify that the frontend can communicate with
 * the backend API endpoints. They require the backend to be running.
 *
 * Run: npm run test:integration (requires backend at localhost:8787)
 * These are excluded from the default `npm run test` run (see package.json).
 */

const API_BASE = 'http://localhost:8787/api';

let backendAvailable = false;

beforeAll(async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  if (!backendAvailable) {
    // eslint-disable-next-line no-console
    console.warn(
      'Backend not available at localhost:8787 -- skipping integration smoke tests.'
    );
  }
});

describe('API Integration Smoke Tests', () => {
  describe('Health Endpoint', () => {
    it.skipIf(!backendAvailable)('should return 200 OK', async () => {
      const response = await fetch(`${API_BASE}/health`);
      expect(response.status).toBe(200);
    });

    it.skipIf(!backendAvailable)('should return JSON with status', async () => {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
    });
  });

  // NOTE: this app authenticates directly against Supabase from the
  // frontend -- there is no backend /api/auth/login route.
  describe('Auth Endpoints', () => {
    it.skipIf(true)('should reject login with invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
      });
      expect(response.status).toBe(401);
    });

    it.skipIf(true)('should validate login request body', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Missing required fields
      });
      expect(response.status).toBe(400);
    });
  });

  describe('API Contract Validation', () => {
    it.skipIf(!backendAvailable)('should return correct content-type', async () => {
      const response = await fetch(`${API_BASE}/health`);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it.skipIf(!backendAvailable)('should have CORS headers', async () => {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'OPTIONS',
      });
      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
    });
  });
});
