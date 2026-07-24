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

## 3. Deploy Edge Function

```bash
supabase functions deploy invite-user
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... ALLOWED_ORIGIN=https://nonchxlantdev.github.io
```

## 4. Bootstrap first admin
After creating an Auth user in the dashboard:

```sql
insert into public.schools (id, name) values ('00000000-0000-0000-0000-000000000001', 'MoneyTykes Classroom');
insert into public.profiles (id, email, first_name, last_name, role, school_id, status)
values (
  '<AUTH_USER_UUID>',
  'shamira.young@moneytykes.school',
  'Shamira',
  'Young',
  'school_admin',
  '00000000-0000-0000-0000-000000000001',
  'active'
);
```

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
