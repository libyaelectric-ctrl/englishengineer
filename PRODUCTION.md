# EngineerOS Production Runbook

## Deployment Steps

1. Verify the release branch is clean and reviewed.
2. Configure production environment variables in the hosting platform.
3. Run:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

4. Deploy `dist/` to the static hosting provider.
5. Verify `/login`, `/dashboard`, `/ai`, `/analytics`, `/gamification`, `/profile`, `/reading`, `/writing`, `/listening`, `/speaking` and `/vocabulary`.
6. Confirm backend AI proxy, Supabase and billing APIs are reachable from the production origin.

## Production Checklist

- TypeScript build passes.
- Vitest suite passes.
- No local env files are committed.
- Supabase RLS policies are enabled.
- Stripe webhooks are configured and verified.
- Backend AI proxy has vendor secrets only on the server.
- Cloud sync table and profile table exist.
- Error boundary renders a recoverable fallback.

## Rollback Strategy

1. Keep the previous production artifact available.
2. If deployment verification fails, roll back static hosting to the previous artifact.
3. Do not roll back Supabase schema without a migration plan.
4. If Stripe webhook processing fails, pause paid launch and keep users on cached entitlements until backend recovery.
5. Record incident notes in the release log.

## Monitoring Recommendations

- Frontend error monitoring for uncaught exceptions.
- Backend AI latency and timeout tracking.
- Stripe webhook success/failure alerts.
- Supabase auth and database error dashboards.
- Cloud sync failure counts.
- Bundle size tracking for the main chunk and large feature chunks.

## Release Process

1. Cut a release branch.
2. Run the quality gate locally.
3. Merge through CI.
4. Deploy to staging.
5. Smoke test production-like integrations.
6. Tag the release as `v2.0.0`.
7. Deploy production.
8. Monitor for the first release window.

## Performance Notes

Routes are lazy-loaded through React `lazy()` and `Suspense`. The production build still reports a large shared chunk because core state, vocabulary content and shared feature infrastructure are reused across pages. Further reductions should be handled in v2.1 through content chunking and selective dynamic imports.
