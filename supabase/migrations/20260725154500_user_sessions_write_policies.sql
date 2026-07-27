-- Ensure authenticated users can manage their own presence rows,
-- and admins can read school (or all) sessions without relying only on RPCs.

drop policy if exists user_sessions_insert_own on public.user_sessions;
create policy user_sessions_insert_own on public.user_sessions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists user_sessions_update_own on public.user_sessions;
create policy user_sessions_update_own on public.user_sessions
  for update to authenticated
  using (user_id = auth.uid() or public.is_school_admin())
  with check (user_id = auth.uid() or public.is_school_admin());

-- Keep existing select policy from prior migration.
