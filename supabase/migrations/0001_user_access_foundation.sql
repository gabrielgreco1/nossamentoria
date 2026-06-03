create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('admin', 'mentor', 'mentee');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.relationship_status as enum ('pending', 'active', 'ended');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  bio text,
  stack text,
  availability_notes text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  intended_role public.user_role not null,
  invited_by uuid references auth.users(id) on delete set null,
  mentor_user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  status public.invitation_status not null default 'pending',
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_email_lowercase check (email = lower(email)),
  constraint invitations_acceptance_consistency check (
    (status = 'accepted' and accepted_at is not null and accepted_by is not null)
    or (status <> 'accepted')
  )
);

create index if not exists invitations_email_idx on public.invitations (email);
create index if not exists invitations_invited_by_idx on public.invitations (invited_by);
create index if not exists invitations_mentor_user_id_idx on public.invitations (mentor_user_id);

create table if not exists public.mentor_mentee_relationships (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid not null references auth.users(id) on delete cascade,
  mentee_user_id uuid not null references auth.users(id) on delete cascade,
  status public.relationship_status not null default 'pending',
  invited_via_id uuid references public.invitations(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentor_mentee_distinct_users check (mentor_user_id <> mentee_user_id),
  constraint mentor_mentee_unique_pair unique (mentor_user_id, mentee_user_id)
);

create index if not exists mentor_mentee_relationships_mentor_idx
  on public.mentor_mentee_relationships (mentor_user_id);
create index if not exists mentor_mentee_relationships_mentee_idx
  on public.mentor_mentee_relationships (mentee_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_invitations_updated_at on public.invitations;
create trigger set_invitations_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

drop trigger if exists set_mentor_mentee_relationships_updated_at on public.mentor_mentee_relationships;
create trigger set_mentor_mentee_relationships_updated_at
before update on public.mentor_mentee_relationships
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    nullif(coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name'), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.has_role(target_user_id uuid, target_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = target_user_id
      and role = target_role
  );
$$;

create or replace function public.current_user_has_role(target_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), target_role);
$$;

create or replace function public.validate_invitation_token(invitation_token text)
returns table (
  status text,
  email text,
  intended_role text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.invitations%rowtype;
  hashed_token text;
begin
  if invitation_token is null or btrim(invitation_token) = '' then
    return query select 'invalid'::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  hashed_token := encode(digest(invitation_token, 'sha256'), 'hex');

  select *
  into invitation
  from public.invitations
  where token_hash = hashed_token
  limit 1;

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  if invitation.status = 'revoked' or invitation.revoked_at is not null then
    return query select 'revoked'::text, invitation.email, invitation.intended_role::text, invitation.expires_at;
    return;
  end if;

  if invitation.status = 'accepted' or invitation.accepted_at is not null then
    return query select 'used'::text, invitation.email, invitation.intended_role::text, invitation.expires_at;
    return;
  end if;

  if invitation.expires_at < now() then
    update public.invitations
    set status = 'expired'
    where id = invitation.id
      and status = 'pending';

    return query select 'expired'::text, invitation.email, invitation.intended_role::text, invitation.expires_at;
    return;
  end if;

  return query select 'valid'::text, invitation.email, invitation.intended_role::text, invitation.expires_at;
end;
$$;

create or replace function public.accept_invitation_token(invitation_token text, accepting_user_id uuid)
returns table (
  ok boolean,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.invitations%rowtype;
  hashed_token text;
  accepting_email text;
begin
  if accepting_user_id is null then
    return query select false, 'Usuário autenticado não informado.'::text;
    return;
  end if;

  hashed_token := encode(digest(invitation_token, 'sha256'), 'hex');

  select *
  into invitation
  from public.invitations
  where token_hash = hashed_token
  for update;

  if not found then
    return query select false, 'Convite inválido.'::text;
    return;
  end if;

  if invitation.status <> 'pending' or invitation.revoked_at is not null or invitation.accepted_at is not null then
    return query select false, 'Convite não está pendente.'::text;
    return;
  end if;

  if invitation.expires_at < now() then
    update public.invitations
    set status = 'expired'
    where id = invitation.id;

    return query select false, 'Convite expirado.'::text;
    return;
  end if;

  select lower(email)
  into accepting_email
  from auth.users
  where id = accepting_user_id;

  if accepting_email is distinct from invitation.email then
    return query select false, 'Email autenticado não corresponde ao convite.'::text;
    return;
  end if;

  insert into public.profiles (id, email)
  values (accepting_user_id, accepting_email)
  on conflict (id) do update set email = excluded.email;

  insert into public.user_roles (user_id, role, assigned_by)
  values (accepting_user_id, invitation.intended_role, invitation.invited_by)
  on conflict (user_id, role) do nothing;

  if invitation.mentor_user_id is not null and invitation.intended_role = 'mentee' then
    insert into public.mentor_mentee_relationships (
      mentor_user_id,
      mentee_user_id,
      status,
      invited_via_id,
      created_by,
      accepted_at
    )
    values (
      invitation.mentor_user_id,
      accepting_user_id,
      'active',
      invitation.id,
      invitation.invited_by,
      now()
    )
    on conflict (mentor_user_id, mentee_user_id) do update
      set status = 'active',
          accepted_at = coalesce(public.mentor_mentee_relationships.accepted_at, now()),
          invited_via_id = coalesce(public.mentor_mentee_relationships.invited_via_id, invitation.id);
  end if;

  update public.invitations
  set status = 'accepted',
      accepted_at = now(),
      accepted_by = accepting_user_id
  where id = invitation.id;

  return query select true, 'Convite aceito.'::text;
end;
$$;

create or replace function public.create_invitation(
  invitee_email text,
  target_role public.user_role,
  mentor_target_user_id uuid default null,
  expires_in interval default interval '7 days'
)
returns table (
  id uuid,
  token text,
  email text,
  intended_role text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_token text;
  normalized_email text;
  current_user_id uuid := auth.uid();
  created_id uuid;
  created_expires_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'Usuário autenticado é obrigatório.';
  end if;

  if not public.has_role(current_user_id, 'admin') then
    if target_role <> 'mentee' or not public.has_role(current_user_id, 'mentor') then
      raise exception 'Usuário não autorizado a criar este convite.';
    end if;
  end if;

  normalized_email := lower(btrim(invitee_email));

  if normalized_email = '' or normalized_email not like '%@%' then
    raise exception 'Email inválido.';
  end if;

  raw_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  insert into public.invitations (
    email,
    token_hash,
    intended_role,
    invited_by,
    mentor_user_id,
    expires_at
  )
  values (
    normalized_email,
    encode(digest(raw_token, 'sha256'), 'hex'),
    target_role,
    current_user_id,
    coalesce(mentor_target_user_id, case when target_role = 'mentee' then current_user_id else null end),
    now() + expires_in
  )
  returning invitations.id, invitations.expires_at
  into created_id, created_expires_at;

  return query select created_id, raw_token, normalized_email, target_role::text, created_expires_at;
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.invitations enable row level security;
alter table public.mentor_mentee_relationships enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
)
with check (
  id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
);

drop policy if exists "user_roles_select_own_or_admin" on public.user_roles;
create policy "user_roles_select_own_or_admin"
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
);

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "invitations_select_admin_inviter_or_invitee" on public.invitations;
create policy "invitations_select_admin_inviter_or_invitee"
on public.invitations
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or invited_by = auth.uid()
  or email = lower(coalesce(auth.jwt()->>'email', ''))
);

drop policy if exists "invitations_admin_or_inviter_update" on public.invitations;
create policy "invitations_admin_or_inviter_update"
on public.invitations
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or invited_by = auth.uid()
)
with check (
  public.has_role(auth.uid(), 'admin')
  or invited_by = auth.uid()
);

drop policy if exists "relationships_select_involved_or_admin" on public.mentor_mentee_relationships;
create policy "relationships_select_involved_or_admin"
on public.mentor_mentee_relationships
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or mentor_user_id = auth.uid()
  or mentee_user_id = auth.uid()
);

drop policy if exists "relationships_update_involved_or_admin" on public.mentor_mentee_relationships;
create policy "relationships_update_involved_or_admin"
on public.mentor_mentee_relationships
for update
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or mentor_user_id = auth.uid()
  or mentee_user_id = auth.uid()
)
with check (
  public.has_role(auth.uid(), 'admin')
  or mentor_user_id = auth.uid()
  or mentee_user_id = auth.uid()
);

grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, update on public.invitations to authenticated;
grant select, update on public.mentor_mentee_relationships to authenticated;
grant execute on function public.validate_invitation_token(text) to anon, authenticated, service_role;
grant execute on function public.accept_invitation_token(text, uuid) to authenticated, service_role;
grant execute on function public.create_invitation(text, public.user_role, uuid, interval) to authenticated, service_role;
grant execute on function public.has_role(uuid, public.user_role) to authenticated, service_role;
grant execute on function public.current_user_has_role(public.user_role) to authenticated, service_role;
