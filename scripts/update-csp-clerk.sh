#!/bin/bash
# Update CSP headers with production Clerk domain
# Usage: bash scripts/update-csp-clerk.sh <clerk-fapi-domain>
# Example: bash scripts/update-csp-clerk.sh engvox.com

set -euo pipefail

CLERK_DOMAIN="${1:-}"

if [ -z "$CLERK_DOMAIN" ]; then
  echo "❌ Usage: bash scripts/update-csp-clerk.sh <clerk-fapi-domain>"
  echo "   Example: bash scripts/update-csp-clerk.sh engvox.com"
  exit 1
fi

echo "🔒 Updating CSP headers for Clerk domain: $CLERK_DOMAIN"
echo ""

# Files to update
FILES=(
  "index.html"
  "nginx.conf"
  "backend/src/app.ts"
)

UPDATED=0

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Check if domain already exists
    if grep -q "$CLERK_DOMAIN" "$FILE"; then
      echo "   ⏭️  $FILE — already contains $CLERK_DOMAIN"
    else
      # Add the domain to all Clerk-related CSP directives
      sed -i \
        -e "s|https://\*.clerk.accounts.dev https://challenges.cloudflare.com|https://*.clerk.accounts.dev https://$CLERK_DOMAIN https://challenges.cloudflare.com|g" \
        -e "s|https://\*.clerk.accounts.dev;|https://*.clerk.accounts.dev https://$CLERK_DOMAIN;|g" \
        -e "s|wss://\*.clerk.accounts.dev|wss://*.clerk.accounts.dev wss://$CLERK_DOMAIN|g" \
        "$FILE"
      echo "   ✅ $FILE — updated with $CLERK_DOMAIN"
      UPDATED=$((UPDATED + 1))
    fi
  else
    echo "   ⚠️  $FILE — not found, skipping"
  fi
done

echo ""
if [ $UPDATED -gt 0 ]; then
  echo "✅ Updated $UPDATED file(s)"
  echo ""
  echo "Next steps:"
  echo "  1. Review changes: git diff"
  echo "  2. Commit: git add -A && git commit -m 'chore: update CSP for production Clerk domain'"
  echo "  3. Push: git push"
else
  echo "ℹ️  No files needed updating"
fi
