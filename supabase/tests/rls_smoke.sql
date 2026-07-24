-- Manual RLS smoke tests (run as different JWTs via Supabase SQL or pgTAP later)
-- 1) As school_admin of school A: SELECT from students WHERE school_id = A → rows
-- 2) As teacher of school A: SELECT Admin-only invite edge → 403
-- 3) As teacher of school A: SELECT students of school B → 0 rows
-- 4) As anon (no JWT): all selects → denied

-- Example: confirm helpers
select public.is_school_admin();
select public.my_school_id();
