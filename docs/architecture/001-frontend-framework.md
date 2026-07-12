# Architecture Decision Record: 001 - Frontend Framework

**Status:** Accepted  
**Date:** 2026-07-11

## Context

EngineerOS requires a blazing fast, SEO-friendly, and highly interactive user interface capable of managing complex state (AI interactions, billing, vocabulary tracking).

## Decision

We chose **React 19 + Vite + Zustand**.

## Consequences

- **Pros:** Vite provides instantaneous HMR (Hot Module Replacement) and optimized build times compared to Webpack. React 19 offers concurrent rendering benefits, and Zustand provides a boilerplate-free global state store compared to Redux.
- **Cons:** Bypassing Next.js means we lose out-of-the-box SSR (Server-Side Rendering). We mitigate SEO concerns by using static pre-rendering and Edge caching via Vercel where applicable.
