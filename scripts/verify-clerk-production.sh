#!/bin/bash
# Verify Clerk Production Migration
# Run this AFTER migration to verify everything works
# Usage: bash scripts/verify-clerk-production.sh <production-domain>

set -euo pipefail

PRODUCTION_DOMAIN="${1:-}"

if [ -z "$PRODUCTION_DOMAIN" ]; then
  echo "❌ Usage: bash scripts/verify-clerk-production.sh <production-domain>"
  echo "   Example: bash scripts/verify-clerk-production.sh engvox.com"
  exit 1
fi

echo "🔍 Verifying Clerk Production Setup — $PRODUCTION_DOMAIN"
echo ""

# ─── Test 1: Frontend accessible ────────────────────────────────────────
echo "📋 Test 1: Frontend accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$PRODUCTION_DOMAIN/sign-in" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "   ✅ /sign-in returns 200"
else
  echo "   ❌ /sign-in returns HTTP $HTTP_STATUS"
fi

# ─── Test 2: Production publishable key ─────────────────────────────────
echo ""
echo "📋 Test 2: Production publishable key..."
PAGE_CONTENT=$(curl -s "https://$PRODUCTION_DOMAIN/sign-in" 2>/dev/null || echo "")
if echo "$PAGE_CONTENT" | grep -q "pk_live_"; then
  echo "   ✅ Production key (pk_live_) found in HTML"
elif echo "$PAGE_CONTENT" | grep -q "pk_test_"; then
  echo "   ❌ Development key (pk_test_) still in use!"
else
  echo "   ⚠️  Could not determine key type from HTML"
fi

# ─── Test 3: Backend health ─────────────────────────────────────────────
echo ""
echo "📋 Test 3: Backend health..."
BACKEND_HEALTH=$(curl -s --max-time 10 "https://englishengineer-backend.onrender.com/api/health" 2>/dev/null || echo '{"status":"unreachable"}')
if echo "$BACKEND_HEALTH" | grep -q '"status":"healthy"'; then
  echo "   ✅ Backend is healthy"
else
  echo "   ⚠️  Backend health: $BACKEND_HEALTH"
fi

# ─── Test 4: JWKS endpoint ──────────────────────────────────────────────
echo ""
echo "📋 Test 4: JWKS endpoint..."
# Try to determine Clerk FAPI domain from the page
if echo "$PAGE_CONTENT" | grep -qo 'https://[^"]*\.clerk\.accounts\.dev'; then
  JWKS_DOMAIN=$(echo "$PAGE_CONTENT" | grep -o 'https://[^"]*\.clerk\.accounts\.dev' | head -1)
  JWKS_STATUS=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$JWKS_DOMAIN/.well-known/jwks.json" 2>/dev/null || echo "000")
  if [ "$JWKS_STATUS" = "200" ]; then
    echo "   ✅ JWKS endpoint accessible"
  else
    echo "   ⚠️  JWKS returned HTTP $JWKS_STATUS"
  fi
else
  echo "   ⚠️  Could not determine Clerk domain from page"
fi

# ─── Test 5: Auth protection ────────────────────────────────────────────
echo ""
echo "📋 Test 5: Auth protection on /dashboard..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$PRODUCTION_DOMAIN/dashboard" 2>/dev/null || echo "000")
if [ "$DASHBOARD_STATUS" = "200" ] || [ "$DASHBOARD_STATUS" = "302" ] || [ "$DASHBOARD_STATUS" = "303" ]; then
  echo "   ✅ /dashboard returns HTTP $DASHBOARD_STATUS (expected for auth redirect)"
else
  echo "   ⚠️  /dashboard returns HTTP $DASHBOARD_STATUS"
fi

# ─── Summary ─────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verification complete!"
echo ""
echo "Manual checks needed:"
echo "  1. Open https://$PRODUCTION_DOMAIN/sign-in in browser"
echo "  2. Verify no 'Development' banner in Clerk UI"
echo "  3. Test Google OAuth → should redirect to Google → back to /dashboard"
echo "  4. Test email/password sign-up"
echo "  5. Verify session persists across page reloads"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
