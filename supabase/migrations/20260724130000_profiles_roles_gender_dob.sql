-- Profiles: Dev / Class Admin / Teacher roles + gender + date_of_birth.
-- Age is derived client-side from date_of_birth (not stored).

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists gender text not null default '';

alter table public.profiles
  add column if not exists date_of_birth date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_gender_check'
  ) then
    alter table public.profiles
      add constraint profiles_gender_check
      check (gender in ('', 'male', 'female'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Roles: drop OLD check first, then migrate values, then add NEW check
-- (old check only allowed teacher|school_admin — cannot update to class_admin first)
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;

do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
      and (
        pg_get_constraintdef(oid) ilike '%school_admin%'
        or pg_get_constraintdef(oid) ilike '%class_admin%'
        or pg_get_constraintdef(oid) ilike '%teacher%'
      )
  loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

update public.profiles
set role = 'class_admin'
where role = 'school_admin';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('dev', 'class_admin', 'teacher'));

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_dev()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'dev' and status = 'active'
  );
$$;

create or replace function public.is_class_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'class_admin' and status = 'active'
  );
$$;

-- Elevated UI/admin privileges (Dev or Class Admin). Keeps legacy name for policies.
create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_dev() or public.is_class_admin();
$$;

-- Dev: any school. Class Admin: own school only.
create or replace function public.can_manage_school(target_school uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_dev()
    or (public.is_class_admin() and public.same_school(target_school));
$$;

-- ---------------------------------------------------------------------------
-- Core policies: school-scoped writes allow Dev everywhere
-- ---------------------------------------------------------------------------
drop policy if exists schools_select_same on public.schools;
create policy schools_select_same on public.schools
  for select to authenticated
  using (public.is_dev() or public.same_school(id) or public.is_class_admin());

drop policy if exists schools_admin_insert on public.schools;
create policy schools_admin_insert on public.schools
  for insert to authenticated
  with check (public.is_school_admin());

drop policy if exists schools_admin_update on public.schools;
create policy schools_admin_update on public.schools
  for update to authenticated
  using (public.can_manage_school(id))
  with check (public.can_manage_school(id));

drop policy if exists schools_admin_delete on public.schools;
create policy schools_admin_delete on public.schools
  for delete to authenticated
  using (public.can_manage_school(id));

drop policy if exists profiles_select_self_or_school on public.profiles;
create policy profiles_select_self_or_school on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_dev()
    or (public.is_class_admin() and public.same_school(school_id))
    or public.same_school(school_id)
  );

drop policy if exists profiles_admin_update_school on public.profiles;
create policy profiles_admin_update_school on public.profiles
  for update to authenticated
  using (public.can_manage_school(school_id) or (public.is_dev() and school_id is null))
  with check (public.can_manage_school(school_id) or (public.is_dev() and school_id is null));

drop policy if exists classes_select_school on public.classes;
create policy classes_select_school on public.classes
  for select to authenticated
  using (public.is_dev() or public.same_school(school_id));

drop policy if exists classes_admin_write on public.classes;
create policy classes_admin_write on public.classes
  for all to authenticated
  using (public.can_manage_school(school_id))
  with check (public.can_manage_school(school_id));

drop policy if exists students_select_school on public.students;
create policy students_select_school on public.students
  for select to authenticated
  using ((public.is_dev() or public.same_school(school_id)) and deleted_at is null);

drop policy if exists students_admin_insert on public.students;
create policy students_admin_insert on public.students
  for insert to authenticated
  with check (public.can_manage_school(school_id));

drop policy if exists students_admin_update on public.students;
create policy students_admin_update on public.students
  for update to authenticated
  using (public.can_manage_school(school_id))
  with check (public.can_manage_school(school_id));

drop policy if exists students_teacher_update on public.students;
create policy students_teacher_update on public.students
  for update to authenticated
  using (public.same_school(school_id) and not public.is_school_admin())
  with check (public.same_school(school_id));

drop policy if exists students_admin_delete on public.students;
create policy students_admin_delete on public.students
  for delete to authenticated
  using (public.can_manage_school(school_id));

drop policy if exists tca_select on public.teacher_class_assignments;
create policy tca_select on public.teacher_class_assignments
  for select to authenticated
  using (
    teacher_id = auth.uid()
    or public.is_school_admin()
  );

drop policy if exists tca_admin_write on public.teacher_class_assignments;
create policy tca_admin_write on public.teacher_class_assignments
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

drop policy if exists audit_admin_select on public.audit_log;
create policy audit_admin_select on public.audit_log
  for select to authenticated
  using (public.can_manage_school(school_id));
