# Swim Aggregator

Ingest swimming drills, sets, and workouts from **pasted text, URLs, YouTube videos, or images**. Content is normalized by Claude into a structured, searchable database of swimming exercises with stroke, focus, equipment, and prescription metadata.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Supabase Postgres (FTS + `pg_trgm` for search and dedup)
- Anthropic Claude Opus 5 for normalization and image OCR
- YouTube captions via `youtube-transcript` (free, no key)
- Web article extraction via `@mozilla/readability`
- Brave Search API for external web search (free tier)

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings
   - `BRAVE_SEARCH_API_KEY` — free tier at [api.search.brave.com](https://api.search.brave.com) (2k queries/mo, no card required)
3. Apply the migrations to your Supabase project:
   - Paste `supabase/migrations/001_initial.sql` and `002_dedup_rpc.sql` into the Supabase SQL editor and run them in order.
4. `pnpm dev` and open [localhost:3000](http://localhost:3000)
5. (optional) `pnpm seed` to populate ~16 swim exercises so the search view isn't empty.

## How it works

```
[ pasted text | URL | YouTube URL | image ]
        │
        ▼
   extract() ──► raw_content (article body, transcript, or OCR text)
        │
        ▼
   normalize() ──► Claude Opus 5 with a strict tool-use schema
        │            └─► NormalizedExercise[]  (enum-constrained)
        ▼
   dedup by trigram similarity on name
        │
        ▼
   insert into `exercises` with source provenance
```

Every exercise stores its source (kind, URL, raw excerpt, confidence) so you can re-normalize later if the schema evolves.

## Scope

**v1 = swimming only.** The schema is sport-first (`sport` enum + `sport_attrs` jsonb), so adding running, cycling, strength, etc. later is a new variant plus taxonomy entries — no migration.

Out of scope for v1: user accounts, workout program builder, session logging, uploaded video files (use a YouTube URL instead — those captions are free).
