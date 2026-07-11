# Testing Strategy & Mocking Standards

## 1. Overview
This document outlines the standard approaches for mocking external services, providers, and global stores within the EngineerOS project. Consistent mocking ensures tests are deterministic, fast, and resilient.

## 2. Global State Mocking (Zustand)
When testing components that rely on global state (e.g., `useAuthStore`, `useBillingStore`), **do not** use actual store implementations. Instead, mock the hooks to return deterministic state values.

**Standard Pattern:**
```typescript
vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn()
}));

// In tests:
vi.mocked(useAuthStore).mockReturnValue({
  user: { id: 'test-user', email: 'test@example.com' },
  isAuthenticated: true,
});
```

## 3. External Services (Stripe, Supabase, AI)
Do not allow tests to make real network requests to third-party services.
- **Supabase**: Mock the Supabase client at the module level.
- **Stripe**: Mock `stripe.provider.ts` or use a mock Stripe instance.
- **AI Providers (OpenAI/Anthropic)**: Mock the `ai-core` abstractions to return static responses.

**Standard Pattern for AI:**
```typescript
vi.mock('@/backend/src/ai-core', () => ({
  generateAIResponse: vi.fn().mockResolvedValue('Mocked AI response text'),
}));
```

## 4. Environment Variables
Tests should never rely on `.env` files. Use `vi.stubEnv` to provide controlled environment variables during testing.

## 5. Timers and Dates
For tests relying on time (e.g., subscriptions, deadlines), use `vi.useFakeTimers()` and `vi.setSystemTime()` to prevent flaky tests.

## 6. Migration Progress (Task 6)
- [x] PricingPage and BillingFlow tests migrated to use declarative Zustand mocking.
- [ ] Migrate AI Service tests to mock AI provider layer.
- [ ] Migrate Supabase repository tests to use mock Supabase client.
