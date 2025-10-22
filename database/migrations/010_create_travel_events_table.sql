-- Migration: Create travel_events table for tracking travel events during sessions
-- Date: 2025-10-22

create extension if not exists pgcrypto;

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

-- Row Level Security
alter table public.travel_events enable row level security;

-- Policies: only the character owner can view/modify
do $$
begin
  -- SELECT
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

  -- INSERT
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

  -- UPDATE
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

  -- DELETE
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

-- Grants for authenticated role
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.travel_events to authenticated;
