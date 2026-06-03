# Supabase Setup

## Apply Migrations

Set `DATABASE_URL` in `.env`, then run:

```bash
npm run db:migrate
```

The migration creates:

- `profiles`
- `user_roles`
- `invitations`
- `mentor_mentee_relationships`
- invite validation and acceptance RPCs
- role helper functions
- RLS policies for the user foundation

## Required Auth Variables

The web app still needs these Supabase API values for Auth:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`DATABASE_URL` is only for migrations and direct database maintenance.

## Initial Admin

After the first admin user exists in Supabase Auth, grant initial roles from the SQL editor:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.user_role
from auth.users
where email = 'your-email@example.com'
on conflict do nothing;

insert into public.user_roles (user_id, role)
select id, 'mentor'::public.user_role
from auth.users
where email = 'your-email@example.com'
on conflict do nothing;
```
