#!/bin/bash
# Clerk Development → Production Migration Script
# Run this AFTER you have a custom domain configured in Clerk Dashboard
# Usage: bash scripts/clerk-production-migrate.sh <production-domain> <clerk-fapi-domain>

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────
PRODUCTION_DOMAIN="${1:-}"
CLERK_FAPI_DOMAIN="${2:-}"  # e.g., engvox.com

if [ -z "$PRODUCTION_DOMAIN" ] || [ -z "$CLERK_FAPI_DOMAIN" ]; then
  echo "❌ Usage: bash scripts/clerk-production-migrate.sh <production-domain> <clerk-fapi-domain>"
  echo "   Example: bash scripts/clerk-production-migrate.sh engvox.com engvox.com"
  exit 1
fi

echo "🚀 Clerk Production Migration — $PRODUCTION_DOMAIN"
echo "   FAPI: $CLERK_FAPI_DOMAIN"
echo ""

# ─── Step 1: Verify Clerk CLI is authenticated ───────────────────────────
echo "📋 Step 1: Verifying Clerk CLI authentication..."
if ! command -v clerk &>/dev/null; then
  echo "❌ Clerk CLI not found. Install: npm install -g clerk"
  exit 1
fi
clerk whoami 2>/dev/null || {
  echo "❌ Not logged in. Run: clerk auth login"
  exit 1
}
echo "✅ Clerk CLI authenticated"
echo ""

# ─── Step 2: Verify production instance exists ──────────────────────────
echo "📋 Step 2: Checking production instance..."
INSTANCES=$(clerk apps list 2>/dev/null | grep -o '"environment_type":"production"' || true)
if [ -z "$INSTANCES" ]; then
  echo "❌ No production instance found!"
  echo "   → Go to Clerk Dashboard → Create production instance first"
  exit 1
fi
echo "✅ Production instance exists"
echo ""

# ─── Step 3: Update CSP headers ─────────────────────────────────────────
echo "📋 Step 3: Updating CSP headers for production Clerk domain..."

# Update index.html
if [ -f "index.html" ]; then
  sed -i "s|https://\*.clerk.accounts.dev|https://*.clerk.accounts.dev https://$CLERK_FAPI_DOMAIN|g" index.html
  echo "   ✅ index.html CSP updated"
fi

# Update nginx.conf
if [ -f "nginx.conf" ]; then
  sed -i "s|https://\*.clerk.accounts.dev|https://*.clerk.accounts.dev https://$CLERK_FAPI_DOMAIN|g" nginx.conf
  echo "   ✅ nginx.conf CSP updated"
fi

# Update backend CSP if present
if [ -f "backend/src/app.ts" ]; then
  sed -i "s|https://\*.clerk.accounts.dev|https://*.clerk.accounts.dev https://$CLERK_FAPI_DOMAIN|g" backend/src/app.ts
  echo "   ✅ backend CSP updated"
fi
echo ""

# ─── Step 4: Generate env var update commands ────────────────────────────
echo "📋 Step 4: Environment variable updates needed:"
echo ""
echo "   Frontend (Vercel):"
echo "   ─────────────────"
echo "   VITE_CLERK_PUBLISHABLE_KEY=pk_live_<new_key_from_production_instance>"
echo ""
echo "   Backend (Render):"
echo "   ─────────────────"
echo "   CLERK_ISSUER=https://$CLERK_FAPI_DOMAIN"
echo ""
echo "   ⚠️  Run these commands or update via dashboards:"
echo "   vercel env add VITE_CLERK_PUBLISHABLE_KEY production"
echo "   # Then paste pk_live_<key>"
echo ""

# ─── Step 5: Verify backend health ──────────────────────────────────────
echo "📋 Step 5: Verifying backend health..."
BACKEND_HEALTH=$(curl -s --max-time 10 "https://englishengineer-backend.onrender.com/api/health" 2>/dev/null || echo '{"status":"unreachable"}')
if echo "$BACKEND_HEALTH" | grep -q '"status":"healthy"'; then
  echo "   ✅ Backend is healthy"
else
  echo "   ⚠️  Backend health: $BACKEND_HEALTH"
  echo "   → Check Render dashboard for deployment status"
fi
echo ""

# ─── Step 6: Verify JWKS endpoint ───────────────────────────────────────
echo "📋 Step 6: Verifying production JWKS endpoint..."
JWKS_URL="https://$CLERK_FAPI_DOMAIN/.well-known/jwks.json"
JWKS_STATUS=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$JWKS_URL" 2>/dev/null || echo "000")
if [ "$JWKS_STATUS" = "200" ]; then
  echo "   ✅ JWKS endpoint accessible at $JWKS_URL"
else
  echo "   ⚠️  JWKS returned HTTP $JWKS_STATUS"
  echo "   → DNS may not have propagated yet. Wait and retry."
fi
echo ""

# ─── Summary ─────────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Migration script completed!"
echo ""
echo "Remaining manual steps:"
echo "  1. Update Vercel env: VITE_CLERK_PUBLISHABLE_KEY=pk_live_<key>"
echo "  2. Update Render env: CLERK_ISSUER=https://$CLERK_FAPI_DOMAIN"
echo "  3. Redeploy both services"
echo "  4. Test: Google OAuth → /dashboard redirect"
echo "  5. Verify no 'Development' banner in Clerk UI"
echo ""
echo "Rollback: Revert env vars to pk_test_/sk_test_ and redeploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
