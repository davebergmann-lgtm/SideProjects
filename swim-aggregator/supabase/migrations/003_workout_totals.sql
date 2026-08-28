-- Workout-level totals for search bucketing.
alter table exercises
  add column if not exists total_distance_meters integer,
  add column if not exists total_duration_minutes integer;

create index if not exists exercises_distance_idx on exercises(total_distance_meters);
create index if not exists exercises_duration_idx on exercises(total_duration_minutes);
