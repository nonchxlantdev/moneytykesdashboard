-- Bootstrap first school + Dev profile for the Auth user you created.
-- Run AFTER applying migrations (including 20260724130000_profiles_roles_gender_dob.sql).
-- Run once in Supabase SQL Editor.

insert into public.schools (id, name)
values ('00000000-0000-0000-0000-000000000001', 'MoneyTykes Classroom')
on conflict (id) do nothing;

insert into public.profiles (id, email, first_name, last_name, role, school_id, status)
select
  u.id,
  u.email,
  'Glenrick',
  'Spain',
  'dev',
  '00000000-0000-0000-0000-000000000001',
  'active'
from auth.users u
where lower(u.email) = lower('glenrickmspain@hotmail.com')
on conflict (id) do update set
  email = excluded.email,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  role = 'dev',
  school_id = excluded.school_id,
  status = 'active';

-- Confirm it worked:
select id, email, first_name, last_name, role, school_id, status
from public.profiles
where lower(email) = lower('glenrickmspain@hotmail.com');
