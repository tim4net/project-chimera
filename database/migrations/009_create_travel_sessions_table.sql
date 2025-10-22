-- Migration: Create travel_sessions table for background travel progression
-- Date: 2025-10-22

create extension if not exists pgcrypto;

create table if not exists public.travel_sessions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  miles_traveled numeric not null default 0,
  miles_total numeric not null,
  destination_x int not null,
  destination_y int not null,
  travel_mode text not null default 'normal' check (travel_mode in ('cautious', 'normal', 'hasty')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Indexes for quick lookups
create index if not exists idx_travel_sessions_character_id on public.travel_sessions (character_id);
create index if not exists idx_travel_sessions_status on public.travel_sessions (status);
create index if not exists idx_travel_sessions_active on public.travel_sessions (character_id, status) where status = 'active';

-- Create trigger to update updated_at timestamp
create or replace function public.travel_sessions_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_travel_sessions_set_updated_at on public.travel_sessions;
create trigger trg_travel_sessions_set_updated_at
before update on public.travel_sessions
for each row execute procedure public.travel_sessions_set_updated_at();

-- Row Level Security
alter table public.travel_sessions enable row level security;

-- Policies: only the character owner can view/modify
do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_sessions' and policyname = 'Select own travel sessions'
  ) then
    create policy "Select own travel sessions"
      on public.travel_sessions
      for select
      using (
        character_id in (
          select id from public.characters where auth.uid() = user_id
        )
      );
  end if;

  -- INSERT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_sessions' and policyname = 'Insert own travel sessions'
  ) then
    create policy "Insert own travel sessions"
      on public.travel_sessions
      for insert
      with check (
        character_id in (
          select id from public.characters where auth.uid() = user_id
        )
      );
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_sessions' and policyname = 'Update own travel sessions'
  ) then
    create policy "Update own travel sessions"
      on public.travel_sessions
      for update
      using (
        character_id in (
          select id from public.characters where auth.uid() = user_id
        )
      )
      with check (
        character_id in (
          select id from public.characters where auth.uid() = user_id
        )
      );
  end if;

  -- DELETE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_sessions' and policyname = 'Delete own travel sessions'
  ) then
    create policy "Delete own travel sessions"
      on public.travel_sessions
      for delete
      using (
        character_id in (
          select id from public.characters where auth.uid() = user_id
        )
      );
  end if;
end$$;

-- Grants for authenticated role
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.travel_sessions to authenticated;
