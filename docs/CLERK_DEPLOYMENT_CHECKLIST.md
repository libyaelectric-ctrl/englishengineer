# Clerk Production Deployment Checklist

## Current State

- **Instance**: `dominant-cricket-288.clerk.accounts.dev` (development)
- **Publishable Key**: `pk_test_ZG9taW5hbnQtY3JpY2tldC0yODguY2xlcmsuYWNjb3VudHMuZGV2JA`
- **Backend Issuer**: `https://dominant-cricket-288.clerk.accounts.dev`
- **Status**: Development instance — cannot create production without custom domain

## Pre-requisites

- [ ] Custom domain purchased (e.g., `engvox.com`)
- [ ] Domain DNS accessible (to add CNAME records)
- [ ] Google Cloud Console access (for OAuth credentials)
- [ ] Clerk Dashboard access

---

## Phase 1: Clerk Dashboard Setup (5-10 min)

### Step 1: Create Production Instance

- [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com/apps/app_3I251yNGqaZVZWzccI00jRzihhp)
- [ ] Click **Development** dropdown → **Create production instance**
- [ ] Select **"Clone from development instance"**
- [ ] Note the new instance domain (e.g., `engvox.com`)

### Step 2: Configure Paths

- [ ] Go to **Configure → Paths**
- [ ] Set:
  - Home URL: `https://engvox.com`
  - After sign-in URL: `https://engvox.com/dashboard`
  - After sign-up URL: `https://engvox.com/sign-up`

### Step 3: Add Domain

- [ ] Go to **Configure → Domains**
- [ ] Add your production domain
- [ ] Note the CNAME records provided by Clerk
- [ ] Add DNS records at your domain registrar

---

## Phase 2: Google OAuth (10-15 min)

### Step 4: Create Google OAuth Credentials

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Create new **OAuth 2.0 Client ID** (Web application)
- [ ] Add Authorized redirect URIs:
  - `https://engvox.com/v1/oauth_callback`
- [ ] Note **Client ID** and **Client Secret**

### Step 5: Configure Google in Clerk

- [ ] Go to **Configure → Social connections → Google**
- [ ] Enter your Google OAuth Client ID and Client Secret
- [ ] Save

---

## Phase 3: Environment Variables (5 min)

### Step 6: Update Frontend (Vercel)

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Update `VITE_CLERK_PUBLISHABLE_KEY`:
  ```
  pk_live_<new_key_from_production_instance>
  ```
- [ ] Save and redeploy

### Step 7: Update Backend (Render)

- [ ] Go to Render → Service → Environment
- [ ] Update `CLERK_ISSUER`:
  ```
  https://engvox.com
  ```
- [ ] Save and redeploy

### Step 8: Update Local Development (Optional)

- [ ] Keep using development keys in `.env.local` for local dev
- [ ] No changes needed — development instance stays active

---

## Phase 4: Deployment (15-20 min)

### Step 9: Deploy Backend First

- [ ] Render auto-deploys on push
- [ ] Verify: `curl -s https://englishengineer-backend.onrender.com/api/health`

### Step 10: Deploy Frontend

- [ ] Vercel auto-deploys on push to main
- [ ] Verify: `curl -s https://engvox.com/sign-in | grep -o "pk_live_[a-zA-Z0-9_-]*"`

### Step 11: Update CSP Headers

- [ ] Run migration script:
  ```bash
  bash scripts/clerk-production-migrate.sh engvox.com engvox.com
  ```
- [ ] Or manually update `index.html`, `nginx.conf`, `backend/src/app.ts`
- [ ] Commit and push

---

## Phase 5: Verification (10-15 min)

### Step 12: Test Authentication Flow

- [ ] `/sign-in` renders Clerk UI (no "Development" banner)
- [ ] Google OAuth button works → redirects to Google → returns to `/dashboard`
- [ ] Email/password sign-up works
- [ ] Session persists across page reloads

### Step 13: Test Backend Integration

- [ ] Backend API calls with Clerk JWT return 200 (not 401)
- [ ] `__clerk_db_jwt` cookie is NOT present (production uses `__client` cookie)
- [ ] No "Development keys" warning in browser console

### Step 14: Test Protected Routes

- [ ] Free-tier limits still work (vocab 1 page, placement locked)
- [ ] Upgrade modal shows for locked features
- [ ] Pricing page loads correctly

---

## Phase 6: Cleanup (5 min)

### Step 15: Final Cleanup

- [ ] Remove any debug logging related to Clerk dev mode
- [ ] Remove `ALLOW_INSECURE_DEV_AUTH` from Render env (if present)
- [ ] Delete development instance test users (if any)

---

## Rollback Plan

If something goes wrong:

1. Revert Vercel env vars to `pk_test_...`
2. Revert Render `CLERK_ISSUER` to `https://dominant-cricket-288.clerk.accounts.dev`
3. Redeploy both services
4. Development instance remains untouched

---

## Timeline

| Phase                 | Duration       |
| --------------------- | -------------- |
| Clerk Dashboard setup | 5-10 min       |
| Google OAuth          | 10-15 min      |
| Environment variables | 5 min          |
| Deployment            | 15-20 min      |
| Verification          | 10-15 min      |
| **Total**             | **~45-65 min** |

---

## Notes

- **No code changes required** — `AuthGuard.tsx`, `ClerkBridge.tsx`, `clerk.config.ts` are all issuer-agnostic
- **Backend auth middleware** works with both dev and prod — just the `CLERK_ISSUER` env var changes
- **DNS propagation** can take up to 48 hours — be patient
- **Google OAuth** is the most critical step — shared credentials won't work in production
