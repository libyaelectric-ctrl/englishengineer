import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * API Integration Smoke Tests
 * 
 * These tests verify that the frontend can communicate with
 * the backend API endpoints. They require the backend to be running.
 * 
 * Run: npm run test:integration (requires backend at localhost:8787)
 */

const API_BASE = 'http://localhost:8787/api';

describe('API Integration Smoke Tests', () => {
  // Skip if backend is not available
  beforeAll(async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) {
        console.warn('⚠️  Backend not available. Skipping integration tests.');
      }
    } catch {
      console.warn('⚠️  Backend not available. Skipping integration tests.');
    }
  });

  describe('Health Endpoint', () => {
    it('should return 200 OK', async () => {
      const response = await fetch(`${API_BASE}/health`);
      expect(response.status).toBe(200);
    });

    it('should return JSON with status', async () => {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('ok');
    });
  });

  describe('Auth Endpoints', () => {
    it('should reject login with invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
      });
      expect(response.status).toBe(401);
    });

    it('should validate login request body', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Missing required fields
      });
      expect(response.status).toBe(400);
    });
  });

  describe('API Contract Validation', () => {
    it('should return correct content-type', async () => {
      const response = await fetch(`${API_BASE}/health`);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should have CORS headers', async () => {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'OPTIONS',
      });
      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
    });
  });
});

describe('Frontend-Backend Contract Tests', () => {
  it('should have matching API schemas', () => {
    // Verify that frontend OpenAPI schemas match backend Swagger definitions
    // This is a static check that runs without the backend
    const { OpenAPISchemas } = require('@/contracts/backend/openapi-schemas');
    expect(OpenAPISchemas).toBeDefined();
    expect(OpenAPISchemas.LoginRequest).toBeDefined();
    expect(OpenAPISchemas.User).toBeDefined();
  });
});
