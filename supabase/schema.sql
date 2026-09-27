create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student'
    check (role in ('student', 'coach', 'admin')),
  placement_score integer
    check (placement_score is null or placement_score between 0 and 100),
  placement_mode text
    check (
      placement_mode is null or placement_mode in
      ('START_MODE', 'RESPONSE_MODE', 'CONVERSATION_MODE', 'FLUENCY_MODE', 'NATIVE_FLOW')
    ),
  placement_completed_at timestamptz,
  daily_goal_minutes integer not null default 20
    check (daily_goal_minutes between 5 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, daily_goal_minutes) on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function private.placement_mode_for_score(score integer)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case
    when score between 0 and 30 then 'START_MODE'
    when score between 31 and 50 then 'RESPONSE_MODE'
    when score between 51 and 70 then 'CONVERSATION_MODE'
    when score between 71 and 90 then 'FLUENCY_MODE'
    when score between 91 and 100 then 'NATIVE_FLOW'
  end;
$$;

revoke all on function private.placement_mode_for_score(integer)
from public, anon, authenticated;

create or replace function private.sync_placement_mode()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.placement_score is null then
    new.placement_mode := null;
    new.placement_completed_at := null;
  else
    new.placement_mode := private.placement_mode_for_score(new.placement_score);
    new.placement_completed_at := coalesce(new.placement_completed_at, now());
  end if;

  return new;
end;
$$;

revoke all on function private.sync_placement_mode()
from public, anon, authenticated;

drop trigger if exists sync_profile_placement_mode on public.profiles;
create trigger sync_profile_placement_mode
before insert or update of placement_score
on public.profiles
for each row
execute function private.sync_placement_mode();

create table if not exists public.training_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_key text not null,
  session_key text not null,
  completion_percent integer not null default 0
    check (completion_percent between 0 and 100),
  speaking_seconds integer not null default 0
    check (speaking_seconds >= 0),
  xp integer not null default 0
    check (xp >= 0),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, session_key)
);

alter table public.training_progress enable row level security;

revoke all on table public.training_progress from anon, authenticated;
grant select on table public.training_progress to authenticated;
grant usage, select on sequence public.training_progress_id_seq to authenticated;

drop policy if exists "Users can read their own progress" on public.training_progress;
create policy "Users can read their own progress"
on public.training_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own progress" on public.training_progress;
create policy "Users can insert their own progress"
on public.training_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.training_progress;
create policy "Users can update their own progress"
on public.training_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table if not exists public.placement_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  listening_score integer not null check (listening_score between 0 and 35),
  reaction_score integer not null check (reaction_score between 0 and 25),
  real_english_score integer not null check (real_english_score between 0 and 20),
  writing_score integer not null check (writing_score between 0 and 20),
  total_score integer generated always as (
    listening_score + reaction_score + real_english_score + writing_score
  ) stored,
  placement_mode text generated always as (
    case
      when (listening_score + reaction_score + real_english_score + writing_score) between 0 and 30 then 'START_MODE'
      when (listening_score + reaction_score + real_english_score + writing_score) between 31 and 50 then 'RESPONSE_MODE'
      when (listening_score + reaction_score + real_english_score + writing_score) between 51 and 70 then 'CONVERSATION_MODE'
      when (listening_score + reaction_score + real_english_score + writing_score) between 71 and 90 then 'FLUENCY_MODE'
      when (listening_score + reaction_score + real_english_score + writing_score) between 91 and 100 then 'NATIVE_FLOW'
    end
  ) stored,
  completed_at timestamptz not null default now()
);

alter table public.placement_attempts enable row level security;

revoke all on table public.placement_attempts from anon, authenticated;
grant select on table public.placement_attempts to authenticated;
grant usage, select on sequence public.placement_attempts_id_seq to authenticated;

drop policy if exists "Users can read their own placement attempts"
on public.placement_attempts;
create policy "Users can read their own placement attempts"
on public.placement_attempts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own placement attempts"
on public.placement_attempts;
create policy "Users can insert their own placement attempts"
on public.placement_attempts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();


-- =========================================================
-- Speak Mode plans, live coaching, and phrase practice
-- =========================================================

create table if not exists public.plans (
  code text primary key,
  name text not null,
  live_sessions_per_month integer not null default 0
    check (live_sessions_per_month >= 0 and live_sessions_per_month <= 20),
  live_session_minutes integer not null default 0
    check (live_session_minutes >= 0 and live_session_minutes <= 180),
  live_session_type text not null default 'none'
    check (live_session_type in ('none','group','one_to_one')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists plan_code text not null default 'digital'
    references public.plans(code);

alter table public.profiles
  add column if not exists subscription_status text not null default 'free'
    check (subscription_status in ('free','active','past_due','cancelled'));

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.plans(code),
  session_type text not null check (session_type in ('group','one_to_one')),
  duration_minutes integer not null check (duration_minutes between 15 and 180),
  preferred_start timestamptz not null,
  timezone text not null,
  topic text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled','no_show')),
  coach_name text,
  meeting_url text,
  coach_feedback text,
  homework text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_sessions_user_month_idx
  on public.live_sessions (user_id, preferred_start);

create index if not exists profiles_plan_code_idx
  on public.profiles (plan_code);

create index if not exists live_sessions_plan_code_idx
  on public.live_sessions (plan_code);

alter table public.plans enable row level security;
alter table public.live_sessions enable row level security;

revoke all on table public.plans from anon, authenticated;
grant select on table public.plans to authenticated;

drop policy if exists "Authenticated users can view active plans" on public.plans;
create policy "Authenticated users can view active plans"
on public.plans
for select
to authenticated
using (active = true);

revoke all on table public.live_sessions from anon, authenticated;
grant select on table public.live_sessions to authenticated;

drop policy if exists "Users can read their own live sessions" on public.live_sessions;
create policy "Users can read their own live sessions"
on public.live_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.phrase_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase_key text not null,
  repetitions integer not null default 0 check (repetitions >= 0 and repetitions <= 1000),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_practiced_at timestamptz not null default now(),
  unique (user_id, phrase_key)
);

alter table public.phrase_progress enable row level security;

revoke all on table public.phrase_progress from anon, authenticated;
grant select on table public.phrase_progress to authenticated;

drop policy if exists "Users can read their own phrase progress" on public.phrase_progress;
create policy "Users can read their own phrase progress"
on public.phrase_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Write access for placement, training, phrase practice, and live coaching
-- is intentionally handled through authenticated SECURITY DEFINER RPCs.

-- save_training_progress uses the named unique constraint to avoid PL/pgSQL
-- ambiguity with the returned session_key column.
create or replace function public.save_training_progress(
  p_module_key text,
  p_session_key text,
  p_completion_percent integer,
  p_speaking_seconds integer,
  p_xp integer
)
returns table (
  session_key text,
  completion_percent integer,
  speaking_seconds integer,
  xp integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.training_progress as tp (
    user_id,
    module_key,
    session_key,
    completion_percent,
    speaking_seconds,
    xp,
    last_activity_at
  )
  values (
    v_user_id,
    p_module_key,
    p_session_key,
    p_completion_percent,
    p_speaking_seconds,
    p_xp,
    now()
  )
  on conflict on constraint training_progress_user_id_session_key_key
  do update set
    completion_percent = greatest(tp.completion_percent, excluded.completion_percent),
    speaking_seconds = greatest(tp.speaking_seconds, excluded.speaking_seconds),
    xp = greatest(tp.xp, excluded.xp),
    last_activity_at = now();

  return query
  select
    saved.session_key,
    saved.completion_percent,
    saved.speaking_seconds,
    saved.xp
  from public.training_progress saved
  where saved.user_id = v_user_id
    and saved.session_key = p_session_key;
end;
$$;
