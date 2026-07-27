# Supabase setup (MoneyTykes Teacher Dashboard)

## 1. Create project
Project URL (this app): `https://rjqpojykfankjmlpdnca.supabase.co`  
Project ref: `rjqpojykfankjmlpdnca`

## 2. Apply migrations
From the repo root (with Supabase CLI linked):

```bash
supabase db push
```

Or paste SQL from `supabase/migrations/` in the SQL editor, in filename order.  
Newest roles migration: `20260724130000_profiles_roles_gender_dob.sql` (Dev / Class Admin / Teacher + gender + DOB).

## 3. Deploy Edge Functions

```bash
supabase functions deploy invite-user
supabase functions deploy admin-reset-password
supabase functions deploy admin-force-logout
supabase secrets set ALLOWED_ORIGIN=https://nonchxlantdev.github.io
```

Session presence migration: `20260725153000_user_sessions_presence.sql`  
(Admin → Online tab, single-device login, force logout.)

## 4. Bootstrap first Dev
After creating an Auth user in the dashboard, run [`bootstrap_admin.sql`](bootstrap_admin.sql) in the SQL editor (sets `glenrickmspain@hotmail.com` to role `dev`).

Roles:
- `dev` — Admin + all schools
- `class_admin` — Admin + own school
- `teacher` — no Admin section

## 5. Enable in the SPA
Set in `.env` / GitHub secrets:

```
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 6. Auth dashboard settings
- Disable public sign-ups
- Confirm email for invites
- Add redirect URLs for `/moneytykesdashboard/` and `/moneytykesdashboard/login`
