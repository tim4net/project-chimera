-- ============================================================================
-- Travel System Migration - APPLY ALL MIGRATIONS
-- ============================================================================
--
-- This file combines all 3 travel system migrations into one.
-- Copy the entire contents and paste into Supabase SQL Editor.
--
-- Migrations:
--   008: Add game-time and calendar fields to characters
--   009: Create travel_sessions table
--   010: Create travel_events table
--
-- Date: 2025-10-22
-- ============================================================================

-- ============================================================================
-- MIGRATION 008: Add game_time_minutes and calendar fields to characters table
-- ============================================================================

ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS game_time_minutes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS world_date_day INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_month INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_year INT NOT NULL DEFAULT 0;

-- Add check constraints for calendar validity
ALTER TABLE public.characters
ADD CONSTRAINT valid_world_date_day CHECK (world_date_day >= 1 AND world_date_day <= 40),
ADD CONSTRAINT valid_world_date_month CHECK (world_date_month >= 1 AND world_date_month <= 10),
ADD CONSTRAINT valid_world_date_year CHECK (world_date_year >= 0);

-- Create index for faster calendar queries
CREATE INDEX IF NOT EXISTS characters_world_date_idx ON public.characters (world_date_year, world_date_month, world_date_day);

-- ============================================================================
-- MIGRATION 009: Create travel_sessions table
-- ============================================================================

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

-- Indexes for efficient queries
create index if not exists idx_travel_sessions_character_id on public.travel_sessions (character_id);
create index if not exists idx_travel_sessions_status on public.travel_sessions (status);
create index if not exists idx_travel_sessions_active on public.travel_sessions (character_id, status) where status = 'active';

-- Trigger to auto-update timestamp
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

-- Enable Row Level Security
alter table public.travel_sessions enable row level security;

-- RLS Policies
do $$
begin
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

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.travel_sessions to authenticated;

-- ============================================================================
-- MIGRATION 010: Create travel_events table
-- ============================================================================

create table if not exists public.travel_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.travel_sessions(id) on delete cascade,
  type text not null check (type in ('encounter', 'landmark', 'weather', 'traveler', 'merchant', 'bandits', 'storm', 'monster', 'trap', 'boss', 'catastrophe')),
  severity text not null check (severity in ('trivial', 'minor', 'moderate', 'dangerous', 'deadly')),
  description text not null,
  choices jsonb,
  requires_response boolean not null default false,
  resolved boolean not null default false,
  resolution text,
  created_at timestamptz not null default now()
);

-- Indexes for efficient queries
create index if not exists idx_travel_events_session_id on public.travel_events (session_id);
create index if not exists idx_travel_events_requires_response on public.travel_events (session_id, requires_response, resolved) where requires_response = true and resolved = false;
create index if not exists idx_travel_events_severity on public.travel_events (severity);

-- Enable Row Level Security
alter table public.travel_events enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_events' and policyname = 'Select own travel events'
  ) then
    create policy "Select own travel events"
      on public.travel_events
      for select
      using (
        session_id in (
          select id from public.travel_sessions ts
          join public.characters c on ts.character_id = c.id
          where auth.uid() = c.user_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_events' and policyname = 'Insert own travel events'
  ) then
    create policy "Insert own travel events"
      on public.travel_events
      for insert
      with check (
        session_id in (
          select id from public.travel_sessions ts
          join public.characters c on ts.character_id = c.id
          where auth.uid() = c.user_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_events' and policyname = 'Update own travel events'
  ) then
    create policy "Update own travel events"
      on public.travel_events
      for update
      using (
        session_id in (
          select id from public.travel_sessions ts
          join public.characters c on ts.character_id = c.id
          where auth.uid() = c.user_id
        )
      )
      with check (
        session_id in (
          select id from public.travel_sessions ts
          join public.characters c on ts.character_id = c.id
          where auth.uid() = c.user_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'travel_events' and policyname = 'Delete own travel events'
  ) then
    create policy "Delete own travel events"
      on public.travel_events
      for delete
      using (
        session_id in (
          select id from public.travel_sessions ts
          join public.characters c on ts.character_id = c.id
          where auth.uid() = c.user_id
        )
      );
  end if;
end$$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.travel_events to authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after applying migrations to verify everything is set up correctly:

-- Check characters table has new columns
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'characters'
--   AND column_name IN ('game_time_minutes', 'world_date_day', 'world_date_month', 'world_date_year')
-- ORDER BY ordinal_position;

-- Check travel_sessions table exists
-- SELECT COUNT(*) FROM information_schema.tables
-- WHERE table_name = 'travel_sessions' AND table_schema = 'public';

-- Check travel_events table exists
-- SELECT COUNT(*) FROM information_schema.tables
-- WHERE table_name = 'travel_events' AND table_schema = 'public';

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================
