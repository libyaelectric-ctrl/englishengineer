-- DESTRUCTIVE rollback for 202609070001_learning_persistence.sql.
-- Take a backup and export affected user data before running this file.
begin;
drop function if exists public.purge_expired_learning_data(interval);
drop function if exists public.delete_learning_user_data(text);
drop function if exists public.export_learning_user_data(text);
drop function if exists public.can_manage_learning_user(text);
drop table if exists public.learning_speaking_submissions;
drop table if exists public.learning_writing_submissions;
drop table if exists public.learning_progress_events;
commit;
