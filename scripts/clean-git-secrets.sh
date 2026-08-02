#!/bin/bash
# =============================================================================
# Git History Secret Cleanup Script
# Uses BFG Repo-Cleaner to remove secrets from git history
# =============================================================================

set -euo pipefail

echo "============================================="
echo "  EngVox Git Secret Cleanup"
echo "============================================="
echo ""

# Pre-flight checks
if ! command -v java &> /dev/null; then
  echo "ERROR: Java is required for BFG Repo-Cleaner."
  echo "Install from: https://adoptium.net/"
  exit 1
fi

if [ ! -f "bfg.jar" ]; then
  echo "Downloading BFG Repo-Cleaner..."
  curl -L -o bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
fi

echo ""
echo "Step 1: Create a fresh clone (BFG requires a bare-ish clone)"
echo "  This creates a mirror clone in /tmp/engvox-bfg-mirror"
echo ""

git clone --mirror . /tmp/engvox-bfg-mirror

echo ""
echo "Step 2: Create secrets.txt with patterns to remove"
echo ""

cat > /tmp/engvox-secrets.txt << 'SECRETS'
# Supabase anon keys (JWT format)
VITE_SUPABASE_ANON_KEY=eyJ

# Vercel OIDC tokens
VERCEL_OIDC_TOKEN=

# Railway tokens
RAILWAY_TOKEN=

# Stripe keys
STRIPE_SECRET_KEY=sk_
STRIPE_WEBHOOK_SECRET=whsec_

# Supabase service role key
SUPABASE_SERVICE_ROLE_KEY=eyJ

# JWT secrets
SUPABASE_JWT_SECRET=

# Upstash Redis tokens
UPSTASH_REDIS_REST_TOKEN=

# Internal API secrets
ENGINEEROS_INTERNAL_API_SECRET=

# Any API key patterns
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
SECRETS

echo ""
echo "Step 3: Run BFG to clean secrets"
echo ""
echo "  Command that will be executed:"
echo "  java -jar bfg.jar --replace-text /tmp/engvox-secrets.txt /tmp/engvox-bfg-mirror"
echo ""

read -p "Press Enter to execute BFG, or Ctrl+C to abort..." _

java -jar bfg.jar --replace-text /tmp/engvox-secrets.txt /tmp/engvox-bfg-mirror

echo ""
echo "Step 4: Push cleaned history"
echo ""
echo "  cd /tmp/engvox-bfg-mirror && git reflog expire --expire=now --all && git gc --prune=now --aggressive"
echo ""

cd /tmp/engvox-bfg-mirror
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "Step 5: Force push to origin"
echo ""
echo "  WARNING: This will rewrite history on the remote!"
echo ""

read -p "Press Enter to force push, or Ctrl+C to abort..." _
git push --force

echo ""
echo "============================================="
echo "  Cleanup complete!"
echo "============================================="
echo ""
echo "Post-cleanup checklist:"
echo "  1. Rotate ALL exposed secrets immediately"
echo "  2. Update .env files with new secrets"
echo "  3. Update Vercel/Railway/Supabase dashboard secrets"
echo "  4. Verify .gitignore includes:"
echo "     .env"
echo "     .env.local"
echo "     .env.vercel.*"
echo "     .env.staging"
echo "  5. Run: git filter-branch --force --index-filter \\"
echo "     'git rm --cached --ignore-unmatch .env .env.local .env.vercel.production' \\"
echo "     --prune-empty --tag-name-filter cat -- --all"
echo "  6. Clean local refs: git reflog expire --expire=now --all"
echo "  7. Garbage collect: git gc --prune=now --aggressive"
echo ""
echo "  Or simply use the BFG approach above which handles all of this."
