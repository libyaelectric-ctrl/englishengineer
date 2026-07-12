# Architecture Decision Record: 002 - Database & Auth

**Status:** Accepted  
**Date:** 2026-07-11

## Context

We need a robust relational database with strong row-level access controls to support a multi-tenant SaaS application natively, without writing thousands of lines of boilerplate backend authorization code.

## Decision

We chose **Supabase (Managed PostgreSQL)**.

## Consequences

- **Pros:** Native Row Level Security (RLS) guarantees data isolation at the database layer. Built-in Auth integrates seamlessly with RLS. The auto-generated REST API (PostgREST) speeds up CRUD operations for the frontend.
- **Cons:** Vendor lock-in to Supabase-specific features (like GoTrue Auth). We mitigate this by keeping heavy business logic (Stripe, AI, Emailing) in our custom Node.js Express backend.
