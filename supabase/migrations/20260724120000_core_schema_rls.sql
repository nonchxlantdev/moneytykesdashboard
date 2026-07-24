-- MoneyTykes Teacher Dashboard — core schema + RLS
-- Apply with: supabase db push  (or SQL editor in dashboard)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text default '',
  email text default '',
  phone text default '',
  address text default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'teacher' check (role in ('teacher', 'school_admin')),
  school_id uuid references public.schools (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_school_id_idx on public.profiles (school_id);
create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'school_admin' and status = 'active'
  );
$$;

create or replace function public.same_school(target_school uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and school_id is not null
      and school_id = target_school
  );
$$;

create or replace function public.my_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid();
$$;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete set null,
  first_name text not null default '',
  last_name text not null default '',
  email text default '',
  gender text default '',
  age int,
  dob date,
  class_label text not null default '',
  guardian text default '',
  phone text default '',
  photo text default '',
  avatar text default '',
  balance numeric not null default 0,
  total_earned numeric not null default 0,
  streak int not null default 0,
  status text not null default 'inactive',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_school_id_idx on public.students (school_id);
create index if not exists students_class_label_idx on public.students (class_label);
create index if not exists students_deleted_at_idx on public.students (deleted_at);

create table if not exists public.teacher_class_assignments (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, class_id)
);

-- Rate limits for Edge Functions
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);

-- Admin audit trail
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  school_id uuid references public.schools (id) on delete set null,
  action text not null,
  target_type text default '',
  target_id text default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_school_id_idx on public.audit_log (school_id);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.teacher_class_assignments enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_log enable row level security;

-- Schools
drop policy if exists schools_select_same on public.schools;
create policy schools_select_same on public.schools
  for select to authenticated
  using (public.same_school(id) or public.is_school_admin());

drop policy if exists schools_admin_insert on public.schools;
create policy schools_admin_insert on public.schools
  for insert to authenticated
  with check (public.is_school_admin());

drop policy if exists schools_admin_update on public.schools;
create policy schools_admin_update on public.schools
  for update to authenticated
  using (public.is_school_admin() and public.same_school(id))
  with check (public.is_school_admin() and public.same_school(id));

drop policy if exists schools_admin_delete on public.schools;
create policy schools_admin_delete on public.schools
  for delete to authenticated
  using (public.is_school_admin() and public.same_school(id));

-- Profiles
drop policy if exists profiles_select_self_or_school on public.profiles;
create policy profiles_select_self_or_school on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (public.is_school_admin() and public.same_school(school_id))
    or public.same_school(school_id)
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_admin_update_school on public.profiles;
create policy profiles_admin_update_school on public.profiles
  for update to authenticated
  using (public.is_school_admin() and public.same_school(school_id))
  with check (public.is_school_admin() and public.same_school(school_id));

-- Inserts into profiles happen via service role (invite Edge Function).

-- Classes
drop policy if exists classes_select_school on public.classes;
create policy classes_select_school on public.classes
  for select to authenticated
  using (public.same_school(school_id));

drop policy if exists classes_admin_write on public.classes;
create policy classes_admin_write on public.classes
  for all to authenticated
  using (public.is_school_admin() and public.same_school(school_id))
  with check (public.is_school_admin() and public.same_school(school_id));

-- Students
drop policy if exists students_select_school on public.students;
create policy students_select_school on public.students
  for select to authenticated
  using (public.same_school(school_id) and deleted_at is null);

drop policy if exists students_admin_insert on public.students;
create policy students_admin_insert on public.students
  for insert to authenticated
  with check (public.is_school_admin() and public.same_school(school_id));

drop policy if exists students_admin_update on public.students;
create policy students_admin_update on public.students
  for update to authenticated
  using (public.is_school_admin() and public.same_school(school_id))
  with check (public.is_school_admin() and public.same_school(school_id));

drop policy if exists students_teacher_update on public.students;
create policy students_teacher_update on public.students
  for update to authenticated
  using (public.same_school(school_id) and not public.is_school_admin())
  with check (public.same_school(school_id));

drop policy if exists students_admin_delete on public.students;
create policy students_admin_delete on public.students
  for delete to authenticated
  using (public.is_school_admin() and public.same_school(school_id));

-- Assignments
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

-- rate_limits / audit_log: no direct client access (service role only)
drop policy if exists rate_limits_deny on public.rate_limits;
create policy rate_limits_deny on public.rate_limits
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists audit_admin_select on public.audit_log;
create policy audit_admin_select on public.audit_log
  for select to authenticated
  using (public.is_school_admin() and public.same_school(school_id));

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists schools_set_updated_at on public.schools;
create trigger schools_set_updated_at before update on public.schools
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at before update on public.classes
  for each row execute function public.set_updated_at();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at before update on public.students
  for each row execute function public.set_updated_at();
