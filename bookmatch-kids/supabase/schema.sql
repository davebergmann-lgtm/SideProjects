-- BookMatch for Kids — Supabase schema
-- Run in Supabase SQL editor. Scope: profiles, children, books, book_entries,
-- reading_lists, groups, group_members, group_lists.
-- Later phases add: sources.

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

-- =====================================================================
-- Reading lists (AI-generated recommendation sets)
-- =====================================================================
create table if not exists public.reading_lists (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children on delete cascade not null,
  generated_at timestamptz default now(),
  source_preference text default 'free_first' check (source_preference in ('free_first','any')),
  books jsonb not null
);

create index if not exists reading_lists_child_idx
  on public.reading_lists(child_id, generated_at desc);

alter table public.reading_lists enable row level security;

drop policy if exists "reading_lists: parent all" on public.reading_lists;
create policy "reading_lists: parent all" on public.reading_lists
  for all using (
    exists (
      select 1 from public.children c
      where c.id = reading_lists.child_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.children c
      where c.id = reading_lists.child_id and c.user_id = auth.uid()
    )
  );

-- =====================================================================
-- Groups (table first, before helper functions that reference group_members)
-- =====================================================================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles on delete set null,
  invite_code text unique default substring(md5(random()::text) from 1 for 8),
  tier text check (tier in ('starter','plus','pro')) not null,
  max_families int not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '1 year')
);

create index if not exists groups_invite_code_idx on public.groups(invite_code);

alter table public.groups enable row level security;

-- =====================================================================
-- Group members (table must exist before is_group_member / is_group_admin)
-- =====================================================================
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  role text default 'member' check (role in ('admin','member')),
  share_ratings boolean default false,
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

create index if not exists group_members_group_idx on public.group_members(group_id);
create index if not exists group_members_user_idx on public.group_members(user_id);

alter table public.group_members enable row level security;

-- =====================================================================
-- Groups: membership helpers (now safe — both tables exist)
-- =====================================================================
create or replace function public.is_group_member(g uuid, u uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.group_members
    where group_id = g and user_id = u
  );
$$;

create or replace function public.is_group_admin(g uuid, u uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.group_members
    where group_id = g and user_id = u and role = 'admin'
  );
$$;

grant execute on function public.is_group_member(uuid, uuid) to authenticated;
grant execute on function public.is_group_admin(uuid, uuid) to authenticated;

-- =====================================================================
-- Groups: RLS policies (depend on is_group_member / is_group_admin)
-- =====================================================================
drop policy if exists "groups: member read" on public.groups;
create policy "groups: member read" on public.groups
  for select using (public.is_group_member(id, auth.uid()));

drop policy if exists "groups: creator insert" on public.groups;
create policy "groups: creator insert" on public.groups
  for insert with check (auth.uid() = created_by);

drop policy if exists "groups: admin update" on public.groups;
create policy "groups: admin update" on public.groups
  for update using (public.is_group_admin(id, auth.uid()));

drop policy if exists "groups: admin delete" on public.groups;
create policy "groups: admin delete" on public.groups
  for delete using (public.is_group_admin(id, auth.uid()));

-- =====================================================================
-- Group members: RLS policies
-- =====================================================================
drop policy if exists "group_members: fellow read" on public.group_members;
create policy "group_members: fellow read" on public.group_members
  for select using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "group_members: self join" on public.group_members;
create policy "group_members: self join" on public.group_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "group_members: self or admin delete" on public.group_members;
create policy "group_members: self or admin delete" on public.group_members
  for delete using (
    auth.uid() = user_id or public.is_group_admin(group_id, auth.uid())
  );

drop policy if exists "group_members: self update" on public.group_members;
create policy "group_members: self update" on public.group_members
  for update using (
    auth.uid() = user_id or public.is_group_admin(group_id, auth.uid())
  ) with check (
    auth.uid() = user_id or public.is_group_admin(group_id, auth.uid())
  );

-- Enforce max_families cap per tier at the DB level.
create or replace function public.enforce_group_cap()
returns trigger
language plpgsql
as $$
declare
  cap int;
  current_count int;
begin
  select max_families into cap from public.groups where id = new.group_id;
  select count(*) into current_count from public.group_members where group_id = new.group_id;
  if current_count >= cap then
    raise exception 'Group is full (% of % families).', current_count, cap;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_group_cap_trg on public.group_members;
create trigger enforce_group_cap_trg
  before insert on public.group_members
  for each row execute function public.enforce_group_cap();

-- =====================================================================
-- Group lists (curated shared book lists)
-- =====================================================================
create table if not exists public.group_lists (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups on delete cascade not null,
  created_by uuid references public.profiles on delete set null,
  title text not null,
  description text,
  books jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists group_lists_group_idx on public.group_lists(group_id);

alter table public.group_lists enable row level security;

drop policy if exists "group_lists: member read" on public.group_lists;
create policy "group_lists: member read" on public.group_lists
  for select using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "group_lists: admin write" on public.group_lists;
create policy "group_lists: admin write" on public.group_lists
  for all using (public.is_group_admin(group_id, auth.uid()))
  with check (public.is_group_admin(group_id, auth.uid()));

-- =====================================================================
-- RPC: look up a group by invite code (bypasses groups.SELECT RLS so
-- non-members can discover a group by code before joining).
-- =====================================================================
create or replace function public.lookup_group_by_invite(code text)
returns table (
  id uuid,
  name text,
  tier text,
  max_families int,
  member_count int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    g.id,
    g.name,
    g.tier,
    g.max_families,
    (select count(*)::int from public.group_members gm where gm.group_id = g.id)
  from public.groups g
  where g.invite_code = lower(code);
$$;

grant execute on function public.lookup_group_by_invite(text) to authenticated;

-- =====================================================================
-- RPC: list members with their profile names (bypasses profiles.SELECT RLS
-- which only allows owners to read themselves).
-- =====================================================================
create or replace function public.list_group_members(g uuid)
returns table (
  user_id uuid,
  full_name text,
  role text,
  share_ratings boolean,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    gm.user_id,
    p.full_name,
    gm.role,
    gm.share_ratings,
    gm.joined_at
  from public.group_members gm
  join public.profiles p on p.id = gm.user_id
  where gm.group_id = g
    and public.is_group_member(g, auth.uid())
  order by gm.joined_at asc;
$$;

grant execute on function public.list_group_members(uuid) to authenticated;

-- =====================================================================
-- RPC: aggregated group ratings feed (only counts members who opted in
-- via share_ratings).
-- =====================================================================
create or replace function public.group_ratings_feed(g uuid)
returns table (
  book_id uuid,
  title text,
  author text,
  cover_image_url text,
  loved_count int,
  liked_count int,
  disliked_count int,
  dnf_count int,
  total_count int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id,
    b.title,
    b.author,
    b.cover_image_url,
    count(*) filter (where be.rating = 'loved')::int,
    count(*) filter (where be.rating = 'liked')::int,
    count(*) filter (where be.rating = 'disliked')::int,
    count(*) filter (where be.rating = 'dnf')::int,
    count(*)::int
  from public.group_members gm
  join public.children c on c.user_id = gm.user_id
  join public.book_entries be on be.child_id = c.id
  join public.books b on b.id = be.book_id
  where gm.group_id = g
    and gm.share_ratings = true
    and public.is_group_member(g, auth.uid())
  group by b.id, b.title, b.author, b.cover_image_url
  order by
    count(*) filter (where be.rating = 'loved') desc,
    count(*) desc
  limit 50;
$$;

grant execute on function public.group_ratings_feed(uuid) to authenticated;
