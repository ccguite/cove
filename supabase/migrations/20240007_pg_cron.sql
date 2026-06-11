-- Enable the pg_cron extension (must be done as superuser via Supabase dashboard
-- Extensions tab, then this SQL registers the job)
select cron.schedule(
  'delete-expired-slot-locks',
  '*/5 * * * *',
  $$
    delete from public.slot_locks
    where expires_at < now();
  $$
);

comment on table public.slot_locks is
  'Temporary holds on a room slot during active checkout. TTL: 10 minutes. Cleaned every 5 minutes by pg_cron job ''delete-expired-slot-locks''.';
