# Secret Management & Rotation Strategy

## Overview

This document outlines how API keys and secrets are managed in production, and the rotation strategy for each.

## Current Secrets

| Secret                      | Service          | Location    |
| --------------------------- | ---------------- | ----------- |
| `SUPABASE_URL`              | Supabase         | Railway env |
| `SUPABASE_ANON_KEY`         | Supabase         | Railway env |
| `SUPABASE_JWT_SECRET`       | Supabase         | Railway env |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase         | Railway env |
| `STRIPE_SECRET_KEY`         | Stripe           | Railway env |
| `STRIPE_WEBHOOK_SECRET`     | Stripe           | Railway env |
| `STRIPE_PRICE_PRO_MONTHLY`  | Stripe           | Railway env |
| `OPENAI_API_KEY`            | OpenAI           | Railway env |
| `ANTHROPIC_API_KEY`         | Anthropic        | Railway env |
| `GEMINI_API_KEY`            | Google AI        | Railway env |
| `UPSTASH_URL`               | Upstash Redis    | Railway env |
| `UPSTASH_TOKEN`             | Upstash Redis    | Railway env |
| `INTERNAL_API_SECRET`       | Backend internal | Railway env |
| `VITE_AI_PROXY_URL`         | Backend proxy    | Vercel env  |

## Storage Principles

1. **Never commit secrets to git** — all secrets live in platform env vars only
2. **Use platform secret managers** — Railway and Vercel encrypt env vars at rest
3. **Separate environments** — production and preview have independent secrets
4. **Least privilege** — service role keys only where needed, anon keys for public access

## Rotation Schedule

| Secret              | Rotation Frequency         | Method                                   |
| ------------------- | -------------------------- | ---------------------------------------- |
| Stripe keys         | On compromise or quarterly | Stripe Dashboard → Developers → API Keys |
| Supabase keys       | On compromise or annually  | Supabase Dashboard → Settings → API      |
| OpenAI/Anthropic    | On compromise or quarterly | Provider dashboard → API Keys            |
| Upstash             | On compromise              | Upstash Dashboard → Tokens               |
| INTERNAL_API_SECRET | On any personnel change    | Regenerate in Railway env                |

## Rotation Procedure

### Step 1: Generate New Key

- Log into the provider dashboard
- Create a new API key (keep old one active temporarily)

### Step 2: Update Environment

- Update the env var in Railway (backend) and Vercel (frontend)
- Railway: Settings → Variables → Edit
- Vercel: Project Settings → Environment Variables → Edit

### Step 3: Redeploy

- Railway auto-redeploys on env change
- Vercel: trigger redeploy if needed

### Step 4: Verify

- Check `/api/health` endpoint
- Run integration tests locally with new key
- Monitor error logs for 15 minutes

### Step 5: Revoke Old Key

- Delete the old key from the provider dashboard
- Confirm no errors appear in logs

## Emergency Rotation

If a secret is suspected compromised:

1. **Immediately** revoke the old key at the provider
2. Generate a new key
3. Update all environments (production + preview)
4. Redeploy both services
5. Check logs for unauthorized access
6. Document the incident

## Access Control

- **Production secrets**: Only accessible via Railway/Vercel dashboards
- **Development secrets**: Use `.env.local` (gitignored)
- **Team access**: Shared via platform team features, never via DM or chat

## Monitoring

- Railway health checks detect if secrets become invalid
- Vercel build fails if required env vars are missing
- Stripe webhook signature verification catches key mismatches
- AI providers return 401 on invalid keys (logged as errors)

## Last Updated

- **Date:** 2026-07-21
