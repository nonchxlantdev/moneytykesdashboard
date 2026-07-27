-- Prevent privilege escalation via profiles.role / school_id writes.
-- Client-side AdminDashboard.canAssignDevRole is not a security boundary —
-- Class Admins can call PostgREST directly. This trigger enforces role rules
-- at the database layer for every INSERT/UPDATE on public.profiles.

create or replace function public.enforce_profile_privilege_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_is_dev boolean := public.is_dev();
  actor_school uuid := public.my_school_id();
  role_changed boolean;
  school_changed boolean;
begin
  -- Service-role / bootstrap paths (no JWT) are allowed; Edge Functions use service role.
  if auth.uid() is null then
    return new;
  end if;

  role_changed := (tg_op = 'INSERT')
    or (coalesce(old.role, '') is distinct from coalesce(new.role, ''));
  school_changed := (tg_op = 'INSERT')
    or (old.school_id is distinct from new.school_id);

  -- Only a Dev may grant or create the Dev role.
  -- Allow no-op updates that leave an existing Dev row's role unchanged.
  if new.role = 'dev' and role_changed and not actor_is_dev then
    raise exception 'Only Dev can assign the Dev role'
      using errcode = '42501';
  end if;

  -- Non-Dev actors may not demote/alter an existing Dev profile's role.
  if tg_op = 'UPDATE'
     and old.role = 'dev'
     and role_changed
     and not actor_is_dev then
    raise exception 'Only Dev can change a Dev profile role'
      using errcode = '42501';
  end if;

  -- Class Admin may not move a profile into a school they do not belong to.
  -- Dev may assign any school_id (including null).
  if school_changed
     and not actor_is_dev
     and new.school_id is not null
     and (actor_school is null or new.school_id is distinct from actor_school) then
    raise exception 'Cannot assign a profile to another school'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_enforce_privilege_rules on public.profiles;
create trigger profiles_enforce_privilege_rules
  before insert or update on public.profiles
  for each row
  execute function public.enforce_profile_privilege_rules();
