-- Tighten teacher WRITE access to assigned classes.
-- SELECT stays school-wide (shared dashboard reads are intentional).
--
-- CLASS ID MISMATCH (important):
-- attendance_records.class_id and calendar_events.class_id are TEXT (often a
-- slug of the class label from the React app, e.g. "form-2"), while
-- teacher_class_assignments.class_id is a UUID FK to public.classes(id).
-- lessons / rewards_bank have no class column at all.
-- We match text refs to assigned classes via UUID string OR classes.name
-- (exact / case-insensitive / slug). Closest safe approximation until
-- those columns are migrated to uuid FKs.

create or replace function public.slugify_class_name(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from lower(regexp_replace(coalesce(value, ''), '[^a-zA-Z0-9]+', '-', 'g')));
$$;

-- True when the acting teacher is assigned to the class identified by text ref,
-- or when the actor is a school admin / Dev (bypass).
create or replace function public.teacher_assigned_to_class_ref(class_ref text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_school_admin()
    or (
      class_ref is not null
      and nullif(trim(class_ref), '') is not null
      and exists (
        select 1
        from public.teacher_class_assignments tca
        join public.classes c on c.id = tca.class_id
        where tca.teacher_id = auth.uid()
          and (
            c.id::text = trim(class_ref)
            or lower(c.name) = lower(trim(class_ref))
            or public.slugify_class_name(c.name) = public.slugify_class_name(class_ref)
          )
      )
    );
$$;

create or replace function public.teacher_assigned_to_student(target_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_school_admin()
    or exists (
      select 1
      from public.students s
      where s.id = target_student
        and public.teacher_assigned_to_class_ref(s.class_label)
    );
$$;

-- ---------------------------------------------------------------------------
-- attendance_records
-- ---------------------------------------------------------------------------
drop policy if exists attendance_school_all on public.attendance_records;
drop policy if exists attendance_school_select on public.attendance_records;
drop policy if exists attendance_school_write on public.attendance_records;
drop policy if exists attendance_school_update on public.attendance_records;
drop policy if exists attendance_school_delete on public.attendance_records;

create policy attendance_school_select on public.attendance_records
  for select to authenticated
  using (public.same_school(school_id));

create policy attendance_school_insert on public.attendance_records
  for insert to authenticated
  with check (
    public.same_school(school_id)
    and public.teacher_assigned_to_class_ref(class_id)
  );

create policy attendance_school_update on public.attendance_records
  for update to authenticated
  using (
    public.same_school(school_id)
    and public.teacher_assigned_to_class_ref(class_id)
  )
  with check (
    public.same_school(school_id)
    and public.teacher_assigned_to_class_ref(class_id)
  );

create policy attendance_school_delete on public.attendance_records
  for delete to authenticated
  using (
    public.same_school(school_id)
    and public.teacher_assigned_to_class_ref(class_id)
  );

-- ---------------------------------------------------------------------------
-- calendar_events — empty class_id / school-scope: admin-only writes
-- ---------------------------------------------------------------------------
drop policy if exists calendar_school_all on public.calendar_events;
drop policy if exists calendar_school_select on public.calendar_events;
drop policy if exists calendar_school_insert on public.calendar_events;
drop policy if exists calendar_school_update on public.calendar_events;
drop policy if exists calendar_school_delete on public.calendar_events;

create policy calendar_school_select on public.calendar_events
  for select to authenticated
  using (public.same_school(school_id));

create policy calendar_school_insert on public.calendar_events
  for insert to authenticated
  with check (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or (
        coalesce(nullif(trim(class_id), ''), '') <> ''
        and public.teacher_assigned_to_class_ref(class_id)
      )
    )
  );

create policy calendar_school_update on public.calendar_events
  for update to authenticated
  using (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or (
        coalesce(nullif(trim(class_id), ''), '') <> ''
        and public.teacher_assigned_to_class_ref(class_id)
      )
    )
  )
  with check (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or (
        coalesce(nullif(trim(class_id), ''), '') <> ''
        and public.teacher_assigned_to_class_ref(class_id)
      )
    )
  );

create policy calendar_school_delete on public.calendar_events
  for delete to authenticated
  using (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or (
        coalesce(nullif(trim(class_id), ''), '') <> ''
        and public.teacher_assigned_to_class_ref(class_id)
      )
    )
  );

-- ---------------------------------------------------------------------------
-- points_ledger — scope via student's class_label
-- ---------------------------------------------------------------------------
drop policy if exists points_ledger_school_all on public.points_ledger;
drop policy if exists points_ledger_school_select on public.points_ledger;
drop policy if exists points_ledger_school_insert on public.points_ledger;
drop policy if exists points_ledger_school_update on public.points_ledger;
drop policy if exists points_ledger_school_delete on public.points_ledger;

create policy points_ledger_school_select on public.points_ledger
  for select to authenticated
  using (public.same_school(school_id));

create policy points_ledger_school_insert on public.points_ledger
  for insert to authenticated
  with check (
    public.same_school(school_id)
    and public.teacher_assigned_to_student(student_id)
  );

create policy points_ledger_school_update on public.points_ledger
  for update to authenticated
  using (
    public.same_school(school_id)
    and public.teacher_assigned_to_student(student_id)
  )
  with check (
    public.same_school(school_id)
    and public.teacher_assigned_to_student(student_id)
  );

create policy points_ledger_school_delete on public.points_ledger
  for delete to authenticated
  using (
    public.same_school(school_id)
    and public.teacher_assigned_to_student(student_id)
  );

-- ---------------------------------------------------------------------------
-- report_cards — class_label text + student_id
-- ---------------------------------------------------------------------------
drop policy if exists report_cards_school_all on public.report_cards;
drop policy if exists report_cards_school_select on public.report_cards;
drop policy if exists report_cards_school_insert on public.report_cards;
drop policy if exists report_cards_school_update on public.report_cards;
drop policy if exists report_cards_school_delete on public.report_cards;

create policy report_cards_school_select on public.report_cards
  for select to authenticated
  using (public.same_school(school_id));

create policy report_cards_school_insert on public.report_cards
  for insert to authenticated
  with check (
    public.same_school(school_id)
    and (
      public.teacher_assigned_to_class_ref(class_label)
      or public.teacher_assigned_to_student(student_id)
    )
  );

create policy report_cards_school_update on public.report_cards
  for update to authenticated
  using (
    public.same_school(school_id)
    and (
      public.teacher_assigned_to_class_ref(class_label)
      or public.teacher_assigned_to_student(student_id)
    )
  )
  with check (
    public.same_school(school_id)
    and (
      public.teacher_assigned_to_class_ref(class_label)
      or public.teacher_assigned_to_student(student_id)
    )
  );

create policy report_cards_school_delete on public.report_cards
  for delete to authenticated
  using (
    public.same_school(school_id)
    and (
      public.teacher_assigned_to_class_ref(class_label)
      or public.teacher_assigned_to_student(student_id)
    )
  );

-- ---------------------------------------------------------------------------
-- lessons — NO class_id column. Closest safe approx: owner writes + admin.
-- ---------------------------------------------------------------------------
drop policy if exists lessons_school_all on public.lessons;
drop policy if exists lessons_school_select on public.lessons;
drop policy if exists lessons_school_insert on public.lessons;
drop policy if exists lessons_school_update on public.lessons;
drop policy if exists lessons_school_delete on public.lessons;

create policy lessons_school_select on public.lessons
  for select to authenticated
  using (public.same_school(school_id));

create policy lessons_school_insert on public.lessons
  for insert to authenticated
  with check (
    public.same_school(school_id)
    and (public.is_school_admin() or created_by = auth.uid())
  );

create policy lessons_school_update on public.lessons
  for update to authenticated
  using (
    public.same_school(school_id)
    and (public.is_school_admin() or created_by = auth.uid())
  )
  with check (
    public.same_school(school_id)
    and (public.is_school_admin() or created_by = auth.uid())
  );

create policy lessons_school_delete on public.lessons
  for delete to authenticated
  using (
    public.same_school(school_id)
    and (public.is_school_admin() or created_by = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- rewards_bank — school-level catalog, no class_id.
-- Closest approx: require at least one class assignment (or admin) so a
-- teacher with zero assignments cannot mutate the school rewards bank.
-- ---------------------------------------------------------------------------
drop policy if exists rewards_bank_school_all on public.rewards_bank;
drop policy if exists rewards_bank_school_select on public.rewards_bank;
drop policy if exists rewards_bank_school_insert on public.rewards_bank;
drop policy if exists rewards_bank_school_update on public.rewards_bank;
drop policy if exists rewards_bank_school_delete on public.rewards_bank;

create policy rewards_bank_school_select on public.rewards_bank
  for select to authenticated
  using (public.same_school(school_id));

create policy rewards_bank_school_insert on public.rewards_bank
  for insert to authenticated
  with check (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or exists (
        select 1 from public.teacher_class_assignments tca
        where tca.teacher_id = auth.uid()
      )
    )
  );

create policy rewards_bank_school_update on public.rewards_bank
  for update to authenticated
  using (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or exists (
        select 1 from public.teacher_class_assignments tca
        where tca.teacher_id = auth.uid()
      )
    )
  )
  with check (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or exists (
        select 1 from public.teacher_class_assignments tca
        where tca.teacher_id = auth.uid()
      )
    )
  );

create policy rewards_bank_school_delete on public.rewards_bank
  for delete to authenticated
  using (
    public.same_school(school_id)
    and (
      public.is_school_admin()
      or exists (
        select 1 from public.teacher_class_assignments tca
        where tca.teacher_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- students_teacher_update — require class assignment via class_label
-- ---------------------------------------------------------------------------
drop policy if exists students_teacher_update on public.students;
create policy students_teacher_update on public.students
  for update to authenticated
  using (
    public.same_school(school_id)
    and not public.is_school_admin()
    and public.teacher_assigned_to_class_ref(class_label)
  )
  with check (
    public.same_school(school_id)
    and public.teacher_assigned_to_class_ref(class_label)
  );

-- report_card_templates stay school-admin style (already school-scoped ALL);
-- leave unchanged — templates are school-wide config, not class-scoped.

notify pgrst, 'reload schema';
