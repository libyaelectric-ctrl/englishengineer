-- Count every deleted row exactly once.
create or replace function public.purge_expired_learning_data(retention interval default interval '730 days')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_rows bigint := 0;
  affected bigint := 0;
begin
  delete from public.learning_progress_events where occurred_at < now() - retention;
  get diagnostics affected = row_count;
  deleted_rows := deleted_rows + affected;
  delete from public.learning_writing_submissions where submitted_at < now() - retention;
  get diagnostics affected = row_count;
  deleted_rows := deleted_rows + affected;
  delete from public.learning_speaking_submissions where submitted_at < now() - retention;
  get diagnostics affected = row_count;
  deleted_rows := deleted_rows + affected;
  return deleted_rows;
end;
$$;
