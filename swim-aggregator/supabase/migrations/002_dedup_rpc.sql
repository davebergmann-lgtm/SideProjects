create or replace function dedup_by_name(q text)
returns table(id uuid, name text, similarity real)
language sql stable as $$
  select id, name, similarity(name_normalized, lower(unaccent(q))) as similarity
  from exercises
  order by name_normalized <-> lower(unaccent(q))
  limit 3;
$$;
