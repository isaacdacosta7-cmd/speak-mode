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
grant select, insert, update on table public.training_progress to authenticated;
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
