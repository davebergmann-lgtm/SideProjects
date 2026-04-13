-- BookMatch for Kids — Supabase schema
-- Run in Supabase SQL editor. Phase 1 scope: profiles, children, books, book_entries.
-- Later phases add: reading_lists, sources, groups, group_members, group_lists.

-- =====================================================================
-- Profiles (extends auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  subscription_tier text default 'free'
    check (subscription_tier in ('free','family','family_plus','group_starter','group_plus','group_pro')),
  stripe_customer_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: owner select" on public.profiles;
create policy "profiles: owner select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: owner update" on public.profiles;
create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles: owner insert" on public.profiles;
create policy "profiles: owner insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Children
-- =====================================================================
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  age int check (age between 0 and 18),
  grade_level text,
  reading_level text check (reading_level in ('beginner','early','middle_grade','tween','ya')),
  interests text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists children_user_id_idx on public.children(user_id);

alter table public.children enable row level security;

drop policy if exists "children: parent all" on public.children;
create policy "children: parent all" on public.children
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enforce max 3 children per user at the free/family tier.
-- Phase 1: hard cap at 3 for all users. Phase 2+ will relax for higher tiers.
create or replace function public.enforce_child_limit()
returns trigger
language plpgsql
as $$
declare
  child_count int;
begin
  select count(*) into child_count from public.children where user_id = new.user_id;
  if child_count >= 3 then
    raise exception 'Child profile limit reached (3).';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_child_limit_trg on public.children;
create trigger enforce_child_limit_trg
  before insert on public.children
  for each row execute function public.enforce_child_limit();

-- =====================================================================
-- Books (master catalog)
-- =====================================================================
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text,
  cover_image_url text,
  google_books_id text unique,
  open_library_id text,
  community_score float default 0,
  total_ratings int default 0,
  created_at timestamptz default now()
);

create index if not exists books_google_id_idx on public.books(google_books_id);
create index if not exists books_isbn_idx on public.books(isbn);

alter table public.books enable row level security;

drop policy if exists "books: public read" on public.books;
create policy "books: public read" on public.books
  for select using (true);

drop policy if exists "books: authed insert" on public.books;
create policy "books: authed insert" on public.books
  for insert with check (auth.uid() is not null);

-- =====================================================================
-- Book entries (per-child ratings)
-- =====================================================================
create table if not exists public.book_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children on delete cascade not null,
  book_id uuid references public.books on delete cascade not null,
  rating text check (rating in ('loved','liked','disliked','dnf')) not null,
  notes text,
  added_by uuid references public.profiles,
  created_at timestamptz default now(),
  unique (child_id, book_id)
);

create index if not exists book_entries_child_idx on public.book_entries(child_id);

alter table public.book_entries enable row level security;

drop policy if exists "book_entries: parent all" on public.book_entries;
create policy "book_entries: parent all" on public.book_entries
  for all using (
    exists (
      select 1 from public.children c
      where c.id = book_entries.child_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = book_entries.child_id and c.user_id = auth.uid()
    )
  );
