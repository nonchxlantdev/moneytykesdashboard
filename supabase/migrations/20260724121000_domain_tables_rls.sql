-- Domain tables for attendance, rewards, calendar, lessons, report cards, My Day

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_id text not null,
  attendance_date date not null,
  student_id uuid not null references public.students (id) on delete cascade,
  student_name text default '',
  status text not null check (status in ('present', 'absent', 'late', 'sick', 'excused')),
  note text default '',
  recorded_by uuid references public.profiles (id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique (class_id, attendance_date, student_id)
);

create index if not exists attendance_school_date_idx
  on public.attendance_records (school_id, attendance_date desc);

create table if not exists public.rewards_bank (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  point_value int not null default 0,
  icon text default '',
  description text default '',
  category text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  reward_id uuid references public.rewards_bank (id) on delete set null,
  reward_name text default '',
  reward_icon text default '',
  points int not null default 0,
  note text default '',
  awarded_by uuid references public.profiles (id) on delete set null,
  awarded_at timestamptz not null default now()
);

create index if not exists points_ledger_student_idx on public.points_ledger (student_id, awarded_at desc);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  title text not null,
  event_type text default 'reminder',
  scope text default 'school',
  class_id text default '',
  event_date date not null,
  event_time text default '',
  location text default '',
  notes text default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  title text not null default 'Untitled Lesson',
  subject text default '',
  description text default '',
  lesson_type text default 'plan',
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_card_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  template jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (school_id)
);

create table if not exists public.report_cards (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  term text not null default '',
  class_label text default '',
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.my_day_tasks (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.my_day_notes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.my_day_reflections (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  reflection_date date not null,
  mood text not null default '',
  notes text default '',
  created_at timestamptz not null default now(),
  unique (teacher_id, reflection_date)
);

-- RLS
alter table public.attendance_records enable row level security;
alter table public.rewards_bank enable row level security;
alter table public.points_ledger enable row level security;
alter table public.calendar_events enable row level security;
alter table public.lessons enable row level security;
alter table public.report_card_templates enable row level security;
alter table public.report_cards enable row level security;
alter table public.my_day_tasks enable row level security;
alter table public.my_day_notes enable row level security;
alter table public.my_day_reflections enable row level security;

-- School-scoped read/write for classroom domains
create policy attendance_school_all on public.attendance_records
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

create policy rewards_bank_school_all on public.rewards_bank
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

create policy points_ledger_school_all on public.points_ledger
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

create policy calendar_school_all on public.calendar_events
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

create policy lessons_school_all on public.lessons
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

create policy report_templates_school_all on public.report_card_templates
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

create policy report_cards_school_all on public.report_cards
  for all to authenticated
  using (public.same_school(school_id))
  with check (public.same_school(school_id));

-- My Day — owner only
create policy my_day_tasks_owner on public.my_day_tasks
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy my_day_notes_owner on public.my_day_notes
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy my_day_reflections_owner on public.my_day_reflections
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
