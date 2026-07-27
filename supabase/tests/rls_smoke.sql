-- Manual RLS smoke tests (run as different JWTs via Supabase SQL or pgTAP later)
-- 1) As school_admin / class_admin of school A: SELECT from students WHERE school_id = A → rows
-- 2) As teacher of school A: SELECT Admin-only invite edge → 403
-- 3) As teacher of school A: SELECT students of school B → 0 rows
-- 4) As anon (no JWT): all selects → denied
--
-- 5) Role escalation (regression for enforce_profile_privilege_rules trigger):
--    As a Class Admin JWT (NOT Dev), attempt:
--      update public.profiles set role = 'dev' where id = auth.uid();
--    Expected: ERROR 42501 — Only Dev can assign the Dev role
--    The React Admin UI already hides the Dev option, but PostgREST must also reject this.
--
-- 6) Demote Dev (regression):
--    As a Class Admin JWT, attempt to change another Dev profile's role to 'teacher'.
--    Expected: ERROR 42501 — Only Dev can change a Dev profile role
--
-- 7) Cross-school reassignment (regression):
--    As a Class Admin of school A, attempt:
--      update public.profiles set school_id = '<school-B-uuid>' where id = auth.uid();
--    Expected: ERROR 42501 — Cannot assign a profile to another school

-- Example: confirm helpers
select public.is_school_admin();
select public.my_school_id();
select public.is_dev();
