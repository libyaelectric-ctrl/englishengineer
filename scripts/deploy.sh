#!/bin/bash

# EngineerOS Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
VERSION=$(node -e "console.log(require('./package.json').version)")

echo "═══════════════════════════════════════════════════════════════"
echo "  EngineerOS Deployment Script"
echo "  Environment: $ENVIRONMENT"
echo "  Version: $VERSION"
echo "═══════════════════════════════════════════════════════════════"

# Pre-deployment checks
echo ""
echo "─── Pre-deployment Checks ───────────────────────────────────"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$ENVIRONMENT" = "production" ]; then
    echo "ERROR: Must be on main branch for production deployment"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "WARNING: Uncommitted changes detected"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run tests
echo ""
echo "─── Running Tests ────────────────────────────────────────────"

echo "Running typecheck..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "ERROR: Typecheck failed"
    exit 1
fi

echo "Running lint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "ERROR: Lint failed"
    exit 1
fi

echo "Running frontend tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend tests failed"
    exit 1
fi

echo "Running backend tests..."
cd backend && npm test
if [ $? -ne 0 ]; then
    echo "ERROR: Backend tests failed"
    exit 1
fi
cd ..

# Build
echo ""
echo "─── Building ─────────────────────────────────────────────────"

echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

# Deploy based on environment
echo ""
echo "─── Deploying ────────────────────────────────────────────────"

case $ENVIRONMENT in
    production)
        echo "Deploying to production (Vercel)..."
        npx vercel --prod --yes
        ;;
    staging)
        echo "Deploying to staging..."
        npx vercel --pre --yes
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Post-deployment verification
echo ""
echo "─── Post-deployment Verification ─────────────────────────────"

echo "Waiting for deployment to stabilize..."
sleep 10

echo "Checking frontend health..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://englishengineer.vercel.app)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: OK ($FRONTEND_STATUS)"
else
    echo "❌ Frontend: FAILED ($FRONTEND_STATUS)"
fi

echo "Checking backend health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://englishengineer-backend.onrender.com/api/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend: OK ($BACKEND_STATUS)"
else
    echo "❌ Backend: FAILED ($BACKEND_STATUS)"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Deployment Complete!"
echo "  Version: $VERSION"
echo "  Environment: $ENVIRONMENT"
echo "  Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "═══════════════════════════════════════════════════════════════"
