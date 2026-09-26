create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'coach', 'admin')),
  placement_score integer check (placement_score between 0 and 100),
  placement_mode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create table if not exists public.training_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_key text not null,
  session_key text not null,
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  speaking_seconds integer not null default 0,
  xp integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, session_key)
);

alter table public.training_progress enable row level security;

create policy "Users can read their own progress"
on public.training_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress"
on public.training_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress"
on public.training_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
