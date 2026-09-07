# Learning data retention and recovery

The canonical production tables are `learning_progress_events`, `learning_writing_submissions`, and `learning_speaking_submissions`.

- Default retention: 730 days via `purge_expired_learning_data()`; schedule only after product/legal approval.
- Export: `export_learning_user_data('<user-id>')`.
- Erasure: `delete_learning_user_data('<user-id>')` after any requested export.
- Rollout: backup, migrate staging, verify two-user RLS and manager read-only access, deploy backend, verify two instances, then migrate production.
- Prefer application rollback while retaining tables. The rollback SQL is destructive and requires backup plus explicit approval.
