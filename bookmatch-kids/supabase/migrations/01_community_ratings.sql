-- Community ratings rollup
-- Maintains books.community_score and books.total_ratings via trigger
-- on book_entries. Adds an RPC to fetch globally popular books for use
-- as cold-start signal in the recommendation engine.
--
-- Safe to run on an existing database: idempotent and backfills.
-- Run via Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Recompute function: given a book id, set community_score + total_ratings.
-- Score is a Bayesian average with a prior of 5 positive + 5 negative ratings,
-- so books with very few ratings can't dominate the rankings on luck alone.
--   score = (positive + 5) / (total + 10)
-- where positive = count of 'loved' or 'liked'.
-- ---------------------------------------------------------------------------
create or replace function public.recompute_book_score(b uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.books
  set
    total_ratings = sub.total,
    community_score = case
      when sub.total = 0 then 0
      else (sub.positive + 5)::float / (sub.total + 10)
    end
  from (
    select
      count(*)::int as total,
      count(*) filter (where rating in ('loved','liked'))::int as positive
    from public.book_entries
    where book_id = b
  ) sub
  where books.id = b;
$$;

-- ---------------------------------------------------------------------------
-- Trigger: recompute affected books on every book_entries insert/update/delete.
-- Handles the rare update-with-book_id-change by recomputing both old and new.
-- ---------------------------------------------------------------------------
create or replace function public.book_entries_score_trg()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    perform public.recompute_book_score(new.book_id);
    return new;
  elsif (TG_OP = 'UPDATE') then
    perform public.recompute_book_score(new.book_id);
    if new.book_id is distinct from old.book_id then
      perform public.recompute_book_score(old.book_id);
    end if;
    return new;
  elsif (TG_OP = 'DELETE') then
    perform public.recompute_book_score(old.book_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists book_entries_score_trg on public.book_entries;
create trigger book_entries_score_trg
  after insert or update or delete on public.book_entries
  for each row execute function public.book_entries_score_trg();

-- ---------------------------------------------------------------------------
-- One-shot backfill for books that already have ratings.
-- ---------------------------------------------------------------------------
do $$
declare
  b record;
begin
  for b in select id from public.books loop
    perform public.recompute_book_score(b.id);
  end loop;
end $$;

create index if not exists books_community_score_idx
  on public.books (community_score desc nulls last, total_ratings desc);

-- ---------------------------------------------------------------------------
-- RPC: top globally-popular books with at least min_ratings ratings.
-- Used by the recommendation engine to seed Claude with proven hits — so the
-- AI has a known-good shortlist to cross-reference against the kid's taste.
-- ---------------------------------------------------------------------------
create or replace function public.popular_books(
  min_ratings int default 3,
  max_count int default 20
)
returns table (
  id uuid,
  title text,
  author text,
  community_score float,
  total_ratings int
)
language sql
stable
as $$
  select
    b.id, b.title, b.author, b.community_score, b.total_ratings
  from public.books b
  where b.total_ratings >= min_ratings
  order by b.community_score desc nulls last, b.total_ratings desc
  limit max_count;
$$;

grant execute on function public.popular_books(int, int) to authenticated;
