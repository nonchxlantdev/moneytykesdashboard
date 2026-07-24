# MoneyTykes Teacher Dashboard — Security

Threat model and hardening checklist for the Supabase-backed teacher app on GitHub Pages.

## Trust boundaries

| Layer | Trust |
|-------|--------|
| GitHub Pages SPA | Untrusted client — anyone can inspect the anon key |
| Supabase Auth | Issues JWTs; invite-only signup |
| Postgres RLS | **Real** authorization boundary |
| Edge Functions | Service role; validate JWT + rate limit + admin role |

Never put `SUPABASE_SERVICE_ROLE_KEY` in Vite env, the SPA, or GitHub Pages build logs.

## Roles (v1)

- `school_admin` — Admin nav, invite teachers/admins, manage schools/classes/students
- `teacher` — Classroom tools only; no Admin nav; cannot create students/teachers

## Environment

```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

GitHub Actions Pages build secrets (same names). Edge Function secrets:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN` — e.g. `https://nonchxlantdev.github.io`

## Auth settings (dashboard)

1. Disable public signup
2. Enable email confirmations for invites
3. Password min length ≥ 8 (prefer leak detection if available)
4. Redirect allow-list: `https://<pages-host>/moneytykesdashboard/` and `/login`

## Deploy order

1. Apply migrations in `supabase/migrations/`
2. Deploy `invite-user` Edge Function
3. Create first school + first `school_admin` profile linked to `auth.users` (SQL or dashboard)
4. Set `VITE_USE_SUPABASE=true` and rebuild Pages

## Checklist

- [ ] RLS enabled on all public tables (default deny)
- [ ] Policy tests: teacher cannot read other schools; teacher cannot invite
- [ ] Invite-only; open signup disabled
- [ ] Service role only in Edge Functions
- [ ] CORS locked to Pages origin on functions
- [ ] Rate limits on `invite-user` (per admin + per school)
- [ ] Audit log rows for invites
- [ ] Soft-delete (`students.deleted_at`) for roster removals
- [ ] Storage buckets private (lesson files) when Storage is enabled
- [ ] Staging project separate from production
- [ ] Document revoke user + rotate anon key incident steps
- [ ] CI secret scanning / `npm audit` on PRs

## Incident basics

1. Disable compromised user in Auth + set `profiles.status = inactive`
2. If anon key leaked, rotate in Supabase and update Pages secrets
3. Review `audit_log` for the affected school
