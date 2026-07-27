-- Live DB still had legacy is_school_admin() = role 'school_admin' only.
-- Dev / Class Admin therefore could not see other profiles (esp. null school_id).

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_dev() or public.is_class_admin();
$$;

drop policy if exists profiles_select_self_or_school on public.profiles;
create policy profiles_select_self_or_school on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_dev()
    or (public.is_class_admin() and public.same_school(school_id))
    or (public.is_class_admin() and school_id is null)
    or public.same_school(school_id)
  );

drop policy if exists profiles_admin_update_school on public.profiles;
create policy profiles_admin_update_school on public.profiles
  for update to authenticated
  using (
    public.is_dev()
    or (public.is_class_admin() and public.same_school(school_id))
    or (public.is_class_admin() and school_id is null)
  )
  with check (
    public.is_dev()
    or (public.is_class_admin() and (school_id is null or public.same_school(school_id)))
  );

notify pgrst, 'reload schema';
