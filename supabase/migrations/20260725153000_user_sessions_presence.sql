-- Active session presence + single-session enforcement helpers.

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  client_id text not null,
  user_agent text not null default '',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, client_id)
);

create index if not exists user_sessions_user_id_idx on public.user_sessions (user_id);
create index if not exists user_sessions_last_seen_idx on public.user_sessions (last_seen_at desc);
create index if not exists user_sessions_active_idx on public.user_sessions (user_id)
  where revoked_at is null;

alter table public.user_sessions enable row level security;

drop policy if exists user_sessions_select_own_or_admin on public.user_sessions;
create policy user_sessions_select_own_or_admin on public.user_sessions
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_dev()
    or (public.is_class_admin() and exists (
      select 1 from public.profiles p
      where p.id = user_sessions.user_id
        and public.same_school(p.school_id)
    ))
  );

-- Mutations go through security definer RPCs (claim / heartbeat / force logout).

-- Claim this browser as the sole active session for the signed-in user.
create or replace function public.claim_session(p_client_id text, p_user_agent text default '')
returns public.user_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.user_sessions;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_client_id is null or length(trim(p_client_id)) = 0 then
    raise exception 'client_id required';
  end if;

  update public.user_sessions
  set revoked_at = now()
  where user_id = uid
    and revoked_at is null
    and client_id <> trim(p_client_id);

  insert into public.user_sessions (user_id, client_id, user_agent, last_seen_at, revoked_at)
  values (uid, trim(p_client_id), coalesce(p_user_agent, ''), now(), null)
  on conflict (user_id, client_id) do update
    set user_agent = excluded.user_agent,
        last_seen_at = now(),
        revoked_at = null
  returning * into row;

  return row;
end;
$$;

revoke all on function public.claim_session(text, text) from public;
grant execute on function public.claim_session(text, text) to authenticated;

-- Heartbeat; returns ok=false when this client was force-logged-out or replaced.
create or replace function public.heartbeat_session(p_client_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.user_sessions;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  select * into row
  from public.user_sessions
  where user_id = uid
    and client_id = trim(p_client_id)
  limit 1;

  if row.id is null then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;

  if row.revoked_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'revoked');
  end if;

  -- Another client claimed the sole active session.
  if exists (
    select 1 from public.user_sessions s
    where s.user_id = uid
      and s.revoked_at is null
      and s.client_id <> trim(p_client_id)
      and s.last_seen_at > row.last_seen_at
  ) then
    update public.user_sessions
    set revoked_at = now()
    where id = row.id;
    return jsonb_build_object('ok', false, 'reason', 'replaced');
  end if;

  update public.user_sessions
  set last_seen_at = now()
  where id = row.id;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.heartbeat_session(text) from public;
grant execute on function public.heartbeat_session(text) to authenticated;

-- Admin: list sessions that look online (default last 2 minutes).
create or replace function public.list_online_sessions(p_within_seconds int default 120)
returns table (
  session_id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  school_id uuid,
  school_name text,
  client_id text,
  user_agent text,
  last_seen_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_school_admin() then
    raise exception 'Only Dev or Class Admin can list online sessions';
  end if;

  return query
  select
    s.id,
    s.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.school_id,
    sch.name,
    s.client_id,
    s.user_agent,
    s.last_seen_at,
    s.created_at
  from public.user_sessions s
  join public.profiles p on p.id = s.user_id
  left join public.schools sch on sch.id = p.school_id
  where s.revoked_at is null
    and s.last_seen_at >= now() - make_interval(secs => greatest(coalesce(p_within_seconds, 120), 30))
    and (
      public.is_dev()
      or public.same_school(p.school_id)
    )
  order by s.last_seen_at desc;
end;
$$;

revoke all on function public.list_online_sessions(int) from public;
grant execute on function public.list_online_sessions(int) to authenticated;

-- Admin: revoke all app sessions for a user (Auth global sign-out still needs Edge Function).
create or replace function public.admin_revoke_user_sessions(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  target_school uuid;
  updated_count int;
begin
  if not public.is_school_admin() then
    raise exception 'Only Dev or Class Admin can force logout';
  end if;

  select school_id into target_school from public.profiles where id = p_user_id;
  if target_school is null and not public.is_dev() then
    -- Class Admin may still force-logout unassigned teachers in their org only if Dev; require Dev for null school
    if not public.is_dev() then
      raise exception 'Cannot force logout this user';
    end if;
  elsif not public.can_manage_school(target_school) and not public.is_dev() then
    raise exception 'Cannot force logout users outside your school';
  end if;

  update public.user_sessions
  set revoked_at = now()
  where user_id = p_user_id
    and revoked_at is null;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.admin_revoke_user_sessions(uuid) from public;
grant execute on function public.admin_revoke_user_sessions(uuid) to authenticated;
