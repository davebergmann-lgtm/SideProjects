-- Swim Aggregator schema. Single-owner v1 (RLS off).
-- Uses FTS + pg_trgm for search and dedup; no embeddings dependency.

create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- Sports (extensible; v1 seeds only swimming).
create type sport as enum ('swimming', 'strength');

-- Swimming enums.
create type swim_stroke as enum (
  'freestyle', 'backstroke', 'breaststroke', 'butterfly', 'IM', 'any'
);

create type swim_exercise_type as enum (
  'drill', 'set', 'warmup', 'cooldown', 'technique', 'pull', 'kick', 'main_set'
);

create type pool_type as enum ('SCY', 'SCM', 'LCM', 'open_water');

create type difficulty_level as enum ('beginner', 'intermediate', 'advanced');

create type source_kind as enum (
  'text', 'url', 'youtube', 'image', 'web_search'
);

create type job_status as enum (
  'queued', 'extracting', 'normalizing', 'ready', 'failed'
);

-- Ingest jobs (async pipeline state).
create table ingest_jobs (
  id uuid primary key default gen_random_uuid(),
  status job_status not null default 'queued',
  source_kind source_kind not null,
  source_url text,
  raw_input text,               -- pasted text, URL, or file reference
  raw_content text,             -- extracted content (transcript, article body, OCR)
  error text,
  exercise_ids uuid[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ingest_jobs_status_idx on ingest_jobs(status, created_at desc);

-- Exercises (the canonical objects).
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_normalized text generated always as (lower(unaccent(name))) stored,
  aliases text[] not null default '{}',

  sport sport not null,
  sport_attrs jsonb not null default '{}'::jsonb,

  -- Common fields.
  equipment text[] not null default '{}',
  difficulty difficulty_level,
  instructions text[] not null default '{}',
  focus_notes text[] not null default '{}',
  safety_notes text[] not null default '{}',
  default_prescription jsonb,

  -- Provenance.
  source_kind source_kind not null,
  source_url text,
  source_excerpt text,
  ingest_job_id uuid references ingest_jobs(id) on delete set null,
  confidence real check (confidence between 0 and 1),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- FTS.
  search_tsv tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(aliases, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(instructions, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(focus_notes, '{}'), ' ')), 'C')
  ) stored
);

create index exercises_search_idx on exercises using gin(search_tsv);
create index exercises_name_trgm_idx on exercises using gin(name_normalized gin_trgm_ops);
create index exercises_sport_idx on exercises(sport);
create index exercises_equipment_idx on exercises using gin(equipment);
create index exercises_sport_attrs_idx on exercises using gin(sport_attrs jsonb_path_ops);

-- updated_at triggers.
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger touch_exercises before update on exercises
  for each row execute function touch_updated_at();
create trigger touch_jobs before update on ingest_jobs
  for each row execute function touch_updated_at();
