-- NossaMentoria - schema inicial completo do MVP
-- Destino: Supabase SQL Editor / PostgreSQL 15+
-- Execute em um projeto novo. O arquivo cria domínio, RLS, RPCs, views e o bucket privado.

begin;

create schema if not exists extensions;
create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('admin', 'mentor', 'mentee');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type public.invitation_type as enum (
  'admin_invites_mentor',
  'admin_invites_mentee',
  'mentor_invites_mentee',
  'mentor_requests_future_mentor'
);
create type public.relationship_status as enum ('invited', 'requested', 'active', 'paused', 'ended');
create type public.mentorship_plan_status as enum ('draft', 'active', 'completed', 'paused');
create type public.lesson_status as enum ('not_started', 'scheduled', 'in_progress', 'completed', 'skipped');
create type public.session_status as enum ('proposed', 'confirmed', 'completed', 'canceled', 'missed');
create type public.material_type as enum (
  'html', 'pdf', 'presentation', 'markdown', 'text', 'image', 'external_link', 'repository'
);
create type public.progress_confidence as enum ('low', 'growing', 'confident');
create type public.notification_type as enum (
  'invitation_created', 'invitation_accepted', 'relationship_activated', 'plan_activated',
  'session_scheduled', 'session_rescheduled', 'session_completed', 'shared_note'
);
create type public.notification_entity_type as enum ('invitation', 'relationship', 'plan', 'session', 'note');
create type public.communication_note_type as enum (
  'mentor_private', 'mentor_shared', 'mentee_note', 'next_action', 'session_summary'
);
create type public.communication_context_type as enum ('relationship', 'plan', 'lesson', 'session');
create type public.communication_visibility as enum ('mentor_only', 'mentor_and_mentee');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  bio text,
  stack text[] not null default '{}',
  availability_notes text,
  is_available_for_mentorship boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(trim(email))),
  token_hash text not null unique,
  intended_role public.user_role not null,
  type public.invitation_type not null,
  invited_by_user_id uuid not null references auth.users(id) on delete restrict,
  mentor_relationship_target_id uuid references auth.users(id) on delete set null,
  optional_message text,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitation_acceptance_consistency check (
    (status = 'accepted' and accepted_at is not null and accepted_by_user_id is not null)
    or status <> 'accepted'
  )
);

create table public.mentor_mentee_relationships (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid not null references auth.users(id) on delete restrict,
  mentee_user_id uuid not null references auth.users(id) on delete restrict,
  invitation_id uuid references public.invitations(id) on delete set null,
  status public.relationship_status not null default 'requested',
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  accepted_at timestamptz,
  paused_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relationship_distinct_people check (mentor_user_id <> mentee_user_id)
);

create unique index one_open_relationship_per_pair
  on public.mentor_mentee_relationships (mentor_user_id, mentee_user_id)
  where status in ('invited', 'requested', 'active', 'paused');

create table public.mentorship_plans (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.mentor_mentee_relationships(id) on delete restrict,
  mentor_user_id uuid not null references auth.users(id) on delete restrict,
  mentee_user_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (length(trim(title)) between 1 and 160),
  start_date date not null,
  expected_end_date date not null,
  duration_label text not null,
  main_goal text not null,
  primary_content_area text not null,
  topics text[] not null default '{}',
  status public.mentorship_plan_status not null default 'draft',
  description text,
  expected_outcomes text,
  prerequisites text,
  mentor_private_notes text,
  shared_notes text,
  reopened_at timestamptz,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_date_order check (expected_end_date >= start_date),
  constraint plan_distinct_people check (mentor_user_id <> mentee_user_id)
);

create table public.lesson_templates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  is_global boolean not null default false,
  title text not null,
  category text not null,
  estimated_duration_minutes integer not null check (estimated_duration_minutes >= 5),
  objective text not null,
  suggested_topics text[] not null default '{}',
  suggested_materials text[] not null default '{}',
  suggested_exercise text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint global_template_owner check ((is_global and owner_user_id is null) or (not is_global and owner_user_id is not null))
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.mentorship_plans(id) on delete cascade,
  source_template_id uuid references public.lesson_templates(id) on delete set null,
  title text not null,
  description text,
  position integer not null check (position > 0),
  objective text not null,
  topics text[] not null default '{}',
  expected_duration_minutes integer check (expected_duration_minutes is null or expected_duration_minutes >= 5),
  suggested_exercise text,
  status public.lesson_status not null default 'not_started',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, position)
);

create table public.content_materials (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  type public.material_type not null,
  title text not null,
  description text,
  category text not null,
  tags text[] not null default '{}',
  source_url text,
  storage_path text unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint material_has_one_source check (num_nonnulls(source_url, storage_path) = 1),
  constraint material_source_matches_type check (
    (type in ('external_link', 'repository') and source_url is not null)
    or (type not in ('external_link', 'repository') and storage_path is not null)
  )
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.mentor_mentee_relationships(id) on delete restrict,
  plan_id uuid not null references public.mentorship_plans(id) on delete restrict,
  lesson_id uuid references public.lessons(id) on delete set null,
  mentor_user_id uuid not null references auth.users(id) on delete restrict,
  mentee_user_id uuid not null references auth.users(id) on delete restrict,
  title text not null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  actual_completion_date timestamptz,
  status public.session_status not null default 'confirmed',
  applied_content text,
  mentor_notes text,
  shared_notes text,
  next_actions text,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_time_order check (scheduled_end > scheduled_start),
  constraint session_distinct_people check (mentor_user_id <> mentee_user_id),
  constraint completed_session_has_date check (status <> 'completed' or actual_completion_date is not null)
);

create table public.plan_materials (
  plan_id uuid not null references public.mentorship_plans(id) on delete cascade,
  material_id uuid not null references public.content_materials(id) on delete cascade,
  shared_with_mentee boolean not null default false,
  attached_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (plan_id, material_id)
);

create table public.lesson_materials (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  material_id uuid not null references public.content_materials(id) on delete cascade,
  shared_with_mentee boolean not null default false,
  attached_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (lesson_id, material_id)
);

create table public.session_materials (
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  material_id uuid not null references public.content_materials(id) on delete cascade,
  shared_with_mentee boolean not null default false,
  attached_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (session_id, material_id)
);

create table public.progress_notes (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.mentor_mentee_relationships(id) on delete cascade,
  plan_id uuid references public.mentorship_plans(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  session_id uuid references public.class_sessions(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  applied text,
  understood text,
  needs_review text,
  next_action text,
  confidence public.progress_confidence,
  shared_with_mentee boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint progress_note_single_detail_context check (num_nonnulls(plan_id, lesson_id, session_id) <= 1)
);

create table public.communication_notes (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.mentor_mentee_relationships(id) on delete cascade,
  plan_id uuid references public.mentorship_plans(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  session_id uuid references public.class_sessions(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  author_role public.user_role not null,
  type public.communication_note_type not null,
  visibility public.communication_visibility not null,
  context_type public.communication_context_type not null,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_context_matches check (
    (context_type = 'relationship' and plan_id is null and lesson_id is null and session_id is null)
    or (context_type = 'plan' and plan_id is not null and lesson_id is null and session_id is null)
    or (context_type = 'lesson' and plan_id is null and lesson_id is not null and session_id is null)
    or (context_type = 'session' and plan_id is null and lesson_id is null and session_id is not null)
  ),
  constraint note_type_visibility_matches check (
    (type = 'mentor_private' and visibility = 'mentor_only')
    or (type <> 'mentor_private' and visibility = 'mentor_and_mentee')
  ),
  constraint note_role_matches check (
    (author_role = 'mentee' and type = 'mentee_note')
    or (author_role = 'mentor' and type <> 'mentee_note')
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  related_entity_type public.notification_entity_type not null,
  related_entity_id uuid not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index invitations_email_status_idx on public.invitations (email, status);
create index invitations_expires_idx on public.invitations (expires_at) where status = 'pending';
create index relationships_mentor_idx on public.mentor_mentee_relationships (mentor_user_id, status);
create index relationships_mentee_idx on public.mentor_mentee_relationships (mentee_user_id, status);
create index plans_relationship_idx on public.mentorship_plans (relationship_id, status);
create index lessons_plan_idx on public.lessons (plan_id, position);
create index materials_owner_idx on public.content_materials (owner_user_id, created_at desc);
create index materials_tags_idx on public.content_materials using gin (tags);
create index sessions_relationship_start_idx on public.class_sessions (relationship_id, scheduled_start);
create index sessions_mentor_start_idx on public.class_sessions (mentor_user_id, scheduled_start);
create index sessions_mentee_start_idx on public.class_sessions (mentee_user_id, scheduled_start);
create index progress_relationship_idx on public.progress_notes (relationship_id, created_at desc);
create index communication_relationship_idx on public.communication_notes (relationship_id, created_at desc);
create index notifications_recipient_unread_idx on public.notifications (recipient_user_id, created_at desc) where read_at is null;

-- Funções-base de segurança. SECURITY DEFINER evita recursão entre políticas RLS.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.has_role(p_user_id uuid, p_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur where ur.user_id = p_user_id and ur.role = p_role
  );
$$;

create or replace function private.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select private.has_role(p_user_id, 'admin'); $$;

create or replace function private.is_relationship_participant(
  p_relationship_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.mentor_mentee_relationships r
    where r.id = p_relationship_id
      and (r.mentor_user_id = p_user_id or r.mentee_user_id = p_user_id)
  );
$$;

create or replace function private.can_manage_relationship(
  p_relationship_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin(p_user_id) or exists (
    select 1 from public.mentor_mentee_relationships r
    where r.id = p_relationship_id and r.mentor_user_id = p_user_id
  );
$$;

create or replace function private.can_access_plan(p_plan_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin(p_user_id) or exists (
    select 1 from public.mentorship_plans p
    where p.id = p_plan_id and (p.mentor_user_id = p_user_id or p.mentee_user_id = p_user_id)
  );
$$;

create or replace function private.can_manage_plan(p_plan_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin(p_user_id) or exists (
    select 1 from public.mentorship_plans p where p.id = p_plan_id and p.mentor_user_id = p_user_id
  );
$$;

create or replace function private.can_access_session(p_session_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin(p_user_id) or exists (
    select 1 from public.class_sessions s
    where s.id = p_session_id and (s.mentor_user_id = p_user_id or s.mentee_user_id = p_user_id)
  );
$$;

create or replace function private.can_view_profile(p_profile_user_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_profile_user_id = p_user_id
    or private.is_admin(p_user_id)
    or exists (
      select 1 from public.mentor_mentee_relationships r
      where (r.mentor_user_id = p_user_id and r.mentee_user_id = p_profile_user_id)
         or (r.mentee_user_id = p_user_id and r.mentor_user_id = p_profile_user_id)
    );
$$;

create or replace function private.can_access_material(p_material_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin(p_user_id)
    or exists (select 1 from public.content_materials m where m.id = p_material_id and m.owner_user_id = p_user_id)
    or exists (
      select 1 from public.plan_materials pm
      join public.mentorship_plans p on p.id = pm.plan_id
      where pm.material_id = p_material_id
        and (p.mentor_user_id = p_user_id or (pm.shared_with_mentee and p.mentee_user_id = p_user_id))
    )
    or exists (
      select 1 from public.lesson_materials lm
      join public.lessons l on l.id = lm.lesson_id
      join public.mentorship_plans p on p.id = l.plan_id
      where lm.material_id = p_material_id
        and (p.mentor_user_id = p_user_id or (lm.shared_with_mentee and p.mentee_user_id = p_user_id))
    )
    or exists (
      select 1 from public.session_materials sm
      join public.class_sessions s on s.id = sm.session_id
      where sm.material_id = p_material_id
        and (s.mentor_user_id = p_user_id or (sm.shared_with_mentee and s.mentee_user_id = p_user_id))
    );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Usuário')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.validate_domain_links()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_relationship_id uuid;
  v_mentor_id uuid;
  v_mentee_id uuid;
  v_plan_id uuid;
begin
  if tg_table_name = 'mentorship_plans' then
    select mentor_user_id, mentee_user_id into v_mentor_id, v_mentee_id
    from public.mentor_mentee_relationships where id = new.relationship_id;
    if not found or new.mentor_user_id <> v_mentor_id or new.mentee_user_id <> v_mentee_id then
      raise exception 'Os participantes do plano não correspondem ao relacionamento.';
    end if;
    if new.status = 'active' and (
      length(trim(new.main_goal)) = 0 or length(trim(new.primary_content_area)) = 0
      or array_length(new.topics, 1) is null
    ) then
      raise exception 'Um plano ativo exige objetivo, área principal e tópicos.';
    end if;
  elsif tg_table_name = 'class_sessions' then
    select relationship_id, mentor_user_id, mentee_user_id
      into v_relationship_id, v_mentor_id, v_mentee_id
    from public.mentorship_plans where id = new.plan_id;
    if not found or new.relationship_id <> v_relationship_id
      or new.mentor_user_id <> v_mentor_id or new.mentee_user_id <> v_mentee_id then
      raise exception 'A sessão não corresponde ao plano e aos participantes informados.';
    end if;
    if new.lesson_id is not null and not exists (
      select 1 from public.lessons l where l.id = new.lesson_id and l.plan_id = new.plan_id
    ) then
      raise exception 'A aula vinculada não pertence ao plano da sessão.';
    end if;
  elsif tg_table_name in ('progress_notes', 'communication_notes') then
    v_relationship_id := new.relationship_id;
    if new.plan_id is not null and not exists (
      select 1 from public.mentorship_plans p where p.id = new.plan_id and p.relationship_id = v_relationship_id
    ) then
      raise exception 'O plano da nota não pertence ao relacionamento.';
    end if;
    if new.lesson_id is not null and not exists (
      select 1 from public.lessons l join public.mentorship_plans p on p.id = l.plan_id
      where l.id = new.lesson_id and p.relationship_id = v_relationship_id
    ) then
      raise exception 'A aula da nota não pertence ao relacionamento.';
    end if;
    if new.session_id is not null and not exists (
      select 1 from public.class_sessions s where s.id = new.session_id and s.relationship_id = v_relationship_id
    ) then
      raise exception 'A sessão da nota não pertence ao relacionamento.';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_plan_links before insert or update on public.mentorship_plans
for each row execute function private.validate_domain_links();
create trigger validate_session_links before insert or update on public.class_sessions
for each row execute function private.validate_domain_links();
create trigger validate_progress_links before insert or update on public.progress_notes
for each row execute function private.validate_domain_links();
create trigger validate_communication_links before insert or update on public.communication_notes
for each row execute function private.validate_domain_links();

create trigger profiles_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger invitations_updated_at before update on public.invitations for each row execute function private.set_updated_at();
create trigger relationships_updated_at before update on public.mentor_mentee_relationships for each row execute function private.set_updated_at();
create trigger plans_updated_at before update on public.mentorship_plans for each row execute function private.set_updated_at();
create trigger templates_updated_at before update on public.lesson_templates for each row execute function private.set_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute function private.set_updated_at();
create trigger materials_updated_at before update on public.content_materials for each row execute function private.set_updated_at();
create trigger sessions_updated_at before update on public.class_sessions for each row execute function private.set_updated_at();
create trigger progress_updated_at before update on public.progress_notes for each row execute function private.set_updated_at();
create trigger communication_updated_at before update on public.communication_notes for each row execute function private.set_updated_at();

-- RPCs usadas pelo aplicativo.
create or replace function public.validate_invitation_token(invitation_token text)
returns table (
  status text,
  email text,
  intended_role text,
  invited_by_user_id uuid,
  mentor_relationship_target_id uuid,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when i.id is null then 'invalid'
      when i.status = 'accepted' then 'used'
      when i.status = 'revoked' then 'revoked'
      when i.status = 'expired' or i.expires_at <= now() then 'expired'
      else 'valid'
    end,
    i.email,
    i.intended_role::text,
    i.invited_by_user_id,
    i.mentor_relationship_target_id,
    i.expires_at
  from (select 1) seed
  left join public.invitations i
    on i.token_hash = encode(extensions.digest(trim(invitation_token), 'sha256'), 'hex');
$$;

-- Ative esta função em Authentication > Hooks > Before User Created depois de criar o primeiro admin.
create or replace function public.hook_require_pending_invitation(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(event -> 'user' ->> 'email'));
begin
  if v_email is null or not exists (
    select 1
    from public.invitations i
    where i.email = v_email
      and i.status = 'pending'
      and i.expires_at > now()
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Uma conta da NossaMentoria exige um convite válido.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

create or replace function public.create_invitation(
  p_email text,
  p_intended_role public.user_role,
  p_type public.invitation_type,
  p_expires_at timestamptz default now() + interval '7 days',
  p_optional_message text default null,
  p_mentor_relationship_target_id uuid default null
)
returns table (invitation_id uuid, invitation_token text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
  v_id uuid;
  v_actor uuid := auth.uid();
  v_is_admin boolean := private.is_admin(v_actor);
  v_is_mentor boolean := private.has_role(v_actor, 'mentor');
  v_mentor_target uuid := p_mentor_relationship_target_id;
begin
  if v_actor is null then raise exception 'Autenticação obrigatória.'; end if;
  if not v_is_admin and not v_is_mentor then raise exception 'Sem permissão para criar convites.'; end if;
  if not v_is_admin and p_type not in ('mentor_invites_mentee', 'mentor_requests_future_mentor') then
    raise exception 'Mentores não podem criar este tipo de convite.';
  end if;
  if p_type in ('admin_invites_mentee', 'mentor_invites_mentee') and p_intended_role <> 'mentee' then
    raise exception 'Este tipo de convite exige o papel de mentorado.';
  end if;
  if p_type in ('admin_invites_mentor', 'mentor_requests_future_mentor') and p_intended_role <> 'mentor' then
    raise exception 'Este tipo de convite exige o papel de mentor.';
  end if;
  if p_type = 'mentor_invites_mentee' then v_mentor_target := v_actor; end if;
  if p_expires_at <= now() then raise exception 'A expiração precisa estar no futuro.'; end if;

  insert into public.invitations (
    email, token_hash, intended_role, type, invited_by_user_id,
    mentor_relationship_target_id, optional_message, expires_at
  ) values (
    lower(trim(p_email)), encode(extensions.digest(v_token, 'sha256'), 'hex'), p_intended_role, p_type, v_actor,
    v_mentor_target, nullif(trim(p_optional_message), ''), p_expires_at
  ) returning id into v_id;

  return query select v_id, v_token;
end;
$$;

create or replace function public.accept_invitation_token(
  invitation_token text,
  accepting_user_id uuid
)
returns table (invitation_id uuid, relationship_id uuid, assigned_role public.user_role)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation public.invitations%rowtype;
  v_user_email text;
  v_relationship_id uuid;
begin
  if auth.role() <> 'service_role' and auth.uid() <> accepting_user_id then
    raise exception 'Não é permitido aceitar um convite para outro usuário.';
  end if;

  select * into v_invitation
  from public.invitations i
  where i.token_hash = encode(extensions.digest(trim(invitation_token), 'sha256'), 'hex')
  for update;

  if not found then raise exception 'Convite inválido.'; end if;
  if v_invitation.status = 'accepted' then raise exception 'Convite já utilizado.'; end if;
  if v_invitation.status = 'revoked' then raise exception 'Convite revogado.'; end if;
  if v_invitation.status = 'expired' or v_invitation.expires_at <= now() then
    update public.invitations set status = 'expired' where id = v_invitation.id;
    raise exception 'Convite expirado.';
  end if;

  select lower(email) into v_user_email from auth.users where id = accepting_user_id;
  if v_user_email is null or v_user_email <> v_invitation.email then
    raise exception 'O e-mail autenticado não corresponde ao convite.';
  end if;

  insert into public.user_roles (user_id, role, assigned_by_user_id)
  values (accepting_user_id, v_invitation.intended_role, v_invitation.invited_by_user_id)
  on conflict (user_id, role) do nothing;

  if v_invitation.intended_role = 'mentee' and v_invitation.mentor_relationship_target_id is not null then
    select r.id into v_relationship_id
    from public.mentor_mentee_relationships r
    where r.mentor_user_id = v_invitation.mentor_relationship_target_id
      and r.mentee_user_id = accepting_user_id
      and r.status in ('invited', 'requested', 'active', 'paused')
    limit 1;

    if v_relationship_id is null then
      insert into public.mentor_mentee_relationships (
        mentor_user_id, mentee_user_id, invitation_id, status,
        created_by_user_id, accepted_at
      ) values (
        v_invitation.mentor_relationship_target_id, accepting_user_id, v_invitation.id, 'active',
        v_invitation.invited_by_user_id, now()
      ) returning id into v_relationship_id;
    else
      update public.mentor_mentee_relationships
      set status = 'active', invitation_id = v_invitation.id, accepted_at = coalesce(accepted_at, now())
      where id = v_relationship_id;
    end if;
  end if;

  update public.invitations
  set status = 'accepted', accepted_at = now(), accepted_by_user_id = accepting_user_id
  where id = v_invitation.id;

  return query select v_invitation.id, v_relationship_id, v_invitation.intended_role;
end;
$$;

create or replace function public.request_mentorship(p_mentee_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
begin
  if not private.has_role(v_actor, 'mentor') then raise exception 'Apenas mentores podem solicitar mentorias.'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = p_mentee_user_id and p.is_available_for_mentorship
  ) then raise exception 'Este mentorado não está disponível para mentoria.'; end if;

  insert into public.mentor_mentee_relationships (
    mentor_user_id, mentee_user_id, status, created_by_user_id
  ) values (v_actor, p_mentee_user_id, 'requested', v_actor)
  returning id into v_id;
  return v_id;
exception when unique_violation then
  raise exception 'Já existe uma relação aberta entre mentor e mentorado.';
end;
$$;

create or replace function public.activate_mentorship_plan(p_plan_id uuid)
returns public.mentorship_plans
language plpgsql
security definer
set search_path = ''
as $$
declare v_plan public.mentorship_plans%rowtype;
begin
  if not private.can_manage_plan(p_plan_id) then raise exception 'Sem permissão para ativar o plano.'; end if;
  update public.mentorship_plans p
  set status = 'active'
  where p.id = p_plan_id
    and exists (
      select 1 from public.mentor_mentee_relationships r
      where r.id = p.relationship_id and r.status = 'active'
    )
  returning * into v_plan;
  if not found then raise exception 'O plano exige um relacionamento ativo.'; end if;
  return v_plan;
end;
$$;

create or replace function public.copy_lesson_templates_to_plan(
  p_plan_id uuid,
  p_template_ids uuid[]
)
returns setof public.lessons
language plpgsql
security definer
set search_path = ''
as $$
declare v_start_position integer;
begin
  if not private.can_manage_plan(p_plan_id) then raise exception 'Sem permissão para editar o plano.'; end if;
  select coalesce(max(position), 0) into v_start_position from public.lessons where plan_id = p_plan_id;

  return query
  insert into public.lessons (
    plan_id, source_template_id, title, description, position, objective,
    topics, expected_duration_minutes, suggested_exercise
  )
  select
    p_plan_id, t.id, t.title, null,
    v_start_position + row_number() over (order by array_position(p_template_ids, t.id)),
    t.objective, t.suggested_topics, t.estimated_duration_minutes, t.suggested_exercise
  from public.lesson_templates t
  where t.id = any(p_template_ids)
    and (t.is_global or t.owner_user_id = auth.uid() or private.is_admin())
  order by array_position(p_template_ids, t.id)
  returning *;
end;
$$;

create or replace function public.reschedule_class_session(
  p_session_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz
)
returns public.class_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare v_session public.class_sessions%rowtype;
begin
  if p_scheduled_end <= p_scheduled_start then raise exception 'O término precisa ser posterior ao início.'; end if;
  if not exists (
    select 1 from public.class_sessions s
    where s.id = p_session_id and (s.mentor_user_id = auth.uid() or private.is_admin())
  ) then raise exception 'Sem permissão para reagendar a sessão.'; end if;

  update public.class_sessions
  set scheduled_start = p_scheduled_start,
      scheduled_end = p_scheduled_end,
      status = case when status = 'proposed' then 'proposed' else 'confirmed' end
  where id = p_session_id
  returning * into v_session;
  return v_session;
end;
$$;

create or replace function public.complete_class_session(
  p_session_id uuid,
  p_applied_content text,
  p_mentor_notes text,
  p_shared_notes text,
  p_next_actions text,
  p_completed_at timestamptz default now()
)
returns public.class_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare v_session public.class_sessions%rowtype;
begin
  if length(trim(p_applied_content)) = 0 or length(trim(p_next_actions)) = 0 then
    raise exception 'Conteúdo aplicado e próximas ações são obrigatórios.';
  end if;
  if not exists (
    select 1 from public.class_sessions s
    where s.id = p_session_id and (s.mentor_user_id = auth.uid() or private.is_admin())
  ) then raise exception 'Sem permissão para concluir a sessão.'; end if;

  update public.class_sessions
  set status = 'completed', actual_completion_date = p_completed_at,
      applied_content = trim(p_applied_content), mentor_notes = nullif(trim(p_mentor_notes), ''),
      shared_notes = nullif(trim(p_shared_notes), ''), next_actions = trim(p_next_actions)
  where id = p_session_id
  returning * into v_session;

  if v_session.lesson_id is not null then
    update public.lessons set status = 'completed', completed_at = p_completed_at
    where id = v_session.lesson_id;
  end if;
  return v_session;
end;
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.notifications set read_at = coalesce(read_at, now())
  where id = p_notification_id and recipient_user_id = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare v_count integer;
begin
  update public.notifications set read_at = now()
  where recipient_user_id = auth.uid() and read_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Notificações internas geradas a partir de eventos do domínio.
create or replace function private.notify_domain_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'invitations' and tg_op = 'UPDATE'
    and old.status <> 'accepted' and new.status = 'accepted' then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (new.invited_by_user_id, 'invitation_accepted', 'Convite aceito', new.email || ' aceitou o convite.', 'invitation', new.id);

  elsif tg_table_name = 'mentor_mentee_relationships'
    and new.status = 'active'
    and case when tg_op = 'INSERT' then true else old.status <> 'active' end then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values
      (new.mentor_user_id, 'relationship_activated', 'Mentoria ativada', 'Uma relação de mentoria foi ativada.', 'relationship', new.id),
      (new.mentee_user_id, 'relationship_activated', 'Mentoria ativada', 'Sua relação de mentoria foi ativada.', 'relationship', new.id);

  elsif tg_table_name = 'mentorship_plans' and new.status = 'active'
    and case when tg_op = 'INSERT' then true else old.status <> 'active' end then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (new.mentee_user_id, 'plan_activated', 'Plano ativado', new.title || ' está ativo.', 'plan', new.id);

  elsif tg_table_name = 'class_sessions' and tg_op = 'INSERT' then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (new.mentee_user_id, 'session_scheduled', 'Nova sessão', new.title || ' foi agendada.', 'session', new.id);

  elsif tg_table_name = 'class_sessions' and tg_op = 'UPDATE'
    and (old.scheduled_start, old.scheduled_end) is distinct from (new.scheduled_start, new.scheduled_end) then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (new.mentee_user_id, 'session_rescheduled', 'Sessão reagendada', new.title || ' recebeu um novo horário.', 'session', new.id);

  elsif tg_table_name = 'class_sessions' and tg_op = 'UPDATE'
    and old.status <> 'completed' and new.status = 'completed' then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (new.mentee_user_id, 'session_completed', 'Sessão concluída', new.title || ' foi concluída.', 'session', new.id);

  elsif tg_table_name = 'communication_notes' and tg_op = 'INSERT'
    and new.visibility = 'mentor_and_mentee' then
    insert into public.notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    select case when new.author_user_id = r.mentor_user_id then r.mentee_user_id else r.mentor_user_id end,
      'shared_note', 'Nova nota compartilhada', left(new.body, 180), 'note', new.id
    from public.mentor_mentee_relationships r where r.id = new.relationship_id;
  end if;
  return new;
end;
$$;

create trigger notify_invitation after update on public.invitations for each row execute function private.notify_domain_event();
create trigger notify_relationship after insert or update on public.mentor_mentee_relationships for each row execute function private.notify_domain_event();
create trigger notify_plan after insert or update on public.mentorship_plans for each row execute function private.notify_domain_event();
create trigger notify_session after insert or update on public.class_sessions for each row execute function private.notify_domain_event();
create trigger notify_communication after insert on public.communication_notes for each row execute function private.notify_domain_event();

create or replace function public.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.invitations
  set status = 'revoked'
  where id = p_invitation_id
    and status = 'pending'
    and (invited_by_user_id = auth.uid() or private.is_admin());
  if not found then raise exception 'Convite não encontrado ou não pode ser revogado.'; end if;
end;
$$;

create or replace function public.change_relationship_status(
  p_relationship_id uuid,
  p_status public.relationship_status
)
returns public.mentor_mentee_relationships
language plpgsql
security definer
set search_path = ''
as $$
declare v_relationship public.mentor_mentee_relationships%rowtype;
begin
  if not private.can_manage_relationship(p_relationship_id) then
    raise exception 'Sem permissão para alterar o relacionamento.';
  end if;
  if p_status in ('invited', 'requested') then
    raise exception 'Use o fluxo de convite ou solicitação para este estado.';
  end if;
  update public.mentor_mentee_relationships
  set status = p_status,
      accepted_at = case when p_status = 'active' then coalesce(accepted_at, now()) else accepted_at end,
      paused_at = case when p_status = 'paused' then now() else paused_at end,
      ended_at = case when p_status = 'ended' then now() else ended_at end
  where id = p_relationship_id
  returning * into v_relationship;
  return v_relationship;
end;
$$;

create or replace function public.confirm_class_session(p_session_id uuid)
returns public.class_sessions
language plpgsql
security definer
set search_path = ''
as $$
declare v_session public.class_sessions%rowtype;
begin
  update public.class_sessions
  set status = 'confirmed'
  where id = p_session_id and mentee_user_id = auth.uid() and status = 'proposed'
  returning * into v_session;
  if not found then raise exception 'Sessão proposta não encontrada.'; end if;
  return v_session;
end;
$$;

-- Views de leitura; security_invoker mantém as políticas RLS das tabelas-base.
create view public.mentorship_relationship_details
with (security_invoker = true)
as
select
  r.id,
  r.status,
  r.mentor_user_id,
  mentor.display_name as mentor_name,
  r.mentee_user_id,
  mentee.display_name as mentee_name,
  r.invitation_id,
  r.accepted_at,
  r.paused_at,
  r.ended_at,
  r.created_at,
  r.updated_at
from public.mentor_mentee_relationships r
join public.profiles mentor on mentor.user_id = r.mentor_user_id
join public.profiles mentee on mentee.user_id = r.mentee_user_id;

create view public.mentorship_plan_progress
with (security_invoker = true)
as
select
  p.id as plan_id,
  p.relationship_id,
  p.mentor_user_id,
  p.mentee_user_id,
  p.title,
  p.status,
  count(distinct l.id) as total_lessons,
  count(distinct l.id) filter (where l.status = 'completed') as completed_lessons,
  count(distinct s.id) filter (where s.status = 'completed') as completed_sessions,
  count(distinct n.id) filter (where nullif(trim(n.next_action), '') is not null) as next_actions,
  case
    when count(distinct l.id) = 0 then 0
    else round(100.0 * count(distinct l.id) filter (where l.status = 'completed') / count(distinct l.id))::integer
  end as completion_percentage
from public.mentorship_plans p
left join public.lessons l on l.plan_id = p.id
left join public.class_sessions s on s.plan_id = p.id
left join public.progress_notes n on n.plan_id = p.id or n.lesson_id = l.id or n.session_id = s.id
group by p.id;

create view public.upcoming_sessions
with (security_invoker = true)
as
select
  s.*,
  mentor.display_name as mentor_name,
  mentee.display_name as mentee_name,
  p.title as plan_title,
  l.title as lesson_title
from public.class_sessions s
join public.profiles mentor on mentor.user_id = s.mentor_user_id
join public.profiles mentee on mentee.user_id = s.mentee_user_id
join public.mentorship_plans p on p.id = s.plan_id
left join public.lessons l on l.id = s.lesson_id
where s.status in ('proposed', 'confirmed') and s.scheduled_start >= now();

create view public.shared_material_contexts
with (security_invoker = true)
as
select pm.material_id, 'plan'::text as context_type, pm.plan_id as context_id,
  p.relationship_id, pm.shared_with_mentee, pm.created_at
from public.plan_materials pm
join public.mentorship_plans p on p.id = pm.plan_id
union all
select lm.material_id, 'lesson'::text, lm.lesson_id,
  p.relationship_id, lm.shared_with_mentee, lm.created_at
from public.lesson_materials lm
join public.lessons l on l.id = lm.lesson_id
join public.mentorship_plans p on p.id = l.plan_id
union all
select sm.material_id, 'session'::text, sm.session_id,
  s.relationship_id, sm.shared_with_mentee, sm.created_at
from public.session_materials sm
join public.class_sessions s on s.id = sm.session_id;

create view public.unread_notification_counts
with (security_invoker = true)
as
select recipient_user_id, count(*)::integer as unread_count
from public.notifications
where read_at is null
group by recipient_user_id;

-- Row Level Security.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.invitations enable row level security;
alter table public.mentor_mentee_relationships enable row level security;
alter table public.mentorship_plans enable row level security;
alter table public.lesson_templates enable row level security;
alter table public.lessons enable row level security;
alter table public.content_materials enable row level security;
alter table public.class_sessions enable row level security;
alter table public.plan_materials enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.session_materials enable row level security;
alter table public.progress_notes enable row level security;
alter table public.communication_notes enable row level security;
alter table public.notifications enable row level security;

create policy profiles_select on public.profiles for select to authenticated
using (private.can_view_profile(user_id));
create policy profiles_insert_self on public.profiles for insert to authenticated
with check (user_id = auth.uid());
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
using (user_id = auth.uid() or private.is_admin())
with check (user_id = auth.uid() or private.is_admin());

create policy roles_select_self_or_admin on public.user_roles for select to authenticated
using (user_id = auth.uid() or private.is_admin());
create policy roles_admin_insert on public.user_roles for insert to authenticated
with check (private.is_admin());
create policy roles_admin_update on public.user_roles for update to authenticated
using (private.is_admin()) with check (private.is_admin());
create policy roles_admin_delete on public.user_roles for delete to authenticated
using (private.is_admin());

create policy invitations_select_creator_or_admin on public.invitations for select to authenticated
using (invited_by_user_id = auth.uid() or private.is_admin());

create policy relationships_select on public.mentor_mentee_relationships for select to authenticated
using (private.is_admin() or mentor_user_id = auth.uid() or mentee_user_id = auth.uid());
create policy relationships_admin_insert on public.mentor_mentee_relationships for insert to authenticated
with check (private.is_admin());
create policy relationships_admin_update on public.mentor_mentee_relationships for update to authenticated
using (private.is_admin()) with check (private.is_admin());
create policy relationships_admin_delete on public.mentor_mentee_relationships for delete to authenticated
using (private.is_admin());

create policy plans_select on public.mentorship_plans for select to authenticated
using (private.is_admin() or mentor_user_id = auth.uid() or mentee_user_id = auth.uid());
create policy plans_insert on public.mentorship_plans for insert to authenticated
with check (private.is_admin() or (mentor_user_id = auth.uid() and private.can_manage_relationship(relationship_id)));
create policy plans_update on public.mentorship_plans for update to authenticated
using (private.is_admin() or mentor_user_id = auth.uid())
with check (private.is_admin() or mentor_user_id = auth.uid());
create policy plans_delete on public.mentorship_plans for delete to authenticated
using (private.is_admin() or mentor_user_id = auth.uid());

create policy templates_select on public.lesson_templates for select to authenticated
using (is_global or owner_user_id = auth.uid() or private.is_admin());
create policy templates_insert on public.lesson_templates for insert to authenticated
with check (
  private.is_admin()
  or (owner_user_id = auth.uid() and not is_global and private.has_role(auth.uid(), 'mentor'))
);
create policy templates_update on public.lesson_templates for update to authenticated
using (private.is_admin() or owner_user_id = auth.uid())
with check (private.is_admin() or (owner_user_id = auth.uid() and not is_global));
create policy templates_delete on public.lesson_templates for delete to authenticated
using (private.is_admin() or owner_user_id = auth.uid());

create policy lessons_select on public.lessons for select to authenticated
using (private.can_access_plan(plan_id));
create policy lessons_insert on public.lessons for insert to authenticated
with check (private.can_manage_plan(plan_id));
create policy lessons_update on public.lessons for update to authenticated
using (private.can_manage_plan(plan_id)) with check (private.can_manage_plan(plan_id));
create policy lessons_delete on public.lessons for delete to authenticated
using (private.can_manage_plan(plan_id));

create policy materials_select on public.content_materials for select to authenticated
using (private.can_access_material(id));
create policy materials_insert on public.content_materials for insert to authenticated
with check (owner_user_id = auth.uid() and (private.has_role(auth.uid(), 'mentor') or private.is_admin()));
create policy materials_update on public.content_materials for update to authenticated
using (owner_user_id = auth.uid() or private.is_admin())
with check (owner_user_id = auth.uid() or private.is_admin());
create policy materials_delete on public.content_materials for delete to authenticated
using (owner_user_id = auth.uid() or private.is_admin());

create policy sessions_select on public.class_sessions for select to authenticated
using (private.can_access_session(id));
create policy sessions_insert on public.class_sessions for insert to authenticated
with check (private.is_admin() or (mentor_user_id = auth.uid() and private.can_manage_plan(plan_id)));
create policy sessions_update on public.class_sessions for update to authenticated
using (private.is_admin() or mentor_user_id = auth.uid())
with check (private.is_admin() or mentor_user_id = auth.uid());
create policy sessions_delete on public.class_sessions for delete to authenticated
using (private.is_admin() or mentor_user_id = auth.uid());

create policy plan_materials_select on public.plan_materials for select to authenticated
using (
  private.is_admin() or private.can_manage_plan(plan_id)
  or (shared_with_mentee and private.can_access_plan(plan_id))
);
create policy plan_materials_insert on public.plan_materials for insert to authenticated
with check (private.can_manage_plan(plan_id) and private.can_access_material(material_id));
create policy plan_materials_update on public.plan_materials for update to authenticated
using (private.can_manage_plan(plan_id)) with check (private.can_manage_plan(plan_id));
create policy plan_materials_delete on public.plan_materials for delete to authenticated
using (private.can_manage_plan(plan_id));

create policy lesson_materials_select on public.lesson_materials for select to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.lessons l join public.mentorship_plans p on p.id = l.plan_id
    where l.id = lesson_id
      and (p.mentor_user_id = auth.uid() or (shared_with_mentee and p.mentee_user_id = auth.uid()))
  )
);
create policy lesson_materials_insert on public.lesson_materials for insert to authenticated
with check (
  exists (select 1 from public.lessons l where l.id = lesson_id and private.can_manage_plan(l.plan_id))
  and private.can_access_material(material_id)
);
create policy lesson_materials_update on public.lesson_materials for update to authenticated
using (exists (select 1 from public.lessons l where l.id = lesson_id and private.can_manage_plan(l.plan_id)))
with check (exists (select 1 from public.lessons l where l.id = lesson_id and private.can_manage_plan(l.plan_id)));
create policy lesson_materials_delete on public.lesson_materials for delete to authenticated
using (exists (select 1 from public.lessons l where l.id = lesson_id and private.can_manage_plan(l.plan_id)));

create policy session_materials_select on public.session_materials for select to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.class_sessions s where s.id = session_id
      and (s.mentor_user_id = auth.uid() or (shared_with_mentee and s.mentee_user_id = auth.uid()))
  )
);
create policy session_materials_insert on public.session_materials for insert to authenticated
with check (
  exists (select 1 from public.class_sessions s where s.id = session_id and (s.mentor_user_id = auth.uid() or private.is_admin()))
  and private.can_access_material(material_id)
);
create policy session_materials_update on public.session_materials for update to authenticated
using (exists (select 1 from public.class_sessions s where s.id = session_id and (s.mentor_user_id = auth.uid() or private.is_admin())))
with check (exists (select 1 from public.class_sessions s where s.id = session_id and (s.mentor_user_id = auth.uid() or private.is_admin())));
create policy session_materials_delete on public.session_materials for delete to authenticated
using (exists (select 1 from public.class_sessions s where s.id = session_id and (s.mentor_user_id = auth.uid() or private.is_admin())));

create policy progress_select on public.progress_notes for select to authenticated
using (
  private.is_admin() or author_user_id = auth.uid()
  or (private.is_relationship_participant(relationship_id)
    and (private.can_manage_relationship(relationship_id) or shared_with_mentee))
);
create policy progress_insert on public.progress_notes for insert to authenticated
with check (author_user_id = auth.uid() and private.is_relationship_participant(relationship_id));
create policy progress_update on public.progress_notes for update to authenticated
using (author_user_id = auth.uid() or private.is_admin())
with check (author_user_id = auth.uid() or private.is_admin());
create policy progress_delete on public.progress_notes for delete to authenticated
using (author_user_id = auth.uid() or private.is_admin());

create policy communication_select on public.communication_notes for select to authenticated
using (
  private.is_admin()
  or (private.is_relationship_participant(relationship_id)
    and (visibility = 'mentor_and_mentee' or (author_user_id = auth.uid() and visibility = 'mentor_only')))
);
create policy communication_insert on public.communication_notes for insert to authenticated
with check (
  author_user_id = auth.uid()
  and private.is_relationship_participant(relationship_id)
  and private.has_role(auth.uid(), author_role)
);
create policy communication_update on public.communication_notes for update to authenticated
using (author_user_id = auth.uid() or private.is_admin())
with check (author_user_id = auth.uid() or private.is_admin());
create policy communication_delete on public.communication_notes for delete to authenticated
using (author_user_id = auth.uid() or private.is_admin());

create policy notifications_select on public.notifications for select to authenticated
using (recipient_user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated
using (recipient_user_id = auth.uid()) with check (recipient_user_id = auth.uid());

-- Bucket privado. Caminho obrigatório: <owner_user_id>/<material_id>/<arquivo>.
insert into storage.buckets (id, name, public, file_size_limit)
values ('materials', 'materials', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

create policy materials_storage_select on storage.objects for select to authenticated
using (
  bucket_id = 'materials'
  and exists (
    select 1 from public.content_materials m
    where m.storage_path = name and private.can_access_material(m.id)
  )
);
create policy materials_storage_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (private.has_role(auth.uid(), 'mentor') or private.is_admin())
);
create policy materials_storage_update on storage.objects for update to authenticated
using (bucket_id = 'materials' and ((storage.foldername(name))[1] = auth.uid()::text or private.is_admin()))
with check (bucket_id = 'materials' and ((storage.foldername(name))[1] = auth.uid()::text or private.is_admin()));
create policy materials_storage_delete on storage.objects for delete to authenticated
using (bucket_id = 'materials' and ((storage.foldername(name))[1] = auth.uid()::text or private.is_admin()));

-- Privilégios: RLS continua sendo a fronteira efetiva para usuários autenticados.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant usage on schema public to supabase_auth_admin;
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.mentorship_relationship_details,
  public.mentorship_plan_progress,
  public.upcoming_sessions,
  public.shared_material_contexts,
  public.unread_notification_counts to authenticated;

revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function public.validate_invitation_token(text) to anon, authenticated, service_role;
grant execute on function public.hook_require_pending_invitation(jsonb) to supabase_auth_admin;
grant execute on function public.accept_invitation_token(text, uuid) to authenticated, service_role;
grant execute on function public.create_invitation(text, public.user_role, public.invitation_type, timestamptz, text, uuid) to authenticated;
grant execute on function public.request_mentorship(uuid) to authenticated;
grant execute on function public.activate_mentorship_plan(uuid) to authenticated;
grant execute on function public.copy_lesson_templates_to_plan(uuid, uuid[]) to authenticated;
grant execute on function public.reschedule_class_session(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.complete_class_session(uuid, text, text, text, text, timestamptz) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.revoke_invitation(uuid) to authenticated;
grant execute on function public.change_relationship_status(uuid, public.relationship_status) to authenticated;
grant execute on function public.confirm_class_session(uuid) to authenticated;
grant execute on function private.has_role(uuid, public.user_role) to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;
grant execute on function private.is_relationship_participant(uuid, uuid) to authenticated;
grant execute on function private.can_manage_relationship(uuid, uuid) to authenticated;
grant execute on function private.can_access_plan(uuid, uuid) to authenticated;
grant execute on function private.can_manage_plan(uuid, uuid) to authenticated;
grant execute on function private.can_access_session(uuid, uuid) to authenticated;
grant execute on function private.can_view_profile(uuid, uuid) to authenticated;
grant execute on function private.can_access_material(uuid, uuid) to authenticated;

commit;


