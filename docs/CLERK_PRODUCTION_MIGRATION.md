# Clerk Development → Production Migration Guide

## Overview

EngVox is currently running on a **Clerk development instance** (`dominant-cricket-288.clerk.accounts.dev`). This guide covers the full migration to a production instance, including OAuth reconfiguration, environment variable updates, and deployment.

> **Current state:**
>
> - Instance type: `development` (capped at 100 users, shared OAuth credentials, `__clerk_db_jwt` session management)
> - Publishable key: `pk_test_...` → needs to become `pk_live_...`
> - Google OAuth callback redirects to `clerk.shared.lcl.dev` (dev proxy) → must redirect to production domain
> - Backend `CLERK_ISSUER`: `https://dominant-cricket-288.clerk.accounts.dev`

---

## Prerequisites

- [ ] A custom domain you own (e.g., `engvox.com`)
- [ ] DNS access to add CNAME records
- [ ] Google Cloud Console project with OAuth credentials
- [ ] Clerk Dashboard access (https://dashboard.clerk.com)

---

## Step 1: Create Production Instance

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click the **Development** dropdown at the top → **Create production instance**
3. Choose **"Clone from development instance"** to copy settings (users do NOT copy)
4. Note the new instance ID and domain

> ⚠️ **What clones:** Auth settings, MFA config, bot protection, email templates
> ❌ **What does NOT clone:** SSO connections, Integrations, Paths settings, OAuth credentials, user data

---

## Step 2: Configure Production Domain

1. In the production instance dashboard → **Configure → Paths**
2. Set:

   | Field             | Value                          |
   | ----------------- | ------------------------------ |
   | Home URL          | `https://engvox.com`           |
   | After sign-in URL | `https://engvox.com/dashboard` |
   | After sign-up URL | `https://engvox.com/sign-up`   |

3. Go to **Configure → Domains**
4. Add your production domain and note the CNAME records Clerk provides:
   ```
   Type: CNAME
   Name: clerk._domainkey (or as shown)
   Value: <provided by Clerk>
   ```

---

## Step 3: DNS Configuration

Add these DNS records to your domain registrar:

| Type  | Name               | Value             | Purpose             |
| ----- | ------------------ | ----------------- | ------------------- |
| CNAME | `clerk`            | `cname.clerk.app` | Frontend API (FAPI) |
| CNAME | `clerk._domainkey` | `<provided>`      | Session management  |

> ⏱️ DNS propagation can take up to 48 hours. Use `dig` to verify:
>
> ```bash
> dig clerk.engvox.com +short CAA
> ```

---

## Step 4: Google OAuth — Production Credentials

**Development uses shared OAuth credentials. Production requires your own.**

### 4.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (or use existing)
3. Set **Authorized redirect URIs** to:

   ```
   https://clerk.engvox.com/v1/oauth_callback
   ```

   > Replace `clerk.engvox.com` with your actual Clerk FAPI domain

4. Note the **Client ID** and **Client Secret**

### 4.2 Configure in Clerk Production Dashboard

1. Go to **Configure → Social connections → Google**
2. Enter your Google OAuth **Client ID** and **Client Secret**
3. Save

---

## Step 5: Environment Variables

### 5.1 Frontend (Vercel)

Update these in Vercel → Settings → Environment Variables:

| Variable                     | Development             | Production          |
| ---------------------------- | ----------------------- | ------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_ZG9taW5hbn...` | `pk_live_<new_key>` |

> Other VITE_CLERK_* variables (SIGN_IN_URL, SIGN_UP_URL, etc.) can stay the same.

### 5.2 Backend (Render)

Update these in Render → Service → Environment:

| Variable       | Development                                       | Production                 |
| -------------- | ------------------------------------------------- | -------------------------- |
| `CLERK_ISSUER` | `https://dominant-cricket-288.clerk.accounts.dev` | `https://clerk.engvox.com` |

> `CLERK_SECRET_KEY` is not currently set on Render. If you add it for backend API calls, use the `sk_live_` version.

### 5.3 Local Development

Keep using development keys in `.env.local` — no changes needed for local dev:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZG9taW5hbn...
CLERK_SECRET_KEY=sk_test_j0h68MAIvuF...
```

---

## Step 6: Update Backend Auth Middleware

The backend already correctly handles Clerk JWT verification via JWKS. After switching to production:

1. The `CLERK_ISSUER` env var change automatically redirects JWKS verification to the production instance
2. No code changes needed — the auth chain (`backend/src/auth.ts`) is issuer-agnostic

```typescript
// This code works for both dev and prod — just the CLERK_ISSUER env var changes
if (config.clerkIssuer && token) {
  const clerkUser = await verifyClerkToken(token, config.clerkIssuer, fetchImpl);
  if (clerkUser) return clerkUser;
}
```

---

## Step 7: Webhooks (If Applicable)

If you have Clerk webhooks configured:

1. Go to production instance → **Configure → Webhooks**
2. Add your webhook endpoint URL (e.g., `https://englishengineer-backend.onrender.com/api/webhooks/clerk`)
3. Copy the new **Signing Secret**
4. Update the backend environment variable if you store it

---

## Step 8: Content Security Policy (CSP)

If your app uses CSP headers, add the production Clerk domains:

```
script-src 'self' https://clerk.engvox.com https://js.clerk.com;
connect-src 'self' https://clerk.engvox.com https://api.clerk.com;
img-src 'self' https://img.clerk.com;
style-src 'self' 'unsafe-inline';
```

---

## Step 9: Deploy & Verify

### 9.1 Deploy Backend First

```bash
# Render auto-deploys on push, but verify:
curl -s https://englishengineer-backend.onrender.com/api/health | jq .
```

### 9.2 Deploy Frontend

```bash
# Vercel auto-deploys on push to main
# After deploy, verify:
curl -s https://engvox.com/sign-in | grep -o "pk_live_[a-zA-Z0-9_-]*"
```

### 9.3 Verify Checklist

- [ ] `/sign-in` renders Clerk UI (no "Development" banner)
- [ ] Google OAuth button works → redirects to Google → returns to `/dashboard`
- [ ] Email/password sign-up works
- [ ] Session persists across page reloads
- [ ] Backend API calls with Clerk JWT return 200 (not 401)
- [ ] `__clerk_db_jwt` cookie is NOT present (production uses `__client` cookie)
- [ ] No "Development keys" warning in browser console

---

## Step 10: Cleanup

1. Delete the development instance test users (if any)
2. Remove `ALLOW_INSECURE_DEV_AUTH` from Render env (should already be absent in production)
3. Remove any debug logging related to Clerk dev mode

---

## Rollback Plan

If something goes wrong:

1. Revert Vercel env vars to `pk_test_...` / `sk_test_...`
2. Revert Render `CLERK_ISSUER` to `https://dominant-cricket-288.clerk.accounts.dev`
3. Redeploy both services
4. Development instance remains untouched — all data is preserved

---

## Key Differences: Dev vs Production

| Feature             | Development                    | Production                   |
| ------------------- | ------------------------------ | ---------------------------- |
| User limit          | 100                            | Unlimited                    |
| OAuth credentials   | Shared (insecure)              | Your own                     |
| Session management  | `__clerk_db_jwt` (querystring) | `__client` (HttpOnly cookie) |
| Frontend API domain | `*.clerk.accounts.dev`         | `clerk.yourdomain.com`       |
| Email branding      | "Development" prefix           | Your app branding            |
| Banner in dashboard | "Development" shown            | None                         |
| Security posture    | Relaxed                        | Strict                       |

---

## Timeline Estimate

| Step                                  | Time                          |
| ------------------------------------- | ----------------------------- |
| Create production instance            | 5 min                         |
| DNS configuration                     | 5 min (propagation: 0–48 hrs) |
| Google OAuth setup                    | 10 min                        |
| Environment variable updates          | 5 min                         |
| Deploy & verify                       | 15 min                        |
| **Total (excluding DNS propagation)** | **~40 min**                   |

---

## Notes for EngVox Specifically

- The backend (`CLERK_ISSUER`) is the only server-side config that needs changing
- Frontend uses Vite env vars injected at build time — Vercel redeploys automatically
- `AuthGuard.tsx` and `ClerkBridge.tsx` are issuer-agnostic — no code changes
- The Playwright e2e test (`tests/helpers/clerk-login.ts`) uses test OTP (`+clerk_test` emails) — these only work in development. For production e2e, use a real test account
- Health check (`/api/health`) does NOT currently report Clerk status — consider adding a `clerk` check
