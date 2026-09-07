# Learning data retention and recovery

## Canonical data

`learning_progress_events`, `learning_writing_submissions`, and `learning_speaking_submissions` are the production sources of truth. Route-local memory stores are not authoritative.

## Retention

The default retention window is 730 days. Schedule `select public.purge_expired_learning_data();` only after product/legal approval. The function is restricted to `service_role`; changing the interval requires a documented retention decision.

## Export and deletion

- User export: `select public.export_learning_user_data('<user-id>');`
- Erasure: `select public.delete_learning_user_data('<user-id>');`

The backend repository also exposes typed export and deletion operations. Export must occur before erasure when a user requests a copy.

## Migration rollout

1. Back up the database.
2. Apply `202609070001_learning_persistence.sql` in staging.
3. Verify owner isolation with two authenticated users and manager read-only access.
4. Deploy backend code after the migration succeeds.
5. Verify writes from two backend instances and compare `/api/v1/progress/overview`.
6. Apply to production and monitor `learning_repository_error` responses.

## Rollback

Application rollback should be preferred: revert the Phase 2 commits while retaining the new tables. The destructive SQL rollback file drops all Phase 2 learning data and must be used only after backup and explicit approval.
